/**
 * `src/icons/manifest.js` is a contract: the names are what matters, the
 * drawings are skin. Drawings live in `static/icons/*.svg` and are
 * interchangeable; names are not. Another iconography replaces the SVG
 * files and keeps the names: no component and no MDX gets rewritten.
 */

/**
 * `name` is our semantic name, the one authors write in MDX. `lucide` is set
 * only where the upstream name diverges: Lucide renames glyphs between
 * versions, and this field absorbs that so a one-line map changes instead of
 * every MDX page that uses the icon.
 *
 * @typedef {'system' | 'navigation' | 'authoring'} Role
 * @typedef {{name: string, roles: Role[], where: string, lucide?: string}} Entry
 */

/**
 * System icons: the component chooses these, never the author.
 * @type {Entry[]}
 */
const SYSTEM = [
  {name: 'info', roles: ['system'], where: 'callout `info`'},
  {name: 'lightbulb', roles: ['system'], where: 'callout `tip`'},
  {name: 'triangle-alert', roles: ['system'], where: 'callout `warning`'},
  {name: 'pencil-line', roles: ['system'], where: 'callout `note`'},
  {name: 'chevron-right', roles: ['system'], where: 'caret de `Accordion`, de categoria de sidebar e — girado — do par `Copiar página`'},
  {name: 'check', roles: ['system'], where: 'passo concluído em `Steps` e confirmação de `Copiar página`'},
  {name: 'copy', roles: ['system'], where: 'botão copiar do bloco de código e o par `Copiar página`'},
  {name: 'wrap-text', roles: ['system'], where: 'toggle de quebra de linha do bloco de código', lucide: 'text-wrap'},
  {name: 'external-link', roles: ['system'], where: 'link externo e os itens de assistente de `Copiar página`'},
  {name: 'search', roles: ['system'], where: 'busca'},
  {name: 'x', roles: ['system'], where: 'fechar modal'},
  {name: 'menu', roles: ['system'], where: 'hambúrguer de tela estreita'},
  {name: 'sun', roles: ['system'], where: 'tema claro'},
  {name: 'moon', roles: ['system'], where: 'tema escuro'},
  {name: 'monitor', roles: ['system'], where: 'tema do sistema'},
  {name: 'languages', roles: ['system'], where: 'seletor de locale'},
  {name: 'link', roles: ['system'], where: 'âncora de heading'},
  {name: 'list', roles: ['system'], where: 'título do índice desta página', lucide: 'text-align-start'},
  {name: 'arrow-right', roles: ['system'], where: 'paginação e CTA de card'},
];

/**
 * Only two icons carry the `navigation` role and nothing else; every other
 * navigation tag rides on an authoring entry as a second role, which is what
 * lets the number of tags exceed the number of files.
 * @type {Entry[]}
 */
const NAVIGATION = [
  {name: 'code-xml', roles: ['navigation'], where: 'Jornadas › API Owner › Conteúdo Teórico'},
  {name: 'activity', roles: ['navigation'], where: 'Procedimentos › Work in Progress e Times › Work in Progress'},
];

/**
 * Authoring icons: the vocabulary written as a STRING, in author MDX, via
 * `<Card icon="…">`.
 *
 * Most of these also carry a second `navigation` role: reusing an authoring
 * drawing for navigation costs no new file, which is why tag count can run
 * well above file count.
 * @type {Entry[]}
 */
const AUTHORING = [
  // Actions
  {name: 'play', roles: ['navigation', 'authoring'], where: 'Ferramentas › … › Contribuir › Telas · vocabulário do autor'},
  {name: 'download', roles: ['navigation', 'authoring'], where: 'Ferramentas › … › overpower › Instalação · vocabulário do autor'},
  {name: 'upload', roles: ['navigation', 'authoring'], where: 'Ferramentas › … › Contribuir › O release-ready · vocabulário do autor'},
  {name: 'refresh-cw', roles: ['navigation', 'authoring'], where: 'Ferramentas › … › Referência › Solução de problemas · vocabulário do autor'},
  {name: 'trash-2', roles: ['authoring'], where: 'vocabulário do autor'},
  {name: 'plus', roles: ['navigation', 'authoring'], where: 'Ferramentas › … › Comandos › overpower install · vocabulário do autor'},
  {name: 'filter', roles: ['navigation', 'authoring'], where: 'Ferramentas › … › Contribuir › Curadoria · vocabulário do autor', lucide: 'funnel'},

  // Objects
  {name: 'file-text', roles: ['navigation', 'authoring'], where: 'Ferramentas › Bibliotecas › overpower › Contribuir › Mapa de módulos · vocabulário do autor'},
  {name: 'folder', roles: ['navigation', 'authoring'], where: 'Ferramentas › … › Alvos › from · vocabulário do autor'},
  {name: 'terminal', roles: ['navigation', 'authoring'], where: 'Ferramentas › Bibliotecas › overpower › Comandos · vocabulário do autor'},
  {name: 'wrench', roles: ['navigation', 'authoring'], where: 'Ferramentas › Bibliotecas › overpower › Contribuir › Arquitetura · vocabulário do autor'},
  {name: 'database', roles: ['navigation', 'authoring'], where: 'Ferramentas › … › Comandos › overpower list · vocabulário do autor'},
  {name: 'server', roles: ['navigation', 'authoring'], where: 'Ferramentas › Servidores MCP · vocabulário do autor'},
  {name: 'cloud', roles: ['authoring'], where: 'vocabulário do autor'},
  {name: 'key', roles: ['authoring'], where: 'vocabulário do autor'},
  {name: 'lock', roles: ['authoring'], where: 'vocabulário do autor'},
  {name: 'mail', roles: ['authoring'], where: 'vocabulário do autor'},
  {name: 'calendar', roles: ['authoring'], where: 'vocabulário do autor'},
  {name: 'users', roles: ['navigation', 'authoring'], where: 'Ferramentas › Bibliotecas › overpower › Contribuir · vocabulário do autor'},
  {name: 'globe', roles: ['navigation', 'authoring'], where: 'Ferramentas › Bibliotecas › overpower › Alvos · vocabulário do autor'},
  {name: 'package', roles: ['navigation', 'authoring'], where: 'Ferramentas › Bibliotecas › overpower › Alvos › O bundle federado · vocabulário do autor'},
  {name: 'rocket', roles: ['navigation', 'authoring'], where: 'Ferramentas › … › Contribuir › Release · vocabulário do autor'},
  {name: 'shapes', roles: ['navigation', 'authoring'], where: 'Ferramentas › … › overpower › Conceitos · vocabulário do autor'},

  // States and signals
  {name: 'zap', roles: ['navigation', 'authoring'], where: 'Ferramentas › Bibliotecas › overpower · vocabulário do autor'},
  {name: 'clock', roles: ['navigation', 'authoring'], where: 'Ferramentas › … › Referência › Changelog · vocabulário do autor'},
  {name: 'circle-alert', roles: ['navigation', 'authoring'], where: 'Ferramentas › … › Referência › Códigos de saída · vocabulário do autor'},
  {name: 'circle-help', roles: ['navigation', 'authoring'], where: 'Ferramentas › … › Comandos › overpower · vocabulário do autor', lucide: 'circle-question-mark'},
  {name: 'sparkles', roles: ['navigation', 'authoring'], where: 'Ferramentas › Bibliotecas › overpower › Contribuir › Critérios de catálogo · vocabulário do autor'},
  {name: 'trending-up', roles: ['authoring'], where: 'vocabulário do autor'},
  {name: 'gauge', roles: ['navigation', 'authoring'], where: 'Ferramentas › … › Comandos › overpower doctor · vocabulário do autor'},

  // Concepts
  {name: 'layers', roles: ['navigation', 'authoring'], where: 'Jornadas › API Owner › Visão Geral · vocabulário do autor'},
  {name: 'workflow', roles: ['navigation', 'authoring'], where: 'Jornadas › API Owner › Conteúdo Prático · vocabulário do autor'},
  {name: 'puzzle', roles: ['navigation', 'authoring'], where: 'Ferramentas › Módulos Terraform · vocabulário do autor'},
  {name: 'bot', roles: ['navigation', 'authoring'], where: 'Ferramentas › Skills · vocabulário do autor'},
  {name: 'webhook', roles: ['navigation', 'authoring'], where: 'Ferramentas › … › Alvos › Servidores MCP · vocabulário do autor'},
  {name: 'bell', roles: ['navigation', 'authoring'], where: 'Ferramentas › Bibliotecas › overpower › Contribuir › Os dois hooks · vocabulário do autor'},
  {name: 'book-open', roles: ['navigation', 'authoring'], where: 'Ferramentas › Bibliotecas › overpower › Referência · vocabulário do autor'},
  {name: 'repeat', roles: ['navigation', 'authoring'], where: 'Ferramentas › … › Contribuir › Testes · vocabulário do autor'},
  {name: 'undo-2', roles: ['authoring'], where: 'vocabulário do autor'},
];

/**
 * A role tag with no drawing behind it, or a drawing with no role tag on it,
 * is the defect: this array is the only place that correspondence is kept.
 * @type {Entry[]}
 */
export const ICONS = [...SYSTEM, ...NAVIGATION, ...AUTHORING];

/** File names, in manifest order: 61 files today against a ceiling of 64. */
export const NAMES = ICONS.map((i) => i.name);

/**
 * The ceiling is hard. A set that grows on demand becomes debt: nobody
 * audits 300 icons for family coherence, but 64 fit on one screen and
 * incoherence jumps out.
 *
 * The ceiling does not shrink with usage. It is the limit of what fits an
 * audit at once, not a watermark of what has already been spent; lowering it
 * would trade a ruler for a record of the past.
 */
export const CEILING = 64;

/**
 * The section-to-icon pairs. The key becomes `sidebar-icon--<key>` in the
 * sidebar's `className`.
 *
 * Every sidebar tree keys the icon to a section, except `overpower`: there,
 * the key is per PAGE, and no two pages share one. That branch is the only
 * one four levels deep, and the only one where a run of identical section
 * icons would read as monotonous; the icon budget has slack (61 of 64 files
 * used) to afford giving every page its own icon. The other three trees stay
 * per section.
 *
 * No top-level sidebar separator gets an icon; everything below it does,
 * leaf or group, at any depth. The navbar's tabs get no icon either.
 * See DECISIONS.md#a-sidebar-category-is-not-a-destination.
 *
 * None of the `overpower` per-page icons cost a new file: all of them reuse
 * drawings the manifest already carries as authoring vocabulary.
 */
export const SECTION_ICON_PAIRS = {
  // The section-level pairs: these trees still have every leaf inherit the
  // icon of the branch that contains it.
  //
  // `work-in-progress` is shared by `Procedimentos` and `Times` on purpose:
  // both are the same empty-tab placeholder, and two glyphs for one sentence
  // would be distinction without difference.
  'visao-geral': 'layers',
  'conteudo-teorico': 'code-xml',
  'conteudo-pratico': 'workflow',
  'work-in-progress': 'activity',
  'modulos-terraform': 'puzzle',
  skills: 'bot',
  'servidores-mcp': 'server',

  // The `overpower` pairs, one per PAGE, none repeated.
  //
  // Order follows the tree, not the alphabet: it reads next to the sidebar,
  // which is how you confirm two neighboring pages didn't get the same
  // glyph.
  overpower: 'zap',
  instalacao: 'download',
  conceitos: 'shapes',

  comandos: 'terminal',
  'comando-raiz': 'circle-help',
  'comando-list': 'database',
  'comando-install': 'plus',
  'comando-doctor': 'gauge',

  alvos: 'globe',
  'alvo-mcp': 'webhook',
  'alvo-from': 'folder',
  'alvo-bundle': 'package',

  referencia: 'book-open',
  'codigos-de-saida': 'circle-alert',
  'solucao-de-problemas': 'refresh-cw',
  changelog: 'clock',

  contribuir: 'users',
  arquitetura: 'wrench',
  'mapa-de-modulos': 'file-text',
  hooks: 'bell',
  testes: 'repeat',
  telas: 'play',
  curadoria: 'filter',
  'criterios-de-catalogo': 'sparkles',
  release: 'rocket',
  'release-ready': 'upload',
};

/**
 * The Lucide version these drawings were copied from.
 *
 * Lucide renames glyphs between versions (`code-xml` used to be `code-2`).
 * Names in this manifest are checked against this version at copy time, by
 * `scripts/vendor-icons.mjs`.
 */
export const LUCIDE_VERSION = '1.30.0';
