// @ts-check

/**
 * A sidebar da tab `Documentação` — seis categorias de topo e vinte e sete
 * folhas. **Trinta e três linhas com a árvore inteira aberta**, que é a fixture
 * de sidebar longa: scroll, `sticky` e os seis ícones em contraste.
 *
 * Três coisas travadas aqui, e nenhuma custa swizzle:
 *
 * 1. **Teto de profundidade 2.** Categoria → documento, nunca um terceiro
 *    nível. Não é gosto: a regra de ícone é *obrigatório na categoria de topo,
 *    ausente na folha*, e num terceiro nível o nó do meio não é nem uma coisa
 *    nem outra — a regra não tem leitura. É por isso que as três páginas de Pix
 *    são irmãs achatadas com o nome qualificado (`Pix — QR dinâmico`) em vez de
 *    filhas de um nó `Pix`.
 * 2. **Categoria clicável**, apontando para a página de visão geral. O rótulo
 *    navega; o `<button class="menu__caret">` irmão colapsa. É o rótulo que
 *    carrega o ícone, então fazer o elemento mais proeminente da sidebar ser um
 *    destino em vez de um toggle é o desenho certo.
 * 3. **`collapsed: false`** em todas — o alvo mostra a árvore inteira aberta.
 *    O default do Docusaurus é colapsado; é uma linha por categoria.
 *
 * **A ordem é declarada aqui e em lugar nenhum mais.** Com lista explícita de
 * itens, `sidebar_position` no front matter é ignorado — e mantê-lo seria uma
 * segunda fonte de verdade que só mente.
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
      items: [
        // `Ambientes` é a fixture de página curta — ~120 palavras e ZERO `##`,
        // a única exceção nomeada à regra de heading. Ela é a única página que
        // prova que o cartão fica no mesmo pixel sem coluna de TOC.
        'comece-aqui/ambientes',
        'comece-aqui/autenticacao',
        'comece-aqui/primeira-cobranca',
      ],
    },
    {
      type: 'category',
      label: 'Conceitos',
      className: 'sidebar-icone sidebar-icone--conceitos',
      collapsed: false,
      link: {type: 'doc', id: 'conceitos/mapa-dos-conceitos'},
      items: [
        'conceitos/ciclo-de-vida',
        'conceitos/idempotencia',
        // A fixture de bloco de código longo: HMAC em três linguagens.
        'conceitos/webhooks',
        // A fixture de prosa pura: nenhum componente, a medida sozinha.
        'conceitos/conciliacao',
        'conceitos/erros',
      ],
    },
    {
      type: 'category',
      label: 'Meios de pagamento',
      className: 'sidebar-icone sidebar-icone--meios-de-pagamento',
      collapsed: false,
      link: {type: 'doc', id: 'meios-de-pagamento/comparativo'},
      items: [
        // `/en/docs/meios-de-pagamento/pix` é a fixture de fallback silencioso
        // de locale: esta seção inteira não tem tradução, de propósito.
        'meios-de-pagamento/pix',
        // O item de sidebar mais largo da árvore.
        'meios-de-pagamento/pix-qr-dinamico',
        'meios-de-pagamento/pix-devolucao',
        'meios-de-pagamento/boleto',
        'meios-de-pagamento/cartao',
        'meios-de-pagamento/split',
      ],
    },
    {
      type: 'category',
      label: 'Guias',
      className: 'sidebar-icone sidebar-icone--guias',
      collapsed: false,
      link: {type: 'doc', id: 'guias/indice-de-guias'},
      items: [
        'guias/aceitar-pix-com-qr-dinamico',
        'guias/cobrar-cartao-com-autenticacao',
        'guias/assinar-um-cliente',
        'guias/migrar-de-outro-provedor',
        // A fixture do catálogo de componentes, entregue no slice anterior.
        'guias/catalogo-de-componentes',
      ],
    },
    {
      type: 'category',
      label: 'SDKs',
      className: 'sidebar-icone sidebar-icone--sdks',
      collapsed: false,
      link: {type: 'doc', id: 'sdks/visao-geral'},
      items: ['sdks/node', 'sdks/python', 'sdks/go'],
    },
    {
      type: 'category',
      label: 'Operação',
      className: 'sidebar-icone sidebar-icone--operacao',
      collapsed: false,
      link: {type: 'doc', id: 'operacao/indice'},
      items: [
        'operacao/monitoramento',
        'operacao/diagnostico',
        // A fixture de tabela larga: 40 linhas × 5 colunas.
        'operacao/codigos-de-recusa',
        'operacao/arquivo-de-movimento',
        'operacao/changelog',
      ],
    },
  ],
};

export default sidebars;
