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
      'pt-BR': {label: 'Português', htmlLang: 'pt-BR', direction: 'ltr'},
      en: {label: 'English', htmlLang: 'en', direction: 'ltr'},
    },
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          // O conteúdo do Trilho mora em `conteudo/`, e não em `docs/`, porque
          // `docs/` é a documentação DESTE repositório — agentes, ADRs, spec de
          // design. A rota pública continua sendo `/docs`, que é o que o portão
          // 6 verifica.
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
          customCss: ['./src/css/tokens.css', './src/css/custom.css'],
        },
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
        // A marca é tipo mais um glifo do manifesto de ícones, e ela nasce no
        // slice 2 junto com o resto do chrome.
        title: 'Trilho',
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'documentacao',
            position: 'left',
            label: 'Documentação',
          },
        ],
      },
      footer: {
        // A anatomia do footer — os quatro links e as três divergências contra o
        // Infima — é de `chrome.md`, no slice 2.
        style: 'dark',
        copyright: `shinydoc — documentação de referência em Docusaurus.`,
      },
      prism: {
        theme: temaPrism,
      },
    }),
};

export default config;
