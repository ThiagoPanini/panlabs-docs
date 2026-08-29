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
 *   19 sistema + 38 navegação + 39 autoria = 96 tags sobre 60 arquivos
 *
 * **A navegação subiu de 36 para 38 com `Times`.** `calendar` e `trending-up`
 * ganharam a tag: os dois já estavam no manifesto como vocabulário do autor, e
 * nenhum arquivo novo entrou. O par `PARES_SECAO` sobe junto, na mesma conta.
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
 * `name` é NOSSO nome — semântico, e é ele que o autor escreve no MDX. `lucide`
 * só aparece onde o upstream diverge, e é a prova de que o nome do contrato não
 * é refém do vocabulário de terceiro: o Lucide renomeia glifo entre versões, e
 * quem paga é o mapa de uma linha, não o MDX de dezenas de páginas.
 *
 * @typedef {'system' | 'navigation' | 'authoring'} Role
 * @typedef {{name: string, roles: Role[], where: string, lucide?: string}} Entry
 */

/**
 * Sistema · 19 — o componente escolhe, o autor nunca.
 *
 * **Eram 19.** `train-track` saiu porque a marca ficou só com a palavra: sem
 * glifo ao lado do nome, o desenho perdeu o único consumidor que tinha, e
 * componente sem consumidor é o defeito que este projeto mata por nome.
 * @type {Entry[]}
 */
const SYSTEM = [
  {name: 'info', roles: ['system'], where: 'callout `info`'},
  {name: 'lightbulb', roles: ['system'], where: 'callout `tip`'},
  {name: 'triangle-alert', roles: ['system'], where: 'callout `warning`'},
  {name: 'pencil-line', roles: ['system'], where: 'callout `note`'},
  {name: 'chevron-right', roles: ['system'], where: 'caret de `Accordion`, de categoria de sidebar e — girado — do par `Copiar página`'},
  {name: 'check', roles: ['system'], where: 'passo concluído em `Steps` e confirmação de `Copiar página`'},
  {name: 'copy', roles: ['system'], where: 'botão copiar do bloco de código e o par `Copiar página`'},
  {name: 'wrap-text', roles: ['system'], where: 'toggle de quebra de linha do bloco de código', lucide: 'text-wrap'},
  {name: 'external-link', roles: ['system'], where: 'link externo e os itens de assistente de `Copiar página`'},
  {name: 'search', roles: ['system'], where: 'busca'},
  {name: 'x', roles: ['system'], where: 'fechar modal'},
  {name: 'menu', roles: ['system'], where: 'hambúrguer de tela estreita'},
  {name: 'sun', roles: ['system'], where: 'tema claro'},
  {name: 'moon', roles: ['system'], where: 'tema escuro'},
  {name: 'monitor', roles: ['system'], where: 'tema do sistema'},
  {name: 'languages', roles: ['system'], where: 'seletor de locale'},
  {name: 'link', roles: ['system'], where: 'âncora de heading'},
  {name: 'list', roles: ['system'], where: 'título do índice desta página', lucide: 'text-align-start'},
  {name: 'arrow-right', roles: ['system'], where: 'paginação e CTA de card'},
];

/**
 * Navegação · 33 tags sobre 33 arquivos, dos quais **dois moram aqui**.
 *
 * Os outros trinta e um reusam entrada de autoria e carregam a segunda tag na
 * própria entrada — é isso que faz as tags caberem em menos arquivos do que elas
 * somam. Os dois daqui são órfãos de navegação **reempregados**, e os dois já
 * trocaram de seção mais de uma vez sem trocar de papel: `code-xml` era
 * `Jornadas › API Owner` e passou a `Conteúdo Teórico`, dentro da mesma jornada;
 * `activity` era `Procedimentos › Diagnóstico` e passou a nomear a folha de
 * marcador de lugar das duas abas que esvaziaram.
 * @type {Entry[]}
 */
const NAVIGATION = [
  {name: 'code-xml', roles: ['navigation'], where: 'Jornadas › API Owner › Conteúdo Teórico'},
  {name: 'activity', roles: ['navigation'], where: 'Procedimentos › Work in Progress e Times › Work in Progress'},
];

/**
 * Autoria · 40 — o vocabulário escrito como STRING: o MDX do autor, por
 * `<Card icon="…">`.
 *
 * **Eram duas superfícies.** A segunda eram as três portas da landing, que
 * usavam a mesma `<Card icon="…">`, e saíram com a página na issue #94. A
 * definição da tag NÃO reverte com elas: `authoring` é *"o nome escrito como
 * string"*, e não *"o MDX do autor"* — a correção que a estabeleceu vale por si.
 *
 * **Trinta e uma entradas carregam a segunda tag `navigation` e moram aqui.**
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
 * @type {Entry[]}
 */
const AUTHORING = [
  // Ações · 8
  {name: 'play', roles: ['navigation', 'authoring'], where: 'Ferramentas › … › Contribuir › Telas · vocabulário do autor'},
  {name: 'download', roles: ['navigation', 'authoring'], where: 'Ferramentas › … › overpower › Instalação · vocabulário do autor'},
  {name: 'upload', roles: ['navigation', 'authoring'], where: 'Ferramentas › … › Contribuir › O release-ready · vocabulário do autor'},
  {name: 'refresh-cw', roles: ['navigation', 'authoring'], where: 'Ferramentas › … › Referência › Solução de problemas · vocabulário do autor'},
  {name: 'trash-2', roles: ['authoring'], where: 'vocabulário do autor'},
  {name: 'plus', roles: ['navigation', 'authoring'], where: 'Ferramentas › … › Comandos › overpower install · vocabulário do autor'},
  {name: 'filter', roles: ['navigation', 'authoring'], where: 'Ferramentas › … › Contribuir › Curadoria · vocabulário do autor', lucide: 'funnel'},

  // Objetos · 16
  {name: 'file-text', roles: ['navigation', 'authoring'], where: 'Ferramentas › Bibliotecas › overpower › Contribuir › Mapa de módulos · vocabulário do autor'},
  {name: 'folder', roles: ['navigation', 'authoring'], where: 'Ferramentas › … › Alvos › from · vocabulário do autor'},
  // Era também a porta `Procedimentos` da landing, que saiu na #94. Hoje é o
  // glifo de `Comandos`, que é o nome que ele já nomeava.
  {name: 'terminal', roles: ['navigation', 'authoring'], where: 'Ferramentas › Bibliotecas › overpower › Comandos · vocabulário do autor'},
  // Comprado pela porta `Ferramentas` da landing, que saiu na #94. Continua no
  // vocabulário do autor, é o único nome de ferramenta do manifesto, e hoje
  // nomeia também `Contribuir › Arquitetura` — ele vestia `Desenvolvimento`, que
  // fundiu em `Contribuir` na #133.
  {name: 'wrench', roles: ['navigation', 'authoring'], where: 'Ferramentas › Bibliotecas › overpower › Contribuir › Arquitetura · vocabulário do autor'},
  {name: 'database', roles: ['navigation', 'authoring'], where: 'Ferramentas › … › Comandos › overpower list · vocabulário do autor'},
  {name: 'server', roles: ['navigation', 'authoring'], where: 'Ferramentas › Servidores MCP · vocabulário do autor'},
  {name: 'cloud', roles: ['authoring'], where: 'vocabulário do autor'},
  {name: 'key', roles: ['authoring'], where: 'vocabulário do autor'},
  {name: 'lock', roles: ['authoring'], where: 'vocabulário do autor'},
  {name: 'mail', roles: ['authoring'], where: 'vocabulário do autor'},
  {name: 'calendar', roles: ['authoring'], where: 'vocabulário do autor'},
  {name: 'users', roles: ['navigation', 'authoring'], where: 'Ferramentas › Bibliotecas › overpower › Contribuir · vocabulário do autor'},
  {name: 'globe', roles: ['navigation', 'authoring'], where: 'Ferramentas › Bibliotecas › overpower › Alvos · vocabulário do autor'},
  // PERDEU a tag `navegacao` na #118. Ele era a chave `bibliotecas`, que as
  // três folhas de topo do `overpower` repetiam; com ícone próprio por página
  // ninguém mais a declara, e par sem declarante é o que `npm run icones`
  // reprova. O separador `Bibliotecas` nunca teve ícone — ADR 10 §e).
  {name: 'package', roles: ['navigation', 'authoring'], where: 'Ferramentas › Bibliotecas › overpower › Alvos › O bundle federado · vocabulário do autor'},
  {name: 'rocket', roles: ['navigation', 'authoring'], where: 'Ferramentas › … › Contribuir › Release · vocabulário do autor'},
  {name: 'shapes', roles: ['navigation', 'authoring'], where: 'Ferramentas › … › overpower › Conceitos · vocabulário do autor'},

  // Estados e sinais · 7
  {name: 'zap', roles: ['navigation', 'authoring'], where: 'Ferramentas › Bibliotecas › overpower · vocabulário do autor'},
  {name: 'clock', roles: ['navigation', 'authoring'], where: 'Ferramentas › … › Referência › Changelog · vocabulário do autor'},
  {name: 'circle-alert', roles: ['navigation', 'authoring'], where: 'Ferramentas › … › Referência › Códigos de saída · vocabulário do autor'},
  {name: 'circle-help', roles: ['navigation', 'authoring'], where: 'Ferramentas › … › Comandos › overpower · vocabulário do autor', lucide: 'circle-question-mark'},
  {name: 'sparkles', roles: ['navigation', 'authoring'], where: 'Ferramentas › Bibliotecas › overpower › Contribuir › Critérios de catálogo · vocabulário do autor'},
  {name: 'trending-up', roles: ['authoring'], where: 'vocabulário do autor'},
  {name: 'gauge', roles: ['navigation', 'authoring'], where: 'Ferramentas › … › Comandos › overpower doctor · vocabulário do autor'},

  // Conceitos · 9
  {name: 'layers', roles: ['navigation', 'authoring'], where: 'Jornadas › API Owner › Visão Geral · vocabulário do autor'},
  {name: 'workflow', roles: ['navigation', 'authoring'], where: 'Jornadas › API Owner › Conteúdo Prático · vocabulário do autor'},
  {name: 'puzzle', roles: ['navigation', 'authoring'], where: 'Ferramentas › Módulos Terraform · vocabulário do autor'},
  {name: 'bot', roles: ['navigation', 'authoring'], where: 'Ferramentas › Skills · vocabulário do autor'},
  {name: 'webhook', roles: ['navigation', 'authoring'], where: 'Ferramentas › … › Alvos › Servidores MCP · vocabulário do autor'},
  {name: 'bell', roles: ['navigation', 'authoring'], where: 'Ferramentas › Bibliotecas › overpower › Contribuir › Os dois hooks · vocabulário do autor'},
  // Era a porta `Jornadas` da landing, que saiu na #94. A regra da porta ficou
  // sem sujeito quando a landing morreu, e é por isso que ele pôde virar glifo de
  // categoria aqui: `Referência` é seção do `overpower`, e nenhuma porta a
  // contém.
  {name: 'book-open', roles: ['navigation', 'authoring'], where: 'Ferramentas › Bibliotecas › overpower › Referência · vocabulário do autor'},
  {name: 'repeat', roles: ['navigation', 'authoring'], where: 'Ferramentas › … › Contribuir › Testes · vocabulário do autor'},
  {name: 'undo-2', roles: ['authoring'], where: 'vocabulário do autor'},
];

/** @type {Entry[]} */
export const ICONS = [...SYSTEM, ...NAVIGATION, ...AUTHORING];

/** Os nomes de arquivo, em ordem de manifesto — 61 hoje, contra o teto de 64. */
export const NAMES = ICONS.map((i) => i.name);

/**
 * O teto é duro. Ele existe porque conjunto que cresce sob demanda vira dívida:
 * ninguém audita 300 ícones em busca de coerência de família, mas 64 cabem numa
 * tela e a incoerência salta aos olhos.
 *
 * **O teto não desce junto com a contagem.** Ele é o limite do que se consegue
 * auditar de uma vez, não uma marca d'água do que já se gastou — descê-lo para
 * 60 seria trocar uma régua por um registro do passado.
 */
export const CEILING = 64;

/**
 * Os trinta e três pares seção→ícone. A chave vira `sidebar-icon--<chave>` no
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
 * O que continua da #97 é a metade que a medição sustentou: as quatro tabs de
 * navbar seguem sem ícone, e o separador de topo também.
 *
 * **Nenhuma das novas custou arquivo.** Todas reaproveitam desenhos que o
 * manifesto já carregava como vocabulário do autor, e o teto de 64 não se move.
 */
export const SECTION_ICON_PAIRS = {
  // As sete de SEÇÃO — as árvores em que a folha ainda herda a chave do ramo que
  // a contém. Ver a nota sobre o orçamento, acima.
  //
  // **Eram doze**, e as cinco que saíram saíram com o conteúdo que nomeavam: as
  // duas jornadas narrativas, as cinco categorias de `Procedimentos` e os dois
  // times. Os desenhos delas NÃO saíram do manifesto: `lock`, `cloud`, `key`,
  // `calendar` e `trending-up` continuam no vocabulário do autor e só perderam a
  // segunda tag, que é a leitura literal do orçamento — tag é papel, e o papel
  // de navegação acabou quando a seção acabou.
  //
  // As três de `Jornadas` são a árvore nova da trilha, e a de marcador de lugar
  // é UMA para as duas abas esvaziadas: `Procedimentos` e `Times` dizem a mesma
  // coisa na mesma folha, e dois glifos para a mesma frase seriam distinção sem
  // diferença.
  'visao-geral': 'layers',
  'conteudo-teorico': 'code-xml',
  'conteudo-pratico': 'workflow',
  'work-in-progress': 'activity',
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
 * `scripts/vendor-icons.mjs` quem roda a conferência.
 */
export const LUCIDE_VERSION = '1.30.0';
