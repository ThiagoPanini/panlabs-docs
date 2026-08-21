// @ts-check

/**
 * A sidebar da tab `Times` — instância `times`.
 *
 * **Dois separadores, quatro páginas.** É a aba que simula documentar um time
 * de verdade em ambiente corporativo: dois times fictícios, mesma estrutura
 * entre os dois, conteúdo mockado e com sabor distinto entre um e outro.
 *
 * **O nível de topo é separador: `collapsible: false` e nenhum `link`.** Igual
 * a `Procedimentos` e `Jornadas` — rótulo em negrito, sem seta, sem ícone, sem
 * `href`, sempre aberto. Esta aba fica FORA de
 * `Ferramentas › Bibliotecas › overpower`, o único ramo em que o teto de
 * profundidade sobe a 4: aqui o teto é 2, separador → folha, e nada abaixo.
 * `docs/design/informacao.md` §3.1.
 *
 * O `className` que carrega o ícone mora em tudo abaixo do separador — regra
 * de `docs/design/icones.md` §8, o mesmo caso único de `sidebars-procedimentos.js`:
 * o separador não leva `className`, e as duas folhas de cada time levam.
 *
 * Procedência: docs/design/informacao.md · docs/design/icones.md · docs/adr/0010.
 *
 * @type {import('@docusaurus/plugin-content-docs').SidebarsConfig}
 */
const sidebars = {
  times: [
    {
      type: 'category',
      label: 'Time A',
      collapsible: false,
      items: [
        {type: 'doc', id: 'time-a/visao-geral', className: 'sidebar-icone sidebar-icone--time-a'},
        {type: 'doc', id: 'time-a/desenvolvimento', className: 'sidebar-icone sidebar-icone--time-a'},
      ],
    },
    {
      type: 'category',
      label: 'Time B',
      collapsible: false,
      items: [
        {type: 'doc', id: 'time-b/visao-geral', className: 'sidebar-icone sidebar-icone--time-b'},
        {type: 'doc', id: 'time-b/desenvolvimento', className: 'sidebar-icone sidebar-icone--time-b'},
      ],
    },
  ],
};

export default sidebars;
