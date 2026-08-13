// @ts-check

/**
 * A sidebar da tab `Ferramentas` — instância `ferramentas`.
 *
 * **Quatro famílias, e é a única aba traduzida.** A fronteira do locale é
 * **audiência do artefato**, não infra pública contra corporativa: biblioteca,
 * módulo, skill e servidor MCP nascem na mesma esteira que tudo, mas são
 * **consumidos por outros times**, e é isso que lhes dá leitor de inglês.
 *
 * **O único lugar do site que usa o nível 3.** O teto de profundidade subiu de 2
 * para 3, e ele é usado onde uma ferramenta tem mais de uma página —
 * `Bibliotecas › Biblioteca C`, que é a que carrega a referência gerada. A regra
 * de ícone foi reescrita junto, e é ela que torna o nível 3 legível: **ícone só
 * no nó de topo da sidebar**. A formulação antiga (*obrigatório na categoria de
 * topo, ausente na folha*) é que não tinha leitura num terceiro nível — não o
 * teto.
 *
 * **O ramo gerado não está aqui, e a sidebar é válida sem ele.** As 6 páginas de
 * referência de `Biblioteca C` chegam no ticket seguinte, junto com o fragmento
 * que as declara; `Bibliotecas` vai de 7 para 13 e a aba de 15 para 21. É assim
 * que os dois tickets ficam verdes: uma sidebar apontando para página inexistente
 * quebraria o build.
 *
 * **A instância declara `docItemComponent` e as folhas daqui não mudam de
 * layout.** O `ApiDocItem` comuta por página pelo front matter `api_exemplos`, e
 * delega para `@theme/DocItem` quando o campo falta — hoje nenhuma folha o
 * declara.
 *
 * Procedência: docs/design/informacao.md · docs/design/icones.md.
 *
 * @type {import('@docusaurus/plugin-content-docs').SidebarsConfig}
 */
const sidebars = {
  ferramentas: [
    {
      type: 'category',
      label: 'Bibliotecas',
      className: 'sidebar-icone sidebar-icone--bibliotecas',
      collapsed: false,
      link: {type: 'doc', id: 'bibliotecas/indice'},
      items: [
        'bibliotecas/biblioteca-a',
        'bibliotecas/biblioteca-b',
        {
          // O NÍVEL 3, e o único do site. Sem ícone: a regra é *só no nó de topo
          // da sidebar*, e este nó é de segundo nível.
          type: 'category',
          label: 'Biblioteca C',
          collapsed: false,
          link: {type: 'doc', id: 'bibliotecas/biblioteca-c/visao-geral'},
          items: [
            // A fixture de painel direito vazio: a folha autoral desta
            // instância passa pela perna do comutador que delega, e a coluna do
            // painel nem chega a existir nela.
            'bibliotecas/biblioteca-c/instalacao-e-configuracao',
            'bibliotecas/biblioteca-c/tratamento-de-erros',
            'bibliotecas/biblioteca-c/changelog',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Módulos Terraform',
      className: 'sidebar-icone sidebar-icone--modulos-terraform',
      collapsed: false,
      link: {type: 'doc', id: 'modulos-terraform/indice'},
      items: ['modulos-terraform/modulo-de-bucket', 'modulos-terraform/modulo-de-papel-iam'],
    },
    {
      type: 'category',
      label: 'Skills',
      className: 'sidebar-icone sidebar-icone--skills',
      collapsed: false,
      link: {type: 'doc', id: 'skills/indice'},
      items: [
        // A fixture de prosa mínima e código máximo — o tipo `Receita`, relocado
        // para cá quando a aba própria dele morreu.
        'skills/scaffold-de-esteira',
        'skills/rotacao-de-segredo',
      ],
    },
    {
      type: 'category',
      label: 'Servidores MCP',
      className: 'sidebar-icone sidebar-icone--servidores-mcp',
      collapsed: false,
      link: {type: 'doc', id: 'servidores-mcp/indice'},
      items: ['servidores-mcp/servidor-de-catalogo-mcp'],
    },
  ],
};

export default sidebars;
