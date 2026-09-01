/**
 * `pd-diagram-tabs`: lets one `.drawio.svg` with several tabs answer to
 * several imports, each naming the tab it wants.
 *
 *     import Visao from './arquitetura.drawio.svg?aba=visao-geral';
 *     import Rede  from './arquitetura.drawio.svg?aba=rede';
 *
 * WHY THE QUERY CANNOT BE A PROP. By the time `<Frame>` renders, SVGR has
 * already turned the file into a React component holding ONE drawing, and
 * SVGO has already dropped the `content` attribute that carried the other
 * tabs: measured, zero occurrences of `mxfile` in the built chunk. Tab
 * selection has to happen before webpack, which is why it is a plugin and
 * not a component prop, and why `src/components/Frame.js` is untouched.
 *
 * WHAT THIS WRITES. One `.svg` per (master, tab) pair an MDX file actually
 * imports, next to its master, committed. Nothing is generated for a tab
 * nobody asks for, the same way the icon registry resolves only the slugs
 * `content/**` names.
 *
 * `content/_diagrama-abas.drawio.svg` is the specimen this was verified
 * against — three tabs (`visao-geral`, `geracao`, `portao`), underscore
 * prefixed so no route is built from it, the same way
 * `_diagrama-grande.drawio.svg` serves the lightbox. No published page
 * imports a tab yet, so add a page importing two of its tabs to exercise
 * the whole path again: `start` should write exactly those two files and
 * leave the third alone.
 *
 * DEVELOPMENT RENDERS, BUILD ONLY VERIFIES. The renderer needs a browser,
 * and the only CI step this project has is `npm run build`, which must stay
 * able to run anywhere. So the generated drawings are committed, `start`
 * keeps them fresh, and `build` checks the stamp each one carries against
 * the master it came from — pure Node, no browser. A stale file fails the
 * build with the command that fixes it.
 *
 * Reload does NOT go through `getPathsToWatch`, for the reason
 * `src/plugins/sidebar-icons` documents at length: each plugin's watched
 * paths get their own chokidar instance, and `reloadPlugin` carries the
 * package's own TODO acknowledging a race when two plugins reload from one
 * event. Every master already sits under a `plugin-content-docs` instance's
 * content path. This watches them itself instead, and writes a `.svg` —
 * which no `plugin-content-docs` instance watches, since `options.include`
 * is markdown only. Webpack's own watcher, independent of Docusaurus's
 * content-reload machinery, picks the write up on its own.
 *
 * THE WATCH IS PER DIRECTORY AND NOT RECURSIVE, and that is not a style
 * choice. Measured on Node 24, watching `content/` both ways at once while
 * a file under it was saved six times, alternating in-place writes with
 * `sed -i`, which saves the way an editor does — by writing a new file and
 * renaming it over the old one:
 *
 *     escrita no lugar    recursivo 2 eventos   plano 2 eventos
 *     sed -i (rename)     recursivo 3 eventos   plano 1 evento
 *     escrita no lugar    recursivo NADA        plano 1 evento
 *     cp por cima         recursivo NADA        plano 1 evento
 *     sed -i de novo      recursivo NADA        plano 1 evento
 *     cp depois do rename recursivo NADA        plano 1 evento
 *
 * The recursive watcher goes deaf at the FIRST rename and never recovers,
 * because that mode registers a watch per entry and the rename leaves it
 * pointing at an inode nothing will write to again. A plain directory
 * watch holds one descriptor on the directory and reports every entry
 * inside it, so it survives any number of saves in any style. The cost is
 * that a master in a directory nobody imported from yet is only picked up
 * on the next pass — the same restart-to-see-it trade the icon plugin
 * takes for a new slug.
 */

import fs from 'node:fs/promises';
import {watch as watchFs} from 'node:fs';
import path from 'node:path';
import webpack from 'webpack';

import {
  MASTER_SUFFIX,
  derivedPathFor,
  readStamp,
  readTabs,
  scanTabImports,
  stampFor,
  unknownTabError,
} from '../../../scripts/lib/drawio.mjs';
import {engineComplaint, openRenderer} from '../../../scripts/lib/drawio-render.mjs';

const CONTENT_DIR = 'content';

/** What an import's query looks like by the time webpack sees the request. */
const TAB_QUERY = /\.drawio\.svg\?aba=/;

/** Coalesces a burst of fs events (some editors emit more than one per save) into one pass. */
const DEBOUNCE_MS = 150;

/** The command that fixes a stale drawing, quoted in every refusal that needs it. */
const REFRESH = 'npm start';

/**
 * The (master, tab) pairs the content tree asks for, each resolved against
 * the master's real tabs. Throws on a slug no tab answers to, naming the
 * page that asked.
 *
 * @param {string} siteDir
 */
async function requestedTabs(siteDir) {
  const contentDir = path.join(siteDir, CONTENT_DIR);
  const imports = await scanTabImports(contentDir);

  /** Read each master once, however many tabs are asked of it. */
  const tabsByMaster = new Map();
  const wanted = new Map();

  for (const request of imports) {
    if (!tabsByMaster.has(request.master)) {
      tabsByMaster.set(request.master, await readTabs(request.master));
    }
    const tabs = tabsByMaster.get(request.master);
    const tab = tabs.find((candidate) => candidate.slug === request.slug);
    if (!tab) {
      throw unknownTabError(request.slug, tabs, request.master, request.source);
    }
    wanted.set(`${request.master}?${request.slug}`, {
      master: request.master,
      tab,
      derived: derivedPathFor(request.master, request.slug),
    });
  }

  return [...wanted.values()];
}

/**
 * Which of the wanted drawings are missing or came from a different version
 * of their tab. The hash is over the tab's own XML, so a save that touched
 * one tab leaves every other one alone.
 *
 * @param {{master: string, tab: {hash: string}, derived: string}[]} wanted
 */
async function staleAmong(wanted) {
  const stale = [];
  for (const entry of wanted) {
    const stamp = await readStamp(entry.derived);
    if (!stamp || stamp.hash !== entry.tab.hash) {
      stale.push(entry);
    }
  }
  return stale;
}

/**
 * Generated drawings whose import is gone. Only files carrying this
 * plugin's stamp are removed — anything else next to a master is somebody's
 * own file, and deleting it would be a guess.
 *
 * @param {string} siteDir
 * @param {Set<string>} keep absolute paths
 */
async function pruneOrphans(siteDir, keep) {
  const removed = [];

  /** @param {string} dir */
  async function walk(dir) {
    for (const entry of await fs.readdir(dir, {withFileTypes: true})) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
        continue;
      }
      if (!entry.name.endsWith('.svg') || entry.name.endsWith('.drawio.svg') || keep.has(full)) {
        continue;
      }
      if (await readStamp(full)) {
        await fs.rm(full);
        removed.push(path.relative(siteDir, full));
      }
    }
  }

  await walk(path.join(siteDir, CONTENT_DIR));
  return removed;
}

/**
 * @param {import('@docusaurus/types').LoadContext} context
 * @returns {import('@docusaurus/types').Plugin}
 */
export default function diagramTabsPlugin(context) {
  const {siteDir} = context;

  /**
   * Brings every requested drawing up to date, rendering only what changed.
   * Returns what it did, for the caller to report.
   */
  async function refresh() {
    const wanted = await requestedTabs(siteDir);
    const stale = await staleAmong(wanted);
    const orphans = await pruneOrphans(siteDir, new Set(wanted.map((entry) => entry.derived)));
    const dirs = new Set(wanted.map((entry) => path.dirname(entry.master)));

    if (stale.length === 0) {
      return {rendered: [], orphans, dirs};
    }

    const renderer = await openRenderer();
    const rendered = [];
    try {
      for (const entry of stale) {
        const master = path.relative(siteDir, entry.master);
        const single = `<mxfile host="panlabs-docs"><diagram id="${entry.tab.id}" name="${entry.tab.name}">${entry.tab.xml}</diagram></mxfile>`;
        const drawing = await renderer.render(single, `${master} (aba "${entry.tab.name}")`);
        const stamp = stampFor({
          master: path.basename(entry.master),
          name: entry.tab.name,
          slug: entry.tab.slug,
          hash: entry.tab.hash,
        });
        await fs.writeFile(entry.derived, `${stamp}\n${drawing}\n`, 'utf8');
        rendered.push(path.relative(siteDir, entry.derived));
      }
    } finally {
      renderer.close();
    }

    return {rendered, orphans, dirs};
  }

  /**
   * The same check without a browser: what `build` runs, and the reason the
   * generated drawings are committed rather than produced in CI.
   */
  async function verify() {
    const wanted = await requestedTabs(siteDir);
    const stale = await staleAmong(wanted);
    if (stale.length === 0) {
      return;
    }
    throw new Error(
      [
        'Desenho de aba desatualizado, e o build não renderiza (isso é do `start`):',
        ...stale.map((entry) => {
          const derived = path.relative(siteDir, entry.derived);
          return `  ${derived} — aba "${entry.tab.name}" de ${path.basename(entry.master)}`;
        }),
        '',
        `Rode \`${REFRESH}\` para regerar, e commite o resultado.`,
      ].join('\n'),
    );
  }

  return {
    name: 'pd-diagram-tabs',

    async loadContent() {
      // `docusaurus build` pins `NODE_ENV` to `production`; `start` leaves
      // the CLI's `development` default in place. A watcher started under
      // `build` would hold the event loop open and hang the command.
      if (process.env.NODE_ENV !== 'development') {
        await verify();
        return;
      }

      // A missing engine degrades to a warning, never a refusal: the
      // drawings are committed, so what is lost is the refresh, not the
      // site. Whoever has no VS Code extension installed still gets a
      // working dev server off what is in the repository, and still gets
      // told which drawing they are looking at an old version of. The
      // build is where that same staleness becomes a refusal.
      const complaint = engineComplaint();
      if (complaint) {
        console.warn(`pd-diagram-tabs: ${complaint}`);
        await verify().catch((error) => console.warn(`pd-diagram-tabs: ${error.message}`));
        return;
      }

      /** One directory watch per directory holding a master, added as they appear. */
      const watched = new Set();
      let pending;

      const onChange = (filename) => {
        // Filtered by suffix so an ordinary markdown save next door costs
        // nothing, and debounced because a single save arrives as more than
        // one event.
        if (!filename || !filename.endsWith(MASTER_SUFFIX)) {
          return;
        }
        clearTimeout(pending);
        pending = setTimeout(() => {
          refresh()
            .then(report)
            .catch((error) => console.error(`pd-diagram-tabs: ${error.message}`));
        }, DEBOUNCE_MS);
      };

      const report = ({rendered, orphans, dirs}) => {
        for (const file of rendered) {
          console.log(`pd-diagram-tabs: ${file} atualizado.`);
        }
        for (const file of orphans) {
          console.log(`pd-diagram-tabs: ${file} removido, ninguém importa mais essa aba.`);
        }
        for (const dir of dirs) {
          if (!watched.has(dir)) {
            watched.add(dir);
            watchFs(dir, (_event, filename) => onChange(filename));
          }
        }
      };

      report(await refresh());
    },

    configureWebpack() {
      return {
        plugins: [
          // The query names a tab; the drawing for it is a real file on
          // disk. Rewriting the request before resolution is what lets the
          // markdown name the master, which is the file the author actually
          // edits, while webpack loads the generated sibling — and it keeps
          // SVGR's rule matching, since what it finally resolves is a plain
          // `.svg`.
          new webpack.NormalModuleReplacementPlugin(TAB_QUERY, (resource) => {
            const [request, slug] = resource.request.split('?aba=');
            resource.request = derivedPathFor(request, slug);
          }),
        ],
      };
    },
  };
}
