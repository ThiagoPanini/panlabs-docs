// @ts-check

/**
 * O ramo gerado de `Ferramentas › Bibliotecas › overpower › Comandos` —
 * **fragmento**, não árvore.
 *
 * GERADO por scripts/gerar-referencia.mjs. Não edite à mão: o portão 5 regenera
 * e reprova em `git diff --exit-code`.
 *
 * Ele é uma LISTA DE ITENS DE FOLHA e nada além. A árvore da aba é escrita à
 * mão em `sidebars-ferramentas.js`, que importa esta lista e a espalha dentro
 * da categoria `Comandos` — no nível 4, que é o teto de profundidade desde o
 * ADR 10 §g). Emitir a árvore inteira daria ao gerador a posse da categoria e
 * da folha autoral que a abre, `Comandos › Índice`, que ele não conhece.
 *
 * Cada item carrega `className: 'sidebar-icone sidebar-icone--comandos'` — a família da SEÇÃO que as hospeda, e não a do
 * vizinho. A regra é a de docs/design/icones.md §8 — *nenhum ícone no
 * separador de topo; ícone em tudo abaixo dele* —, e folha gerada não abre
 * exceção. O gerador precisa saber o slug da família porque o contrato de
 * assinatura não carrega posição na sidebar.
 *
 * Procedência: docs/design/referencia.md §5 · docs/design/icones.md §8 ·
 * docs/adr/0009 · docs/adr/0010.
 *
 * @type {import('@docusaurus/plugin-content-docs').SidebarItemConfig[]}
 */
const referencia = [
  {type: 'doc', id: 'bibliotecas/overpower/comandos/overpower', className: 'sidebar-icone sidebar-icone--comandos'},
  {type: 'doc', id: 'bibliotecas/overpower/comandos/list', className: 'sidebar-icone sidebar-icone--comandos'},
  {type: 'doc', id: 'bibliotecas/overpower/comandos/install', className: 'sidebar-icone sidebar-icone--comandos'},
  {type: 'doc', id: 'bibliotecas/overpower/comandos/doctor', className: 'sidebar-icone sidebar-icone--comandos'},
];

export default referencia;
