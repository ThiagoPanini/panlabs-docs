// @ts-check

// O ramo gerado de `Biblioteca C`, emitido por `scripts/gerar-referencia.mjs`.
// É o ÚNICO import de um arquivo de sidebar deste projeto, e ele existe para que
// as duas posses não se misturem — ver o bloco abaixo.
import referencia from './sidebars-referencia.js';

/**
 * A sidebar da tab `Ferramentas` — instância `ferramentas`.
 *
 * **Quatro famílias, e é a única aba traduzida.** A fronteira do locale é
 * **audiência do artefato**, não infra pública contra corporativa: biblioteca,
 * módulo, skill e servidor MCP nascem na mesma esteira que tudo, mas são
 * **consumidos por outros times**, e é isso que lhes dá leitor de inglês.
 *
 * **O único lugar do site que COLAPSA.** Os quatro nós de topo são separadores
 * mudos (`collapsible: false`, sem `link`), e o único nó com seta do site é
 * `Bibliotecas › Biblioteca C` — nível 2, com página de abertura própria e
 * nascendo **fechado**. É por isso que a seta só ganha desenho aqui: ela é o
 * único lugar do sistema onde tem função (ADR 10 §a, §b).
 *
 * **`collapsed: false` saiu do repositório inteiro.** A chave estava carimbada
 * `herdado` com a fonte *"a âncora mostra a árvore aberta"*, e a medição diz
 * outra coisa: a âncora mostra o **nível 1** aberto — e ele nem colapsa —,
 * enquanto grupo aninhado nasce fechado e abre sozinho no ramo da página atual.
 * `Biblioteca C` omite a chave e herda o default `true` do Docusaurus; o
 * `DocSidebar` abre o ramo da página atual sozinho, sem estado nosso.
 *
 * **As quatro páginas de índice saíram.** `Bibliotecas`, `Módulos Terraform`,
 * `Skills` e `Servidores MCP` eram *a lista do que está logo abaixo*, e a
 * sidebar já é essa lista (ADR 10 §c). Nenhuma delas carregava tipo nem fixture
 * — as quatro que carregavam sobreviveram como folha, e todas elas moram nas
 * outras duas abas.
 *
 * **A regra de ícone é a da ADR 10 §e: nenhum no separador, ícone em tudo
 * abaixo, folha ou grupo, em qualquer nível.** `Biblioteca C` passa a receber
 * `className` — ela é grupo, mas está abaixo do separador, e o teste da regra
 * não pergunta mais o nível. É a terceira redação, e a primeira agnóstica de
 * profundidade; as duas anteriores travaram o nível 3 por duas issues porque o
 * teste mudava de resultado com a profundidade.
 *
 * **O ramo gerado chega por IMPORT, e a árvore continua escrita à mão aqui.** As
 * 6 páginas de referência de `Biblioteca C` saem do contrato de assinatura, e o
 * gerador emite um **fragmento** — uma lista de itens de folha, com o mesmo
 * `className` que as três autorais vizinhas — em vez da sidebar inteira da
 * instância. `Bibliotecas` fecha em 12 e a aba em 17. É a única forma de as
 * duas posses conviverem: as onze folhas autorais são nossas e o gerador não as
 * conhece; as seis geradas são dele e editá-las à mão seria a segunda fonte de
 * verdade que o gerador existe para impedir.
 *
 * **A instância declara `docItemComponent` e as folhas autorais não mudam de
 * layout.** O `ApiDocItem` comuta por página pelo front matter `api_exemplos`, e
 * delega para `@theme/DocItem` quando o campo falta — as seis geradas o declaram,
 * as onze autorais não.
 *
 * Procedência: docs/design/informacao.md · docs/design/icones.md · docs/adr/0008
 * · docs/adr/0010.
 *
 * @type {import('@docusaurus/plugin-content-docs').SidebarsConfig}
 */
const sidebars = {
  ferramentas: [
    {
      type: 'category',
      label: 'Bibliotecas',
      collapsible: false,
      items: [
        // A folha de abertura da instância. Ela carrega `slug: /`, e é o que faz
        // `/ferramentas` responder 200 sem redirecionamento (ADR 10 §h).
        {type: 'doc', id: 'bibliotecas/biblioteca-a', className: 'sidebar-icone sidebar-icone--bibliotecas'},
        {type: 'doc', id: 'bibliotecas/biblioteca-b', className: 'sidebar-icone sidebar-icone--bibliotecas'},
        {
          // O NÍVEL 2 COLAPSÁVEL, e o único do site — a única seta com função.
          // COM ícone: a regra nova não abre exceção por nível, só pelo
          // separador de topo. Sem `collapsed`, que é `true` por default: o
          // Docusaurus abre este ramo sozinho quando a página atual está dentro.
          type: 'category',
          label: 'Biblioteca C',
          className: 'sidebar-icone sidebar-icone--bibliotecas',
          link: {type: 'doc', id: 'bibliotecas/biblioteca-c/visao-geral'},
          items: [
            // A fixture de painel direito vazio: a folha autoral desta
            // instância passa pela perna do comutador que delega, e a coluna do
            // painel nem chega a existir nela.
            {type: 'doc', id: 'bibliotecas/biblioteca-c/instalacao-e-configuracao', className: 'sidebar-icone sidebar-icone--bibliotecas'},
            {type: 'doc', id: 'bibliotecas/biblioteca-c/tratamento-de-erros', className: 'sidebar-icone sidebar-icone--bibliotecas'},
            {type: 'doc', id: 'bibliotecas/biblioteca-c/changelog', className: 'sidebar-icone sidebar-icone--bibliotecas'},
            // O ramo gerado, espalhado como irmão das autorais. Sem categoria
            // própria: um nó a mais aqui seria o nível 4, e o teto é 3.
            ...referencia,
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Módulos Terraform',
      collapsible: false,
      items: [
        {type: 'doc', id: 'modulos-terraform/modulo-de-bucket', className: 'sidebar-icone sidebar-icone--modulos-terraform'},
        {type: 'doc', id: 'modulos-terraform/modulo-de-papel-iam', className: 'sidebar-icone sidebar-icone--modulos-terraform'},
      ],
    },
    {
      type: 'category',
      label: 'Skills',
      collapsible: false,
      items: [
        // A fixture de prosa mínima e código máximo — o tipo `Receita`, relocado
        // para cá quando a aba própria dele morreu.
        {type: 'doc', id: 'skills/scaffold-de-esteira', className: 'sidebar-icone sidebar-icone--skills'},
        {type: 'doc', id: 'skills/rotacao-de-segredo', className: 'sidebar-icone sidebar-icone--skills'},
      ],
    },
    {
      type: 'category',
      label: 'Servidores MCP',
      collapsible: false,
      items: [
        {type: 'doc', id: 'servidores-mcp/servidor-de-catalogo-mcp', className: 'sidebar-icone sidebar-icone--servidores-mcp'},
      ],
    },
  ],
};

export default sidebars;
