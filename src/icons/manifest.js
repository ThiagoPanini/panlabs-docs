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
 *   19 sistema + 36 navegação + 39 autoria = 94 tags sobre 60 arquivos
 *
 * O teto é 64 — **teto, não meta**. Ele foi alcançado no mapa do `mint` e a
 * árvore do `panlabs` devolveu folga: **quatro cortes, quatro slots livres**.
 * **Um voltou a ser gasto**: `list`, o glifo do título do índice desta página,
 * é o 61º arquivo e deixa a folga em três. O teto NÃO desce junto.
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
 * Sistema · 19 — o componente escolhe, o autor nunca.
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
  {nome: 'chevron-right', papeis: ['sistema'], onde: 'caret de `Accordion`, de categoria de sidebar e — girado — do par `Copiar página`'},
  {nome: 'check', papeis: ['sistema'], onde: 'passo concluído em `Steps` e confirmação de `Copiar página`'},
  {nome: 'copy', papeis: ['sistema'], onde: 'botão copiar do bloco de código e o par `Copiar página`'},
  {nome: 'wrap-text', papeis: ['sistema'], onde: 'toggle de quebra de linha do bloco de código', lucide: 'text-wrap'},
  {nome: 'external-link', papeis: ['sistema'], onde: 'link externo e os itens de assistente de `Copiar página`'},
  {nome: 'search', papeis: ['sistema'], onde: 'busca'},
  {nome: 'x', papeis: ['sistema'], onde: 'fechar modal'},
  {nome: 'menu', papeis: ['sistema'], onde: 'hambúrguer de tela estreita'},
  {nome: 'sun', papeis: ['sistema'], onde: 'tema claro'},
  {nome: 'moon', papeis: ['sistema'], onde: 'tema escuro'},
  {nome: 'monitor', papeis: ['sistema'], onde: 'tema do sistema'},
  {nome: 'languages', papeis: ['sistema'], onde: 'seletor de locale'},
  {nome: 'link', papeis: ['sistema'], onde: 'âncora de heading'},
  {nome: 'list', papeis: ['sistema'], onde: 'título do índice desta página', lucide: 'text-align-start'},
  {nome: 'arrow-right', papeis: ['sistema'], onde: 'paginação e CTA de card'},
];

/**
 * Navegação · 11 tags sobre 11 arquivos, dos quais **dois moram aqui**.
 *
 * Os outros nove reusam entrada de autoria e carregam a segunda tag na própria
 * entrada — é isso que faz 70 tags caberem em 61 arquivos. Os dois daqui são
 * órfãos de navegação **reempregados**: `code-xml` e `activity` já eram
 * navegação na árvore anterior, e trocaram de seção sem trocar de papel.
 * @type {Entrada[]}
 */
const NAVEGACAO = [
  {nome: 'code-xml', papeis: ['navegacao'], onde: 'Jornadas › API Owner'},
  {nome: 'activity', papeis: ['navegacao'], onde: 'Procedimentos › Diagnóstico'},
];

/**
 * Autoria · 40 — o vocabulário escrito como STRING: o MDX do autor, por
 * `<Card icon="…">`.
 *
 * **Eram duas superfícies.** A segunda eram as três portas da landing, que
 * usavam a mesma `<Card icon="…">`, e saíram com a página na issue #94. A
 * definição da tag NÃO reverte com elas: `autoria` é *"o nome escrito como
 * string"*, e não *"o MDX do autor"* — a correção que a estabeleceu vale por si.
 *
 * **Vinte e nove entradas carregam a segunda tag `navegacao` e moram aqui.**
 * Elas chegaram em duas levas, e as duas provam a mesma coisa: navegação nova
 * NÃO custa arquivo. As cinco seções do `overpower` levaram a navegação de 11
 * para 16 tags; a #118 deu ícone próprio a cada uma das 21 páginas do produto e
 * a levou a 31, reaproveitando outros dezesseis desenhos que já estavam no
 * vocabulário do autor. `package` fez o caminho contrário e devolveu a tag na
 * mesma issue — ver a nota na entrada dele. O teto de 64 não se moveu em
 * nenhuma das três vezes, e a contagem de arquivos segue em 61.
 *
 * As nove primeiras foram escolhidas pela regra da porta lida ao contrário: a
 * categoria ficava com o glifo que nomeia o que ela guarda, e a porta ficava com
 * um que nenhuma das categorias dela usava. A regra fica sem sujeito, e a escolha
 * que ela produziu fica — desfazê-la seria remexer no manifesto sem medição que
 * o peça.
 * @type {Entrada[]}
 */
const AUTORIA = [
  // Ações · 8
  {nome: 'play', papeis: ['navegacao', 'autoria'], onde: 'Ferramentas › … › Contribuir › Telas · vocabulário do autor'},
  {nome: 'download', papeis: ['navegacao', 'autoria'], onde: 'Ferramentas › … › overpower › Instalação · vocabulário do autor'},
  {nome: 'upload', papeis: ['navegacao', 'autoria'], onde: 'Ferramentas › … › Contribuir › O release-ready · vocabulário do autor'},
  {nome: 'refresh-cw', papeis: ['navegacao', 'autoria'], onde: 'Ferramentas › … › Referência › Solução de problemas · vocabulário do autor'},
  {nome: 'trash-2', papeis: ['autoria'], onde: 'vocabulário do autor'},
  {nome: 'plus', papeis: ['navegacao', 'autoria'], onde: 'Ferramentas › … › Comandos › overpower install · vocabulário do autor'},
  {nome: 'filter', papeis: ['navegacao', 'autoria'], onde: 'Ferramentas › … › Contribuir › Curadoria · vocabulário do autor', lucide: 'funnel'},

  // Objetos · 16
  {nome: 'file-text', papeis: ['navegacao', 'autoria'], onde: 'Ferramentas › Bibliotecas › overpower › Contribuir › Mapa de módulos · vocabulário do autor'},
  {nome: 'folder', papeis: ['navegacao', 'autoria'], onde: 'Ferramentas › … › Alvos › from · vocabulário do autor'},
  // Era também a porta `Procedimentos` da landing, que saiu na #94. Hoje é o
  // glifo de `Comandos`, que é o nome que ele já nomeava.
  {nome: 'terminal', papeis: ['navegacao', 'autoria'], onde: 'Ferramentas › Bibliotecas › overpower › Comandos · vocabulário do autor'},
  // Comprado pela porta `Ferramentas` da landing, que saiu na #94. Continua no
  // vocabulário do autor, é o único nome de ferramenta do manifesto, e hoje
  // nomeia também `Contribuir › Arquitetura` — ele vestia `Desenvolvimento`, que
  // fundiu em `Contribuir` na #133.
  {nome: 'wrench', papeis: ['navegacao', 'autoria'], onde: 'Ferramentas › Bibliotecas › overpower › Contribuir › Arquitetura · vocabulário do autor'},
  {nome: 'database', papeis: ['navegacao', 'autoria'], onde: 'Ferramentas › … › Comandos › overpower list · vocabulário do autor'},
  {nome: 'server', papeis: ['navegacao', 'autoria'], onde: 'Ferramentas › Servidores MCP · vocabulário do autor'},
  {nome: 'cloud', papeis: ['navegacao', 'autoria'], onde: 'Procedimentos › Infraestrutura · vocabulário do autor'},
  {nome: 'key', papeis: ['navegacao', 'autoria'], onde: 'Procedimentos › Acessos · vocabulário do autor'},
  {nome: 'lock', papeis: ['navegacao', 'autoria'], onde: 'Jornadas › Security Champion · vocabulário do autor'},
  {nome: 'mail', papeis: ['autoria'], onde: 'vocabulário do autor'},
  {nome: 'calendar', papeis: ['autoria'], onde: 'vocabulário do autor'},
  {nome: 'users', papeis: ['navegacao', 'autoria'], onde: 'Ferramentas › Bibliotecas › overpower › Contribuir · vocabulário do autor'},
  {nome: 'globe', papeis: ['navegacao', 'autoria'], onde: 'Ferramentas › Bibliotecas › overpower › Alvos · vocabulário do autor'},
  // PERDEU a tag `navegacao` na #118. Ele era a chave `bibliotecas`, que as
  // três folhas de topo do `overpower` repetiam; com ícone próprio por página
  // ninguém mais a declara, e par sem declarante é o que `npm run icones`
  // reprova. O separador `Bibliotecas` nunca teve ícone — ADR 10 §e).
  {nome: 'package', papeis: ['navegacao', 'autoria'], onde: 'Ferramentas › Bibliotecas › overpower › Alvos › O bundle federado · vocabulário do autor'},
  {nome: 'rocket', papeis: ['navegacao', 'autoria'], onde: 'Ferramentas › … › Contribuir › Release · vocabulário do autor'},
  {nome: 'shapes', papeis: ['navegacao', 'autoria'], onde: 'Ferramentas › … › overpower › Conceitos · vocabulário do autor'},

  // Estados e sinais · 7
  {nome: 'zap', papeis: ['navegacao', 'autoria'], onde: 'Ferramentas › Bibliotecas › overpower · vocabulário do autor'},
  {nome: 'clock', papeis: ['navegacao', 'autoria'], onde: 'Ferramentas › … › Referência › Changelog · vocabulário do autor'},
  {nome: 'circle-alert', papeis: ['navegacao', 'autoria'], onde: 'Ferramentas › … › Referência › Códigos de saída · vocabulário do autor'},
  {nome: 'circle-help', papeis: ['navegacao', 'autoria'], onde: 'Ferramentas › … › Comandos › overpower · vocabulário do autor', lucide: 'circle-question-mark'},
  {nome: 'sparkles', papeis: ['navegacao', 'autoria'], onde: 'Ferramentas › Bibliotecas › overpower › Contribuir › Critérios de catálogo · vocabulário do autor'},
  {nome: 'trending-up', papeis: ['autoria'], onde: 'vocabulário do autor'},
  {nome: 'gauge', papeis: ['navegacao', 'autoria'], onde: 'Ferramentas › … › Comandos › overpower doctor · vocabulário do autor'},

  // Conceitos · 9
  {nome: 'layers', papeis: ['navegacao', 'autoria'], onde: 'Procedimentos › Ambiente · vocabulário do autor'},
  {nome: 'workflow', papeis: ['navegacao', 'autoria'], onde: 'Procedimentos › Esteiras · vocabulário do autor'},
  {nome: 'puzzle', papeis: ['navegacao', 'autoria'], onde: 'Ferramentas › Módulos Terraform · vocabulário do autor'},
  {nome: 'bot', papeis: ['navegacao', 'autoria'], onde: 'Ferramentas › Skills · vocabulário do autor'},
  {nome: 'webhook', papeis: ['navegacao', 'autoria'], onde: 'Ferramentas › … › Alvos › Servidores MCP · vocabulário do autor'},
  {nome: 'bell', papeis: ['navegacao', 'autoria'], onde: 'Ferramentas › Bibliotecas › overpower › Contribuir › Os dois hooks · vocabulário do autor'},
  // Era a porta `Jornadas` da landing, que saiu na #94. A regra da porta ficou
  // sem sujeito quando a landing morreu, e é por isso que ele pôde virar glifo de
  // categoria aqui: `Referência` é seção do `overpower`, e nenhuma porta a
  // contém.
  {nome: 'book-open', papeis: ['navegacao', 'autoria'], onde: 'Ferramentas › Bibliotecas › overpower › Referência · vocabulário do autor'},
  {nome: 'repeat', papeis: ['navegacao', 'autoria'], onde: 'Ferramentas › … › Contribuir › Testes · vocabulário do autor'},
  {nome: 'undo-2', papeis: ['autoria'], onde: 'vocabulário do autor'},
];

/** @type {Entrada[]} */
export const ICONES = [...SISTEMA, ...NAVEGACAO, ...AUTORIA];

/** Os nomes de arquivo, em ordem de manifesto — 61 hoje, contra o teto de 64. */
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
 * Os trinta e um pares seção→ícone. A chave vira `sidebar-icone--<chave>` no
 * `className` da sidebar.
 *
 * **A chave deixou de ser da seção e passou a ser da PÁGINA — no `overpower`.**
 * Até o produto entrar, toda folha herdava a chave do separador que a continha.
 * Depois passou a herdar a da seção de nível 3. A #118 fecha o caminho: no ramo
 * do `overpower`, cada uma das 21 páginas tem glifo próprio, e nenhuma repete o
 * da página que a contém. A regra que vale continua sendo a do ADR 10 §e), e ela
 * não fala de nível: nenhum ícone no separador de topo, ícone em tudo abaixo.
 *
 * **O ORÇAMENTO é o que decide o alcance, e ele vai escrito porque a assimetria
 * é visível.** Fazer o site inteiro pedir 55 chaves — uma por nó de sidebar — e
 * cada chave pede um desenho com a tag `navegacao`. Sobrando 19 de sistema, os
 * 61 arquivos oferecem 42, e o teto de 64 não fecha a conta nem gastando a folga
 * de 3. As 21 do `overpower` cabem com sobra de 11, e é por isso que a regra
 * nova vale no ramo que a pediu — o único com profundidade 4, e o único onde a
 * fileira de folhas idênticas era longa o bastante para incomodar. As outras
 * três árvores seguem com ícone de seção, e a linha que as separa é aritmética,
 * não gosto.
 *
 * O que continua da #97 é a metade que a medição sustentou: as três tabs de
 * navbar seguem sem ícone, e o separador de topo também.
 *
 * **Nenhuma das novas custou arquivo.** Todas reaproveitam desenhos que o
 * manifesto já carregava como vocabulário do autor, e o teto de 64 não se move.
 */
export const PARES_SECAO = {
  // As dez de SEÇÃO — as árvores em que a folha ainda herda a chave do ramo que
  // a contém. Ver a nota sobre o orçamento, acima.
  'api-owner': 'code-xml',
  'security-champion': 'lock',
  ambiente: 'layers',
  esteiras: 'workflow',
  infraestrutura: 'cloud',
  acessos: 'key',
  diagnostico: 'activity',
  'modulos-terraform': 'puzzle',
  skills: 'bot',
  'servidores-mcp': 'server',

  // As vinte e sete do `overpower` — uma por PÁGINA, e nenhuma repetida.
  //
  // A ordem é a da árvore, não a alfabética: ela se lê ao lado da sidebar, e é
  // assim que se confere que duas páginas vizinhas não ganharam o mesmo glifo.
  //
  // **`desenvolvimento` e `publicacao` saíram na #133**, com a fusão que criou
  // o `contribuir/`. Os glifos delas não se perderam: a chave inglesa desceu
  // para `arquitetura`, que é a página que herdou o conteúdo do índice de
  // publicação, e o foguete ficou com `release`, que é o que ele sempre
  // desenhou. `bibliotecas` (`package`) tinha SAÍDO na #118 e volta aqui,
  // agora vestindo `alvo-bundle`, que é a página do bundle federado.
  overpower: 'zap',
  instalacao: 'download',
  conceitos: 'shapes',

  comandos: 'terminal',
  'comando-raiz': 'circle-help',
  'comando-list': 'database',
  'comando-install': 'plus',
  'comando-doctor': 'gauge',

  alvos: 'globe',
  'alvo-mcp': 'webhook',
  'alvo-from': 'folder',
  'alvo-bundle': 'package',

  referencia: 'book-open',
  'codigos-de-saida': 'circle-alert',
  'solucao-de-problemas': 'refresh-cw',
  changelog: 'clock',

  contribuir: 'users',
  arquitetura: 'wrench',
  'mapa-de-modulos': 'file-text',
  hooks: 'bell',
  testes: 'repeat',
  telas: 'play',
  curadoria: 'filter',
  'criterios-de-catalogo': 'sparkles',
  release: 'rocket',
  'release-ready': 'upload',
};

/**
 * A versão do Lucide de onde os desenhos foram copiados.
 *
 * O Lucide **renomeia glifo entre versões** — `code-xml` já foi `code-2`. Os
 * nomes deste manifesto se conferem contra esta versão no ato de copiar, e é
 * `scripts/vendorizar-icones.mjs` quem roda a conferência.
 */
export const LUCIDE_VERSAO = '1.30.0';
