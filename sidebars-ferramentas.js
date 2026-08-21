// @ts-check

// O ramo gerado de `overpower › Comandos`, emitido por
// `scripts/gerar-referencia.mjs`. É o ÚNICO import de um arquivo de sidebar deste
// projeto, e ele existe para que as duas posses não se misturem — ver o bloco
// abaixo.
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
 * mudos (`collapsible: false`, sem `link`), e os únicos nós com seta do site
 * moram todos dentro de `Bibliotecas › overpower` — o nó do produto, no nível 2,
 * e as cinco seções dele, no nível 3. Todos com página de abertura própria e
 * nascendo **fechados**. É por isso que a seta só ganha desenho aqui: ela é o
 * único lugar do sistema onde tem função (ADR 10 §a, §b).
 *
 * **O teto de profundidade é 4, e ele é confinado a este ramo.** O ADR 10 §g)
 * subiu o número e escreveu a condição junto: as 13 folhas de nível 4 estão todas
 * sob `overpower`, e o portão 4 cobra o confinamento em vez de *usado uma vez*.
 * Nenhuma outra aba passa do nível 2.
 *
 * **`collapsed: false` saiu do repositório inteiro.** A chave estava carimbada
 * `herdado` com a fonte *"a âncora mostra a árvore aberta"*, e a medição diz
 * outra coisa: a âncora mostra o **nível 1** aberto — e ele nem colapsa —,
 * enquanto grupo aninhado nasce fechado e abre sozinho no ramo da página atual.
 * Os seis grupos de `overpower` omitem a chave e herdam o default `true` do
 * Docusaurus; o `DocSidebar` abre o ramo da página atual sozinho, sem estado
 * nosso.
 *
 * **As quatro páginas de índice saíram.** `Bibliotecas`, `Módulos Terraform`,
 * `Skills` e `Servidores MCP` eram *a lista do que está logo abaixo*, e a
 * sidebar já é essa lista (ADR 10 §c). Nenhuma delas carregava tipo nem fixture
 * — as quatro que carregavam sobreviveram como folha, e todas elas moram nas
 * outras duas abas.
 *
 * **A regra de ícone é a da ADR 10 §e: nenhum no separador, ícone em tudo
 * abaixo, folha ou grupo, em qualquer nível.** É a terceira redação, e a
 * primeira agnóstica de profundidade; as duas anteriores travaram o nível 3 por
 * duas issues porque o teste mudava de resultado com a profundidade. Com o
 * `overpower` dentro, a régua é exercitada até o nível 4 e não muda de resposta.
 *
 * **A família de ícone é da SEÇÃO, não do separador.** As cinco seções do
 * `overpower` trazem família própria, e o nó do produto e as três folhas de
 * abertura ficam com `--bibliotecas`, que é a do separador que as contém. Nenhum
 * arquivo novo entrou em `static/icons/`: as cinco famílias reaproveitam desenhos
 * que o manifesto já carregava, e o teto de 64 não se move.
 *
 * **O ramo gerado chega por IMPORT, e a árvore continua escrita à mão aqui.** As
 * 4 páginas de `Comandos` saem do contrato de superfície de comando, e o gerador
 * emite um **fragmento** — uma lista de itens de folha — em vez da sidebar
 * inteira da instância. A categoria `Comandos` que as hospeda é escrita aqui,
 * porque o rótulo dela e a folha autoral que a abre são nossos e o gerador não os
 * conhece. `Bibliotecas` fecha em 21 e a aba em 26.
 *
 * **Nenhuma folha desta instância muda de layout, e desde a #118 não há o que
 * comutar.** A instância declarava `docItemComponent: '@theme/ApiDocItem'`, que
 * trocava a moldura das quatro páginas geradas por uma grade de duas colunas sem
 * TOC. O componente saiu, a linha saiu da config, e as vinte e seis folhas — 22
 * autorais e 4 geradas — passam pelo mesmo `@theme/DocItem`.
 *
 * Procedência: docs/design/informacao.md · docs/design/icones.md · docs/adr/0009
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
        {
          // O NÍVEL 2, e o nó do produto. A folha de abertura dele carrega
          // `slug: /`, e é o que faz `/ferramentas` responder 200 sem
          // redirecionamento (ADR 10 §h). Sem `collapsed`, que é `true` por
          // default: o Docusaurus abre este ramo sozinho quando a página atual
          // está dentro.
          type: 'category',
          label: 'overpower',
          className: 'sidebar-icone sidebar-icone--overpower',
          link: {type: 'doc', id: 'bibliotecas/overpower/visao-geral'},
          items: [
            {type: 'doc', id: 'bibliotecas/overpower/instalacao', className: 'sidebar-icone sidebar-icone--instalacao'},
            {type: 'doc', id: 'bibliotecas/overpower/conceitos', className: 'sidebar-icone sidebar-icone--conceitos'},
            {
              // A seção que hospeda o ramo gerado. A folha de abertura dela é
              // autoral e é a fixture de painel direito vazio: ela passa pela
              // perna do comutador que delega, e a coluna do painel nem chega a
              // existir nela — irmã direta das quatro que a pintam.
              type: 'category',
              label: 'Comandos',
              className: 'sidebar-icone sidebar-icone--comandos',
              link: {type: 'doc', id: 'bibliotecas/overpower/comandos/indice'},
              items: [...referencia],
            },
            {
              type: 'category',
              label: 'Alvos',
              className: 'sidebar-icone sidebar-icone--alvos',
              link: {type: 'doc', id: 'bibliotecas/overpower/alvos/indice'},
              items: [
                {type: 'doc', id: 'bibliotecas/overpower/alvos/servidores-mcp', className: 'sidebar-icone sidebar-icone--alvo-mcp'},
                {type: 'doc', id: 'bibliotecas/overpower/alvos/from', className: 'sidebar-icone sidebar-icone--alvo-from'},
                {type: 'doc', id: 'bibliotecas/overpower/alvos/bundle-federado', className: 'sidebar-icone sidebar-icone--alvo-bundle'},
              ],
            },
            {
              type: 'category',
              label: 'Referência',
              className: 'sidebar-icone sidebar-icone--referencia',
              link: {type: 'doc', id: 'bibliotecas/overpower/referencia/indice'},
              items: [
                {type: 'doc', id: 'bibliotecas/overpower/referencia/codigos-de-saida', className: 'sidebar-icone sidebar-icone--codigos-de-saida'},
                // A fixture de aninhamento máximo: nível 4, com os 40px de
                // recuo mais o ícone mais o rótulo mais longo desta
                // profundidade, tudo dentro dos 288px da coluna.
                {type: 'doc', id: 'bibliotecas/overpower/referencia/solucao-de-problemas', className: 'sidebar-icone sidebar-icone--solucao-de-problemas'},
                // O changelog é do lado do leitor, e não do de quem publica: ele
                // responde *o que mudou na versão que eu tenho*, que é pergunta
                // de quem usa. Ele morava sob `publicacao/` e mudou de casa na
                // #133, junto com a fusão que criou o `contribuir/`.
                {type: 'doc', id: 'bibliotecas/overpower/referencia/changelog', className: 'sidebar-icone sidebar-icone--changelog'},
              ],
            },
            {
              // **A fronteira entre quem usa e quem contribui é estrutural.**
              // `desenvolvimento/` e `publicacao/` serviam os dois ao mesmo
              // leitor, misturadas com as que servem quem instala, e nada na
              // sidebar dizia qual era qual. A fusão num nó só põe a fronteira
              // onde o leitor a vê antes de clicar (#133).
              type: 'category',
              label: 'Contribuir',
              className: 'sidebar-icone sidebar-icone--contribuir',
              link: {type: 'doc', id: 'bibliotecas/overpower/contribuir/indice'},
              items: [
                {type: 'doc', id: 'bibliotecas/overpower/contribuir/arquitetura', className: 'sidebar-icone sidebar-icone--arquitetura'},
                {type: 'doc', id: 'bibliotecas/overpower/contribuir/mapa-de-modulos', className: 'sidebar-icone sidebar-icone--mapa-de-modulos'},
                {type: 'doc', id: 'bibliotecas/overpower/contribuir/hooks', className: 'sidebar-icone sidebar-icone--hooks'},
                {type: 'doc', id: 'bibliotecas/overpower/contribuir/testes', className: 'sidebar-icone sidebar-icone--testes'},
                {type: 'doc', id: 'bibliotecas/overpower/contribuir/telas', className: 'sidebar-icone sidebar-icone--telas'},
                {type: 'doc', id: 'bibliotecas/overpower/contribuir/curadoria', className: 'sidebar-icone sidebar-icone--curadoria'},
                {type: 'doc', id: 'bibliotecas/overpower/contribuir/criterios-de-catalogo', className: 'sidebar-icone sidebar-icone--criterios-de-catalogo'},
                {type: 'doc', id: 'bibliotecas/overpower/contribuir/release', className: 'sidebar-icone sidebar-icone--release'},
                {type: 'doc', id: 'bibliotecas/overpower/contribuir/release-ready', className: 'sidebar-icone sidebar-icone--release-ready'},
              ],
            },
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
