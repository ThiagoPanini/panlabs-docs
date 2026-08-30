// @ts-check

/**
 * Sidebar for the `Jornadas` tab, `default` instance: one journey, three
 * sections. Real content doesn't exist yet, so this tree is a placeholder
 * instead of invented text nobody would keep updated. Order is declared
 * only here: with an explicit item list, `sidebar_position` in front
 * matter is ignored.
 * @type {import('@docusaurus/plugin-content-docs').SidebarsConfig}
 */
const sidebars = {
  journeys: [
    // Top level is a mute separator: `collapsible: false` and no `link`.
    // In `theme-classic`, `useCategoryHrefWithSSRFallback` returns
    // `undefined` when `!item.collapsible`, so the label renders as an
    // `<a>` with no `href`, no caret, no `CollapseButton`.
    {
      type: 'category',
      label: 'API Owner',
      collapsible: false,
      items: [
        // Sections are categories with no `link`, so each one's opening
        // leaf gets its own visible row instead of hiding behind the
        // category label. Depth here is 3 (separator, section, leaf),
        // distinct from the depth-4 cap confined to `Ferramentas ›
        // Bibliotecas › overpower`. No icon on the separator; everything
        // below it gets one, and the icon family belongs to the section,
        // so both `Visão Geral` leaves carry its key.
        {
          type: 'category',
          label: 'Visão Geral',
          className: 'sidebar-icon sidebar-icon--visao-geral',
          items: [
            // Opening leaf of the instance. It carries `slug: /`, which
            // makes `/jornadas` resolve to a real page instead of a 404.
            {type: 'doc', id: 'api-owner/visao-geral/resumo-das-trilhas', className: 'sidebar-icon sidebar-icon--visao-geral'},
            // Silent locale fallback fixture: `/en/jornadas/api-owner/visao-geral/links-e-referencias` serves pt-BR text.
            {type: 'doc', id: 'api-owner/visao-geral/links-e-referencias', className: 'sidebar-icon sidebar-icon--visao-geral'},
          ],
        },
        {
          type: 'category',
          label: 'Conteúdo Teórico',
          className: 'sidebar-icon sidebar-icon--conteudo-teorico',
          items: [
            {type: 'doc', id: 'api-owner/conteudo-teorico/work-in-progress', className: 'sidebar-icon sidebar-icon--conteudo-teorico'},
          ],
        },
        {
          type: 'category',
          label: 'Conteúdo Prático',
          className: 'sidebar-icon sidebar-icon--conteudo-pratico',
          items: [
            {type: 'doc', id: 'api-owner/conteudo-pratico/work-in-progress', className: 'sidebar-icon sidebar-icon--conteudo-pratico'},
          ],
        },
      ],
    },
  ],
};

export default sidebars;
