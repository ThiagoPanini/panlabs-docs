/**
 * The library build `panlabs-docs` doesn't ship, because it isn't a library.
 *
 * design-sync's converter wants a built entry plus a compiled stylesheet. This
 * script produces exactly that, and it exists to absorb four things the
 * converter's own bundler can't do for a Docusaurus site:
 *
 *   1. JSX lives in `.js` files here. esbuild's default `.js` loader doesn't
 *      parse JSX, so the loader is pinned.
 *   2. `src/icons/registry.js` imports Lucide `.svg` files and renders them as
 *      COMPONENTS — that's SVGR, a webpack loader. The converter loads `.svg`
 *      as a data URL, which would turn every `<Drawing />` into an invalid
 *      element type. The `svgr` plugin below restores the component form.
 *   3. `@site/*` and `@docusaurus/Link` are webpack aliases, not packages.
 *   4. `catalog.module.css` is a CSS Module, and the components paint through
 *      its class names (never through `data-pd-*` — see the note in
 *      `Callout.js`). esbuild's native `local-css` handling keeps the JS and
 *      the emitted CSS agreeing on the hashed names.
 *
 * What it does NOT do: change, wrap, or reimplement a component. The output is
 * the repo's own source, transpiled.
 *
 * Output (gitignored, regenerated): `.design-sync/.cache/dist/index.{js,css}`.
 */

import {createRequire} from 'node:module';
import {readFileSync, writeFileSync, mkdirSync, existsSync, statSync, readdirSync, cpSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '..');
const OUT = join(HERE, '.cache', 'dist');

/* esbuild comes from the staged converter deps (`.ds-sync/`), which is where
   design-sync installs it. Both are gitignored, so a fresh clone stages the
   scripts before running this — the re-sync flow does that already. */
const require = createRequire(import.meta.url);
let esbuild;
for (const candidate of ['../.ds-sync/node_modules/esbuild', 'esbuild']) {
  try {
    esbuild = require(candidate);
    break;
  } catch {}
}
if (!esbuild) {
  console.error(
    "esbuild not found. Stage the converter first:\n" +
      "  cp -r <skill>/package-*.mjs <skill>/resync.mjs <skill>/lib <skill>/storybook .ds-sync/\n" +
      "  (cd .ds-sync && npm i esbuild ts-morph @types/react)",
  );
  process.exit(1);
}

/* -----------------------------------------------------------------------------
   SVGR, minus the toolchain.

   The drawing is preserved byte for byte and handed to React through
   `dangerouslySetInnerHTML`, so no SVG child is ever re-parsed or re-emitted.
   Only the ROOT attributes cross into React's naming (`stroke-width` ->
   `strokeWidth`), and props land after them, which is what lets `Icon.js`
   override `strokeWidth` per size the way it does under webpack.
   --------------------------------------------------------------------------- */

const ROOT = /<svg([^>]*)>([\s\S]*)<\/svg>/;
const ATTR = /([:A-Za-z_][-.:\w]*)\s*=\s*"([^"]*)"/g;

function reactAttrName(name) {
  if (name === 'class') return 'className';
  if (name.startsWith('data-') || name.startsWith('aria-')) return name;
  return name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

const svgr = {
  name: 'svgr',
  setup(build) {
    build.onLoad({filter: /\.svg$/}, (args) => {
      const source = readFileSync(args.path, 'utf8');
      const match = ROOT.exec(source);
      if (!match) {
        return {errors: [{text: `${args.path}: no <svg> root element`}]};
      }
      const [, attrString, inner] = match;
      const base = {};
      for (const [, name, value] of attrString.matchAll(ATTR)) {
        base[reactAttrName(name)] = value;
      }
      return {
        loader: 'js',
        contents:
          `import * as React from 'react';\n` +
          `const BASE = ${JSON.stringify(base)};\n` +
          `const INNER = ${JSON.stringify(inner)};\n` +
          `export default function Svg(props) {\n` +
          `  return React.createElement('svg', {...BASE, ...props, dangerouslySetInnerHTML: {__html: INNER}});\n` +
          `}\n`,
      };
    });
  },
};

/* -----------------------------------------------------------------------------
   The webpack aliases Docusaurus provides and esbuild doesn't.
   --------------------------------------------------------------------------- */

const ALIASES = [
  [/^@site\//, (path) => join(REPO, path.slice('@site/'.length))],
  [/^@docusaurus\/Link$/, () => join(HERE, 'shims', 'docusaurus-link.js')],
];

/* Webpack resolves the extension; esbuild only does that for its own
   resolution, not for a path a plugin hands back. */
const EXTENSIONS = ['', '.js', '.jsx', '.mjs', '/index.js', '/index.jsx'];

function withExtension(path) {
  for (const extension of EXTENSIONS) {
    if (existsSync(path + extension) && !path.endsWith('/')) {
      const candidate = path + extension;
      if (statSync(candidate).isFile()) return candidate;
    }
  }
  return path;
}

const aliases = {
  name: 'docusaurus-aliases',
  setup(build) {
    build.onResolve({filter: /^@(site|docusaurus)\//}, (args) => {
      for (const [pattern, target] of ALIASES) {
        if (pattern.test(args.path)) return {path: withExtension(target(args.path))};
      }
      return undefined;
    });
  },
};

/* -----------------------------------------------------------------------------
   `src/icons/registry.js` is generated and gitignored, so a fresh clone has no
   `src/icons/` at all — and `Icon.js` imports `resolveIcon` from it. Under
   Docusaurus the `pd-sidebar-icons` plugin writes it on every start and build;
   here it is called directly, which keeps this script the single command a
   clean checkout needs.

   The plugin is ESM in a package with no `"type": "module"`, so node would
   read it as CommonJS and choke on `export default`. esbuild is already in
   hand — transpile it to a real `.mjs` and import that.

   `loadContent()` also starts a file watcher, but only when NODE_ENV is
   `development`. It isn't, running this way, so the call returns.
   --------------------------------------------------------------------------- */

mkdirSync(OUT, {recursive: true});

const ICON_SHEET = join(REPO, '.docusaurus', 'pd-sidebar-icons', 'styles.css');

if (!existsSync(join(REPO, 'src', 'icons', 'registry.js')) || !existsSync(ICON_SHEET)) {
  const plugin = join(OUT, 'sidebar-icons.mjs');
  await esbuild.build({
    entryPoints: [join(REPO, 'src', 'plugins', 'sidebar-icons', 'index.js')],
    outfile: plugin,
    bundle: true,
    format: 'esm',
    platform: 'node',
    packages: 'external',
  });
  const {default: sidebarIcons} = await import(pathToFileURL(plugin).href);
  await sidebarIcons({siteDir: REPO, generatedFilesDir: join(REPO, '.docusaurus')}).loadContent();
  console.log('  regenerated src/icons/registry.js + the icon stylesheet (one was absent)');
}

const result = await esbuild.build({
  entryPoints: [join(HERE, 'entry.js')],
  outfile: join(OUT, 'index.js'),
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2020',
  /* React stays external: the converter re-points it at `window.React`, and a
     second copy inside the bundle would break element identity. */
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  loader: {'.js': 'jsx'},
  jsx: 'automatic',
  plugins: [aliases, svgr],
  logLevel: 'info',
  metafile: true,
});

/* -----------------------------------------------------------------------------
   One stylesheet, because that's what the site loads.

   `docusaurus.config.js` hands Docusaurus five global files through
   `customCss`, and webpack extracts `catalog.module.css` alongside them. The
   converter takes a single `cssEntry`, so the same set is concatenated here in
   the same order — globals first (tokens must be declared before the component
   CSS reads them), the module CSS last.

   `chrome.css` is the one file left out, and the reason is what it contains:
   70 rules, every one of them addressing the Docusaurus frame —
   `html.docs-doc-page`, `.navbar`, `.theme-doc-sidebar-*`, `.breadcrumbs`,
   `.pagination-nav`, `.footer`. None of those elements exists in a design
   built from this system, and the type scale they modulate is already
   declared on the bare `h1`–`h6` in `custom.css`.
   --------------------------------------------------------------------------- */

const GLOBAL_CSS = ['tokens.css', 'custom.css', 'components.css', 'focus.css'];

/* `@font-face` in `custom.css` points at `/fonts/*.woff2`, which Docusaurus
   serves from `static/`. Nothing serves that path here, so the files are
   co-located with the stylesheet and the url is made relative — which is also
   the shape `extractFonts` resolves and `rewriteBundleFontFaces` accepts. */
mkdirSync(join(OUT, 'fonts'), {recursive: true});
for (const file of readdirSync(join(REPO, 'static', 'fonts')).filter((f) => /\.(woff2?|ttf|otf)$/i.test(f))) {
  cpSync(join(REPO, 'static', 'fonts', file), join(OUT, 'fonts', file));
}

/* -----------------------------------------------------------------------------
   The adapter's missing consumer.

   `tokens.css` ends with the ADAPTER: a one-way block assigning `--ifm-*` from
   `var(--pd-*)`. It only assigns. The rules that READ those variables are
   Infima's, and Infima is Docusaurus's stylesheet — not this repo's, and not
   something a design system bundle should carry.

   Ship the assignment without the consumer and the page is silently wrong:
   prose falls back to the browser's serif while `--pd-font-body` sits resolved
   and unread, every link comes back underlined against an explicit
   `--ifm-link-decoration: none`, and headings lose `--pd-text-strong`.

   So this is the consumer, and nothing else. Every declaration below is a
   `var(--ifm-*)` this repo's own adapter assigns — no value is chosen here, and
   a skin swap or an adapter edit carries through untouched. The line-by-line
   correspondence is the rule: a property whose variable the adapter doesn't
   assign does not belong in this block.
   --------------------------------------------------------------------------- */

const ADAPTER_CONSUMER = `
:root {
  background: var(--ifm-background-color);
  color: var(--ifm-font-color-base);
  font-family: var(--ifm-font-family-base);
  font-size: var(--ifm-font-size-base);
  line-height: var(--ifm-line-height-base);
}

a {
  color: var(--ifm-link-color);
  text-decoration: var(--ifm-link-decoration);
}

a:hover {
  color: var(--ifm-link-hover-color);
  text-decoration: var(--ifm-link-hover-decoration);
}

h1, h2, h3, h4, h5, h6 {
  color: var(--ifm-heading-color);
  font-weight: var(--ifm-heading-font-weight);
}
`;

const moduleCss = readFileSync(join(OUT, 'index.css'), 'utf8');
/* The SIXTH stylesheet, and the one that isn't in `customCss`: the icon plugin
   writes it into `.docusaurus/` and hands it to Docusaurus through
   `getClientModules()`. Two of its rules matter here — `:root` declarations of
   `--pd-chrome-icon-chevron-right` and `--pd-chrome-icon-list`, the data-URI
   masks that draw the accordion's caret and the mobile menu's glyph. Without
   them `mask: var(--pd-chrome-icon-chevron-right)` has nothing to mask with and
   the caret paints as a solid square.

   Its other rules — the `.sidebar-icon--*` classes — are dropped on purpose:
   their only consumer is `chrome.css`, which this bundle doesn't ship either. */
const iconVariables = readFileSync(ICON_SHEET, 'utf8')
  .split('\n')
  .filter((line) => line.startsWith(':root'))
  .join('\n');

const globals = [
  ...GLOBAL_CSS.map(
    (file) => `/* ===== src/css/${file} ===== */\n${readFileSync(join(REPO, 'src', 'css', file), 'utf8')}`,
  ),
  `/* ===== icon masks (generated by src/plugins/sidebar-icons) ===== */\n${iconVariables}`,
].join('\n\n');

writeFileSync(
  join(OUT, 'index.css'),
  [
    globals,
    `/* ===== component CSS (src/components/catalog.module.css) ===== */\n${moduleCss}`,
    `/* ===== the adapter's consumer (see the note above) ===== */\n${ADAPTER_CONSUMER}`,
  ]
    .join('\n\n')
    .replace(/url\((['"]?)\/fonts\//g, 'url($1./fonts/'),
);

const outKey = Object.keys(result.metafile.outputs).find((k) => k.endsWith('index.js'));
console.log(
  `\n  dist: ${OUT}\n` +
    `    index.js   ${Object.keys(result.metafile.outputs[outKey]?.inputs ?? {}).length} inputs\n` +
    `    index.css  ${GLOBAL_CSS.length} global files + component CSS\n` +
    `    fonts/     ${readdirSync(join(OUT, 'fonts')).length} files`,
);
