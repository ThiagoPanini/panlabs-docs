/**
 * O manifesto de ícones — CONTRATO.
 *
 * Os desenhos são skin e se trocam (`static/icons/*.svg`); estes nomes não.
 * O corporativo com iconografia própria substitui os arquivos e mantém os
 * nomes: nenhum componente e nenhum MDX é reescrito.
 *
 * Três papéis, UM registro, UM orçamento. **O papel é uma tag na entrada, não
 * uma pilha separada de desenhos** — é por isso que `package`, `layers`,
 * `workflow` e outros seis carregam duas tags e consomem um arquivo só.
 *
 *   18 sistema + 11 navegação + 40 autoria = 69 tags sobre 60 arquivos
 *
 * O teto é 64 — **teto, não meta**. Ele foi alcançado no mapa do `mint` e a
 * árvore do `panlabs` devolveu folga: **quatro cortes, quatro slots livres**.
 * `train-track` morreu com a marca, que ficou só com a palavra; `wallet` e
 * `receipt` nomeavam pagamentos, e o domínio inteiro morreu; `credit-card` já
 * estava sem consumidor desde que a grade de cinco cartões da landing morreu.
 *
 * A regra que decidiu os cortes: **sobrevive quem é neutro de domínio ou nomeia
 * o cenário fixado** — GitHub Actions, AWS, Python.
 *
 * Procedência: docs/design/icones.md.
 */

/**
 * `nome` é NOSSO nome — semântico, e é ele que o autor escreve no MDX. `lucide`
 * só aparece onde o upstream diverge, e é a prova de que o nome do contrato não
 * é refém do vocabulário de terceiro: o Lucide renomeia glifo entre versões, e
 * quem paga é o mapa de uma linha, não o MDX de dezenas de páginas.
 *
 * @typedef {'sistema' | 'navegacao' | 'autoria'} Papel
 * @typedef {{nome: string, papeis: Papel[], onde: string, lucide?: string}} Entrada
 */

/**
 * Sistema · 18 — o componente escolhe, o autor nunca.
 *
 * **Eram 19.** `train-track` saiu porque a marca ficou só com a palavra: sem
 * glifo ao lado do nome, o desenho perdeu o único consumidor que tinha, e
 * componente sem consumidor é o defeito que este projeto mata por nome.
 * @type {Entrada[]}
 */
const SISTEMA = [
  {nome: 'info', papeis: ['sistema'], onde: 'callout `info`'},
  {nome: 'lightbulb', papeis: ['sistema'], onde: 'callout `tip`'},
  {nome: 'triangle-alert', papeis: ['sistema'], onde: 'callout `warning`'},
  {nome: 'pencil-line', papeis: ['sistema'], onde: 'callout `note`'},
  {nome: 'chevron-right', papeis: ['sistema'], onde: 'caret de `Accordion` e de categoria de sidebar'},
  {nome: 'check', papeis: ['sistema'], onde: 'passo concluído em `Steps`'},
  {nome: 'copy', papeis: ['sistema'], onde: 'botão copiar do bloco de código'},
  {nome: 'wrap-text', papeis: ['sistema'], onde: 'toggle de quebra de linha do bloco de código', lucide: 'text-wrap'},
  {nome: 'external-link', papeis: ['sistema'], onde: 'link externo'},
  {nome: 'search', papeis: ['sistema'], onde: 'busca'},
  {nome: 'x', papeis: ['sistema'], onde: 'fechar modal'},
  {nome: 'menu', papeis: ['sistema'], onde: 'hambúrguer de tela estreita'},
  {nome: 'sun', papeis: ['sistema'], onde: 'tema claro'},
  {nome: 'moon', papeis: ['sistema'], onde: 'tema escuro'},
  {nome: 'monitor', papeis: ['sistema'], onde: 'tema do sistema'},
  {nome: 'languages', papeis: ['sistema'], onde: 'seletor de locale'},
  {nome: 'link', papeis: ['sistema'], onde: 'âncora de heading'},
  {nome: 'arrow-right', papeis: ['sistema'], onde: 'paginação e CTA de card'},
];

/**
 * Navegação · 11 tags sobre 11 arquivos, dos quais **dois moram aqui**.
 *
 * Os outros nove reusam entrada de autoria e carregam a segunda tag na própria
 * entrada — é isso que faz 69 tags caberem em 60 arquivos. Os dois daqui são
 * órfãos de navegação **reempregados**: `code-xml` e `activity` já eram
 * navegação na árvore anterior, e trocaram de seção sem trocar de papel.
 * @type {Entrada[]}
 */
const NAVEGACAO = [
  {nome: 'code-xml', papeis: ['navegacao'], onde: 'Jornadas › API Owner'},
  {nome: 'activity', papeis: ['navegacao'], onde: 'Procedimentos › Diagnóstico'},
];

/**
 * Autoria · 40 — o vocabulário escrito como STRING: o MDX do autor e as três
 * portas da landing, que usam a mesma superfície `<Card icon="…">`.
 *
 * **Nove entradas carregam a segunda tag `navegacao` e moram aqui.** Foram
 * escolhidas pela regra da porta lida ao contrário: a categoria fica com o
 * glifo que nomeia o que ela guarda, e a porta da landing fica com um que
 * nenhuma das categorias dela usa.
 * @type {Entrada[]}
 */
const AUTORIA = [
  // Ações · 8
  {nome: 'play', papeis: ['autoria'], onde: 'vocabulário do autor'},
  {nome: 'download', papeis: ['autoria'], onde: 'vocabulário do autor'},
  {nome: 'upload', papeis: ['autoria'], onde: 'vocabulário do autor'},
  {nome: 'refresh-cw', papeis: ['autoria'], onde: 'vocabulário do autor'},
  {nome: 'send', papeis: ['autoria'], onde: 'vocabulário do autor'},
  {nome: 'trash-2', papeis: ['autoria'], onde: 'vocabulário do autor'},
  {nome: 'plus', papeis: ['autoria'], onde: 'vocabulário do autor'},
  {nome: 'filter', papeis: ['autoria'], onde: 'vocabulário do autor', lucide: 'funnel'},

  // Objetos · 16
  {nome: 'file-text', papeis: ['autoria'], onde: 'vocabulário do autor'},
  {nome: 'folder', papeis: ['autoria'], onde: 'vocabulário do autor'},
  {nome: 'terminal', papeis: ['autoria'], onde: 'vocabulário do autor · landing › porta Procedimentos'},
  {nome: 'wrench', papeis: ['autoria'], onde: 'vocabulário do autor · landing › porta Ferramentas'},
  {nome: 'database', papeis: ['autoria'], onde: 'vocabulário do autor'},
  {nome: 'server', papeis: ['navegacao', 'autoria'], onde: 'Ferramentas › Servidores MCP · vocabulário do autor'},
  {nome: 'cloud', papeis: ['navegacao', 'autoria'], onde: 'Procedimentos › Infraestrutura · vocabulário do autor'},
  {nome: 'key', papeis: ['navegacao', 'autoria'], onde: 'Procedimentos › Acessos · vocabulário do autor'},
  {nome: 'lock', papeis: ['navegacao', 'autoria'], onde: 'Jornadas › Security Champion · vocabulário do autor'},
  {nome: 'mail', papeis: ['autoria'], onde: 'vocabulário do autor'},
  {nome: 'calendar', papeis: ['autoria'], onde: 'vocabulário do autor'},
  {nome: 'users', papeis: ['autoria'], onde: 'vocabulário do autor'},
  {nome: 'globe', papeis: ['autoria'], onde: 'vocabulário do autor'},
  {nome: 'package', papeis: ['navegacao', 'autoria'], onde: 'Ferramentas › Bibliotecas · vocabulário do autor'},
  {nome: 'rocket', papeis: ['autoria'], onde: 'vocabulário do autor'},
  {nome: 'shapes', papeis: ['autoria'], onde: 'vocabulário do autor'},

  // Estados e sinais · 7
  {nome: 'zap', papeis: ['autoria'], onde: 'vocabulário do autor'},
  {nome: 'clock', papeis: ['autoria'], onde: 'vocabulário do autor'},
  {nome: 'circle-alert', papeis: ['autoria'], onde: 'vocabulário do autor'},
  {nome: 'circle-help', papeis: ['autoria'], onde: 'vocabulário do autor', lucide: 'circle-question-mark'},
  {nome: 'sparkles', papeis: ['autoria'], onde: 'vocabulário do autor'},
  {nome: 'trending-up', papeis: ['autoria'], onde: 'vocabulário do autor'},
  {nome: 'gauge', papeis: ['autoria'], onde: 'vocabulário do autor'},

  // Conceitos · 9
  {nome: 'layers', papeis: ['navegacao', 'autoria'], onde: 'Procedimentos › Ambiente · vocabulário do autor'},
  {nome: 'workflow', papeis: ['navegacao', 'autoria'], onde: 'Procedimentos › Esteiras · vocabulário do autor'},
  {nome: 'puzzle', papeis: ['navegacao', 'autoria'], onde: 'Ferramentas › Módulos Terraform · vocabulário do autor'},
  {nome: 'bot', papeis: ['navegacao', 'autoria'], onde: 'Ferramentas › Skills · vocabulário do autor'},
  {nome: 'webhook', papeis: ['autoria'], onde: 'vocabulário do autor'},
  {nome: 'bell', papeis: ['autoria'], onde: 'vocabulário do autor'},
  // A porta `Jornadas` da landing. Ela deixou de violar a regra da porta no
  // mesmo commit em que a árvore mudou: nos onze pares abaixo, `book-open` não é
  // glifo de categoria nenhuma.
  {nome: 'book-open', papeis: ['autoria'], onde: 'vocabulário do autor · landing › porta Jornadas'},
  {nome: 'repeat', papeis: ['autoria'], onde: 'vocabulário do autor'},
  {nome: 'undo-2', papeis: ['autoria'], onde: 'vocabulário do autor'},
];

/** @type {Entrada[]} */
export const ICONES = [...SISTEMA, ...NAVEGACAO, ...AUTORIA];

/** Os 60 nomes de arquivo, em ordem de manifesto. */
export const NOMES = ICONES.map((i) => i.nome);

/**
 * O teto é duro. Ele existe porque conjunto que cresce sob demanda vira dívida:
 * ninguém audita 300 ícones em busca de coerência de família, mas 64 cabem numa
 * tela e a incoerência salta aos olhos.
 *
 * **O teto não desce junto com a contagem.** Ele é o limite do que se consegue
 * auditar de uma vez, não uma marca d'água do que já se gastou — descê-lo para
 * 60 seria trocar uma régua por um registro do passado.
 */
export const TETO = 64;

/**
 * Os onze pares seção→ícone. A chave é o `id` da categoria de topo — o mesmo
 * que vira `sidebar-icone--<chave>` no `className` da sidebar.
 *
 * **`Biblioteca C` não recebe ícone**, e é a regra reescrita que diz isso: o
 * ícone vai **só no nó de topo da sidebar**. Ela é categoria de segundo nível, e
 * a formulação antiga (*obrigatório na categoria de topo, ausente na folha*) é
 * que não tinha leitura no nível 3.
 *
 * As três tabs de navbar continuam sem ícone.
 */
export const PARES_SECAO = {
  'api-owner': 'code-xml',
  'security-champion': 'lock',
  ambiente: 'layers',
  esteiras: 'workflow',
  infraestrutura: 'cloud',
  acessos: 'key',
  diagnostico: 'activity',
  bibliotecas: 'package',
  'modulos-terraform': 'puzzle',
  skills: 'bot',
  'servidores-mcp': 'server',
};

/**
 * A versão do Lucide de onde os desenhos foram copiados.
 *
 * O Lucide **renomeia glifo entre versões** — `code-xml` já foi `code-2`. Os
 * nomes deste manifesto se conferem contra esta versão no ato de copiar, e é
 * `scripts/vendorizar-icones.mjs` quem roda a conferência.
 */
export const LUCIDE_VERSAO = '1.30.0';
