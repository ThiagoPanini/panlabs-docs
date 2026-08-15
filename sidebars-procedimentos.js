// @ts-check

/**
 * A sidebar da tab `Procedimentos` — instância `procedimentos`.
 *
 * **Cinco categorias, dezenove páginas.** É a aba que diz **como se faz**, e a
 * fronteira com `Jornadas` é regra conferível, não estilo: `<Steps>` é a espinha
 * daqui e **não entra** lá. Sem a proibição, o leitor abre um capítulo e não
 * consegue dizer por que a página não está nesta aba.
 *
 * **Quatro dos cinco índices são forma, não tipo** — o piso do tipo da seção
 * mais um índice das folhas. O quinto, `Diagnóstico › Índice de sintomas`,
 * carrega tipo de verdade: ele é a tabela de sintomas do gabarito de
 * `Troubleshooting`, e é por isso que a categoria aponta para ele em vez de
 * apontar para uma visão geral que repetiria a mesma lista.
 *
 * `Ambiente › Índice` é a **fixture de página muito curta** — ~120 palavras e
 * ZERO `##`, a única exceção nomeada da regra de heading. Ela é a única página
 * que prova que a coluna de conteúdo fica no mesmo pixel sem coluna de TOC, e a
 * prova nunca foi o cartão: é o `.col` travado, confirmado ao vivo contra a
 * própria âncora, que reserva a largura da coluna de TOC mesmo vazia.
 *
 * O `className` que carrega o ícone (`mask-image` em `::before`, regras em
 * `src/css/chrome.css`) mora na FOLHA desde a issue #97, não mais na categoria
 * — a âncora não marca cabeçalho de grupo.
 *
 * Procedência: docs/design/informacao.md · docs/design/icones.md.
 *
 * @type {import('@docusaurus/plugin-content-docs').SidebarsConfig}
 */
const sidebars = {
  procedimentos: [
    {
      type: 'category',
      label: 'Ambiente',
      collapsed: false,
      link: {type: 'doc', id: 'ambiente/indice'},
      items: [
        // A fixture de tabela como página inteira: o tipo `Catálogo` com prosa
        // quase nula.
        {type: 'doc', id: 'ambiente/comparativo-dev-staging-prod', className: 'sidebar-icone sidebar-icone--ambiente'},
        {type: 'doc', id: 'ambiente/preparar-a-maquina-local', className: 'sidebar-icone sidebar-icone--ambiente'},
      ],
    },
    {
      type: 'category',
      label: 'Esteiras',
      collapsed: false,
      link: {type: 'doc', id: 'esteiras/indice'},
      items: [
        // A fixture de bloco de código longo.
        {type: 'doc', id: 'esteiras/verificar-a-assinatura-hmac', className: 'sidebar-icone sidebar-icone--esteiras'},
        {type: 'doc', id: 'esteiras/publicar-um-pacote-interno', className: 'sidebar-icone sidebar-icone--esteiras'},
        {type: 'doc', id: 'esteiras/rodar-a-esteira-localmente', className: 'sidebar-icone sidebar-icone--esteiras'},
      ],
    },
    {
      type: 'category',
      label: 'Infraestrutura',
      collapsed: false,
      link: {type: 'doc', id: 'infraestrutura/indice'},
      items: [
        // A fixture de aninhamento profundo: quatro níveis de `<ResponseField>`
        // sobre `<Expandable>`.
        {type: 'doc', id: 'infraestrutura/o-output-de-um-modulo', className: 'sidebar-icone sidebar-icone--infraestrutura'},
        {type: 'doc', id: 'infraestrutura/criar-um-bucket-versionado', className: 'sidebar-icone sidebar-icone--infraestrutura'},
        {type: 'doc', id: 'infraestrutura/promover-um-modulo', className: 'sidebar-icone sidebar-icone--infraestrutura'},
      ],
    },
    {
      type: 'category',
      label: 'Acessos',
      collapsed: false,
      link: {type: 'doc', id: 'acessos/indice'},
      items: [
        // A fixture de tabela larga: 40 linhas × 5 colunas.
        {type: 'doc', id: 'acessos/permissoes-por-papel', className: 'sidebar-icone sidebar-icone--acessos'},
        {type: 'doc', id: 'acessos/assumir-um-papel-na-aws', className: 'sidebar-icone sidebar-icone--acessos'},
        {type: 'doc', id: 'acessos/rotacionar-uma-chave', className: 'sidebar-icone sidebar-icone--acessos'},
      ],
    },
    {
      type: 'category',
      label: 'Diagnóstico',
      collapsed: false,
      // O nono índice, e o único que carrega tipo: `Troubleshooting`.
      link: {type: 'doc', id: 'diagnostico/indice-de-sintomas'},
      items: [
        {type: 'doc', id: 'diagnostico/monitoramento-e-alertas', className: 'sidebar-icone sidebar-icone--diagnostico'},
        // Várias linguagens na mesma página.
        {type: 'doc', id: 'diagnostico/o-mesmo-erro-em-tres-formas', className: 'sidebar-icone sidebar-icone--diagnostico'},
        // Diff.
        {type: 'doc', id: 'diagnostico/o-diff-que-resolveu', className: 'sidebar-icone sidebar-icone--diagnostico'},
      ],
    },
  ],
};

export default sidebars;
