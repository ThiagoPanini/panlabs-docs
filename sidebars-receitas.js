// @ts-check

/**
 * A sidebar da tab `Receitas` — instância `receitas`.
 *
 * **Plana de propósito, e é o zero do 6 · 0 · 6.** Receita não tem seção, tem
 * caso de uso: agrupar nove páginas em três caixas de três é cerimônia. Sem
 * categoria, logo **sem ícone** — e é por isso que `Receitas` não consome
 * nenhum dos doze slots de navegação.
 *
 * A intro é a primeira irmã, não uma visão geral de categoria. As nove receitas
 * chegam no slice 4.
 *
 * Procedência: docs/design/informacao.md.
 *
 * @type {import('@docusaurus/plugin-content-docs').SidebarsConfig}
 */
const sidebars = {
  receitas: ['intro'],
};

export default sidebars;
