# design-sync — notas do repositório

`panlabs-docs` não é uma biblioteca de componentes: é um site Docusaurus com um
design system dentro. Quase tudo aqui existe por causa dessa diferença.

## A forma

- **Shape `package`, com um build que o repo não tinha.** `.design-sync/build-dist.mjs`
  produz `.design-sync/.cache/dist/index.{js,css}` a partir de `.design-sync/entry.js`.
  É o `buildCmd`, e roda antes do conversor, sempre.
- **`entry.js` só nomeia.** Reexporta os 14 exports do catálogo sob os mesmos nomes que
  `src/theme/MDXComponents/index.js` registra. Não embrulha nem inventa nada.
  De fora ficam `CommandPanel` e `CopyPage` (chrome de rota, ninguém autora),
  `Tabs`/`TabItem` (do Docusaurus, não são deste repo) e `CodeGroup`
  (depende de `@theme/Tabs` + `@theme/CodeBlock`, que só existem dentro do app).
- **`ThemeRoot` é o `cfg.provider`**, e está em `componentSrcMap` como `null` para não
  virar um componente do catálogo. Ele existe, é exportado no bundle e o
  `conventions.md` manda embrulhar a página nele.

## As quatro coisas que o bundler do conversor não faz sozinho

Todas absorvidas por `build-dist.mjs`; cada uma tem comentário no arquivo.

1. **JSX em `.js`.** O loader é fixado (`loader: {'.js': 'jsx'}`).
2. **SVGR.** `src/icons/registry.js` importa `.svg` do Lucide e os renderiza como
   COMPONENTES. O conversor carrega `.svg` como data URL, o que tornaria todo
   `<Drawing />` um tipo de elemento inválido. O plugin `svgr` do build restaura a
   forma de componente, preservando o desenho byte a byte.
3. **Aliases de webpack.** `@site/*` e `@docusaurus/Link` não são pacotes.
   O shim de `Link` vira um `<a>` — é o que sobra dele fora de um app com router.
4. **CSS Module.** O catálogo pinta por classe de módulo, nunca por `data-pd-*`
   (a razão está no comentário do `Callout.js`). O `local-css` nativo do esbuild
   mantém JS e CSS concordando nos nomes hasheados.

## Os dois arquivos gerados e gitignorados

Um clone fresco não tem nenhum dos dois, e `Icon.js` importa do primeiro.
`build-dist.mjs` chama o plugin `pd-sidebar-icons` direto quando faltar qualquer um —
o plugin é ESM num pacote CJS, então ele é transpilado antes de importado.

- `src/icons/registry.js` — o registro de ícones.
- `.docusaurus/pd-sidebar-icons/styles.css` — **o sexto stylesheet**, e o único que
  não está em `customCss` (entra por `getClientModules()`). Só as duas linhas `:root`
  dele são embarcadas: `--pd-chrome-icon-chevron-right` e `--pd-chrome-icon-list`,
  as máscaras data-URI que desenham o caret do accordion. Sem elas o caret vira um
  **quadrado preto sólido** — foi assim que o defeito apareceu.

## O que o Infima levava embora, e onde foi restaurado

O bloco `/* ADAPTER */` de `tokens.css` só ATRIBUI `--ifm-*` a partir de `var(--pd-*)`.
Quem CONSUMIA era o stylesheet do Infima, que este bundle não embarca (e não deve).
Sem consumidor a página nasce errada em silêncio: prosa em serifa do navegador com
`--pd-font-body` resolvido e nunca lido, link sublinhado contra um
`--ifm-link-decoration: none` explícito, heading sem `--pd-text-strong`.

- **No stylesheet** (`build-dist.mjs`, bloco `ADAPTER_CONSUMER`): `:root`, `a`,
  `a:hover`, `h1..h6`. Toda declaração é um `var(--ifm-*)` que o adaptador atribui —
  nenhum valor é escolhido ali. `:root` espelha o que o Infima faz
  (`html { background-color: var(--ifm-background-color) }`), e `body` não é tocado,
  porque no site real o body não tem fundo próprio.
- **No provider** (`ThemeRoot`): o atributo `data-theme` e a reafirmação do fundo em
  `body`. O atributo não cabe em CSS — o seletor é `:root[data-theme='light']`, e só
  `<html>` o carrega. O fundo em `body` existe porque o scaffold do card de preview
  crava `body{background:#fff}`; branco sob ink de modo escuro é colapso de contraste.
  Escrito como `var(--ifm-background-color)`, não como cor: quem redefinir
  `--pd-surface-page` continua recebendo o próprio fundo.

**`chrome.css` fica de fora do bundle**: 70 regras, todas endereçando o frame do
Docusaurus (`html.docs-doc-page`, `.navbar`, `.theme-doc-sidebar-*`, `.breadcrumbs`,
`.pagination-nav`, `.footer`). Nada disso existe num design.

## Modo de cor

Escuro é o padrão do `ThemeRoot`, seguindo `colorMode.defaultMode` no
`docusaurus.config.js` — *"Dark is canonical, it's where the design was born"*.
Decisão do dono do repo nesta sessão, com o claro em cima da mesa. Os dois modos
sobem completos; o claro é `<ThemeRoot mode="light">`.

## Previews

- Os 14 são autorados, em `.design-sync/previews/`, e a composição vem do `content/`
  real sempre que existe (instalação do `overpower`, códigos de saída do `doctor`,
  changelog, grade de cartões da página de entrada).
- **Prosa dentro de componente vai em `<p>`.** Vários são `flex`/`grid`, e um nó de
  texto solto vira uma linha própria — no site quem embrulha é o MDX. Foi assim que
  o corpo do `Card` apareceu quebrado em quatro linhas.
- `cardMode: column` nos 14: todo membro deste catálogo é bloco de documento de
  largura cheia, e lado a lado na grade do painel eles cortam.

## Docs por componente

`content/` documenta o `overpower`, não este design system — não há doc de componente
no repo. As 14 de `.design-sync/docs/` foram escritas para o sync e o `category` do
front matter é o que define o grupo (`highlight`, `disclosure`, `sequence`,
`reference`, `presentation`).

## Avisos de render conhecidos

Nenhum. O `package-validate.mjs` sai limpo, 14/14, sem linha de aviso.

## Riscos para o próximo sync

- **`dtsPropsFor` é escrito à mão, e não é medido.** O repo é JS puro, sem `.d.ts` e
  sem tsconfig, então o extrator não tem o que ler (`[DTS] parsed 0 .d.ts files`).
  Todo contrato de props no `config.json` foi transcrito da fonte à mão: **uma prop
  que mudar em `src/components/` não vai reprovar nada aqui.** Ao mexer num componente,
  confira o `dtsPropsFor` dele.
- **O registro de ícones muda com o conteúdo.** `src/icons/registry.js` é gerado do que
  o `content/**` usa; escrever um ícone novo numa página muda a união de `Icon.name`
  no `.d.ts` e a célula `Registro` do preview. Ambos precisam de atualização à mão.
- **`conventions.md` enumera nomes de token.** Foram conferidos contra o build desta
  sessão. Uma renomeação em `tokens.css` não quebra nada — só faz o cabeçalho mentir
  para o agente de design. Revalide (o passo do skill faz isso) a cada sync.
- **O scaffold do card é claro.** `.ds-cell` e o `h4` do rótulo usam cinzas cravados
  pelo harness. No escuro isso aparece como moldura clara em volta da célula: é do
  harness, não do sistema, e não se conserta pelo lado de cá.
- **`playwright-core` fixa o chromium do cache.** Aqui foi `chromium-1234` e
  `playwright@1.62.1`. Se o cache mudar, cheque o `browsers.json` da versão antes de
  instalar, e passe `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`.
