// @ts-check

/**
 * A sidebar da tab `Documentação` — seis categorias de topo.
 *
 * Três coisas travadas aqui, e nenhuma custa swizzle:
 *
 * 1. **Teto de profundidade 2.** Categoria → documento, nunca um terceiro
 *    nível. Não é gosto: a regra de ícone é *obrigatório na categoria de topo,
 *    ausente na folha*, e num terceiro nível o nó do meio não é nem uma coisa
 *    nem outra — a regra não tem leitura.
 * 2. **Categoria clicável**, apontando para a página de visão geral. O rótulo
 *    navega; o `<button class="menu__caret">` irmão colapsa. É o rótulo que
 *    carrega o ícone, então fazer o elemento mais proeminente da sidebar ser um
 *    destino em vez de um toggle é o desenho certo.
 * 3. **`collapsed: false`** em todas — o alvo mostra a árvore inteira aberta.
 *    O default do Docusaurus é colapsado; é uma linha por categoria.
 *
 * O `className` é o degrau 1 da escada do ADR 2 — `className` em `sidebars.js`
 * é contrato público do schema de item de sidebar. Ele carrega o ícone por
 * `mask-image` em `::before`; as regras estão em `src/css/chrome.css` e os doze
 * pares em `src/icons/manifest.js`.
 *
 * Procedência: docs/design/informacao.md · docs/design/icones.md.
 *
 * @type {import('@docusaurus/plugin-content-docs').SidebarsConfig}
 */
const sidebars = {
  documentacao: [
    {
      type: 'category',
      label: 'Comece aqui',
      className: 'sidebar-icone sidebar-icone--comece-aqui',
      collapsed: false,
      link: {type: 'doc', id: 'comece-aqui/visao-geral'},
      items: ['comece-aqui/ambientes'],
    },
    {
      type: 'category',
      label: 'Conceitos',
      className: 'sidebar-icone sidebar-icone--conceitos',
      collapsed: false,
      link: {type: 'doc', id: 'conceitos/mapa-dos-conceitos'},
      items: [],
    },
    {
      type: 'category',
      label: 'Meios de pagamento',
      className: 'sidebar-icone sidebar-icone--meios-de-pagamento',
      collapsed: false,
      link: {type: 'doc', id: 'meios-de-pagamento/comparativo'},
      items: [],
    },
    {
      type: 'category',
      label: 'Guias',
      className: 'sidebar-icone sidebar-icone--guias',
      collapsed: false,
      link: {type: 'doc', id: 'guias/indice-de-guias'},
      items: [],
    },
    {
      type: 'category',
      label: 'SDKs',
      className: 'sidebar-icone sidebar-icone--sdks',
      collapsed: false,
      link: {type: 'doc', id: 'sdks/visao-geral'},
      items: [],
    },
    {
      type: 'category',
      label: 'Operação',
      className: 'sidebar-icone sidebar-icone--operacao',
      collapsed: false,
      link: {type: 'doc', id: 'operacao/indice'},
      items: ['operacao/changelog'],
    },
  ],
};

export default sidebars;
