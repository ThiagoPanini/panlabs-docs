// @ts-check

/**
 * A sidebar da tab `Referência da API` — instância `api`.
 *
 * A árvore fechada é **6 · 0 · 6**: seis categorias de topo aqui, as mesmas
 * seis regras da tab `Documentação`, e os mesmos doze pares seção→ícone.
 *
 * **Cinco das seis não estão escritas aqui, e é de propósito.** `Cobranças`,
 * `Clientes`, `Assinaturas`, `Reembolsos` e `Webhooks` apontam para as páginas
 * `O objeto X`, que são **geradas do contrato OpenAPI** no slice 5 — junto com
 * este arquivo, que o gerador passa a emitir. Escrevê-las à mão agora criaria
 * exatamente a segunda fonte de verdade que o gerador existe para impedir, e
 * uma categoria clicável cujo destino não existe reprova no build.
 *
 * O que este slice prova é a **topologia**: a segunda instância responde em
 * `/api-reference`, com `docItemComponent` próprio e sidebar própria, trocada
 * pela tab de navbar. Os doze pares de ícone estão inteiros em
 * `src/icons/manifest.js` e em `src/css/chrome.css` desde já — os cinco que
 * ainda não têm categoria não custam nada e não erram nada.
 *
 * Procedência: docs/design/informacao.md.
 *
 * @type {import('@docusaurus/plugin-content-docs').SidebarsConfig}
 */
const sidebars = {
  api: [
    {
      type: 'category',
      label: 'Introdução',
      className: 'sidebar-icone sidebar-icone--introducao',
      collapsed: false,
      link: {type: 'doc', id: 'introducao/visao-geral'},
      items: [],
    },
  ],
};

export default sidebars;
