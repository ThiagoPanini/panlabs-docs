// @ts-check

/**
 * A sidebar da tab `Receitas` — instância `receitas`.
 *
 * **Plana de propósito, e é o zero do 6 · 0 · 6.** Receita não tem seção, tem
 * caso de uso: agrupar nove páginas em três caixas de três é cerimônia. Sem
 * categoria, logo **sem ícone** — e é por isso que `Receitas` não consome
 * nenhum dos doze slots de navegação.
 *
 * A intro é a primeira irmã, não uma visão geral de categoria.
 *
 * As nove receitas são a fixture de *prosa mínima e código máximo*: o escape de
 * medida repetido a cada dois parágrafos. E são elas que exercitam o teto de
 * **um `##` por receita** — seis ficam em zero e não montam coluna de TOC, três
 * ficam em um e montam.
 *
 * Procedência: docs/design/informacao.md.
 *
 * @type {import('@docusaurus/plugin-content-docs').SidebarsConfig}
 */
const sidebars = {
  receitas: [
    'intro',
    'checkout-pix-em-dez-minutos',
    'verificar-assinatura-de-webhook',
    'cobrar-cartao-salvo',
    'emitir-boleto-com-vencimento',
    'dividir-uma-cobranca-com-split',
    'estornar-parcialmente',
    'retentativa-com-espera-exponencial',
    'paginar-o-historico-de-cobrancas',
    'conciliar-com-referencia-externa',
  ],
};

export default sidebars;
