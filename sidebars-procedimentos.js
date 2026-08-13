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
 * Procedência: docs/design/informacao.md · docs/design/icones.md.
 *
 * @type {import('@docusaurus/plugin-content-docs').SidebarsConfig}
 */
const sidebars = {
  procedimentos: [
    {
      type: 'category',
      label: 'Ambiente',
      className: 'sidebar-icone sidebar-icone--ambiente',
      collapsed: false,
      link: {type: 'doc', id: 'ambiente/indice'},
      items: [
        // A fixture de tabela como página inteira: o tipo `Catálogo` com prosa
        // quase nula.
        'ambiente/comparativo-dev-staging-prod',
        'ambiente/preparar-a-maquina-local',
      ],
    },
    {
      type: 'category',
      label: 'Esteiras',
      className: 'sidebar-icone sidebar-icone--esteiras',
      collapsed: false,
      link: {type: 'doc', id: 'esteiras/indice'},
      items: [
        // A fixture de bloco de código longo.
        'esteiras/verificar-a-assinatura-hmac',
        'esteiras/publicar-um-pacote-interno',
        'esteiras/rodar-a-esteira-localmente',
      ],
    },
    {
      type: 'category',
      label: 'Infraestrutura',
      className: 'sidebar-icone sidebar-icone--infraestrutura',
      collapsed: false,
      link: {type: 'doc', id: 'infraestrutura/indice'},
      items: [
        // A fixture de aninhamento profundo: quatro níveis de `<ResponseField>`
        // sobre `<Expandable>`.
        'infraestrutura/o-output-de-um-modulo',
        'infraestrutura/criar-um-bucket-versionado',
        'infraestrutura/promover-um-modulo',
      ],
    },
    {
      type: 'category',
      label: 'Acessos',
      className: 'sidebar-icone sidebar-icone--acessos',
      collapsed: false,
      link: {type: 'doc', id: 'acessos/indice'},
      items: [
        // A fixture de tabela larga: 40 linhas × 5 colunas.
        'acessos/permissoes-por-papel',
        'acessos/assumir-um-papel-na-aws',
        'acessos/rotacionar-uma-chave',
      ],
    },
    {
      type: 'category',
      label: 'Diagnóstico',
      className: 'sidebar-icone sidebar-icone--diagnostico',
      collapsed: false,
      // O nono índice, e o único que carrega tipo: `Troubleshooting`.
      link: {type: 'doc', id: 'diagnostico/indice-de-sintomas'},
      items: [
        'diagnostico/monitoramento-e-alertas',
        // Várias linguagens na mesma página.
        'diagnostico/o-mesmo-erro-em-tres-formas',
        // Diff.
        'diagnostico/o-diff-que-resolveu',
      ],
    },
  ],
};

export default sidebars;
