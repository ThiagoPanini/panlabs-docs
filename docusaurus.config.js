// @ts-check

/**
 * shinydoc — configuração do Docusaurus.
 *
 * Regra que atravessa este arquivo: NENHUM valor de cor entra aqui. A paleta de
 * sintaxe chega ao Prism por um shim que só referencia token; a fonte única de
 * valor continua sendo `src/css/tokens.css`.
 */

/**
 * Shim do tema Prism.
 *
 * Um tema do `prism-react-renderer` é `{plain, styles: [{types, style}]}`, e o
 * `style` aceita qualquer string CSS — inclusive `var(--sd-code-*)`. É isso que
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
    color: 'var(--sd-code-fg)',
    backgroundColor: 'var(--sd-surface-code)',
  },
  styles: [
    {
      types: ['comment', 'prolog', 'doctype', 'cdata'],
      style: {color: 'var(--sd-code-comment)', fontStyle: 'italic'},
    },
    {
      types: ['keyword', 'atrule', 'selector', 'tag', 'important', 'builtin'],
      style: {color: 'var(--sd-code-keyword)'},
    },
    {
      types: ['string', 'char', 'attr-value', 'regex', 'inserted'],
      style: {color: 'var(--sd-code-string)'},
    },
    {
      types: ['function', 'class-name', 'function-variable'],
      style: {color: 'var(--sd-code-function)'},
    },
    {
      types: ['constant', 'symbol', 'number', 'boolean', 'deleted'],
      style: {color: 'var(--sd-code-constant)'},
    },
    {
      types: ['parameter', 'variable', 'property', 'attr-name'],
      style: {color: 'var(--sd-code-parameter)'},
    },
    {
      types: ['operator', 'punctuation', 'entity', 'url'],
      style: {color: 'var(--sd-code-operator)'},
    },
  ],
};

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Trilho',
  tagline: 'A plataforma de pagamentos que some do caminho',

  // GitHub Pages, do próprio repositório.
  url: 'https://panlabs-tech.github.io',
  baseUrl: '/shinydoc-docusaurus/',
  organizationName: 'panlabs-tech',
  projectName: 'shinydoc-docusaurus',

  // URLs sem barra final. Ver ADR 7 — os seis consumidores, o preço de host e a
  // alavanca de emissão dupla, que é acionada se o portão 6 rota 1 reprovar.
  // `undefined` está descartado: os links sairiam como cada plugin os gerou,
  // sem normalização, e a saída deixaria de ser determinada pela nossa config.
  trailingSlash: false,

  onBrokenLinks: 'throw',
  // O terceiro do trio, e ele nasce neste slice porque é aqui que aparecem os
  // primeiros links de âncora intra-página — a tabela de sintomas de
  // `Operação › Diagnóstico`. O default do Docusaurus é `warn`, e âncora
  // quebrada que só avisa é âncora quebrada que fica. Consequência de contrato:
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
      // O navbar carrega três tabs, busca, locale e GitHub — 110px é a
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
        // A tab `Documentação` é a instância `default` do plugin de docs.
        //
        // O conteúdo do Trilho mora em `conteudo/`, e não em `docs/`, porque
        // `docs/` é a documentação DESTE repositório — agentes, ADRs, spec de
        // design. A rota pública continua sendo `/docs`, que é o que o portão
        // 6 verifica.
        docs: {
          path: 'conteudo/documentacao',
          routeBasePath: 'docs',
          sidebarPath: './sidebars.js',
        },
        // Sem blog: nada no mapa o pediu, e um plugin ligado sem consumidor é a
        // mesma classe de defeito que as variáveis inertes do Infima.
        blog: false,
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

  // As outras duas tabs. **Uma instância por tab, um-para-um**, e não uma
  // instância com várias sidebars: `routeBasePath` é por instância, então
  // compartilhar jogaria as receitas em `/docs/receitas/…` e a URL deixaria de
  // ler o eixo — que é a decisão inteira da arquitetura de informação.
  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      /** @type {import('@docusaurus/plugin-content-docs').Options} */
      ({
        id: 'api',
        path: 'conteudo/api-reference',
        routeBasePath: 'api-reference',
        sidebarPath: './sidebars-api.js',
        // Opção PÚBLICA do plugin — vira literalmente o `component` da rota.
        // Substitui o layout inteiro da página com custo de upgrade zero: não é
        // swizzle, é componente de tema próprio. Ver ADR 2.
        docItemComponent: '@theme/ApiDocItem',
      }),
    ],
    [
      '@docusaurus/plugin-content-docs',
      /** @type {import('@docusaurus/plugin-content-docs').Options} */
      ({
        id: 'receitas',
        path: 'conteudo/receitas',
        routeBasePath: 'receitas',
        sidebarPath: './sidebars-receitas.js',
      }),
    ],
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
        // Sem `title` e sem `logo`, e é decisão: o `LogoSchema` exige `src` e o
        // `Logo` renderiza `ThemedImage`, ou seja um `<img>`, que não herda
        // `currentColor`. A marca é tipo mais um glifo do manifesto, em
        // `--sd-accent`, e entra pelo item `custom-marca`. O `.navbar__brand`
        // vazio que o upstream continua renderizando é escondido em
        // `chrome.css`, com `:empty`.
        items: [
          {type: 'custom-marca', position: 'left'},

          // As três tabs. Cada uma troca a sidebar inteira, e cada sidebar é
          // uma instância — o eixo de navegação é a natureza do conteúdo.
          {
            type: 'docSidebar',
            sidebarId: 'documentacao',
            position: 'left',
            label: 'Documentação',
          },
          {
            type: 'docSidebar',
            docsPluginId: 'api',
            sidebarId: 'api',
            position: 'left',
            label: 'Referência da API',
          },
          {
            type: 'docSidebar',
            docsPluginId: 'receitas',
            sidebarId: 'receitas',
            position: 'left',
            label: 'Receitas',
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
            href: 'https://github.com/panlabs-tech/shinydoc-docusaurus',
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
        // `target: '_self'` nos dois externos, e é correção de premissa medida
        // nesta implementação: o `<Link>` do Docusaurus injeta
        // `target="_blank"` SOZINHO em todo `href` externo. A decisão do rodapé
        // é que nenhum link abre em nova aba — sem esta linha ela não valeria, e
        // esconder o ícone de link externo passaria a apagar um anúncio
        // verdadeiro em vez de um falso.
        links: [
          {label: 'Status', href: 'https://status.trilho.dev', target: '_self'},
          {label: 'Changelog', to: '/docs/operacao/changelog'},
          {label: 'Suporte', href: 'mailto:suporte@trilho.dev', target: '_self'},
        ],
        copyright: '© 2026 Trilho',
      },
      prism: {
        theme: temaPrism,
      },
    }),
};

export default config;
