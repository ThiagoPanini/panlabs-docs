/**
 * O manifesto de ícones — CONTRATO.
 *
 * Os desenhos são skin e se trocam (`static/icons/*.svg`); estes nomes não.
 * O corporativo com iconografia própria substitui os arquivos e mantém os
 * nomes: nenhum componente e nenhum MDX é reescrito.
 *
 * Três papéis, UM registro, UM orçamento. **O papel é uma tag na entrada, não
 * uma pilha separada de desenhos** — é por isso que `package`, `users`,
 * `webhook` e `book-open` carregam duas tags e consomem um arquivo só.
 *
 *   19 sistema + 12 navegação + 37 autoria = 68 tags sobre 64 arquivos
 *
 * O teto é 64 — **teto, não meta**, e ele acabou de ser alcançado: o slot que
 * sobrava foi para `wrench`, o único desenho novo do mapa do `mint`. **Folga
 * zero.** O 65º ícone deixou de ser revisão de design e virou troca: ou entra no
 * lugar de outro, ou não entra.
 *
 * Procedência: docs/design/icones.md.
 */

/**
 * `nome` é NOSSO nome — semântico, e é ele que o autor escreve no MDX. `lucide`
 * só aparece onde o upstream diverge, e é a prova de que o nome do contrato não
 * é refém do vocabulário de terceiro: o Lucide renomeia glifo entre versões, e
 * quem paga é o mapa de uma linha, não o MDX de 73 páginas.
 *
 * @typedef {'sistema' | 'navegacao' | 'autoria'} Papel
 * @typedef {{nome: string, papeis: Papel[], onde: string, lucide?: string}} Entrada
 */

/**
 * Sistema · 19 — o componente escolhe, o autor nunca.
 * @type {Entrada[]}
 */
const SISTEMA = [
  {nome: 'info', papeis: ['sistema'], onde: 'callout `info`'},
  {nome: 'lightbulb', papeis: ['sistema'], onde: 'callout `tip`'},
  {nome: 'triangle-alert', papeis: ['sistema'], onde: 'callout `warning`'},
  {nome: 'pencil-line', papeis: ['sistema'], onde: 'callout `note`'},
  {nome: 'train-track', papeis: ['sistema'], onde: 'a marca, ao lado da palavra `Trilho`'},
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
 * Navegação · 12 tags, 9 arquivos — um slot por seção de topo de sidebar.
 * As três seções que reusam entrada de autoria estão em AUTORIA, com a
 * segunda tag na própria entrada.
 * @type {Entrada[]}
 */
const NAVEGACAO = [
  {nome: 'rocket', papeis: ['navegacao'], onde: 'Documentação › Comece aqui'},
  {nome: 'shapes', papeis: ['navegacao'], onde: 'Documentação › Conceitos'},
  {nome: 'wallet', papeis: ['navegacao'], onde: 'Documentação › Meios de pagamento'},
  // Retagueado pela landing: ele ganha a segunda tag e o segundo ponto de
  // consumo. A porta é escrita como STRING — `<Card icon="book-open">` —, que é
  // a mesma superfície do MDX, e é a tag de autoria que a governa.
  {nome: 'book-open', papeis: ['navegacao', 'autoria'], onde: 'Documentação › Guias · landing › porta Jornadas'},
  {nome: 'activity', papeis: ['navegacao'], onde: 'Documentação › Operação'},
  {nome: 'code-xml', papeis: ['navegacao'], onde: 'Referência da API › Introdução'},
  {nome: 'receipt', papeis: ['navegacao'], onde: 'Referência da API › Cobranças'},
  {nome: 'repeat', papeis: ['navegacao'], onde: 'Referência da API › Assinaturas'},
  {nome: 'undo-2', papeis: ['navegacao'], onde: 'Referência da API › Reembolsos'},
];

/**
 * Autoria · 37 — o vocabulário escrito como STRING: o MDX do autor e, agora, as
 * três portas da landing, que usam a mesma superfície `<Card icon="…">`.
 *
 * Três entradas carregam a segunda tag `navegacao` e moram aqui; `book-open`
 * carrega o par na direção contrária e mora em NAVEGACAO. As quatro juntas são o
 * que faz 68 tags caberem em 64 arquivos.
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

  // Objetos · 15
  {nome: 'file-text', papeis: ['autoria'], onde: 'vocabulário do autor'},
  {nome: 'folder', papeis: ['autoria'], onde: 'vocabulário do autor'},
  {nome: 'terminal', papeis: ['autoria'], onde: 'vocabulário do autor · landing › porta Procedimentos'},
  // O único desenho NOVO do mapa do `mint`, e o único ponto em que o teto de 64
  // compra alguma coisa: na porta `Ferramentas`, todo glifo adequado do acervo
  // já é uma das quatro famílias que aquela aba abre, e a regra da porta é não
  // repetir o glifo de nenhuma categoria que ela abre.
  {nome: 'wrench', papeis: ['autoria'], onde: 'vocabulário do autor · landing › porta Ferramentas'},
  {nome: 'database', papeis: ['autoria'], onde: 'vocabulário do autor'},
  {nome: 'server', papeis: ['autoria'], onde: 'vocabulário do autor'},
  {nome: 'cloud', papeis: ['autoria'], onde: 'vocabulário do autor'},
  {nome: 'key', papeis: ['autoria'], onde: 'vocabulário do autor'},
  {nome: 'lock', papeis: ['autoria'], onde: 'vocabulário do autor'},
  {nome: 'mail', papeis: ['autoria'], onde: 'vocabulário do autor'},
  {nome: 'calendar', papeis: ['autoria'], onde: 'vocabulário do autor'},
  // Sem consumidor desde que a grade de cinco cartões da landing morreu, e ele
  // FICA. O corte é do ticket da árvore, que é quem reescreve o manifesto
  // inteiro; cortá-lo aqui adiantaria metade de uma decisão que lá é uma só.
  {nome: 'credit-card', papeis: ['autoria'], onde: 'vocabulário do autor'},
  {nome: 'users', papeis: ['navegacao', 'autoria'], onde: 'Referência da API › Clientes · vocabulário do autor'},
  {nome: 'globe', papeis: ['autoria'], onde: 'vocabulário do autor'},
  {nome: 'package', papeis: ['navegacao', 'autoria'], onde: 'Documentação › SDKs · vocabulário do autor'},

  // Estados e sinais · 7
  {nome: 'zap', papeis: ['autoria'], onde: 'vocabulário do autor'},
  {nome: 'clock', papeis: ['autoria'], onde: 'vocabulário do autor'},
  {nome: 'circle-alert', papeis: ['autoria'], onde: 'vocabulário do autor'},
  {nome: 'circle-help', papeis: ['autoria'], onde: 'vocabulário do autor', lucide: 'circle-question-mark'},
  {nome: 'sparkles', papeis: ['autoria'], onde: 'vocabulário do autor'},
  {nome: 'trending-up', papeis: ['autoria'], onde: 'vocabulário do autor'},
  {nome: 'gauge', papeis: ['autoria'], onde: 'vocabulário do autor'},

  // Conceitos · 6
  {nome: 'layers', papeis: ['autoria'], onde: 'vocabulário do autor'},
  {nome: 'workflow', papeis: ['autoria'], onde: 'vocabulário do autor'},
  {nome: 'puzzle', papeis: ['autoria'], onde: 'vocabulário do autor'},
  {nome: 'bot', papeis: ['autoria'], onde: 'vocabulário do autor'},
  {nome: 'webhook', papeis: ['navegacao', 'autoria'], onde: 'Referência da API › Webhooks · vocabulário do autor'},
  {nome: 'bell', papeis: ['autoria'], onde: 'vocabulário do autor'},
];

/** @type {Entrada[]} */
export const ICONES = [...SISTEMA, ...NAVEGACAO, ...AUTORIA];

/** Os 64 nomes de arquivo, em ordem de manifesto. */
export const NOMES = ICONES.map((i) => i.nome);

/**
 * O teto é duro. Ele existe porque conjunto que cresce sob demanda vira dívida:
 * ninguém audita 300 ícones em busca de coerência de família, mas 64 cabem numa
 * tela e a incoerência salta aos olhos.
 */
export const TETO = 64;

/**
 * Os doze pares seção→ícone. A chave é o `id` da categoria de topo — o mesmo
 * que vira `sidebar-icone--<chave>` no `className` da sidebar.
 *
 * `Receitas` é sidebar plana: sem categoria, logo sem ícone, e não consome slot.
 * As três tabs de navbar também não recebem ícone.
 */
export const PARES_SECAO = {
  'comece-aqui': 'rocket',
  conceitos: 'shapes',
  'meios-de-pagamento': 'wallet',
  guias: 'book-open',
  sdks: 'package',
  operacao: 'activity',
  introducao: 'code-xml',
  cobrancas: 'receipt',
  clientes: 'users',
  assinaturas: 'repeat',
  reembolsos: 'undo-2',
  webhooks: 'webhook',
};

/**
 * A versão do Lucide de onde os desenhos foram copiados.
 *
 * O Lucide **renomeia glifo entre versões** — `code-xml` já foi `code-2`. Os
 * nomes deste manifesto se conferem contra esta versão no ato de copiar, e é
 * `scripts/vendorizar-icones.mjs` quem roda a conferência.
 */
export const LUCIDE_VERSAO = '1.30.0';
