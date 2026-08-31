// @ts-check

/**
 * panlabs-docs, Docusaurus configuration.
 *
 * Rule that spans this file: NO color value enters here. The syntax palette
 * reaches Prism through a shim that only references tokens; the single
 * source of value stays `src/css/tokens.css`.
 */

/**
 * Prism theme shim.
 *
 * A `prism-react-renderer` theme is `{plain, styles: [{types, style}]}`, and
 * `style` accepts any CSS string, including `var(--pd-code-*)`. That's what
 * keeps the single source of value: the syntax palette is a layer-2 role,
 * forked per mode in `tokens.css`, and this object only references it.
 *
 * One shim serves both modes: Docusaurus falls back to `prism.theme` when
 * `prism.darkTheme` doesn't exist, and the tokens already fork by mode.
 *
 * `plain.backgroundColor` is also where the adapter's exception 4 writes:
 * `CodeBlock/Container` injects `--prism-background-color` as an INLINE
 * style attribute, and inline style isn't reachable by a stylesheet.
 *
 * @type {import('prism-react-renderer').PrismTheme}
 */
const temaPrism = {
  plain: {
    color: 'var(--pd-code-fg)',
    backgroundColor: 'var(--pd-surface-code)',
  },
  styles: [
    {
      types: ['comment', 'prolog', 'doctype', 'cdata'],
      style: {color: 'var(--pd-code-comment)', fontStyle: 'italic'},
    },
    {
      types: ['keyword', 'atrule', 'selector', 'tag', 'important', 'builtin'],
      style: {color: 'var(--pd-code-keyword)'},
    },
    {
      types: ['string', 'char', 'attr-value', 'regex', 'inserted'],
      style: {color: 'var(--pd-code-string)'},
    },
    {
      types: ['function', 'class-name', 'function-variable'],
      style: {color: 'var(--pd-code-function)'},
    },
    {
      types: ['constant', 'symbol', 'number', 'boolean', 'deleted'],
      style: {color: 'var(--pd-code-constant)'},
    },
    {
      types: ['parameter', 'variable', 'property', 'attr-name'],
      style: {color: 'var(--pd-code-parameter)'},
    },
    {
      types: ['operator', 'punctuation', 'entity', 'url'],
      style: {color: 'var(--pd-code-operator)'},
    },
  ],
};

/**
 * The four tabs, in navbar order: the single source of order for the
 * search and ai-era plugins. Ids only, the LABEL of each is read from the
 * navbar itself, further down this file, since that's where it already
 * exists and where `navbar.json` translation reaches it.
 *
 * The list lives here, not inside each plugin, because the order search
 * uses to break ties and the order the navbar presents tabs in are the
 * SAME decision; two copies of it would drift the day a tab changes.
 *
 * `Jornadas` sits second, ahead of `Procedimentos`: the order reflects what
 * the collection actually has to offer. `Ferramentas` and `Jornadas` carry
 * content; `Procedimentos` and `Times` are placeholders until real content
 * lands. Since this list is also search's first tiebreaker, ranking the
 * two empty tabs lower is a result decision, not an aesthetic one.
 */
const TABS = ['tools', 'default', 'procedures', 'teams'];

/** @type {import('@docusaurus/types').Config} */
const config = {
  // `panlabs`, lowercase, with no product name above it: `title` and
  // `tagline` aren't translatable in Docusaurus, so the site's identity has
  // to live in a single string that needs no translation.
  title: 'panlabs',
  tagline: 'O acervo de aprendizado de um desenvolvedor',

  // GitHub Pages, this repository's own.
  url: 'https://thiagopanini.github.io',
  baseUrl: '/panlabs-docs/',
  organizationName: 'ThiagoPanini',
  projectName: 'panlabs-docs',

  // URLs with no trailing slash. Four reasons, verified in the v3.10.2
  // source:
  //
  //   a) it's the only value that preserves the `.md` convention: appending
  //      `.md` to the URL the reader is looking at has to be pure string
  //      concatenation, and a trailing slash would turn it into `/foo/.md`;
  //   b) it collapses permalink and route into one string, so
  //      `removeTrailingSlash` is a no-op and the two representations can
  //      never diverge;
  //   c) it doesn't threaten the footer's `llms.txt` link: `Link.tsx`
  //      applies `applyTrailingSlash` to any internal URL with no
  //      extension guard, so `true` would turn that link into `/llms.txt/`;
  //   d) files under `static/` are immune either way, copied verbatim by
  //      `StaticDirectoriesCopyPlugin`.
  //
  // `undefined` is off the table: links would come out however each plugin
  // generated them, unnormalized, and the output would stop being
  // determined by this config.
  trailingSlash: false,

  onBrokenLinks: 'throw',
  // Third of the trio. Docusaurus defaults to `warn`, and a broken anchor
  // that only warns is a broken anchor that stays. Contract consequence:
  // every anchor a link cites is declared with `{#id}` on the heading
  // itself, instead of depending on how the slugger handles accents.
  onBrokenAnchors: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  // `future.v4` stays OFF on purpose. One of the flags it turns on is
  // `useCssCascadeLayers`, and this project keeps `@layer` out: its
  // specificity architecture is measured against Infima with no cascade
  // layers. Turning the flag on changes that premise.

  // NOT an i18n leftover: this is what pins the locale to pt-BR. Without
  // this block, Docusaurus's own default is `en` (`DEFAULT_I18N_CONFIG`,
  // checked in
  // `node_modules/@docusaurus/core/lib/server/configValidation.js`), and
  // the site's `htmlLang` would come out wrong. A single-entry locale list
  // is the standard way to pin a language with no translation, no
  // dropdown, and no `i18n/` directory.
  i18n: {
    defaultLocale: 'pt-BR',
    locales: ['pt-BR'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        // The `Jornadas` tab is the docs plugin's `default` instance.
        //
        // The collection lives in `content/`, not `docs/`: `docs/` is this
        // repository's OWN documentation, the one agents read. The public route
        // is `/jornadas`.
        docs: {
          path: 'content/jornadas',
          routeBasePath: 'jornadas',
          sidebarPath: './sidebars-jornadas.js',
        },
        // No blog: nothing in the map asked for one, and a plugin turned on
        // with no consumer is the same class of defect as Infima's inert
        // variables.
        blog: false,
        // SVGR inlines the `.drawio.svg` imported by a page, and these two
        // optimizations are off because the stage paints the drawing by
        // matching draw.io's ATTRIBUTE layer with a selector.
        //
        // `moveElemsAttrsToGroup` hoists a shared attribute up to the
        // parent `<g>`, and it hoists MORE in a file saved by an editor
        // with no `light-dark()`, because colors are uniform there. The
        // attribute would leave the leaf, the selector would stop
        // matching, and the result was an invisible black arrow in dark
        // mode, ONLY in files from that editor. Measured: 3 hoisted groups
        // in the affected file, zero in the clean one.
        //
        // `convertColors` shortens `#000000` to `#000`, and an attribute
        // selector matches a string, not a color. Turning it off keeps one
        // shape only.
        svgr: {
          svgrConfig: {
            svgoConfig: {
              plugins: [
                {
                  name: 'preset-default',
                  params: {
                    overrides: {
                      removeTitle: false,
                      removeViewBox: false,
                      moveElemsAttrsToGroup: false,
                      convertColors: false,
                    },
                  },
                },
              ],
            },
          },
        },
        theme: {
          // Order matters: `tokens.css` comes first because the roots must
          // exist before any rule that consumes them.
          customCss: [
            './src/css/tokens.css',
            './src/css/custom.css',
            './src/css/chrome.css',
            './src/css/components.css',
            './src/css/focus.css',
          ],
        },
      }),
    ],
  ],

  // The other three tabs. One instance PER tab, one to one, never one
  // instance with multiple sidebars: `routeBasePath` is per instance, so
  // sharing one would nest tools under `/jornadas/ferramentas/…` and the
  // URL would stop reflecting the navigation axis.
  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      /** @type {import('@docusaurus/plugin-content-docs').Options} */
      ({
        id: 'procedures',
        path: 'content/procedimentos',
        routeBasePath: 'procedimentos',
        sidebarPath: './sidebars-procedimentos.js',
      }),
    ],
    [
      '@docusaurus/plugin-content-docs',
      /** @type {import('@docusaurus/plugin-content-docs').Options} */
      ({
        id: 'tools',
        path: 'content/ferramentas',
        routeBasePath: 'ferramentas',
        sidebarPath: './sidebars-ferramentas.js',
      }),
    ],
    [
      '@docusaurus/plugin-content-docs',
      /** @type {import('@docusaurus/plugin-content-docs').Options} */
      ({
        id: 'teams',
        path: 'content/times',
        routeBasePath: 'times',
        sidebarPath: './sidebars-times.js',
      }),
    ],

    // Resolves every sidebar icon's Lucide slug and emits the stylesheet
    // that masks it in. Bare string, no options: it reads the sidebar
    // files listed in its own module, not the instances above.
    './src/plugins/sidebar-icons',

    // The site's own search and ai-era plugins. Neither is an npm
    // dependency or an external service: they're the same mechanism seen
    // from two sides, and they read the four instances above through the
    // same hook (`allContentLoaded`).
    //
    // `TABS` is declared once and served to both: it's the navbar order,
    // which search uses as its first tiebreaker and `llms.txt` uses as
    // section order. An id missing from the instances above breaks the
    // build instead of silently dropping a third of the site.
    ['./src/plugins/search', {tabs: TABS}],
    ['./src/plugins/ai-era', {tabs: TABS}],
  ],

  // The diagram lightbox's behavior, and the only entry this key will ever
  // want to keep short.
  //
  // It's here, and not in React, because React has no rung that reaches:
  // `Root`, `Layout`, and `DocItem/Layout` are all absent from
  // `@docusaurus/theme-classic`'s swizzle ledger, so each falls through to
  // the `unsafe` default, and the budget for those is fixed at zero.
  // `clientModules` is a public configuration key — rung 2 of the same
  // ladder — and it spends nothing. See
  // DECISIONS.md#the-diagram-lightbox.
  //
  // The module is inert until a reader clicks a diagram: it registers one
  // delegated listener on `document` and nothing else, which is also what
  // makes it indifferent to client-side navigation.
  clientModules: ['./src/clientModules/lightbox.js'],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        // Dark is canonical, it's where the design was born. Not a mandate
        // on the reader: `respectPrefersColorScheme` hands them their
        // system's mode.
        defaultMode: 'dark',
        respectPrefersColorScheme: true,
        disableSwitch: false,
      },
      navbar: {
        // THE BRAND IS JUST THE WORD, back to Docusaurus's native path.
        //
        // `title` with no `logo` makes the upstream render a plain
        // `<b class="navbar__title">` inside `.navbar__brand`: pure type,
        // no `<img>`, no glyph. Gone with it: the custom theme component
        // that existed only to draw the glyph-and-word pair, and the
        // `.navbar__brand:empty` rule that hid the empty link the upstream
        // renders when `title` is absent.
        //
        // Same argument as the landing page's figure, with more force: the
        // brand appears on EVERY page, the landing on one. It stays
        // MONOCHROME, in `--pd-text-strong`: tinting a word with an accent
        // in the top-left corner is the kind of flourish the house rule
        // refuses. The typography didn't change; what left was the glyph,
        // the only thing consuming `--pd-accent`.
        //
        // `title` is a translatable string; `panlabs` needs no translation
        // either way, which is part of why the name was chosen.
        title: 'panlabs',

        items: [
          // THE SPACER THAT OPENS THE TAB STRIP: the only piece of the
          // strip that isn't CSS. It has 100% basis and 0 height
          // (`chrome.css`), so it forces a line break inside
          // `.navbar__items` without taking up a pixel.
          //
          // Chosen over giving the brand `flex-basis: 100%`, which also
          // works and is measured, because it doesn't couple the strip to
          // a brand EXISTING. The style is replicable as a house template,
          // and swapping the brand for something else doesn't lose the
          // strip.
          //
          // `value` can NOT be empty: the schema fails the build with
          // `"navbar.items[N].value" is not allowed to be empty`. An HTML
          // comment satisfies the schema and renders nothing.
          {
            type: 'html',
            position: 'left',
            className: 'tab-strip-break',
            value: '<!--quebra-->',
          },

          // The four tabs. Each swaps the whole sidebar, and each sidebar
          // is its own instance: the navigation axis is the nature of the
          // content.
          {
            type: 'docSidebar',
            docsPluginId: 'tools',
            sidebarId: 'tools',
            position: 'left',
            label: 'Ferramentas',
          },
          {
            type: 'docSidebar',
            sidebarId: 'journeys',
            position: 'left',
            label: 'Jornadas',
          },
          {
            type: 'docSidebar',
            docsPluginId: 'procedures',
            sidebarId: 'procedures',
            position: 'left',
            label: 'Procedimentos',
          },
          {
            type: 'docSidebar',
            docsPluginId: 'teams',
            sidebarId: 'teams',
            position: 'left',
            label: 'Times',
          },

          // Right side, in declared order: search, GitHub. The theme
          // toggle isn't declarable: `Navbar/Content` renders it after the
          // right-side items, which is why it always closes the line.
          //
          // The search slot is RESERVED here and filled by the search
          // plugin. While the theme's `SearchBar` is the empty placeholder,
          // the upstream hides the container on its own
          // (`.navbarSearchContainer:empty`), so reserving the spot costs
          // zero pixels.
          {type: 'search', position: 'right'},
          {
            href: 'https://github.com/ThiagoPanini/panlabs-docs',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        // `style` is NOT declared. The schema defaults to `'light'`;
        // `'dark'` would hardcode the literal `#303846` plus four more
        // variables of its own. Not configuring it is a clean decision, not
        // an omission.
        //
        // `links` is a FLAT list, never `MultiColumn`. A sitemap in the
        // footer is a second copy of navigation the reader already has in
        // view, and a column would mean inventing a company around a
        // fictional product.
        //
        // The rule that chose these links: the footer holds only what
        // lives nowhere else on the site. `llms.txt` is the fourth, and it
        // ships alongside the ai-era plugin's other artifacts.
        //
        // The company is NEVER named, and the developer has NO name
        // either, so there's no status domain to cite and no one to write
        // to: inventing either would name the employer by accident, the
        // one thing this collection's narrative forbids in writing.
        // `llms.txt` is the only artifact on the site with no navigation
        // entry at all, so without this line it's undiscoverable.
        //
        // `pathname://` is Docusaurus's PUBLIC escape hatch for pointing at
        // a file that isn't a route. It does three things at once: `<Link>`
        // uses `<a>` instead of `history.push()`, the link checker doesn't
        // charge a route that never existed, and `baseUrl` still gets
        // prepended, which is where the artifact is served from.
        //
        // `target: '_self'` is a measured premise fix: `<Link>` injects
        // `target="_blank"` on its own for anything it reads as external,
        // and this footer's decision is that no link opens a new tab.
        links: [
          {label: 'Changelog', to: '/ferramentas/bibliotecas/overpower/referencia/changelog'},
          {label: 'llms.txt', href: 'pathname:///llms.txt', target: '_self'},
        ],
        copyright: '© 2026 panlabs',
      },
      prism: {
        theme: temaPrism,
        // `bash` isn't in `prism-react-renderer`'s default bundle; without
        // registering it, a fenced block renders with no highlight and
        // nothing warns you. It backs the AWS CLI fences across the
        // landing page, `Procedimentos`, and `Ferramentas`: a missing
        // highlight in a fence is what catches a forgotten registration
        // today.
        additionalLanguages: ['bash'],
      },
    }),
};

export default config;
