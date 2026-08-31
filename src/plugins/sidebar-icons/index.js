/**
 * `pd-sidebar-icons`: resolves every `icon('<slug>')` a sidebar file calls
 * against the installed `lucide-static` package, and emits one CSS rule per
 * slug that a sidebar item's mask (`chrome.css`) reads by class name.
 *
 * Runs INSIDE the build, deliberately, unlike `generate-reference.mjs` — see
 * DECISIONS.md#reference-is-generated-from-contract for why the two differ.
 *
 * A Docusaurus plugin, not a `prestart`/`prebuild` script, so the generated
 * stylesheet `getClientModules` hands to webpack can be rewritten while
 * `npm start` is already running: a script run once before start couldn't
 * reach a class added after the server was up.
 *
 * NOT wired through `getPathsToWatch`, unlike every other watched path in
 * this project. Measured against @docusaurus/core@3.10.2
 * (`lib/commands/start/utils.js`): each plugin's watched paths get their own
 * chokidar instance, and `reloadPlugin` — called per plugin, per matched
 * file — carries the package's own TODO acknowledging a race when two
 * plugins reload from the same event, with no queue between them. Each of
 * the four sidebar files with a `plugin-content-docs` instance is already
 * watched by that instance; adding this plugin's name to the same path
 * reproduced the race on the first edit tried — the docs instance's own
 * reload lost, the sidebar item's class silently reverting to its pre-edit
 * value with no error and no second event to retry on. Below, this plugin
 * watches the sidebar files itself instead — `fs.watch` on their directory,
 * filtered by name so an editor's atomic rename-based save doesn't orphan
 * the watch the way it would watching the file path directly — and writes
 * straight to the generated stylesheet, a file no other plugin touches.
 * Webpack's own watcher, independent of Docusaurus's content-reload
 * machinery, picks up that write on its own.
 */

import fs from 'node:fs/promises';
import {watch as watchFs} from 'node:fs';
import path from 'node:path';

const SIDEBAR_FILES = [
  'sidebars-jornadas.js',
  'sidebars-procedimentos.js',
  'sidebars-ferramentas.js',
  'sidebars-referencia.js',
  'sidebars-times.js',
];

/** What `icon('<slug>')` looks like from the call site, single-quoted like the rest of this project. */
const ICON_CALL = /\bicon\('([^']+)'\)/g;

/**
 * The literal a hand-written `className` would contain. After the
 * migration, this substring has exactly one legitimate source in the whole
 * project: the template string inside `icon()` itself, in
 * `sidebars-icons.js`, which is not one of `SIDEBAR_FILES`. Any occurrence
 * inside a sidebar file is a raw `className` that bypassed the helper, and
 * a raw one carries no guarantee the slug it names was ever checked against
 * the installed package.
 */
const RAW_CLASS = 'sidebar-icon--';

const LUCIDE_ICONS_DIR = 'node_modules/lucide-static/icons';
const LUCIDE_LICENSE = 'node_modules/lucide-static/LICENSE';
const LICENSE_DESTINATION = 'static/icons/LICENSE.txt';

/** Coalesces a burst of fs events (some tools emit more than one per save) into one rebuild. */
const DEBOUNCE_MS = 150;

/**
 * Levenshtein distance, hand-written for the same reason
 * `src/icons/registry.js` gives: a dependency for eight lines is the worse
 * trade. Kept as its own copy, not imported from there — that file is
 * frozen for this ticket, see the issue's "what survives on purpose".
 *
 * @param {string} a
 * @param {string} b
 */
function distance(a, b) {
  const row = Array.from({length: b.length + 1}, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const saved = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = saved;
    }
  }
  return row[b.length];
}

/**
 * @param {string} name
 * @param {string[]} candidates
 * @returns {string | undefined} the nearest neighbor, if a plausible one exists
 */
function nearestNeighbor(name, candidates) {
  let best;
  let smallest = Infinity;
  for (const candidate of candidates) {
    const d = distance(name, candidate);
    if (d < smallest) {
      smallest = d;
      best = candidate;
    }
  }
  // Same ratio as registry.js: past a third of the length, the suggestion
  // turns into noise.
  return smallest <= Math.max(2, Math.ceil(name.length / 3)) ? best : undefined;
}

/**
 * Every slug a sidebar file calls `icon()` with, and a loud refusal if any
 * of them writes `sidebar-icon--` by hand instead.
 *
 * @param {string} siteDir
 */
async function scanSidebars(siteDir) {
  const slugs = new Set();

  for (const file of SIDEBAR_FILES) {
    const source = await fs.readFile(path.join(siteDir, file), 'utf8');
    if (source.includes(RAW_CLASS)) {
      throw new Error(
        [
          `${file} escreve \`${RAW_CLASS}\` à mão.`,
          `Use \`icon('<slug>')\`, importado de \`./sidebars-icons.js\` — é a única forma que a varredura reconhece.`,
        ].join('\n'),
      );
    }
    for (const match of source.matchAll(ICON_CALL)) {
      slugs.add(match[1]);
    }
  }

  return slugs;
}

/**
 * One CSS rule per slug, the artwork inlined as a base64 data URI so a
 * missing file in `static/` can never 404: `--pd-sidebar-icon` is the same
 * custom property `chrome.css`'s mask rule already reads, just fed a class
 * per slug instead of per section.
 *
 * @param {Set<string>} slugs
 * @param {string} siteDir
 */
async function stylesheetFor(slugs, siteDir) {
  const iconsDir = path.join(siteDir, LUCIDE_ICONS_DIR);
  const catalog = (await fs.readdir(iconsDir))
    .filter((file) => file.endsWith('.svg'))
    .map((file) => file.replace(/\.svg$/, ''));
  const known = new Set(catalog);

  const rules = [];
  for (const slug of [...slugs].sort()) {
    if (!known.has(slug)) {
      const suggestion = nearestNeighbor(slug, catalog);
      throw new Error(
        [
          `Ícone "${slug}" não existe em ${LUCIDE_ICONS_DIR}.`,
          suggestion && `Você quis dizer "${suggestion}"?`,
          'Confira o slug em https://lucide.dev/icons.',
        ]
          .filter(Boolean)
          .join('\n'),
      );
    }
    const svg = await fs.readFile(path.join(iconsDir, `${slug}.svg`), 'utf8');
    const dataUri = `data:image/svg+xml;base64,${Buffer.from(svg, 'utf8').toString('base64')}`;
    rules.push(`.sidebar-icon--${slug} { --pd-sidebar-icon: url("${dataUri}"); }`);
  }

  return `${rules.join('\n')}\n`;
}

/**
 * @param {import('@docusaurus/types').LoadContext} context
 * @returns {import('@docusaurus/types').Plugin}
 */
export default function sidebarIconsPlugin(context) {
  const {siteDir, generatedFilesDir} = context;
  const cssPath = path.join(generatedFilesDir, 'pd-sidebar-icons', 'styles.css');

  const rebuild = async () => {
    const slugs = await scanSidebars(siteDir);
    const css = await stylesheetFor(slugs, siteDir);

    await fs.mkdir(path.dirname(cssPath), {recursive: true});
    await fs.writeFile(cssPath, css, 'utf8');

    // Copied verbatim, never hand-maintained: the ISC notice has to match
    // whatever `lucide-static` version is actually installed, and a copy
    // that only runs at install time would drift the day the dependency
    // bumps without anyone touching this file.
    await fs.copyFile(path.join(siteDir, LUCIDE_LICENSE), path.join(siteDir, LICENSE_DESTINATION));
  };

  return {
    name: 'pd-sidebar-icons',

    async loadContent() {
      await rebuild();

      // `docusaurus build` is one-shot; this loop only starts under
      // `docusaurus start`, matching how `build.js` pins `NODE_ENV` to
      // `production` and `start.js` leaves the CLI's own `development`
      // default in place. A watcher started under `build` would hold the
      // event loop open and hang the command after the build finished.
      if (process.env.NODE_ENV !== 'development') {
        return;
      }

      const watchedNames = new Set(SIDEBAR_FILES);
      let pending;
      watchFs(siteDir, (_event, filename) => {
        if (!filename || !watchedNames.has(filename)) {
          return;
        }
        clearTimeout(pending);
        pending = setTimeout(() => {
          rebuild()
            .then(() => console.log('pd-sidebar-icons: ícones atualizados.'))
            .catch((error) => console.error(`pd-sidebar-icons: ${error.message}`));
        }, DEBOUNCE_MS);
      });
    },

    getClientModules() {
      return [cssPath];
    },
  };
}
