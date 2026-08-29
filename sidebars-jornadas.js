// @ts-check

/**
 * A sidebar da tab `Jornadas` — instância `default`.
 *
 * **Uma jornada, três seções, e a árvore foi reconstruída para conteúdo real.**
 * O acervo mockado de `Jornadas` era narrativo: duas jornadas, dez capítulos e
 * um índice por jornada que ordenava por tempo. Ele saiu inteiro. O que entra no
 * lugar é a forma que o aprendizado corporativo de fato tem — uma visão geral
 * que resume e aponta as fontes, mais dois corpos de conteúdo, o teórico e o
 * prático —, e ela nasce com marcador de lugar em vez de texto inventado.
 *
 * Uma jornada continua sendo **um papel que o autor vestiu**, não um tópico. O
 * que mudou é o que vai dentro dela: trilha de aprendizado, não arco narrativo.
 *
 * Três coisas travadas aqui, e nenhuma custa swizzle:
 *
 * 1. **O nível de topo é SEPARADOR — mudo, e sempre aberto.** `collapsible:
 *    false` mais ausência de `link`, e é só isso: no fonte do `theme-classic`,
 *    `useCategoryHrefWithSSRFallback` devolve `undefined` quando
 *    `!item.collapsible`, nos dois lados, então o rótulo sai como `<a>` sem
 *    `href`, sem caret e sem `CollapseButton`. É o análogo exato do
 *    `<h3 class="sidebar-title">` da âncora, e não custa `pointer-events` nem
 *    componente. ADR 10 §a.
 * 2. **As três seções são categoria SEM `link`, e a folha de abertura tem linha
 *    própria.** É a mesma decisão do ADR 10 §d, aplicada um nível abaixo: o
 *    rótulo da seção agrupa e colapsa, e quem tem página é a folha. Dar `link` à
 *    seção esconderia `Resumo das Trilhas` da lista, que é justamente a linha
 *    que a árvore pedida desenha.
 * 3. **Esta aba usa profundidade 3.** Separador → seção → folha. O teto de 4
 *    continua confinado a `Ferramentas › Bibliotecas › overpower`; o que mudou é
 *    que a fronteira deixou de ser *um* ramo e passou a ser dois, com teto
 *    próprio cada um. `docs/design/informacao.md` §3.1.
 *
 * **A ordem é declarada aqui e em lugar nenhum mais.** Com lista explícita de
 * itens, `sidebar_position` no front matter é ignorado — e mantê-lo seria uma
 * segunda fonte de verdade que só mente.
 *
 * O `className` é o degrau 1 da escada do ADR 2 — `className` em `sidebars*.js`
 * é contrato público do schema de item de sidebar. **A regra de ícone é a de
 * `docs/design/icones.md` §8**: o separador não leva `className`, e tudo abaixo
 * dele leva, seção ou folha. A família é da SEÇÃO, então as duas folhas de
 * `Visão Geral` carregam a chave dela. As regras de máscara estão em
 * `src/css/chrome.css` e os pares em `src/icons/manifest.js`.
 *
 * Procedência: docs/design/informacao.md · docs/design/icones.md · docs/adr/0010.
 *
 * @type {import('@docusaurus/plugin-content-docs').SidebarsConfig}
 */
const sidebars = {
  journeys: [
    {
      type: 'category',
      label: 'API Owner',
      collapsible: false,
      items: [
        {
          type: 'category',
          label: 'Visão Geral',
          className: 'sidebar-icon sidebar-icon--visao-geral',
          items: [
            // A folha de abertura da instância. Ela carrega `slug: /`, e é por
            // isso que `/jornadas` é página de verdade em vez de 404 (ADR 10 §h).
            {type: 'doc', id: 'api-owner/visao-geral/resumo-das-trilhas', className: 'sidebar-icon sidebar-icon--visao-geral'},
            // A fixture de fallback silencioso de locale:
            // `/en/jornadas/api-owner/visao-geral/links-e-referencias` serve o
            // texto em pt-BR.
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
