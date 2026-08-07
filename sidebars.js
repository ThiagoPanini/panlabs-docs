// @ts-check

/**
 * A árvore de doze categorias de topo é de `docs/design/informacao.md`, no slice
 * 2. Aqui está só o que a bala traçante precisa: uma barra lateral real, com uma
 * categoria e uma página, para que a rota `/docs/<qualquer>` exista de verdade.
 *
 * @type {import('@docusaurus/plugin-content-docs').SidebarsConfig}
 */
const sidebars = {
  documentacao: [
    {
      type: 'category',
      label: 'Comece aqui',
      collapsed: false,
      items: ['comece-aqui/ambientes'],
    },
  ],
};

export default sidebars;
