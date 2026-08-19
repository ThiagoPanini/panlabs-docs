// @ts-check

/**
 * O ramo gerado de `Ferramentas › Bibliotecas › Biblioteca C` — **fragmento**,
 * não árvore.
 *
 * GERADO por scripts/gerar-referencia.mjs. Não edite à mão: o portão 5 regenera
 * e reprova em `git diff --exit-code`.
 *
 * Ele é uma LISTA DE ITENS DE FOLHA e nada além. A árvore da aba é escrita à
 * mão em `sidebars-ferramentas.js`, que importa esta lista e a espalha dentro
 * de `Biblioteca C` — no nível 3, que é o teto de profundidade. Emitir a
 * árvore inteira daria ao gerador a posse das folhas autorais da aba, que ele
 * não conhece.
 *
 * Cada item carrega `className: 'sidebar-icone sidebar-icone--bibliotecas'` — a mesma família das três folhas autorais vizinhas de
 * `Biblioteca C`. A regra é a de docs/design/icones.md §8 — *nenhum ícone no
 * separador de topo; ícone em tudo abaixo dele* —, e folha gerada não abre
 * exceção. O gerador precisa saber o slug da família porque o contrato de
 * assinatura não carrega posição na sidebar.
 *
 * Procedência: docs/design/referencia.md §5 · docs/design/icones.md §8 ·
 * docs/adr/0008 · docs/adr/0010.
 *
 * @type {import('@docusaurus/plugin-content-docs').SidebarItemConfig[]}
 */
const referencia = [
  {type: 'doc', id: 'bibliotecas/biblioteca-c/referencia/panlabs-esteira', className: 'sidebar-icone sidebar-icone--bibliotecas'},
  {type: 'doc', id: 'bibliotecas/biblioteca-c/referencia/esteira', className: 'sidebar-icone sidebar-icone--bibliotecas'},
  {type: 'doc', id: 'bibliotecas/biblioteca-c/referencia/passo', className: 'sidebar-icone sidebar-icone--bibliotecas'},
  {type: 'doc', id: 'bibliotecas/biblioteca-c/referencia/esteira-trabalho', className: 'sidebar-icone sidebar-icone--bibliotecas'},
  {type: 'doc', id: 'bibliotecas/biblioteca-c/referencia/esteira-gerar', className: 'sidebar-icone sidebar-icone--bibliotecas'},
  {type: 'doc', id: 'bibliotecas/biblioteca-c/referencia/padrao-python', className: 'sidebar-icone sidebar-icone--bibliotecas'},
];

export default referencia;
