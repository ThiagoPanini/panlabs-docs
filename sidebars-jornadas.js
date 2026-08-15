// @ts-check

/**
 * A sidebar da tab `Jornadas` — instância `default`.
 *
 * **Duas jornadas, 6 e 4 capítulos, e a contagem desigual é de propósito:** arco
 * de papel não tem comprimento fixo, e duas jornadas com o mesmo número leem
 * como formulário preenchido duas vezes.
 *
 * Uma jornada é **um papel que o autor vestiu**, não um tópico. É a forma que
 * vale, não os dois nomes: papel tem começo, meio e aprendizado, e é isso que
 * evita a jornada virar uma categoria de `Procedimentos` com outro nome.
 *
 * Três coisas travadas aqui, e nenhuma custa swizzle:
 *
 * 1. **A categoria é clicável e aponta para o índice de jornada.** O índice é o
 *    décimo tipo de página do site, e ele **não é linha própria na sidebar** —
 *    é o destino da categoria. O rótulo navega; o `<button class="menu__caret">`
 *    irmão colapsa.
 * 2. **Teto de profundidade 3, e esta aba não o usa.** Categoria → capítulo, e
 *    nada abaixo. O único lugar do site no nível 3 é `Ferramentas › Bibliotecas
 *    › Biblioteca C`.
 * 3. **`collapsed: false`** em todas — o alvo mostra a árvore inteira aberta.
 *
 * **A ordem é declarada aqui e em lugar nenhum mais.** Com lista explícita de
 * itens, `sidebar_position` no front matter é ignorado — e mantê-lo seria uma
 * segunda fonte de verdade que só mente. A ordem dos capítulos é **temporal**, e
 * é a mesma da lista ordenada de `## Como foi` no índice: o portão 4 cobra que a
 * lista tenha um item por capítulo, e é essa lista que carrega o traço do tipo.
 *
 * O `className` é o degrau 1 da escada do ADR 2 — `className` em `sidebars*.js`
 * é contrato público do schema de item de sidebar. Issue #97: ele passou da
 * categoria para a FOLHA — cada item de `items` carrega o ícone da família por
 * `mask-image` em `::before`; as regras estão em `src/css/chrome.css` e os onze
 * pares em `src/icons/manifest.js`. A categoria não leva mais `className`: a
 * âncora não marca cabeçalho de grupo.
 *
 * Procedência: docs/design/informacao.md · docs/design/icones.md.
 *
 * @type {import('@docusaurus/plugin-content-docs').SidebarsConfig}
 */
const sidebars = {
  jornadas: [
    {
      type: 'category',
      label: 'API Owner',
      collapsed: false,
      link: {type: 'doc', id: 'api-owner/indice'},
      items: [
        // A fixture de página muito longa, e o lado comprido do par que prova
        // comprimento desigual entre irmãos.
        {type: 'doc', id: 'api-owner/o-contrato-que-nao-existia', className: 'sidebar-icone sidebar-icone--api-owner'},
        // O lado curto do mesmo par — ~180 palavras contra ~1800.
        {type: 'doc', id: 'api-owner/o-que-o-contrato-nao-cobre', className: 'sidebar-icone sidebar-icone--api-owner'},
        // A fixture de fallback silencioso de locale:
        // `/en/jornadas/api-owner/a-politica-de-versao` serve o texto em pt-BR.
        {type: 'doc', id: 'api-owner/a-politica-de-versao', className: 'sidebar-icone sidebar-icone--api-owner'},
        // A fixture de saída literal de terminal.
        {type: 'doc', id: 'api-owner/o-schema-que-mudou-sem-aviso', className: 'sidebar-icone sidebar-icone--api-owner'},
        {type: 'doc', id: 'api-owner/depreciar-em-seis-meses', className: 'sidebar-icone sidebar-icone--api-owner'},
        {type: 'doc', id: 'api-owner/o-consumidor-invisivel', className: 'sidebar-icone sidebar-icone--api-owner'},
      ],
    },
    {
      type: 'category',
      label: 'Security Champion',
      collapsed: false,
      // O índice desta jornada é a fixture de prosa pura: nenhum componente do
      // catálogo além do `<Untranslated />`, que é o que o décimo tipo é por
      // definição.
      link: {type: 'doc', id: 'security-champion/indice'},
      items: [
        // O item de sidebar mais largo do site — 30 caracteres.
        {type: 'doc', id: 'security-champion/a-varredura-que-reprovava-tudo', className: 'sidebar-icone sidebar-icone--security-champion'},
        {type: 'doc', id: 'security-champion/o-segredo-no-commit', className: 'sidebar-icone sidebar-icone--security-champion'},
        {type: 'doc', id: 'security-champion/a-excecao-que-virou-regra', className: 'sidebar-icone sidebar-icone--security-champion'},
        {type: 'doc', id: 'security-champion/o-inventario-de-imagens', className: 'sidebar-icone sidebar-icone--security-champion'},
      ],
    },
  ],
};

export default sidebars;
