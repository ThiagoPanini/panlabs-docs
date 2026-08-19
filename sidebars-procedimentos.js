// @ts-check

/**
 * A sidebar da tab `Procedimentos` — instância `procedimentos`.
 *
 * **Cinco separadores, dezesseis páginas.** É a aba que diz **como se faz**, e a
 * fronteira com `Jornadas` é regra conferível, não estilo: `<Steps>` é a espinha
 * daqui e **não entra** lá. Sem a proibição, o leitor abre um capítulo e não
 * consegue dizer por que a página não está nesta aba.
 *
 * **Três índices morreram, e dois viraram folha.** `Esteiras`, `Infraestrutura`
 * e `Acessos` tinham por conteúdo *a lista do que está logo abaixo*, e a sidebar
 * já é essa lista — a redundância é o que a âncora não tem (ADR 10 §c). Os dois
 * que ficaram não eram forma, eram conteúdo com dona:
 *
 * - `Ambiente › Índice` é a **fixture de página muito curta** — ~120 palavras e
 *   ZERO `##`, a única exceção nomeada da regra de heading. Ela é a única página
 *   que prova que a coluna de conteúdo fica no mesmo pixel sem coluna de TOC, e
 *   a prova nunca foi o cartão: é o `.col` travado, confirmado ao vivo contra a
 *   própria âncora, que reserva a largura da coluna de TOC mesmo vazia.
 * - `Diagnóstico › Índice de sintomas` carrega tipo de verdade: é a tabela de
 *   sintomas do gabarito de `Troubleshooting`.
 *
 * As duas ganharam **linha própria** no lugar de serem o destino do rótulo, e
 * abrem o grupo delas — ADR 10 §d.
 *
 * **O nível de topo é separador: `collapsible: false` e nenhum `link`.** Rótulo
 * em negrito, sem seta, sem ícone, sem `href`, e sempre aberto — o análogo do
 * `<h3 class="sidebar-title">` da âncora, sem swizzle e sem `pointer-events`
 * (ADR 10 §a). Esta aba não tem nó abaixo do separador que colapse: os cinco
 * grupos são separador → folha.
 *
 * O `className` que carrega o ícone (`mask-image` em `::before`, regras em
 * `src/css/chrome.css`) mora em **tudo abaixo do separador**. A regra é a de
 * `docs/design/icones.md` §8, e aqui ela só tem um caso: o separador não leva
 * `className`, e todas as folhas levam.
 *
 * Procedência: docs/design/informacao.md · docs/design/icones.md · docs/adr/0010.
 *
 * @type {import('@docusaurus/plugin-content-docs').SidebarsConfig}
 */
const sidebars = {
  procedimentos: [
    {
      type: 'category',
      label: 'Ambiente',
      collapsible: false,
      items: [
        // A folha de abertura da instância, e a fixture `pagina-muito-curta`.
        // Ela carrega `slug: /`, e é o que faz `/procedimentos` responder 200
        // sem redirecionamento (ADR 10 §h).
        {type: 'doc', id: 'ambiente/indice', className: 'sidebar-icone sidebar-icone--ambiente'},
        // A fixture de tabela como página inteira: o tipo `Catálogo` com prosa
        // quase nula.
        {type: 'doc', id: 'ambiente/comparativo-dev-staging-prod', className: 'sidebar-icone sidebar-icone--ambiente'},
        {type: 'doc', id: 'ambiente/preparar-a-maquina-local', className: 'sidebar-icone sidebar-icone--ambiente'},
      ],
    },
    {
      type: 'category',
      label: 'Esteiras',
      collapsible: false,
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
      collapsible: false,
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
      collapsible: false,
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
      collapsible: false,
      items: [
        // A folha de abertura que carrega tipo: `Troubleshooting`.
        {type: 'doc', id: 'diagnostico/indice-de-sintomas', className: 'sidebar-icone sidebar-icone--diagnostico'},
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
