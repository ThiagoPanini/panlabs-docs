/**
 * `pd-sidebar-icons`: two outputs from the same source, the installed
 * `lucide-static` package.
 *
 * 1. Resolves every `icon('<slug>')` a sidebar file calls, and emits one
 *    CSS rule per slug that a sidebar item's mask (`chrome.css`) reads by
 *    class name — plus two fixed slugs this project's own chrome always
 *    needs (`CHROME_ICONS`), never declared via `icon()` since they aren't
 *    sidebar items: the tree's own collapse caret and the TOC title icon.
 * 2. Resolves every icon an MDX author writes (scanned from `content/**`)
 *    or a component hardcodes (`HARDCODED_ICONS`), and writes
 *    `src/icons/registry.js`: one static `import` per slug, so SVGR —
 *    which matches by issuer file, `.js` included, per the header of the
 *    file this writes — turns each into a React component.
 *
 * Both run INSIDE the build, deliberately, unlike `generate-reference.mjs`
 * — see DECISIONS.md#reference-is-generated-from-contract for why the two
 * differ. A Docusaurus plugin, not a `prestart`/`prebuild` script, so a
 * missing or misspelled icon fails on the page being edited, not on an
 * unrelated generator run earlier. `src/icons/registry.js` is generated
 * for the same reason and is gitignored: it has to exist as a real `.js`
 * file before webpack resolves `src/components/Icon.js`'s import of it,
 * which a plugin's `loadContent` — running before webpack starts — already
 * guarantees.
 *
 * Reload does NOT go through `getPathsToWatch`, unlike every other watched
 * path in this project. Measured against @docusaurus/core@3.10.2
 * (`lib/commands/start/utils.js`): each plugin's watched paths get their
 * own chokidar instance, and `reloadPlugin` — called per plugin, per
 * matched file — carries the package's own TODO acknowledging a race when
 * two plugins reload from the same event, with no queue between them. Each
 * sidebar file with a `plugin-content-docs` instance is already watched by
 * that instance; adding this plugin to the same path reproduced the race
 * on the first edit tried, the docs instance's own reload silently losing.
 * Below, this plugin watches the sidebars itself instead — `fs.watch` on
 * their directory, filtered by name so an editor's atomic rename-based
 * save doesn't orphan the watch the way it would watching the file path
 * directly — and writes straight to the generated stylesheet, a file no
 * other plugin touches; webpack's own watcher, independent of Docusaurus's
 * content-reload machinery, picks up that write on its own.
 *
 * `content/**` gets no such watcher: it's a much larger tree than five
 * fixed files, already watched by four separate `plugin-content-docs`
 * instances, and a new icon slug next to an ordinary content edit is rare.
 * `src/icons/registry.js` regenerates on every server start and every
 * build; picking up a same-session addition costs a restart, same as an
 * edit to `docusaurus.config.js` does.
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

/**
 * Fixed chrome, not a sidebar item: the tree's own collapse caret
 * (`chrome.css`, shared with the accordion's caret in
 * `catalog.module.css`) and the TOC title icon (`chrome.css`). Neither is
 * declared via `icon()` — there's no sidebar file to scan them from — so
 * they ride into the stylesheet unconditionally instead, each keyed by its
 * own `--pd-chrome-icon-<slug>` custom property rather than the per-class
 * `--pd-sidebar-icon` the dynamic slugs above use.
 */
const CHROME_ICONS = ['chevron-right', 'list'];

/**
 * Every icon a component hardcodes: assembled at runtime (`name={x}`) or a
 * literal outside `content/**`, so `scanContent` below can't see it. Kept
 * by hand, reviewed wherever the hardcoded name itself is reviewed — an
 * entry missing here throws at prerender, same as an author's typo in
 * `content/**` does.
 */
const HARDCODED_ICONS = [
  'pencil-line', 'info', 'lightbulb', 'triangle-alert', // Callout.js: one glyph per variant
  'check', 'copy', 'chevron-right', 'file-text', 'external-link', // CopyPage.js
  'search', 'x', // SearchBar/index.js
];

/** `icon="…"`, on any content component — Card, Steps, Accordion, or one not yet written. */
const CONTENT_ICON_PROP = /\bicon="([^"]+)"/g;

/** `<Icon name="…">`, written directly. Measured at the time this shipped: zero. */
const CONTENT_ICON_TAG = /<Icon\s+[^>]*?\bname="([^"]+)"/g;

/** Only these two extensions carry MDX; anything else under `content/` is an asset. */
const CONTENT_FILE = /\.mdx?$/i;

const LUCIDE_ICONS_DIR = 'node_modules/lucide-static/icons';
const LUCIDE_LICENSE = 'node_modules/lucide-static/LICENSE';
const LICENSE_DESTINATION = 'static/icons/LICENSE.txt';
const REGISTRY_TARGET = 'src/icons/registry.js';
const RUNTIME_TEMPLATE = 'src/plugins/sidebar-icons/registryRuntime.js';

/** Coalesces a burst of fs events (some tools emit more than one per save) into one rebuild. */
const DEBOUNCE_MS = 150;

/**
 * Levenshtein distance, hand-written for the same reason
 * `registryRuntime.js` gives: a dependency for eight lines is the worse
 * trade. This copy runs here in Node, at build time, over sidebar and
 * content slugs; `registryRuntime.js` carries its own, for the
 * browser/SSR runtime — neither can import the other.
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
  // Same ratio throughout this project: past a third of the length, the
  // suggestion turns into noise.
  return smallest <= Math.max(2, Math.ceil(name.length / 3)) ? best : undefined;
}

/**
 * `book-open` → `BookOpen`, `x` → `X`: a JS identifier for the slug's
 * `import` binding.
 *
 * @param {string} slug
 */
function pascalCase(slug) {
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

/**
 * Refuses to proceed with a slug the installed package doesn't have, with
 * a nearest-neighbor suggestion — the same shape whichever of the three
 * scans below found it, `source` naming which one so the message points
 * at where to fix it.
 *
 * @param {Iterable<string>} slugs
 * @param {Set<string>} known
 * @param {string[]} catalog
 * @param {string} source
 */
function assertKnown(slugs, known, catalog, source) {
  for (const slug of slugs) {
    if (!known.has(slug)) {
      const suggestion = nearestNeighbor(slug, catalog);
      throw new Error(
        [
          `Ícone "${slug}" não existe em ${LUCIDE_ICONS_DIR} (${source}).`,
          suggestion && `Você quis dizer "${suggestion}"?`,
          'Confira o slug em https://lucide.dev/icons.',
        ]
          .filter(Boolean)
          .join('\n'),
      );
    }
  }
}

/**
 * The full Lucide catalog installed, read once and shared by both outputs
 * below.
 *
 * @param {string} siteDir
 */
async function loadCatalog(siteDir) {
  const iconsDir = path.join(siteDir, LUCIDE_ICONS_DIR);
  const catalog = (await fs.readdir(iconsDir))
    .filter((file) => file.endsWith('.svg'))
    .map((file) => file.replace(/\.svg$/, ''));
  return {catalog, known: new Set(catalog)};
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
 * Every icon slug an MDX author writes, anywhere under `content/`.
 *
 * @param {string} siteDir
 */
async function scanContent(siteDir) {
  const slugs = new Set();

  /** @param {string} dir */
  async function walk(dir) {
    const entries = await fs.readdir(dir, {withFileTypes: true});
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
        continue;
      }
      if (!CONTENT_FILE.test(entry.name)) {
        continue;
      }
      const source = await fs.readFile(full, 'utf8');
      for (const match of source.matchAll(CONTENT_ICON_PROP)) {
        slugs.add(match[1]);
      }
      for (const match of source.matchAll(CONTENT_ICON_TAG)) {
        slugs.add(match[1]);
      }
    }
  }

  await walk(path.join(siteDir, 'content'));
  return slugs;
}

/**
 * One CSS rule per sidebar slug, the artwork inlined as a base64 data URI
 * so a missing file in `static/` can never 404: `--pd-sidebar-icon` is the
 * same custom property `chrome.css`'s mask rule already reads, just fed a
 * class per slug instead of per section. `CHROME_ICONS` get a second,
 * fixed rule each, keyed by their own `--pd-chrome-icon-<slug>` property.
 *
 * @param {Set<string>} sidebarSlugs
 * @param {string[]} catalog
 * @param {Set<string>} known
 * @param {string} siteDir
 */
async function stylesheetFor(sidebarSlugs, catalog, known, siteDir) {
  assertKnown(sidebarSlugs, known, catalog, 'sidebar');
  assertKnown(CHROME_ICONS, known, catalog, 'chrome fixo');

  const iconsDir = path.join(siteDir, LUCIDE_ICONS_DIR);
  const dataUriFor = async (slug) => {
    const svg = await fs.readFile(path.join(iconsDir, `${slug}.svg`), 'utf8');
    return `data:image/svg+xml;base64,${Buffer.from(svg, 'utf8').toString('base64')}`;
  };

  const rules = [];
  for (const slug of [...sidebarSlugs].sort()) {
    rules.push(`.sidebar-icon--${slug} { --pd-sidebar-icon: url("${await dataUriFor(slug)}"); }`);
  }
  for (const slug of CHROME_ICONS) {
    rules.push(`:root { --pd-chrome-icon-${slug}: url("${await dataUriFor(slug)}"); }`);
  }

  return `${rules.join('\n')}\n`;
}

/**
 * `src/icons/registry.js`, generated: one static import per icon this
 * project's MDX actually uses, from the installed `lucide-static`
 * package, plus `registryRuntime.js` appended verbatim for resolution,
 * the throw, and the nearest-neighbor suggestion.
 *
 * @param {Set<string>} slugs
 * @param {string} siteDir
 */
async function registryModuleFor(slugs, siteDir) {
  const sorted = [...slugs].sort();
  const identifiers = sorted.map(pascalCase);
  const runtime = await fs.readFile(path.join(siteDir, RUNTIME_TEMPLATE), 'utf8');

  const imports = sorted.map((slug, i) => `import ${identifiers[i]} from 'lucide-static/icons/${slug}.svg';`);
  const entries = sorted.map((slug, i) => `  '${slug}': ${identifiers[i]},`);

  const lines = [
    '// @ts-check',
    '',
    '/**',
    ' * `src/icons/registry.js`, GENERATED by `src/plugins/sidebar-icons`: one',
    " * static import per icon this project's MDX actually uses — scanned from",
    ' * `content/**`, plus the handful `src/components/Callout.js`,',
    ' * `src/theme/MDXComponents/CopyPage.js`, and `src/theme/SearchBar/index.js`',
    ' * hardcode. Edit content or the component, not this file: the next',
    ' * `npm start` or `npm run build` overwrites it.',
    ' *',
    ' * Per-size optical compensation (`strokeWidth`) lives in',
    ' * `src/components/Icon.js`, not here — this file only resolves a name to',
    ' * a drawing.',
    ' */',
    '',
    ...imports,
    '',
    '/** @type {Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>>} */',
    'const DRAWINGS = {',
    ...entries,
    '};',
    '',
    runtime.trimEnd(),
    '',
  ];

  return lines.join('\n');
}

/**
 * @param {import('@docusaurus/types').LoadContext} context
 * @returns {import('@docusaurus/types').Plugin}
 */
export default function sidebarIconsPlugin(context) {
  const {siteDir, generatedFilesDir} = context;
  const cssPath = path.join(generatedFilesDir, 'pd-sidebar-icons', 'styles.css');
  const registryPath = path.join(siteDir, REGISTRY_TARGET);

  const rebuild = async () => {
    const {catalog, known} = await loadCatalog(siteDir);

    const sidebarSlugs = await scanSidebars(siteDir);
    const css = await stylesheetFor(sidebarSlugs, catalog, known, siteDir);
    await fs.mkdir(path.dirname(cssPath), {recursive: true});
    await fs.writeFile(cssPath, css, 'utf8');

    const contentSlugs = await scanContent(siteDir);
    const registrySlugs = new Set([...contentSlugs, ...HARDCODED_ICONS]);
    assertKnown(registrySlugs, known, catalog, 'registro de ícones do MDX');
    const registry = await registryModuleFor(registrySlugs, siteDir);
    // `src/icons/` holds nothing else tracked now that this file is
    // gitignored: a fresh checkout has no such directory at all, unlike a
    // long-lived local clone where it lingers from before.
    await fs.mkdir(path.dirname(registryPath), {recursive: true});
    await fs.writeFile(registryPath, registry, 'utf8');

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
