// @ts-check

// The generated `overpower › Comandos` branch, emitted by
// `scripts/generate-reference.mjs`. The only sidebar-file import in this
// project, kept separate so the two ownership domains don't mix.
import referencia from './sidebars-referencia.js';

/**
 * The `Ferramentas` tab sidebar (`tools` instance): the only tree that
 * collapses. `overpower` nests to depth 4, confined to this branch; every
 * other top-level node is a mute separator, and nothing else on the site
 * passes depth 2.
 *
 * @type {import('@docusaurus/plugin-content-docs').SidebarsConfig}
 */
const sidebars = {
  tools: [
    {
      // Top-level separator: mute label that only groups, `collapsible:
      // false` and no `link`. Measured against the anchor site's DOM: its
      // top node is a plain heading, no link, no caret, and the reference
      // theme's own docs say top-level groups always expand and can't
      // collapse. Making this level a clickable "destination" was an
      // unmeasured opinion the render never bore out. The four nodes at
      // this level all work this way; only `overpower`'s branch, two
      // levels down, actually collapses.
      type: 'category',
      label: 'Bibliotecas',
      collapsible: false,
      items: [
        {
          // Level 2, the product node. Depth caps at 4 inside `Comandos`
          // (13 leaves there), confined to this branch. The 288px sidebar
          // width doesn't force a lower number: another site on the same
          // reference theme holds five levels in that same width, and the
          // theme declares no numeric nesting ceiling at all. The opening
          // leaf carries `slug: /`, which makes `/ferramentas` resolve
          // without a redirect. No `collapsed`: it's `true` by default, and
          // Docusaurus opens this branch on its own when the current page
          // is inside it.
          type: 'category',
          label: 'overpower',
          className: 'sidebar-icon sidebar-icon--overpower',
          link: {type: 'doc', id: 'bibliotecas/overpower/visao-geral'},
          items: [
            {type: 'doc', id: 'bibliotecas/overpower/instalacao', className: 'sidebar-icon sidebar-icon--instalacao'},
            {type: 'doc', id: 'bibliotecas/overpower/conceitos', className: 'sidebar-icon sidebar-icon--conceitos'},
            {
              // Hosts the generated branch. Its own opening leaf is
              // authored and is the empty-right-panel fixture: it takes
              // the delegating branch of the switch, and the panel column
              // never gets created for it, a direct sibling of the four
              // pages that do paint one.
              type: 'category',
              label: 'Comandos',
              className: 'sidebar-icon sidebar-icon--comandos',
              link: {type: 'doc', id: 'bibliotecas/overpower/comandos/indice'},
              items: [...referencia],
            },
            {
              type: 'category',
              label: 'Alvos',
              className: 'sidebar-icon sidebar-icon--alvos',
              link: {type: 'doc', id: 'bibliotecas/overpower/alvos/indice'},
              items: [
                {type: 'doc', id: 'bibliotecas/overpower/alvos/servidores-mcp', className: 'sidebar-icon sidebar-icon--alvo-mcp'},
                {type: 'doc', id: 'bibliotecas/overpower/alvos/from', className: 'sidebar-icon sidebar-icon--alvo-from'},
                {type: 'doc', id: 'bibliotecas/overpower/alvos/bundle-federado', className: 'sidebar-icon sidebar-icon--alvo-bundle'},
              ],
            },
            {
              type: 'category',
              label: 'Referência',
              className: 'sidebar-icon sidebar-icon--referencia',
              link: {type: 'doc', id: 'bibliotecas/overpower/referencia/indice'},
              items: [
                {type: 'doc', id: 'bibliotecas/overpower/referencia/codigos-de-saida', className: 'sidebar-icon sidebar-icon--codigos-de-saida'},
                // Max-nesting fixture: depth 4, with the 40px indent plus
                // icon plus the longest label at this depth, all inside the
                // column's 288px.
                {type: 'doc', id: 'bibliotecas/overpower/referencia/solucao-de-problemas', className: 'sidebar-icon sidebar-icon--solucao-de-problemas'},
                // The changelog serves the reader, not the publisher: it
                // answers "what changed in the version I have", a user's
                // question.
                {type: 'doc', id: 'bibliotecas/overpower/referencia/changelog', className: 'sidebar-icon sidebar-icon--changelog'},
              ],
            },
            {
              // The boundary between using and contributing is structural:
              // one node groups everything a contributor needs, visible
              // before the reader even clicks.
              type: 'category',
              label: 'Contribuir',
              className: 'sidebar-icon sidebar-icon--contribuir',
              link: {type: 'doc', id: 'bibliotecas/overpower/contribuir/indice'},
              items: [
                {type: 'doc', id: 'bibliotecas/overpower/contribuir/arquitetura', className: 'sidebar-icon sidebar-icon--arquitetura'},
                {type: 'doc', id: 'bibliotecas/overpower/contribuir/mapa-de-modulos', className: 'sidebar-icon sidebar-icon--mapa-de-modulos'},
                {type: 'doc', id: 'bibliotecas/overpower/contribuir/hooks', className: 'sidebar-icon sidebar-icon--hooks'},
                {type: 'doc', id: 'bibliotecas/overpower/contribuir/testes', className: 'sidebar-icon sidebar-icon--testes'},
                {type: 'doc', id: 'bibliotecas/overpower/contribuir/telas', className: 'sidebar-icon sidebar-icon--telas'},
                {type: 'doc', id: 'bibliotecas/overpower/contribuir/curadoria', className: 'sidebar-icon sidebar-icon--curadoria'},
                {type: 'doc', id: 'bibliotecas/overpower/contribuir/criterios-de-catalogo', className: 'sidebar-icon sidebar-icon--criterios-de-catalogo'},
                {type: 'doc', id: 'bibliotecas/overpower/contribuir/release', className: 'sidebar-icon sidebar-icon--release'},
                {type: 'doc', id: 'bibliotecas/overpower/contribuir/release-ready', className: 'sidebar-icon sidebar-icon--release-ready'},
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Módulos Terraform',
      collapsible: false,
      items: [
        {type: 'doc', id: 'modulos-terraform/modulo-de-bucket', className: 'sidebar-icon sidebar-icon--modulos-terraform'},
        {type: 'doc', id: 'modulos-terraform/modulo-de-papel-iam', className: 'sidebar-icon sidebar-icon--modulos-terraform'},
      ],
    },
    {
      type: 'category',
      label: 'Skills',
      collapsible: false,
      items: [
        // Minimal-prose, maximal-code fixture: the `Receita` type.
        {type: 'doc', id: 'skills/scaffold-de-esteira', className: 'sidebar-icon sidebar-icon--skills'},
        {type: 'doc', id: 'skills/rotacao-de-segredo', className: 'sidebar-icon sidebar-icon--skills'},
      ],
    },
    {
      type: 'category',
      label: 'Servidores MCP',
      collapsible: false,
      items: [
        {type: 'doc', id: 'servidores-mcp/servidor-de-catalogo-mcp', className: 'sidebar-icon sidebar-icon--servidores-mcp'},
      ],
    },
  ],
};

export default sidebars;
