// @ts-check

/**
 * panlabs-docs — configuração do Docusaurus.
 *
 * Regra que atravessa este arquivo: NENHUM valor de cor entra aqui. A paleta de
 * sintaxe chega ao Prism por um shim que só referencia token; a fonte única de
 * valor continua sendo `src/css/tokens.css`.
 */

/**
 * Shim do tema Prism.
 *
 * Um tema do `prism-react-renderer` é `{plain, styles: [{types, style}]}`, e o
 * `style` aceita qualquer string CSS — inclusive `var(--pd-code-*)`. É isso que
 * salva a fonte única de valor: a paleta de sintaxe é um papel da camada 2, que
 * bifurca por modo em `tokens.css`, e este objeto só a referencia.
 *
 * Um shim serve os DOIS modos: o Docusaurus cai em `prism.theme` quando
 * `prism.darkTheme` não existe, e os tokens já bifurcaram. Declarar um segundo
 * seria criar um lugar a mais onde o modo diverge.
 *
 * `plain.backgroundColor` é também o ponto de escrita da exceção 4 do adaptador:
 * `--prism-background-color` é injetada no atributo `style` INLINE por
 * `CodeBlock/Container`, e estilo inline não é alcançável por folha de estilo.
 *
 * @type {import('prism-react-renderer').PrismTheme}
 */
const temaPrism = {
  plain: {
    color: 'var(--pd-code-fg)',
    backgroundColor: 'var(--pd-surface-code)',
  },
  styles: [
    {
      types: ['comment', 'prolog', 'doctype', 'cdata'],
      style: {color: 'var(--pd-code-comment)', fontStyle: 'italic'},
    },
    {
      types: ['keyword', 'atrule', 'selector', 'tag', 'important', 'builtin'],
      style: {color: 'var(--pd-code-keyword)'},
    },
    {
      types: ['string', 'char', 'attr-value', 'regex', 'inserted'],
      style: {color: 'var(--pd-code-string)'},
    },
    {
      types: ['function', 'class-name', 'function-variable'],
      style: {color: 'var(--pd-code-function)'},
    },
    {
      types: ['constant', 'symbol', 'number', 'boolean', 'deleted'],
      style: {color: 'var(--pd-code-constant)'},
    },
    {
      types: ['parameter', 'variable', 'property', 'attr-name'],
      style: {color: 'var(--pd-code-parameter)'},
    },
    {
      types: ['operator', 'punctuation', 'entity', 'url'],
      style: {color: 'var(--pd-code-operator)'},
    },
  ],
};

/**
 * As quatro tabs, na ordem do navbar — a fonte única de ordem dos dois plugins
 * do slice 7. Só os ids: o RÓTULO de cada uma é lido do próprio navbar, mais
 * abaixo neste arquivo, porque é lá que ele já existe e é lá que a tradução do
 * `navbar.json` o alcança.
 *
 * A lista mora aqui, e não dentro de cada plugin, porque a ordem que a busca usa
 * para desempatar e a ordem em que o navbar apresenta as tabs **são a mesma
 * decisão** — e duas cópias dela divergiriam no dia em que uma quarta tab
 * entrasse. Foi o que aconteceu: `Times` chegou, e as duas listas sobem na
 * mesma revisão que reordena as três primeiras.
 *
 * **`Jornadas` subiu para segunda**, na frente de `Procedimentos`. A ordem lê o
 * que o acervo tem para oferecer: `Ferramentas` e `Jornadas` carregam conteúdo, e
 * `Procedimentos` e `Times` são marcador de lugar até o conteúdo real chegar. Como
 * esta lista é também o primeiro desempate da busca, descer as duas abas vazias é
 * decisão de resultado, e não de estética.
 */
const ABAS = ['ferramentas', 'default', 'procedimentos', 'times'];

/** @type {import('@docusaurus/types').Config} */
const config = {
  // `panlabs` — minúsculo, sem nome de produto acima dele. O nome resolve a
  // mesma restrição dura que batizou o produto anterior: `title` e `tagline`
  // NÃO são traduzíveis no Docusaurus, e um namespace atravessa os dois locales
  // sem tradução.
  title: 'panlabs',
  tagline: 'O acervo de aprendizado de um desenvolvedor',

  // GitHub Pages, do próprio repositório.
  url: 'https://thiagopanini.github.io',
  baseUrl: '/panlabs-docs/',
  organizationName: 'ThiagoPanini',
  projectName: 'panlabs-docs',

  // URLs sem barra final. Ver ADR 7 — os seis consumidores, o preço de host e a
  // alavanca de emissão dupla, que é acionada se o portão 6 rota 1 reprovar.
  // `undefined` está descartado: os links sairiam como cada plugin os gerou,
  // sem normalização, e a saída deixaria de ser determinada pela nossa config.
  trailingSlash: false,

  onBrokenLinks: 'throw',
  // O terceiro do trio. O default do Docusaurus é `warn`, e âncora quebrada que
  // só avisa é âncora quebrada que fica. Consequência de contrato:
  // toda âncora citada por um link é declarada com `{#id}` no próprio heading,
  // em vez de depender de como o slugger trata acento.
  onBrokenAnchors: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  // `future.v4` fica DESLIGADO de propósito. Entre os flags que ele acende está
  // `useCssCascadeLayers`, e o ADR 1 põe `@layer` fora: a arquitetura de
  // especificidade deste projeto foi medida contra o Infima sem camadas.
  // Ligar o flag muda a premissa e reabre o ADR.

  i18n: {
    defaultLocale: 'pt-BR',
    locales: ['pt-BR', 'en'],
    localeConfigs: {
      // `PT` e não `Português (Brasil)`: o rótulo do `localeDropdown` é o do
      // locale corrente, e o default do Docusaurus mede 165px contra 55px.
      // O navbar carrega quatro tabs, busca, locale e GitHub — 110px é a
      // diferença entre caber e não caber na faixa de 997 a 1200px.
      'pt-BR': {label: 'PT', htmlLang: 'pt-BR', direction: 'ltr'},
      en: {label: 'EN', htmlLang: 'en', direction: 'ltr'},
    },
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        // A tab `Jornadas` é a instância `default` do plugin de docs.
        //
        // O acervo mora em `conteudo/`, e não em `docs/`, porque `docs/` é a
        // documentação DESTE repositório — agentes, ADRs, spec de design. A
        // rota pública é `/jornadas`, e é ela que o portão 6 verifica.
        docs: {
          path: 'conteudo/jornadas',
          routeBasePath: 'jornadas',
          sidebarPath: './sidebars-jornadas.js',
        },
        // Sem blog: nada no mapa o pediu, e um plugin ligado sem consumidor é a
        // mesma classe de defeito que as variáveis inertes do Infima.
        blog: false,
        // O SVGR inlina o `.drawio.svg` importado de uma página, e as duas
        // otimizações desligadas aqui existem porque o palco pinta o desenho
        // casando a camada de ATRIBUTO do draw.io por seletor.
        //
        // `moveElemsAttrsToGroup` sobe atributo comum para o `<g>` pai, e ele
        // sobe MAIS num arquivo salvo por editor sem `light-dark()`, porque ali
        // as cores ficam uniformes. O atributo saía da folha, o seletor deixava
        // de casar, e o resultado era seta preta invisível no escuro **só** nos
        // arquivos vindos daquele editor. Medido: 3 grupos hasteados no arquivo
        // assado, zero no sadio.
        //
        // `convertColors` encurta `#000000` para `#000`, e um seletor de
        // atributo casa string, não cor. Desligar deixa uma forma só.
        svgr: {
          svgrConfig: {
            svgoConfig: {
              plugins: [
                {
                  name: 'preset-default',
                  params: {
                    overrides: {
                      removeTitle: false,
                      removeViewBox: false,
                      moveElemsAttrsToGroup: false,
                      convertColors: false,
                    },
                  },
                },
              ],
            },
          },
        },
        theme: {
          // A ordem importa: `tokens.css` é o primeiro item porque as raízes
          // precisam existir antes de qualquer regra que as consuma.
          customCss: [
            './src/css/tokens.css',
            './src/css/custom.css',
            './src/css/chrome.css',
            './src/css/componentes.css',
            './src/css/foco.css',
          ],
        },
      }),
    ],
  ],

  // As outras três tabs. **Uma instância por tab, um-para-um**, e não uma
  // instância com várias sidebars: `routeBasePath` é por instância, então
  // compartilhar jogaria as ferramentas em `/jornadas/ferramentas/…` e a URL
  // deixaria de ler o eixo — que é a decisão inteira da arquitetura de
  // informação.
  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      /** @type {import('@docusaurus/plugin-content-docs').Options} */
      ({
        id: 'procedimentos',
        path: 'conteudo/procedimentos',
        routeBasePath: 'procedimentos',
        sidebarPath: './sidebars-procedimentos.js',
      }),
    ],
    [
      '@docusaurus/plugin-content-docs',
      /** @type {import('@docusaurus/plugin-content-docs').Options} */
      ({
        id: 'ferramentas',
        path: 'conteudo/ferramentas',
        routeBasePath: 'ferramentas',
        sidebarPath: './sidebars-ferramentas.js',
        // **Esta instância declarava `docItemComponent`, e não declara mais.**
        // O `ApiDocItem` era um componente de tema próprio que comutava o
        // layout inteiro por página, pelo front matter `api_exemplos`: as 4
        // páginas geradas de `overpower › Comandos` ganhavam prosa de 577 e um
        // trilho grudado de 511, e com isso perdiam a coluna do TOC. O trilho
        // desceu para o fluxo na #118 — virou `<PainelComando />`, um bloco de
        // MDX que o registro global resolve —, e sem layout a comutar o
        // componente da rota ficou sendo `@theme/DocItem` chamando
        // `@theme/DocItem`. As 26 páginas desta instância medem a mesma coisa.
      }),
    ],
    [
      '@docusaurus/plugin-content-docs',
      /** @type {import('@docusaurus/plugin-content-docs').Options} */
      ({
        id: 'times',
        path: 'conteudo/times',
        routeBasePath: 'times',
        sidebarPath: './sidebars-times.js',
      }),
    ],

    // Os dois plugins de caminho do slice 7. Nenhum é dependência npm, nenhum
    // é serviço externo — eles são a mesma mecânica vista de dois lados, e leem
    // as quatro instâncias acima pela mesma porta (`allContentLoaded`).
    //
    // `abas` é declarada UMA vez e servida aos dois: ela é a ordem do navbar,
    // que a busca usa como primeiro desempate e o `llms.txt` usa como seção. Um
    // id que não exista entre as instâncias **quebra o build** em vez de sumir
    // um terço do site em silêncio.
    ['./src/plugins/busca', {abas: ABAS}],
    ['./src/plugins/ai-era', {abas: ABAS}],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        // Escuro é canônico — é onde o desenho nasce. Não é mandato sobre o
        // leitor: `respectPrefersColorScheme` entrega o modo do sistema dele.
        defaultMode: 'dark',
        respectPrefersColorScheme: true,
        disableSwitch: false,
      },
      navbar: {
        // **A MARCA É SÓ A PALAVRA**, e ela volta para o caminho nativo.
        //
        // `title` sem `logo` faz o upstream renderizar `<b class="navbar__title">`
        // dentro do `.navbar__brand` — tipo puro, sem `<img>`, sem glifo. Some
        // com isso o componente de tema próprio que existia só para desenhar o
        // par glifo+palavra, e some a regra `.navbar__brand:empty` que escondia
        // o link vazio que o upstream renderizava sem `title`.
        //
        // O argumento é o da figura da landing, com força maior: a marca aparece
        // em TODA página e a landing em uma. Ela fica **monocromática**, em
        // `--pd-text-strong` — tingir uma palavra de acento no canto superior
        // esquerdo é o enfeite que a régua recusa. A tipografia não mudou: o que
        // saiu foi o glifo, que era a única coisa a consumir `--pd-accent`.
        //
        // `title` é string traduzível e entra em `navbar.json`; `panlabs` fica
        // IDÊNTICA nos dois locales, que é a razão de o nome ter sido escolhido.
        title: 'panlabs',

        items: [
          // O ESPAÇADOR QUE ABRE A FAIXA DE TABS — degrau 2, opção pública, e a
          // única peça da faixa que não é CSS. Ele tem base 100% e altura 0
          // (`chrome.css`), então força a quebra de linha dentro de
          // `.navbar__items` e não ocupa um pixel.
          //
          // Escolhido em vez de dar `flex-basis: 100%` à marca — que também
          // funciona, e está medido — porque não acopla a faixa à EXISTÊNCIA de
          // uma marca. O estilo é replicável como template da casa, e um
          // transplante que troque a marca por outra coisa não perde a faixa
          // junto.
          //
          // `value` NÃO pode ser vazio: o schema reprova o build com
          // `"navbar.items[N].value" is not allowed to be empty`. Um comentário
          // HTML satisfaz o schema e não renderiza nada.
          {
            type: 'html',
            position: 'left',
            className: 'quebra-de-faixa',
            value: '<!--quebra-->',
          },

          // As quatro tabs. Cada uma troca a sidebar inteira, e cada sidebar é
          // uma instância — o eixo de navegação é a natureza do conteúdo.
          {
            type: 'docSidebar',
            docsPluginId: 'ferramentas',
            sidebarId: 'ferramentas',
            position: 'left',
            label: 'Ferramentas',
          },
          {
            type: 'docSidebar',
            sidebarId: 'jornadas',
            position: 'left',
            label: 'Jornadas',
          },
          {
            type: 'docSidebar',
            docsPluginId: 'procedimentos',
            sidebarId: 'procedimentos',
            position: 'left',
            label: 'Procedimentos',
          },
          {
            type: 'docSidebar',
            docsPluginId: 'times',
            sidebarId: 'times',
            position: 'left',
            label: 'Times',
          },

          // À direita, na ordem declarada: Buscar · PT · GitHub. A alternância
          // de tema não é declarável — o `Navbar/Content` a renderiza depois
          // dos itens da direita, e é por isso que ela fecha a linha.
          //
          // O slot de busca fica RESERVADO aqui e é preenchido no slice 7.
          // Enquanto o `SearchBar` do tema for o placeholder vazio, o upstream
          // esconde o contêiner sozinho (`.navbarSearchContainer:empty`), então
          // reservar a posição custa zero pixel.
          {type: 'search', position: 'right'},
          {type: 'localeDropdown', position: 'right'},
          {
            href: 'https://github.com/ThiagoPanini/panlabs-docs',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        // `style` NÃO é declarado. O default do schema é `'light'`; `'dark'`
        // cravaria `#303846` literal mais quatro variáveis próprias. Não
        // configurar é decisão limpa, não omissão.
        //
        // `links` é lista PLANA — nunca `MultiColumn`. Um sitemap no rodapé é
        // segunda cópia de navegação que o leitor já tem à vista, e coluna
        // exigiria inventar empresa em torno de um produto fictício.
        //
        // A regra que escolheu os links: **entra no footer só o que não está em
        // nenhum outro lugar do site.** `llms.txt` é o quarto, e entra no slice
        // 7 junto com o artefato.
        //
        // **Eram quatro; são dois**, e os dois que saíram saíram com o produto.
        // `Status` e `Suporte` apontavam para um host e uma caixa de e-mail do
        // Trilho, e o acervo não tem nem um nem outro: a empresa **nunca é
        // nomeada**, então não há domínio de status a citar, e o desenvolvedor
        // **não tem nome**, então não há para quem escrever. Inventar os dois
        // seria nomear o empregador por acidente, que é a única coisa que a
        // narrativa do acervo proíbe por escrito.
        //
        // O que sobra passa a satisfazer a regra melhor do que antes: `llms.txt`
        // é o único artefato do site sem nenhuma entrada de navegação, logo
        // indescobrível sem esta linha.
        //
        // `pathname://` é a escotilha PÚBLICA do Docusaurus para apontar a um
        // arquivo que não é rota (degrau 2 da escada). Ela faz três coisas de
        // uma vez: o `<Link>` usa `<a>` em vez de `history.push()`, o
        // verificador de links não cobra uma rota que nunca existiu, e o
        // baseUrl continua sendo acrescentado — inclusive o do locale, que é
        // onde o build do EN escreve o artefato dele.
        //
        // `target: '_self'`, e é correção de premissa medida: o `<Link>` injeta
        // `target="_blank"` SOZINHO em tudo que ele lê como externo, e a decisão
        // do rodapé é que nenhum link abre em nova aba.
        links: [
          {label: 'Changelog', to: '/ferramentas/bibliotecas/overpower/referencia/changelog'},
          {label: 'llms.txt', href: 'pathname:///llms.txt', target: '_self'},
        ],
        copyright: '© 2026 panlabs',
      },
      prism: {
        theme: temaPrism,
        // Degrau 2 — opção pública. `bash` não está no bundle padrão do
        // `prism-react-renderer`, e sem o registro o bloco sai sem realce e
        // ninguém avisa.
        //
        // **O consumidor mudou de dono e ficou maior.** Ele era o snippet de
        // cURL que o gerador da Referência emitia, e o gerador morreu com o
        // contrato HTTP; agora são as cercas `bash` do próprio acervo — a AWS
        // CLI é um terço do cenário fixado, e ela aparece na laje da landing e
        // em folhas de `Procedimentos` e `Ferramentas`. A conferência que
        // `scripts/lib/openapi.mjs` fazia sobre a lista sai junto com ele; o
        // que pega o esquecimento hoje é a cerca sem realce à vista.
        additionalLanguages: ['bash'],
      },
    }),
};

export default config;
