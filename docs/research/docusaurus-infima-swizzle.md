# Docusaurus v3: arquitetura de tema, Infima e a fronteira do swizzle

> Pesquisa do ticket [#5](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/5). Responde: **onde ficam as fronteiras reais de customização** do Docusaurus v3 sob a restrição vanilla-first — o que se muda com variável, o que exige swizzle, o que exige ejetar, e o que não se muda sem sair do preset `classic`.
>
> A §7 responde a pergunta derivada, que ficou concreta depois que outra pesquisa mediu que quatro das sete referências (FastMCP, Devin, Perplexity, Trigger.dev) servem o mesmo CSS do Mintlify: **quanto do chrome do Mintlify o Docusaurus vanilla alcança, e onde ele impede.**

## Sumário executivo

Sete afirmações que sustentam decisões, todas verificadas em código:

1. **A superfície de variável do Infima é 293 propriedades `--ifm-*`**, e 284 delas moram em `:root` — logo, quase toda a re-marcação é troca de variável em `custom.css`, sem seletor nenhum.
2. **O dark mode é `html[data-theme='dark']`**, especificidade `(0,1,1)`. O seletor `[data-theme='dark']` que a documentação oficial ensina tem `(0,1,0)` e **perde silenciosamente** para as 36 variáveis que o Infima redefine no bloco dark. Essa é a armadilha nº 1 do projeto.
3. **O Infima não usa `@layer`.** Cascade layers, aqui, são uma armadilha e não uma ferramenta: CSS sem camada vence CSS em camada.
4. **`customCss` é injetado depois do Infima**, por construção do `getClientModules()` do theme-classic. A igualdade de especificidade já basta para vencer — `!important` é quase sempre sintoma de seletor errado.
5. **Dos 220 componentes swizzláveis do theme-classic, 173 não têm nenhuma ação `safe`.** O `getSwizzleConfig` declara nível para **55** componentes; os outros 165 caem no default `unsafe`. Navbar, TOC, DocItem, Layout, Tabs, Breadcrumbs, DocSidebarItem — todo o chrome central é `unsafe`. O que é seguro: Footer inteiro, Admonition (abaixo da raiz), CodeBlock (raiz), MDXComponents, os ícones, ColorModeToggle, NotFound, SearchBar, SkipToContent, DocCardList, e `DocSidebar` em wrap.
6. **Não existe um único ponto `safe` dentro de uma página de doc.** É a fronteira mais dura da pesquisa, e a que mais separa o Docusaurus do alvo de replicação (§7).
7. **`--wrap` e `--eject` custam coisas diferentes no upgrade.** Wrap acopla-se a props; eject acopla-se à implementação inteira e congela um retrato do tema numa versão. E `unsafe` não é cautela: é licença explícita para quebrar em **minor** — `CodeBlock`, `Tabs` e `DocCard` já foram reestruturados dentro do v3.
8. **A largura da coluna de leitura é `max-width: 75% !important` numa classe de CSS Module hasheada.** É o exemplo canônico de onde a variável acaba: não há token, não há classe estável, e a única saída limpa é swizzle `unsafe` ou seletor estrutural.

---

## 0. Escopo, versões e método

| Item | Versão | Fonte |
| --- | --- | --- |
| `@docusaurus/core` | **3.10.2** (2026-07-10) | `registry.npmjs.org/@docusaurus/core` → `dist-tags.latest` |
| `@docusaurus/theme-classic` | **3.10.2** | idem |
| `infima` | **0.2.0-alpha.45** — **pin exato, sem `^`** | `dependencies` de `@docusaurus/theme-classic@3.10.2` |
| `@mdx-js/react` | `^3.0.0` | idem — MDX v3 |
| `prism-react-renderer` | `^2.3.0` | idem |

**Método.** Os pacotes publicados foram baixados com `npm pack` e lidos no disco — não o `main` do GitHub, que sofre drift em relação ao que se instala. Toda afirmação abaixo aponta para arquivo dentro do tarball publicado da versão citada, ou para a documentação oficial.

**O pin do Infima importa.** `infima` está pinado em versão exata, não em faixa. A superfície de variáveis é, portanto, **congelada até você subir a versão do Docusaurus**. Não existe cenário de "o Infima mudou embaixo de mim" sem upgrade explícito.

Mais que isso: **o Infima está parado desde 2024-08-23** — `0.2.0-alpha.45` é a última publicação no npm, e o projeto nunca saiu de `alpha` (a dist-tag `next` aponta para `0.2.0-alpha.1`, mais antiga que a `latest`, sinal de tag abandonada). Duas leituras: a estabilidade prática é alta, e não se deve esperar nada de novo vindo de cima. O que falta no Infima hoje vai continuar faltando — logo, cada lacuna da §1.8 é território permanente do projeto, não uma espera.

---

## 1. Infima: a superfície completa de variáveis

### 1.1 Como o Infima entra no build

`@docusaurus/theme-classic@3.10.2`, `src/index.ts`:

```ts
function getInfimaCSSFile(direction: string) {
  return `infima/dist/css/default/default${direction === 'rtl' ? '-rtl' : ''}.css`;
}
// ...
getClientModules() {
  const modules = [
    require.resolve(getInfimaCSSFile(direction)),
    './prism-include-languages',
    './nprogress',
  ];
  modules.push(...customCss.map((p) => path.resolve(context.siteDir, p)));
  return modules;
},
```

Três consequências diretas:

- O que chega ao browser é **um único CSS pré-compilado** (`infima/dist/css/default/default.css`, 3.054 linhas), não os fontes `.pcss`. Os `.pcss` do pacote são referência de leitura; o build já resolveu `color-mod()`, `@each` e `@custom-media`.
- **`customCss` entra depois do Infima, sempre.** Isso é código, não convenção. É a base de toda a doutrina de cascata da seção 3.
- Existe uma variante RTL (`default-rtl.css`) selecionada por locale, e o theme-classic roda `rtlcss` via PostCSS em tudo **menos** no arquivo do Infima (que já vem RTL). Se o projeto ganhar locale RTL, CSS próprio passa pelo rtlcss automaticamente.

Ordem de import interna, de `infima/styles/infima.pcss`: `common/variables` → `common/base` → `layout/{grid,spacing}` → `content/{code,heading,image,markdown,list,table,typography}` → `utilities/{shadow,text,custom-scrollbar,misc}` → `components/{alert,avatar,badge,breadcrumb,button,button-group,card,table-of-contents,close,dropdown,footer,forms,hero,menu,navbar,pagination,pagination-nav,pills,tabs}` → **`common/dark-mode` por último**.

### 1.2 O tamanho e a forma da superfície

Contagem sobre `infima/dist/css/default/default.css@0.2.0-alpha.45`:

| Medida | Valor |
| --- | --- |
| Propriedades `--ifm-*` distintas | **293** |
| Declaradas em `:root` | **284** |
| Redefinidas em `html[data-theme='dark']` | **36** |
| Declaradas fora de `:root` (variantes de componente) | 9 famílias — `.alert`, `.alert--*`, `.navbar--dark`, `.navbar--primary`, `.footer--dark`, `.hero--*`, `.badge--*`, `.button--*`, `.pagination--sm/lg`, `.col--*`, `.markdown`, `.avatar__photo--*`, `.breadcrumbs--sm/lg` |
| Classes globais expostas | **287**, em 46 famílias |
| Ocorrências de `!important` no Infima | 116 (quase todas em utilitários `margin--*`/`padding--*`/`text--*`) |
| Uso de `@layer` | **zero** |
| Uso de `prefers-color-scheme` em CSS | **zero** |
| Uso de `clamp()` | **zero** |
| Variáveis declaradas e **nunca consumidas** pelo próprio Infima | ~43 |

O ponto estrutural: **284 de 293 estão em `:root`**. Mesmo as variáveis de componente (`--ifm-navbar-height`, `--ifm-toc-border-color`, `--ifm-card-border-radius`) são declaradas em `:root`, não no seletor do componente. Você as sobrescreve globalmente sem tocar em seletor de componente. As 9 exceções são **variantes** (`.navbar--dark` redefine `--ifm-navbar-link-color` etc.) — para essas, é preciso repetir o seletor da variante.

### 1.3 Núcleo global — `common/variables.pcss` (73 declarações explícitas)

**Motores de derivação de cor** (não são cores; são os percentuais que geram as shades):

```
--ifm-dark-value: 10%       --ifm-light-value: 15%
--ifm-darker-value: 15%     --ifm-lighter-value: 30%
--ifm-darkest-value: 30%    --ifm-lightest-value: 50%
--ifm-contrast-background-value: 90%        --ifm-contrast-foreground-value: 70%
--ifm-contrast-background-dark-value: 70%   --ifm-contrast-foreground-dark-value: 90%
```

Armadilha: no CSS **compilado**, as shades já estão resolvidas em `rgb()` literal. Mudar `--ifm-dark-value` em runtime **não recalcula nada** — `color-mod()` rodou em build time, no build do Infima, com os valores default. Ou seja: **as seis shades de cada cor semântica precisam ser declaradas à mão** quando você troca a cor base. É exatamente o que o gerador oficial de paleta do Docusaurus produz, e a razão pela qual ele existe.

**Cores semânticas** (6 bases × 8 derivadas = 48 variáveis derivadas):

```
--ifm-color-primary: #3578e5     --ifm-color-info: #54c7ec
--ifm-color-secondary: #ebedf0   --ifm-color-warning: #ffba00
--ifm-color-success: #00a400     --ifm-color-danger: #fa383e
```

Derivadas por cor `$c ∈ {primary, secondary, success, info, warning, danger}`:
`--ifm-color-$c-{dark,darker,darkest,light,lighter,lightest,contrast-background,contrast-foreground}`.

**Escala de cinza e ênfase** — a espinha dorsal do dark mode:

```
--ifm-color-white / --ifm-color-black
--ifm-color-gray-{0,100,200,300,400,500,600,700,800,900,1000}
--ifm-color-emphasis-{0,100,...,1000}   → apontam para os grays
```

Só `--ifm-color-emphasis-*` é redefinido no dark (invertido: `emphasis-0 → gray-1000`). **Os grays não são invertidos.** Consequência de projeto: consumir `--ifm-color-emphasis-*` dá inversão automática de graça; consumir `--ifm-color-gray-*` direto ancora no claro e quebra no escuro.

**Base:**

```
--ifm-color-content: var(--ifm-color-emphasis-900)
--ifm-color-content-inverse: var(--ifm-color-emphasis-0)
--ifm-color-content-secondary: #525860
--ifm-background-color: transparent        (fundo do body)
--ifm-background-surface-color: var(--ifm-color-content-inverse)
--ifm-global-border-width: 1px
--ifm-global-radius: 0.4rem
--ifm-hover-overlay: rgba(0,0,0,0.05)
```

`--ifm-global-radius` é o único raio global — tudo que tem canto (card, button, badge, alert, code, pagination) deriva dele por `calc()`. Trocar um valor re-marca o site inteiro.

**Tipografia:**

```
--ifm-font-family-base: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif, ...
--ifm-font-family-monospace: SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace
--ifm-font-size-base: 100%
--ifm-font-weight-{light,normal,semibold,bold}: 300 / 400 / 500 / 700
--ifm-font-weight-base: var(--ifm-font-weight-normal)
--ifm-line-height-base: 1.65
--ifm-font-color-base / --ifm-font-color-base-inverse / --ifm-font-color-secondary
```

Note `semibold: 500` — não 600. Fonte com 600 real precisa de override explícito.

**Espaçamento, transição, sombra, z-index:**

```
--ifm-global-spacing: 1rem
--ifm-spacing-vertical / --ifm-spacing-horizontal   → derivam de global-spacing
--ifm-transition-fast: 200ms   --ifm-transition-slow: 400ms
--ifm-transition-timing-default: cubic-bezier(0.08, 0.52, 0.52, 1)
--ifm-global-shadow-lw / -md / -tl
--ifm-z-index-dropdown: 100   --ifm-z-index-fixed: 200   --ifm-z-index-overlay: 400
```

O Infima já respeita `prefers-reduced-motion` — zera `--ifm-transition-fast/slow` sob a media query. Motion próprio que use essas variáveis herda o respeito de graça; motion próprio com duração literal, não.

Apenas **três** z-indexes nomeados. Qualquer camada nova do projeto (overlay de busca, tooltip, banner sticky) sai do contrato e vira convenção do projeto.

**Não existe escala de espaçamento.** Só as três variáveis acima. Os utilitários `.margin--sm`, `.padding-vert--lg` etc. são gerados em build time a partir de literais em `layout/spacing.pcss` (`none 0`, `xs 0.25rem`, `sm 0.5rem`, `md 1rem`, `lg 2rem`, `xl 5rem`), **com `!important` e completamente desacoplados de `--ifm-global-spacing`**. Mudar a variável não move nenhum utilitário. Não há `--ifm-space-*`. A escala de espaçamento do projeto nasce do zero.

**Também não existe escala de raio.** Só `--ifm-global-radius`; os componentes multiplicam à mão (`card` usa `* 2`, `breadcrumb` crava `1.5rem`). Não há `--ifm-radius-sm/md/lg/full`.

### 1.3.1 As variáveis inertes

Cerca de **43 variáveis são declaradas e nunca consumidas** pelo próprio Infima. Sobrescrevê-las não muda pixel nenhum — são tokens declarativos, não ganchos. As que mais enganam:

- **Todas as `-light`, `-lighter`, `-lightest` e `-darkest`** das seis cores semânticas.
- As dez variáveis `-value` de derivação (§1.3), inertes por serem build-time.
- `--ifm-transition-slow`, `--ifm-z-index-overlay`, `--ifm-alert-color`, `--ifm-navbar-link-active-color`, `--ifm-image-alignment-padding`, `--ifm-font-weight-base`, `--ifm-color-emphasis-600`, `--ifm-color-emphasis-1000`.

O inverso não acontece: **não há nenhuma variável referenciada via `var()` sem default**. O Infima não deixa ganchos de extensão vazios de propósito — tudo que ele lê, ele declara.

### 1.4 Superfície por componente

Todas em `:root`. Contagem por família, do CSS compilado:

| Família | Nº | Variáveis-chave |
| --- | --- | --- |
| **navbar** | 15 | `--ifm-navbar-height: 3.75rem`, `-background-color`, `-shadow`, `-link-color`, `-link-hover-color`, `-link-active-color`, `-padding-{horizontal,vertical}`, `-item-padding-{horizontal,vertical}`, `-search-input-{background-color,color,placeholder-color,icon}`, `-sidebar-width: 83vw` |
| **alert** (= admonition) | 11 | `-background-color`, `-border-color`, `-border-radius`, `-border-width: 0px`, `-border-left-width: 5px`, `-color`, `-padding-{horizontal,vertical}`, `-shadow`, `-background-color-highlight`, `-foreground-color` |
| **breadcrumb** | 11 | `-border-radius: 1.5rem`, `-spacing`, `-color-active`, `-item-background-active`, `-padding-*`, `-size-multiplier`, `-separator` (SVG data-URI), `-separator-filter`, `-separator-size*` |
| **button** | 11 | `-background-color`, `-border-{color,width,radius}`, `-color`, `-font-weight`, `-padding-*`, `-size-multiplier`, `-transition-duration` |
| **footer** | 9 | `-background-color: var(--ifm-color-emphasis-100)`, `-color`, `-link-color`, `-link-hover-color`, `-link-horizontal-spacing`, `-padding-*`, `-title-color`, `-logo-max-width` |
| **pagination** | 9 | `-border-radius`, `-color-active`, `-font-size`, `-item-active-background`, `-page-spacing`, `-padding-*` (+ `--ifm-pagination-nav-border-radius`, `-color-hover`) |
| **table** | 9 | `-cell-padding`, `-background`, `-stripe-background`, `-border-{width,color}`, `-head-{background,color,font-weight}`, `-cell-color` |
| **heading** | 8 + 6 | `-color`, `-margin-{top,bottom}`, `-font-family`, `-font-weight`, `-line-height: 1.25`; `--ifm-h1..h6-font-size` (2 / 1.5 / 1.25 / 1 / 0.875 / 0.85 rem) |
| **menu** (sidebar) | 8 | `-color`, `-color-active`, `-color-background-active`, `-color-background-hover`, `-link-padding-{horizontal,vertical}`, `-link-sublist-icon` (SVG data-URI), `-link-sublist-icon-filter` |
| **badge** | 7 | `-background-color`, `-border-{color,radius,width}`, `-color`, `-padding-*` |
| **blockquote** | 7 | `-font-size`, `-border-left-width: 2px`, `-padding-*`, `-shadow`, `-color`, `-border-color` |
| **code / pre** | 10 | `--ifm-code-{background,border-radius,font-size: 90%,padding-*}`, `--ifm-pre-{background,border-radius,color,line-height: 1.45,padding: 1rem}` |
| **tabs** | 5 | `-color`, `-color-active`, `-color-active-border`, `-padding-*` |
| **card** | 4 | `-background-color`, `-border-radius: calc(var(--ifm-global-radius) * 2)`, `-horizontal-spacing`, `-vertical-spacing` |
| **toc** | 4 | `-border-color`, `-link-color`, `-padding-{vertical,horizontal}` |
| **dropdown** | 4 | `-background-color`, `-font-weight`, `-link-color`, `-hover-background-color` |
| **scrollbar** | 4 | `-size: 7px`, `-track-background-color`, `-thumb-background-color`, `-thumb-hover-background-color` |
| **list** | 4 | `-left-padding: 2rem`, `-margin`, `-item-margin`, `-paragraph-margin` |
| **link** | 4 | `-color`, `-decoration: none`, `-hover-color`, `-hover-decoration: underline` |
| **hr** | 3 | `-background-color`, `-height: 1px`, `-margin-vertical` |
| **pills** | 3 | `-color-active`, `-color-background-active`, `-spacing` |
| **avatar** | 3 | `-intro-margin`, `-intro-alignment`, `-photo-size: 3rem` |
| **hero** | 2 | `-background-color`, `-text-color` |
| **container** | 2 | `--ifm-container-width: 1140px`, `--ifm-container-width-xl: 1320px` |
| **col** | 1 | `--ifm-col-width: 100%` |
| **markdown (ritmo vertical)** | 8 | `--ifm-leading-desktop: 1.25`, `--ifm-leading`, `--ifm-h{1,2,3}-vertical-rhythm-top` (3 / 2 / 1.5), `--ifm-heading-vertical-rhythm-top: 1.25`, `--ifm-h1-vertical-rhythm-bottom: 1.25`, `--ifm-heading-vertical-rhythm-bottom: 1`, `--ifm-paragraph-margin-bottom` |
| **image** | 1 | `--ifm-image-alignment-padding: 1.25rem` |

O bloco de **ritmo vertical** é o que a maioria ignora e é o que mais decide sensação de densidade num corpo longo: `--ifm-leading` é a unidade, e os `vertical-rhythm-*` são multiplicadores de margem de heading dentro de `.markdown`. É a alavanca certa para ritmo tipográfico — não margem literal em `h2`.

**A única tipografia responsiva que existe** mora em `content/markdown.pcss` e reescreve três variáveis por seletor, com corte em 576px:

| Seletor | Variável | ≥577px | ≤576px |
| --- | --- | --- | --- |
| `.markdown h1:first-child` | `--ifm-h1-font-size` | `3rem` | `2rem` |
| `.markdown > h2` | `--ifm-h2-font-size` | `2rem` | `1.5rem` |
| `.markdown > h3` | `--ifm-h3-font-size` | `1.5rem` | `1.25rem` |

Ou seja: o `h1` de uma página de doc é **3rem**, não os 2rem do `:root`. Isso é o mais próximo de "escala tipográfica de conteúdo" que o Infima tem, e é um override por seletor — não por token. Uma escala própria precisa reescrever esses três seletores, não só as variáveis.

**O padrão de sub-tema local, que vale copiar.** `.alert` redefine **sete variáveis globais dentro do próprio escopo** — `--ifm-code-background`, `--ifm-link-color`, `--ifm-link-hover-color`, `--ifm-link-decoration: underline`, `--ifm-tabs-color`, `--ifm-tabs-color-active`, `--ifm-tabs-color-active-border`. É como o Infima faz um componente ter tema próprio sem CSS novo: **redeclarar tokens no escopo da classe**. É exatamente a técnica que os componentes de conteúdo autorais devem usar.

E o contra-exemplo: `--ifm-alert-background-color-highlight` é `rgba()` **literal** por variante (`rgba(53,120,229,0.15)` no primary), não derivado. Trocar `--ifm-color-primary` **não** atualiza o fundo de `<code>` dentro de admonitions — é um dos poucos pontos onde a re-marcação por variável vaza.

### 1.5 O namespace `--docusaurus-*` (10 variáveis)

Fora do Infima, declaradas pelo Docusaurus em CSS Modules. O comentário no fonte do `theme-common` é explícito: `/* CSS variables, meant to be overridden by final theme */`.

| Variável | Default (claro / escuro) | Arquivo | Escopo |
| --- | --- | --- | --- |
| `--docusaurus-highlighted-code-line-bg` | `rgb(72 77 91)` / `rgb(100 100 100)` | `theme/CodeBlock/Line/styles.module.css` | `:root` |
| `--docusaurus-announcement-bar-height` | `auto`; `30px` em ≥997px | `theme/AnnouncementBar/styles.module.css` | `:root` |
| `--docusaurus-collapse-button-bg` | `transparent` / `rgb(255 255 255 / 5%)` | `theme/DocSidebar/Desktop/CollapseButton/styles.module.css` | `:root` |
| `--docusaurus-collapse-button-bg-hover` | `rgb(0 0 0 / 10%)` / `rgb(255 255 255 / 10%)` | idem | `:root` |
| `--docusaurus-progress-bar-color` | `var(--ifm-color-primary)` | `src/nprogress.css` | `:root` |
| `--docusaurus-blog-social-icon-size` | `1rem` | `theme/Blog/Components/Author/Socials/styles.module.css` | **classe** |
| `--docusaurus-tag-list-border` | `var(--ifm-color-emphasis-300)` / hover `var(--ifm-link-color)` | `theme/Tag/styles.module.css` | **classe** |
| `--docusaurus-details-decoration-color` | `grey` (theme-common) → `var(--ifm-alert-border-color)` (classic) | `theme-common/components/Details` + `theme/Details` | **classe** |
| `--docusaurus-details-transition` | `transform var(--ifm-transition-fast) ease` | idem | **classe** |
| `--docusaurus-details-summary-arrow-size` | `0.38rem` | só em `theme-common/components/Details/styles.module.css` | **classe** |

**A coluna de escopo é a pegadinha.** Só as cinco primeiras estão em `:root` e se sobrescrevem de `custom.css` sem seletor. As outras cinco vivem em classes de CSS Module (`.details`, `.tagRegular`) — para trocá-las é preciso alcançar um seletor ancestral cujo valor herde (ex.: `.theme-admonition`, `:root`… que não funciona porque a declaração local vence). Na prática: `--docusaurus-details-*` e `--docusaurus-tag-list-border` **não são configuráveis de `custom.css`** sem seletor estrutural.

**Dois namespaces vizinhos, fora de alcance:**

- `--prism-color` e `--prism-background-color` **não vêm de CSS nenhum** — são injetadas no atributo `style` inline pelo `prism-react-renderer` a partir de `themeConfig.prism.theme`. Consumidas por `CodeBlock/Container` e `CodeBlock/Content` (`--ifm-pre-background: var(--prism-background-color)`). Logo, **a cor de fundo do bloco de código sai do tema Prism, não do Infima** — e se muda por config, não por CSS.
- `--docsearch-*` (7 variáveis) vêm do pacote externo `@docsearch/css` (Algolia). Consumidas pelo `theme-search-algolia`, nunca declaradas no monorepo. Só entram no projeto se a busca Algolia entrar.

### 1.6 O terceiro namespace, não documentado: `--doc-sidebar-*`

```css
/* @docusaurus/theme-classic@3.10.2 — theme/DocRoot/Layout/Sidebar/styles.module.css */
:root {
  --doc-sidebar-width: 300px;
  --doc-sidebar-hidden-width: 30px;
}
```

Duas variáveis sem prefixo de namespace, declaradas em `:root` dentro de um CSS Module. São **a única forma sem swizzle** de mudar a largura da sidebar de docs — consumidas por `DocSidebar/Desktop`, `DocRoot/Layout/Main` e `DocRoot/Layout/Sidebar`. Não aparecem na documentação oficial de styling; são contrato de fato, não de direito.

### 1.7 Dark mode: o mecanismo exato

**Onde a chave é virada.** Um script inline (para evitar FOUC) roda antes da hidratação — `@docusaurus/theme-classic@3.10.2`, `src/inlineScripts.ts`:

```js
document.documentElement.setAttribute('data-theme', initialTheme || <system|defaultMode>);
document.documentElement.setAttribute('data-theme-choice', initialTheme || 'system'|defaultMode);
```

- `data-theme` ∈ `{light, dark}` — o que o CSS lê.
- `data-theme-choice` ∈ `{light, dark, system}` — a *escolha* do usuário, distinta do resultado. O comentário no código é explícito: *"We use `data-theme-choice="system"`, not an absent attribute. This is easier to handle for users with CSS"* (`@docusaurus/theme-common@3.10.2`, `src/contexts/colorMode.tsx`). Isso permite estilizar um toggle tri-estado sem JS próprio — e o próprio `ColorModeToggle` já usa esse atributo no CSS dele.
- `data-announcement-bar-initially-dismissed` — terceiro atributo escrito pelo mesmo script inline, consumido pelo CSS do `AnnouncementBar`.
- Persistência: chave `theme` + namespace do site, em `localStorage`/`sessionStorage` conforme `siteStorage.type` (`ColorModeStorageKey = 'theme'`).
- Override por query string: **`?docusaurus-theme=dark`**. E, mais geral, `?docusaurus-data-<attr>=<valor>` grava qualquer `data-*` em `<html>` (`DataAttributeQueryStringInlineJavaScript`). Excelente para screenshot e QA visual de estados sem tocar em código.
- `respectPrefersColorScheme: true` faz o estado inicial vir de `matchMedia('(prefers-color-scheme: dark)')`, e o contexto React registra `mql.addEventListener('change', …)` para reagir a troca no SO em tempo real. `false` (default) força `defaultMode`.

**Fato estrutural: não existe uma única media query `prefers-color-scheme` em todo o CSS** — nem no Infima, nem no theme-classic. O dark mode é **100% dirigido por JavaScript via atributo**. Consequências: sem JS o site fica preso no `defaultMode`; e qualquer CSS próprio que use `@media (prefers-color-scheme: dark)` vai **divergir do resto do site** quando o usuário trocar manualmente. **Regra: o projeto nunca usa `prefers-color-scheme` em CSS; usa sempre `[data-theme]`.**

**O seletor, e a armadilha.** O Infima escreve o bloco dark como:

```css
/* infima@0.2.0-alpha.45 — styles/common/dark-mode.pcss, o último import de infima.pcss */
html[data-theme='dark'] { ... }
```

Especificidade **`(0,1,1)`** — um tipo + um atributo.

A documentação oficial de styling ensina a escrever, em `custom.css`:

```css
[data-theme='dark'] { --ifm-color-primary: #25c2a0; }
```

Especificidade **`(0,1,0)`**. Isso **perde** para `html[data-theme='dark']`, por especificidade, **independentemente de ordem de origem**.

Funciona na prática só porque `--ifm-color-primary` **não está** entre as 36 variáveis do bloco dark — a concorrente dela é `:root` `(0,1,0)`, e aí a ordem de origem decide a favor do `custom.css`. Para qualquer uma das 36 abaixo, o mesmo padrão **falha em silêncio**:

```
--ifm-color-scheme
--ifm-color-emphasis-{0,100,200,300,400,500,600,700,800,900,1000}
--ifm-background-color                 (#1b1b1d)
--ifm-background-surface-color         (#242526)
--ifm-hover-overlay                    (rgba(255,255,255,0.05))
--ifm-color-content                    (#e3e3e3)
--ifm-color-content-secondary
--ifm-breadcrumb-separator-filter
--ifm-code-background                  (rgba(255,255,255,0.1))
--ifm-scrollbar-{track,thumb,thumb-hover}-background-color
--ifm-table-stripe-background
--ifm-toc-border-color
--ifm-color-{primary,secondary,success,info,warning,danger}-contrast-{background,foreground}
```

Ou seja: **fundo de página, fundo de superfície, cor de texto, fundo de código, borda do TOC, listra de tabela, overlay de hover e toda a escala de ênfase** — justamente o que uma skin dark autoral mais precisa mexer.

(Há ainda um bloco combinado `html[data-theme='dark'], .navbar--dark` que redefine `--ifm-menu-link-sublist-icon-filter`, para inverter o chevron SVG da sidebar.)

**A regra do projeto, então:** em `custom.css`, escrever sempre

```css
:root[data-theme='dark'] { /* (0,2,0) — vence com folga */ }
```

Nunca `[data-theme='dark']` sozinho. Custa um caractere e elimina uma classe inteira de bug silencioso.

> Nota: `:root[data-theme='dark']` já aparece no próprio theme-classic (`DocSidebar/Desktop/CollapseButton/styles.module.css` usa `[data-theme='dark']:root`), o que confirma que a equipe conhece o problema.

### 1.8 Onde a variável acaba

Fronteiras verificadas por ausência no CSS:

**Breakpoints são compilados, não variáveis.** O fonte declara `@custom-media --ifm-narrow-window (max-width: 996px)`, construção de **build time** do PostCSS. No CSS entregue restam literais. O conjunto inteiro de breakpoints do sistema:

| Breakpoint | Origem | Uso |
| --- | --- | --- |
| `max-width: 996px` | Infima + theme-classic (4×) | mobile |
| `min-width: 997px` | theme-classic (13×) | desktop — sidebar, TOC, larguras |
| `max-width: 576px` | ambos | small |
| `min-width: 1440px` | Infima | `--ifm-container-width-xl` |
| `pointer: fine` / `hover: hover` | Infima / theme-classic | affordances de ponteiro |
| `prefers-reduced-motion: reduce` | Infima | zera transições |
| `print` | Infima + theme-classic (4×) | impressão |

**996/997 não é negociável sem reescrever media query.** Qualquer decisão de responsivo do mapa herda essa fronteira ou paga o custo de duplicar todas as queries.

**Não existe variável para:**

- Largura da coluna de leitura (é `75% !important` — §3.4).
- Largura da coluna do TOC (é `col--3`, 25% da grid do Infima, no JSX de `DocItem/Layout`).
- Tipografia fluida — **zero `clamp()`** em Infima e theme-classic de produção; a escala é fixa em `rem`, com um único degrau responsivo por seletor (§1.4). Sem `--ifm-type-ratio`, sem `--ifm-font-size-scale`.
- Escala de espaçamento e de raio (§1.3).
- Curvas de motion além de `--ifm-transition-timing-default`; não há escala de easing. Onde o Infima precisa de outra curva, ele crava: `navbar.pcss` usa `ease-in-out` literal em três lugares.
- `letter-spacing`, `text-wrap: balance/pretty`, `font-feature-settings`, `hyphens`. Relevante: **hifenização e quebra em pt-BR são território 100% de CSS próprio.**
- Camadas além dos três z-indexes.
- Qualquer coisa de grid da página de doc: a estrutura é `.row > .col + .col--3`, JSX, não CSS configurável.

**Duas ausências que são risco, não só lacuna:**

**Sombras não sabem que existe dark mode.** Nenhum dos três `--ifm-global-shadow-*` é redefinido em `html[data-theme='dark']`, e todos usam `rgba(0,0,0,…)` — invisível sobre `#1b1b1d`. Como o axioma 4 do projeto é "dark é canônico", **elevação em dark é obrigatoriamente CSS próprio**, e é uma das primeiras coisas que a spec precisa cravar.

**Foco é quase inexistente.** No CSS compilado do Infima inteiro há **2 ocorrências de `:focus` e zero de `:focus-visible`**. No theme-classic, 5 regras de foco em 76 arquivos, das quais só uma usa `:focus-visible`. Não existe `--ifm-focus-ring-color`, `-width` ou `-offset`. **Acessibilidade de teclado é integralmente responsabilidade do projeto** — e é, com folga, o maior buraco funcional do Infima. Merece token próprio e uma regra global no `custom.css`.

**Conclusão operacional.** Cor, raio, sombra, espaçamento base, ritmo vertical do markdown, altura de navbar, largura de sidebar: **variável**. Layout, largura de leitura, responsivo, tipografia fluida, motion autoral, foco, hifenização: **CSS próprio** — e, em alguns pontos, swizzle.

---

## 2. Customizável sem swizzle nenhum

### 2.1 `customCss`

Schema real (`@docusaurus/theme-classic@3.10.2`, `src/options.ts`):

```ts
const PluginOptionSchema = Joi.object<PluginOptions>({
  customCss: Joi.alternatives()
    .try(
      Joi.array().items(Joi.string().required()),
      /* string única é normalizada para [string] */
    )
    .default([]),
});
```

Aceita string ou **array**, injetado na ordem declarada, sempre **depois** do Infima (§1.1). Um array é a forma de manter arquitetura de tokens em arquivos separados sem bundler próprio:

```ts
theme: { customCss: [
  './src/css/tokens.css',      // :root — a skin trocável
  './src/css/dark.css',        // :root[data-theme='dark']
  './src/css/chrome.css',      // overrides de classe do Infima
  './src/css/content.css',     // componentes de conteúdo
]}
```

Isso atende diretamente o axioma 3 (skin trocável): trocar a skin vira trocar `tokens.css` + `dark.css`.

### 2.2 `themeConfig` — a superfície completa, do schema Joi

Extraído de `src/options.ts@3.10.2` (`ThemeConfigSchema`). Esta é a lista **fechada** — chave fora dela é erro de validação.

| Bloco | Campos | Default |
| --- | --- | --- |
| `colorMode` | `defaultMode` (`dark`\|`light`), `disableSwitch`, `respectPrefersColorScheme` | `light`, `false`, `false` |
| `docs.sidebar` | `hideable`, `autoCollapseCategories` | `false`, `false` |
| `docs` | `versionPersistence` (`localStorage`\|`none`) | `localStorage` |
| `blog.sidebar` | `groupByYear` | `true` |
| `navbar` | `style` (`dark`\|`primary`), `hideOnScroll`, `title`, `logo`, `items` | `hideOnScroll: false` |
| `footer` | `style` (`dark`\|`light`), `logo`, `copyright`, `links` | `style: 'light'` |
| `prism` | `theme`, `darkTheme`, `defaultLanguage`, `additionalLanguages`, `magicComments` | tema `palenight` |
| `tableOfContents` | `minHeadingLevel`, `maxHeadingLevel` (inteiros, 2..6) | `2`, `3` |
| `announcementBar` | `id`, `content` (HTML), `backgroundColor`, `textColor`, `isCloseable` | `isCloseable: true` |
| `metadata` | array de `{id,name,property,content,itemprop}` + desconhecidos | `[]` |
| `image` | string (og:image) | — |

**Tipos de item de navbar** (do switch do `NavbarItemSchema`): default (link `to`/`href`), `doc`, `docSidebar`, `docsVersion`, `docsVersionDropdown`, `localeDropdown`, `dropdown`, `search`, `html`, e **`custom-*`** (regex `/custom-.*/`) — a escotilha oficial para tipo próprio, que exige ejetar `NavbarItem/ComponentTypes` (`eject: safe`). Dropdown aninhado é proibido por schema.

**Os ganchos de `className`** — a alavanca de estilo sem swizzle mais subestimada. `className` é aceito em: todo item de navbar (`NavbarItemBaseSchema`), item de busca, item `html`, item de link do footer, **coluna do footer** (`FooterColumnItemSchema`) e logo (`LogoSchema`). Todo item de navbar/footer também aceita **atributos desconhecidos** (`.unknown()`), com comentário explícito no código: *"users may need additional attributes like target, aria-role, data-customAttribute"*. Então `data-*` próprio em item de navegação é suportado por design, e vira gancho de CSS.

**`prism.magicComments`** dá classe própria em linha de código sem swizzle. O default é `{className: 'theme-code-block-highlighted-line', line: 'highlight-next-line', block: {start: 'highlight-start', end: 'highlight-end'}}`; acrescentar entradas cria destaques semânticos próprios (ex.: linha de erro, linha adicionada) estilizáveis por classe estável.

**Onde a config acaba, dito pelo próprio código.** `colorMode.switchConfig` é `Joi.any().forbidden()` com a mensagem:

> *"colorMode.switchConfig is deprecated. If you want to customize the icons for light and dark mode, swizzle IconLightMode, IconDarkMode, or ColorModeToggle instead."*

É a fronteira config→swizzle escrita pelos mantenedores. Note que os três são `safe`.

Também `forbidden`, com mensagem de migração: `disableDarkMode`, `defaultDarkMode`, `metadatas`, `hideableSidebar`, `autoCollapseSidebarCategories`, `sidebarCollapsible`.

**O que `themeConfig` não tem:** nada de largura, fonte, escala, espaçamento, motion. Tipografia e layout **não passam por config** — só por CSS.

### 2.3 `src/theme/Root` — o único wrapper global sem swizzle

`@docusaurus/core@3.10.2` embarca um `theme-fallback` com `Root`, `Layout`, `Error`, `Loading`, `NotFound`, `SiteMetadata`, `ThemeProvider`. `Root` envolve a aplicação inteira, persiste entre navegações, e **basta criar `src/theme/Root.tsx`** — o alias `@theme/Root` resolve para o arquivo do usuário (§4.1). Não há comando de swizzle envolvido, e por isso não há custo de upgrade de componente: você não copiou implementação nenhuma.

É o lugar certo para provider próprio, listener global ou wrapper de contexto — e a alternativa barata a envolver `Layout` (que é `unsafe`).

### 2.4 Outros pontos sem swizzle

- **`docusaurus.config.ts`**: `i18n`/locales, `staticDirectories`, `headTags`, `scripts`, `stylesheets` (webfont próprio entra aqui, ou por `@font-face` no `customCss` com arquivo em `static/`), `markdown.*`, `future.*`.
- **`sidebars.ts`**: `className` por item, `type: 'html'` para markup arbitrário na sidebar (renderizado por `DocSidebarItem/Html`), `customProps`.
- **Front matter**: `sidebar_class_name`, `sidebar_custom_props`, `hide_table_of_contents`, `toc_min_heading_level`/`toc_max_heading_level`, `image`, `pagination_next`/`pagination_prev`/`pagination_label`, `draft`, `unlisted`.
- **`src/pages/`**: páginas React/MDX próprias com CSS Modules — território totalmente livre, sem swizzle. É onde a landing page vive.
- **`@docusaurus/Head`**: já está no escopo global do MDX (§5.1), então qualquer página MDX pode injetar `<head>`.
- **CSS Modules próprios**: `*.module.css` em qualquer componente de `src/` — classe hasheada, sem risco de colisão.

---

## 3. Ordem de cascata: como o CSS próprio ganha sem `!important` espalhado

### 3.1 As três alavancas, em ordem de preferência

**1. Sobrescrever variável, não regra.** É a alavanca de primeira escolha por três razões estruturais:

- 284 das 293 variáveis estão em `:root`; um bloco `:root` no `custom.css` empata em especificidade `(0,1,0)` e **vence por ordem de origem**, porque `customCss` é injetado depois (§1.1). Zero seletor, zero acoplamento.
- Variável atravessa CSS Module. As classes do theme-classic são hasheadas e inalcançáveis, mas os `var()` dentro delas leem do seu `:root`.
- Variável não quebra em upgrade a menos que o nome saia do Infima — e o Infima está pinado (§0).

**2. Escrever regra sobre classe estável.** Quando não há variável. Duas famílias de classes globais estão disponíveis:

- **287 classes do Infima** (46 famílias) — `.navbar`, `.navbar__link`, `.menu__link`, `.menu__list-item`, `.footer__col`, `.table-of-contents__link`, `.pagination-nav__link`, `.breadcrumbs__item`, `.alert`, `.card`, `.tabs__item`, `.hero`, além da grid (`.row`, `.col`, `.col--N`) e dos utilitários (`.margin-*`, `.padding-*`, `.text--*`, `.shadow--*`, `.clean-btn`, `.thin-scrollbar`).
- **`ThemeClassNames` do `@docusaurus/theme-common`** — contrato público, com aviso no topo do arquivo: *"Please do not modify the classnames! This is a breaking change, and annoying for users!"* (`src/utils/ThemeClassNames.ts@3.10.2`). É a garantia de estabilidade que o Infima não dá.

**2b. `:where()` para baixar a própria especificidade.** O Infima já usa (`:where(.button--primary)`, `:where([data-theme='dark'])`). Serve ao inverso do que se costuma querer: envolver o *seu* seletor em `:where()` o torna **zero-específico**, o que é ideal para uma camada de defaults do projeto que qualquer regra posterior possa sobrescrever sem esforço. Útil para a base de tokens de componentes de conteúdo; inútil para vencer o tema.

**3. `!important` — só onde o tema já usou.** Ver §3.4: a lista é fechada e tem 12 declarações.

### 3.2 O contrato de classes estáveis (`ThemeClassNames@3.10.2`)

```
page:        docs-doc-page · docs-tags-list-page · docs-tags-doc-list-page · mdx-page
             blog-list-page · blog-post-page · blog-tags-list-page · blog-tags-post-list-page
             blog-authors-list-page · blog-authors-posts-page
wrapper:     main-wrapper · docs-wrapper · blog-wrapper · mdx-wrapper
common:      theme-edit-this-page · theme-last-updated · theme-back-to-top-button
             theme-code-block · theme-admonition · theme-admonition-<tipo>
             theme-unlisted-banner · theme-draft-banner
announcement theme-announcement-bar
tabs:        theme-tabs-container
layout:      theme-layout-navbar · theme-layout-navbar-left · theme-layout-navbar-right
             theme-layout-navbar-sidebar · theme-layout-navbar-sidebar-panel
             theme-layout-main · theme-layout-footer · theme-layout-footer-column
docs:        theme-doc-version-banner · theme-doc-version-badge · theme-doc-breadcrumbs
             theme-doc-markdown · theme-doc-toc-mobile · theme-doc-toc-desktop
             theme-doc-footer · theme-doc-footer-tags-row · theme-doc-footer-edit-meta-row
             theme-doc-sidebar-container · theme-doc-sidebar-menu
             theme-doc-sidebar-item-category · theme-doc-sidebar-item-link
             theme-doc-sidebar-item-category-level-<n> · theme-doc-sidebar-item-link-level-<n>
             theme-doc-card-container · theme-doc-card-heading · theme-doc-card-icon
             theme-doc-card-title · theme-doc-card-description
blog:        theme-blog-footer-tags-row · theme-blog-footer-edit-meta-row
pages:       theme-pages-footer-edit-meta-row
```

Duas peças de alto valor prático:

- **`theme-doc-sidebar-item-{category,link}-level-<n>`** dá estilo por profundidade de sidebar sem swizzle nenhum. É a alavanca para hierarquia visual na sidebar — tipicamente a decisão de chrome mais visível de uma doc.
- **`theme-admonition-<tipo>`** dá estilo por tipo de admonition, inclusive tipos próprios (§5.2).

### 3.3 Escopo por tipo de página: `<html>` carrega a classe

`DocRoot/index.tsx@3.10.2`:

```tsx
<HtmlClassNameProvider className={clsx(ThemeClassNames.page.docsDocPage)}>
```

`HtmlClassNameProvider` aplica a classe ao elemento **`<html>`**, não a um wrapper interno. Combinado com `data-theme`, o seletor raiz do projeto fica:

```css
html.docs-doc-page[data-theme='dark'] .menu__link { ... }   /* (0,3,1) */
```

Isso resolve escopo por seção sem swizzle e sem `!important`, e é o mecanismo canônico para "a landing tem regra visual diferente da documentação" (a névoa de "modo showcase" no mapa).

O Docusaurus também acrescenta em `<html>` classes por plugin/id, o que permite escopar por instância de plugin de docs.

### 3.4 `!important`: a lista fechada

O theme-classic usa `!important` em exatamente **12 declarações, em 10 arquivos** (`src/theme/**/*.css@3.10.2`):

| Arquivo | Declaração | O que trava |
| --- | --- | --- |
| `DocItem/Layout/styles.module.css:15` | `max-width: 75% !important` (≥997px) | **largura da coluna de leitura** |
| `DocCategoryGeneratedIndexPage/styles.module.css:10` | `max-width: 75% !important` | idem, na página de índice de categoria |
| `DocRoot/Layout/Main/styles.module.css:26` | `max-width: calc(--ifm-container-width + --doc-sidebar-width) !important` | largura com sidebar oculta |
| `DocSidebar/Desktop/styles.module.css:27,32,33` | `display: flex`, `color: inherit`, `text-decoration: none` | link da sidebar |
| `DocSidebar/Desktop/CollapseButton/styles.module.css:20` | `display: block !important` | botão de colapso |
| `Tabs/styles.module.css:13` | `margin-top: 0 !important` | primeiro filho do painel de tab |
| `CodeBlock/Buttons/styles.module.css:32` + `CopyButton/styles.module.css:9` | `opacity: 1 !important` | botões do code block em foco/hover |
| `BlogSidebar/Desktop/styles.module.css:38` | `color: var(--ifm-color-primary) !important` | item ativo da sidebar do blog |
| `BlogPostItem/Header/Authors/styles.module.css:9` | `max-width: inherit !important` | coluna de autores |

Somando os 116 do Infima — quase todos em utilitários `margin--*`, `padding--*`, `text--*`, que são utilitários e **devem** ganhar — o mapa é: `!important` no CSS do projeto só se justifica contra uma dessas 12, e a maioria delas nem é território do projeto.

**O caso que importa: a largura de leitura.** É o exemplo canônico de "onde a variável acaba":

```tsx
// DocItem/Layout/index.tsx@3.10.2
<div className="row">
  <div className={clsx('col', !docTOC.hidden && styles.docItemCol)}>…</div>
  {docTOC.desktop && <div className="col col--3">{docTOC.desktop}</div>}
</div>
```

```css
/* DocItem/Layout/styles.module.css@3.10.2 */
@media (min-width: 997px) { .docItemCol { max-width: 75% !important; } }
```

Não existe variável. A classe `.docItemCol` é hasheada e não pode ser selecionada. Restam três saídas:

1. **Seletor estrutural + `!important`** — sem swizzle, mas acopla-se à estrutura do DOM:
   ```css
   @media (min-width: 997px) {
     html.docs-doc-page .row > .col:not(.col--3) { max-width: 100% !important; }
   }
   ```
   Frágil: se o JSX mudar, quebra em silêncio.
2. **`--ifm-container-width`** — muda a largura do `.container` externo. Não desfaz os 75%, mas move a moldura. Robusto e barato; é a alavanca certa se a meta for "coluna mais estreita", não "mais larga".
3. **Swizzle `--eject` de `DocItem/Layout`** — `unsafe`. Controle total do grid, ao custo de congelar `DocItem/Layout` (§4.4).

Essa decisão de três vias é exatamente a forma da spec de chrome do mapa.

### 3.5 `@layer` é armadilha, não ferramenta

Verificado: **zero ocorrências de `@layer`** no CSS entregue do Infima e em todo o CSS do theme-classic.

Pela cascata do CSS, **estilo sem camada vence estilo em camada**, independentemente de especificidade. Se o projeto envolver o `custom.css` em `@layer projeto { … }`, o CSS do projeto passa a **perder** de todo o Infima e de todo o theme-classic. O reflexo moderno de "organizo minha cascata em layers" é, aqui, exatamente o movimento errado.

Duas ressalvas honestas: `@layer` continua útil **dentro** do CSS do projeto para ordenar camadas entre si (todas ainda perderiam do não-camada — portanto só serve se **tudo** do projeto estiver em camada, o que reintroduz o problema). Na prática: **não usar `@layer` neste projeto**, e registrar a razão, porque é contraintuitivo o bastante para alguém tentar de novo.

### 3.6 A doutrina, condensada

1. Token novo ou re-marcação → `:root { --ifm-*: … }` em `custom.css`. Ordem de origem resolve.
2. Valor dark → **`:root[data-theme='dark']`**, nunca `[data-theme='dark']`.
3. Regra sobre chrome → classe do Infima ou `ThemeClassNames`, escopada por `html.<page-class>` quando precisar de mais peso.
4. Não usar `@layer`.
5. `!important` só contra a lista de 12 — e registrar no código qual delas está sendo combatida.
6. Se o alvo só existe em classe hasheada de CSS Module e não há classe estável ancestral: **a decisão virou swizzle**, não CSS. Reconhecer isso cedo evita seletor estrutural frágil.

---

## 4. Swizzle

### 4.1 A mecânica de resolução (aliases)

`@docusaurus/core@3.10.2`, `src/webpack/aliases/index.ts`:

```ts
function loadThemeAliases({siteDir, plugins}) {
  const pluginThemes = plugins.map((p) => p.getThemePath && path.resolve(p.path, p.getThemePath()));
  const userTheme = path.resolve(siteDir, THEME_PATH);          // <siteDir>/src/theme
  return createThemeAliases([ThemeFallbackDir, ...pluginThemes], [userTheme]);
}
```

- Cada componente vira um alias `@theme/<Caminho>`. Temas de plugin também registram **`@theme-original/<Caminho>`** (`addOriginalAlias: true`); o tema do usuário **não** (`false`).
- Quando um tema sombreia outro, o primeiro que forneceu o componente fica preservado em **`@theme-init/<Caminho>`**. Atenção: esse alias **só existe se mais de um tema fornecer o componente**. Num site com só o `classic`, importar `@theme-init/X` quebra o build.
- Precedência final: `src/theme/` do usuário > temas de plugin (na ordem) > `theme-fallback` do core. A ordem documentada de empilhamento é `preset plugins > preset themes > plugins > themes > site`.
- Os aliases são ordenados para que `@theme/NavbarItem` fique **depois** de `@theme/NavbarItem/LocaleDropdown`, senão o pai sombrearia o filho.

É por isso que um wrapper funciona: seu `src/theme/Footer/index.tsx` responde por `@theme/Footer`, e dentro dele `@theme-original/Footer` ainda aponta para o do theme-classic. **E é por isso que `src/theme/Root.tsx` funciona sem swizzle nenhum** (§2.3).

`THEME_PATH` é `src/theme`; `--typescript` gera `.tsx`, senão `.js`.

### 4.2 `--wrap`: o que gera, exatamente

`@docusaurus/core@3.10.2`, `src/commands/swizzle/actions.ts`, função `wrap()`. Saída **literal** (TypeScript):

```tsx
import React, {type ReactNode} from 'react';
import Footer from '@theme-original/Footer';
import type FooterType from '@theme/Footer';
import type {WrapperProps} from '@docusaurus/types';

type Props = WrapperProps<typeof FooterType>;

export default function FooterWrapper(props: Props): ReactNode {
  return (
    <>
      <Footer {...props} />
    </>
  );
}
```

Detalhes de comportamento, do código:

- O nome é sempre `<UltimoSegmento>Wrapper` — `Footer/Links/MultiColumn` → `MultiColumnWrapper`.
- Se o alvo é diretório, o arquivo criado é `<Componente>/index.{tsx,js}`; se é arquivo, `<Componente>.{tsx,js}`.
- `importType` é `'original'` por padrão — daí `@theme-original`. O modo `@theme-init` existe no código para o caso de temas encadeados.

**O que `--wrap` permite:** envolver com markup/provider, injetar antes/depois, interceptar e transformar props, renderizar condicionalmente, ou substituir por completo em algum caso e delegar no resto.

**O que `--wrap` não permite:** mudar o *interior* do componente. Se o alvo é uma `<div>` no meio da árvore do original, wrap não alcança.

**Custo de upgrade:** baixo. O acoplamento é à **assinatura de props** e à existência do componente. Um upgrade que reescreva o interior sem mudar props passa direto. Quebra se: o componente for removido/renomeado, ou as props mudarem de forma. `WrapperProps<typeof XType>` faz o TypeScript acusar mudança de props no build — é a razão prática para usar `--typescript` mesmo num projeto JS.

### 4.3 `--eject`: o que gera, exatamente

Mesma fonte, função `eject()`:

- Se o alvo é diretório, copia **`<dir>/**/*`** — todos os arquivos, inclusive `styles.module.css` e subcomponentes. Se é arquivo, copia `<nome>.*`.
- Ignora sempre: `**/*.{story,stories,test,tests}.{js,jsx,ts,tsx}` e `**/{__fixtures__,__tests__}/*`.
- **Sem `--typescript`, ignora `**/*.{d.ts,ts,tsx}`** — ou seja, ejetar um componente TS num projeto JS copia o JS transpilado de `lib/`, não o fonte.
- **Remove o cabeçalho de licença**: `fileContents.trimStart().replace(/^\/\*.+?\*\/\s*/ms, '')`. O arquivo ejetado perde a marca de origem — e com ela a pista de qual versão ele veio. **Anotar a versão de origem em comentário no topo de todo arquivo ejetado é disciplina obrigatória**, não zelo.

**O que `--eject` permite:** tudo. É o seu arquivo.

**Custo de upgrade:** alto e silencioso. O arquivo ejetado é um **retrato congelado** do componente na versão em que você ejetou. Correções de bug, de acessibilidade, de i18n e de performance que o upstream fizer depois **não chegam** — e nada avisa. Pior: um ejetado que importa `@theme/Sub` continua recebendo o `Sub` novo, então a incompatibilidade aparece como bug de runtime, não como erro de build.

**A regra:** `--wrap` por padrão; `--eject` só quando wrap comprovadamente não alcança o alvo.

### 4.4 A tabela canônica de segurança

Vive em código: `@docusaurus/theme-classic@3.10.2`, `src/getSwizzleConfig.ts` — 55 entradas. Status possíveis: `safe`, `unsafe`, `forbidden` (`SwizzleActionsStatuses`, `src/commands/swizzle/common.ts`).

#### Tudo `safe` em wrap **e** eject (40 componentes)

| Componente | Responsabilidade (descrição do próprio config) |
| --- | --- |
| `CodeBlock` | Blocos de código multi-linha; a raiz — o interior (`CodeBlock/Content`) é `unsafe` |
| `ColorModeToggle` | O botão de troca claro/escuro |
| `DocCardList` | Lista de cards de itens da sidebar; usado nas páginas de índice gerado de categoria |
| `Footer` + `Footer/{Copyright,Layout,LinkItem,Links,Links/MultiColumn,Links/Simple,Logo}` | **O footer inteiro, em 8 peças** |
| `MDXContent` | Envolve todo conteúdo MDX e fornece o contexto de MDXComponents |
| `MDXComponents/{A,Code,Details,Heading,Img,Li,Pre,Ul}` | Os renderizadores de tag HTML dentro de MDX |
| `Admonition/Layout` | O layout padrão aplicado a todos os tipos de admonition |
| `Admonition/Type/{Note,Tip,Info,Warning,Danger,Caution}` | Um por tipo `:::` |
| `Admonition/Icon/{Note,Tip,Info,Warning,Danger}` | Os ícones |
| `Icon/{Arrow,DarkMode,LightMode,Edit,Menu}` | Ícones de chrome |
| `NotFound` | A página 404 — *"meant to be ejected and customized"* |
| `SearchBar` | A barra de busca da navbar (placeholder vazio por default) |
| `SkipToContent` | O link de acessibilidade "pular para o conteúdo" (WCAG G1) |

#### `safe` só em uma ação (7)

| Componente | wrap | eject | Nota |
| --- | --- | --- | --- |
| `DocSidebar` | **safe** | `unsafe` | *"Too much technical code in sidebar, not very safe atm"* |
| `MDXComponents` | `forbidden` | **safe** | É um objeto, não componente — *"Meant to be ejected"* |
| `Admonition/Types` | `forbidden` | **safe** | Mapa tipo→componente. *"Use it to add custom admonition type components"* |
| `Admonition/Icon` | `forbidden` | **safe** | Pasta |
| `Admonition/Type` | `forbidden` | **safe** | Pasta |
| `NavbarItem/ComponentTypes` | `forbidden` | **safe** | Mapa de tipos de item de navbar; abre o tipo `custom-*` |
| `prism-include-languages` | `forbidden` | **safe** | Não é componente; lista de linguagens do Prism |

`forbidden` aqui quase sempre quer dizer **"é objeto ou pasta, o wrapper gerado não faria sentido"**, não "perigoso". Os comentários no código confirmam (`// Can't wrap a folder`, `// TODO the swizzle CLI should provide a way to wrap such objects`, `// Not a component!`).

#### `forbidden` nas duas ações (5)

`Blog`, `Blog/Components`, `Blog/Pages`, `Icon`, `Icon/Socials`, `DocItem/TOC` — todos com o mesmo comentário: *"Forbidden because it's a parent folder, makes the CLI crash atm"*. **Limitação de CLI, não de arquitetura.** Os filhos continuam swizzláveis.

#### O default é `unsafe` — e é onde mora quase tudo

`@docusaurus/core@3.10.2`, `src/commands/swizzle/components.ts`:

```ts
const FallbackSwizzleActionStatus = 'unsafe';
const FallbackSwizzleComponentConfig = {
  actions: {wrap: FallbackSwizzleActionStatus, eject: FallbackSwizzleActionStatus},
  description: 'N/A',
};
const FallbackIntermediateFolderSwizzleComponentConfig = {
  actions: {wrap: 'forbidden', eject: FallbackSwizzleActionStatus},
};
```

E em `normalizeSwizzleConfig` (`config.ts`), ação declarada sem status também cai para `'unsafe'`.

**Reproduzindo a lógica de `readComponentNames` sobre `lib/theme` de `@docusaurus/theme-classic@3.10.2`:**

| | |
| --- | --- |
| Componentes swizzláveis | **220** (211 arquivos + 9 pastas intermediárias) |
| Declarados em `getSwizzleConfig` | 55 |
| **Caem no default por omissão** | **165 (75%)** |
| `safe` nas duas ações | **40** |
| `safe` em pelo menos uma | **47** |
| **Sem nenhuma ação `safe`** | **173 (79%)** |

(165 e 173 medem coisas diferentes: 165 é "não está no config"; 173 é "não tem nenhuma ação segura" — inclui os que estão no config mas são `unsafe`, como `CodeBlock/Content`, e os `forbidden/forbidden`.)

**A política de semver por trás dos rótulos**, verbatim da doc de swizzling:

> - **Safe**: this component is safe to be swizzled, its public API is considered stable, and no breaking changes should happen within a theme **major version**
> - **Unsafe**: this component is a theme implementation detail, not safe to be swizzled, and breaking changes might happen within a theme **minor version**
> - **Forbidden**: the swizzle CLI will prevent you from swizzling this component

`unsafe` não é um aviso de cautela — é uma **licença explícita que o time se dá para quebrar em minor**. Tratar todo bump de minor como potencialmente breaking, para cada componente `unsafe` swizzlado, é a leitura correta.

**Os outros temas do ecossistema não têm swizzle config nenhum.** `@docusaurus/theme-search-algolia`, `@docusaurus/theme-live-codeblock` e `@docusaurus/theme-mermaid` não exportam `getSwizzleConfig`, então caem em `FallbackSwizzleConfig = {components: {}}` — **tudo `unsafe/unsafe`**, incluindo `SearchPage`. Fora do escopo vanilla-first, mas relevante se a busca Algolia entrar.

#### O que isso significa para o chrome — o achado que mais decide

Todos `unsafe` nas duas ações:

```
Navbar  ·  Navbar/{Content,Layout,Logo,ColorModeToggle,Search}
Navbar/MobileSidebar  ·  Navbar/MobileSidebar/{Header,Layout,PrimaryMenu,SecondaryMenu,Toggle}
NavbarItem  ·  NavbarItem/{DefaultNavbarItem,DocNavbarItem,DocSidebarNavbarItem,DropdownNavbarItem,
                LocaleDropdownNavbarItem,DocsVersionDropdownNavbarItem,HtmlNavbarItem,
                SearchNavbarItem,NavbarNavLink}
TOC  ·  TOCItems  ·  TOCItems/Tree  ·  TOCInline  ·  TOCCollapsible
DocItem  ·  DocItem/{Content,Footer,Layout,Metadata,Paginator,TOC/Desktop,TOC/Mobile}
DocRoot  ·  DocRoot/Layout  ·  DocRoot/Layout/{Main,Sidebar,Sidebar/ExpandButton}
DocSidebar/{Desktop,Desktop/Content,Desktop/CollapseButton,Mobile}
DocSidebarItem  ·  DocSidebarItem/{Category,Link,Html}  ·  DocSidebarItems
DocBreadcrumbs  ·  DocPaginator  ·  PaginatorNavLink  ·  DocCard  ·  DocCard/*
Layout  ·  Layout/Provider  ·  Logo  ·  Heading  ·  Details  ·  CodeInline
Tabs  ·  TabItem  ·  AnnouncementBar  ·  AnnouncementBar/{Content,CloseButton}
BackToTopButton  ·  EditThisPage  ·  LastUpdated  ·  ThemedImage  ·  Mermaid
```

**Traduzindo para o mapa:** de todo o chrome, o que tem passagem segura é **o footer** (8 peças, todas `safe`), **`DocSidebar` em wrap**, **`ColorModeToggle`**, **os ícones** e **`SkipToContent`**. Navbar, TOC, breadcrumbs, paginação, layout de doc e itens de sidebar são território `unsafe` — ou se resolvem por variável/classe estável (§3), ou pagam preço de manutenção.

Isso confirma, com número, a assimetria que o mapa já postulou: **o chrome se entorta, não se autora.** A diferença é que agora se sabe exatamente onde a torção é gratuita e onde é cara.

#### Como o CLI trata `unsafe`

`unsafe` **não é bloqueio**: o CLI pede confirmação explícita, ou aceita `--danger`. A mensagem do próprio código: *"this component is an unsafe internal component and can only be swizzled with `--danger` or explicit confirmation."* `forbidden` é bloqueio real.

Flags reais (`packages/docusaurus/src/commands/cli.ts@3.10.2`): `-w, --wrap` · `-e, --eject` · `-l, --list` · `-t, --typescript` · `-j, --javascript` · `--danger` · `--config <config>`. Sem `--wrap`/`--eject`, o CLI pergunta interativamente; se ambos forem passados, **`--wrap` vence**. `--list` sem nome de tema lista todos os temas e sai.

E o aviso literal que o `--list` imprime para componentes `unsafe`: *"we may release breaking changes within minor version upgrades. You will have to upgrade your component manually and maintain it over time."*

```
npm run swizzle -- --list                                  # a tabela deste doc, na versão instalada
npm run swizzle @docusaurus/theme-classic Footer -- --wrap --typescript
npm run swizzle @docusaurus/theme-classic DocItem/Layout -- --eject --danger --typescript
```

Rodar `--list` no upgrade e comparar com a tabela congelada aqui é o teste de regressão mais barato que existe para tema (§6).

---

## 5. MDX v3

### 5.1 Componente global disponível em todo MDX

O escopo global de MDX é o objeto `@theme/MDXComponents`. Estado default (`@docusaurus/theme-classic@3.10.2`, `src/theme/MDXComponents/index.tsx`):

```tsx
const MDXComponents: MDXComponentsObject = {
  Head,                    // @docusaurus/Head — já global
  details: MDXDetails,
  Details: MDXDetails,
  code: MDXCode,
  a: MDXA,
  pre: MDXPre,
  ul: MDXUl,
  li: MDXLi,
  img: MDXImg,
  h1: (props) => <MDXHeading as="h1" {...props} />,   // … até h6
  admonition: Admonition,
  mermaid: Mermaid,
};
```

`MDXComponents` é `wrap: forbidden` / **`eject: safe`** — a descrição no config diz *"Meant to be ejected"*. Como é um objeto de uma linha só, "ejetar" na prática é escrever o arquivo à mão, sem copiar implementação:

```tsx
// src/theme/MDXComponents.tsx  — zero dependência nova
import MDXComponents from '@theme-original/MDXComponents';
import Callout from '@site/src/components/Callout';
import CardGroup from '@site/src/components/CardGroup';
import Steps from '@site/src/components/Steps';

export default {
  ...MDXComponents,
  Callout,
  CardGroup,
  Steps,
};
```

Note que isso é tecnicamente um *wrap manual* — espalha o original e acrescenta — apesar de `wrap` estar `forbidden` no CLI (limitação de CLI para objetos, §4.4). A doc oficial instrui exatamente isso: *"Since the swizzle CLI doesn't allow wrapping non-component files yet, you should manually create the wrapper."* **Custo de upgrade: praticamente zero**, porque nenhuma implementação foi copiada. É a técnica de menor risco de todo o documento.

Detalhe que morde: **não anote esse arquivo com `import type {MDXComponentsObject} from '@theme/MDXComponents'`** — o alias resolveria para o próprio arquivo, criando referência circular. Importe o valor de `@theme-original/` e deixe o tipo inferir.

**Três regras do MDX v3 que governam isto:**

1. **PascalCase é obrigatório.** Em MDX v3, *"lower-case tag names are always rendered as native html elements, and will not use any component mapping you provide."* Um mapeamento `myElement` é ignorado; tem que ser `MyElement`. Além disso os mapeamentos de tag ficaram *sandboxed*: um mapping de `h1` vale para `# título` em Markdown, mas **não** para `<h1>` escrito à mão em JSX.
2. **O escopo global default é praticamente vazio para uso autoral.** Das 17 chaves acima, só `Head` e `Details` são tags que um autor escreve. As outras 15 são mapeamentos de elementos gerados pelo Markdown ou alvos internos de plugin remark (`admonition`, `mermaid`). Ou seja: **tudo que o autor de conteúdo vai usar, o projeto tem que registrar.**
3. **MDX importado em página React não recebe o escopo global** a menos que seja envolvido em `@theme/MDXContent`:
   ```jsx
   import Feature from './_feature.mdx';
   import MDXContent from '@theme/MDXContent';
   // ...
   <MDXContent><Feature /></MDXContent>
   ```
   Relevante para a landing page, que é `src/pages` React consumindo blocos MDX.

**Global versus import explícito.** Sem registro global, cada `.mdx` precisa de `import Callout from '@site/src/components/Callout'` no topo — verboso, fácil de esquecer, e **impossível em `.md` puro**. Com registro global, funciona em qualquer MDX sem import. Os preços: nome global (colisão é problema seu), rastreabilidade menor (um `<Callout>` no arquivo não tem origem visível), e **custo de bundle** — `MDXComponents` é importado por `MDXContent`, que envolve todo conteúdo MDX, então o objeto inteiro entra no bundle de toda página com MDX, sem tree-shaking.

A heurística da própria doc: *"If you use the same component across a lot of files, you don't need to import it everywhere—consider adding it to the global scope."* Traduzindo para regra do projeto: **global para os poucos componentes que aparecem em dezenas de páginas; import explícito para o resto.**

### 5.2 Admonition própria

O componente `Admonition` (`src/theme/Admonition/index.tsx@3.10.2`) despacha por tipo:

```tsx
function getAdmonitionTypeComponent(type: string): ComponentType<Props> {
  const component = AdmonitionTypes[type];
  if (component) return component;
  console.warn(`No admonition component found for admonition type "${type}". Using Info as fallback.`);
  return AdmonitionTypes.info!;
}
```

E `Admonition/Types.tsx` é o mapa:

```tsx
const admonitionTypes = {note, tip, info, warning, danger};
const admonitionAliases = {                     // "Undocumented legacy admonition type aliases"
  secondary: <Note title="secondary"/>, important: <Info title="important"/>,
  success:   <Tip  title="success"/>,   caution:  Caution,
};
export default {...admonitionTypes, ...admonitionAliases};
```

Cada tipo é uma casca fina sobre `Admonition/Layout` que só escolhe classe do Infima, ícone e título default:

```tsx
// Admonition/Type/Tip.tsx@3.10.2
const infimaClassName = 'alert alert--success';
const defaultProps = {icon: <IconTip />, title: <Translate id="theme.admonition.tip">tip</Translate>};
export default function AdmonitionTypeTip(props) {
  return <AdmonitionLayout {...defaultProps} {...props}
           className={clsx(infimaClassName, props.className)}>{props.children}</AdmonitionLayout>;
}
```

Mapeamento tipo → variante do Infima (do código): `note → alert--secondary`, `tip → alert--success`, `info → alert--info`, `warning → alert--warning`, `caution → alert--warning`, `danger → alert--danger`. Toda admonition é, no fundo, um `.alert` do Infima — logo as 11 variáveis `--ifm-alert-*` re-marcam todas de uma vez.

Dois detalhes de versão: **`caution` está deprecado** (comentário no código: `// TODO remove before v4: Caution replaced by Warning`) — o conteúdo do projeto deve usar `:::warning`, e `:::warning[cuidado]` se quiser o rótulo. E o componente **`Admonition` raiz não tem entrada no swizzle config** — cai no default `unsafe`, exigindo `--danger`. Os pontos seguros para customizar admonition são `Admonition/Layout`, `Admonition/Type/*` e `Admonition/Icon/*`, todos `safe` nas duas ações.

Note também a ordem de props no template: `{...defaultProps}` **antes** de `{...props}`, para o autor poder sobrescrever ícone e título; e `className` **mesclado**, nunca substituído. Uma admonition própria que inverta isso quebra `:::requisito[Título customizado]`.

O `Layout` aplica as classes estáveis:

```tsx
clsx(ThemeClassNames.common.admonition,           // theme-admonition
     ThemeClassNames.common.admonitionType(type), // theme-admonition-<tipo>
     styles.admonition, className)
```

#### Caminho A — sintaxe `:::` com tipo próprio (dois passos, zero dependência)

**1. Registrar a keyword** nas opções do plugin de conteúdo. Do `@docusaurus/mdx-loader@3.10.2`, `src/remark/admonitions/index.ts`:

```ts
export type AdmonitionOptions = {keywords: string[]; extendDefaults: boolean};
export const DefaultAdmonitionOptions = {
  keywords: ['secondary','info','success','danger','note','tip','warning','important','caution'],
  extendDefaults: true,
};
```

```ts
// docusaurus.config.ts
presets: [['classic', {docs: {admonitions: {keywords: ['requisito'], extendDefaults: true}}}]]
```

`extendDefaults: true` (default) **acrescenta** aos nove padrão; `false` substitui — é como se remove tipos indesejados.

Três fatos que a documentação de API não conta:

- **`admonitions` é opção por instância de plugin de conteúdo**, não global. Não existe versão em `siteConfig`. Registrar a keyword em `docs` **não** a registra em `blog` nem em `pages` — cada um precisa da sua declaração.
- **A opção não aparece na tabela de API do `plugin-content-docs`.** Ela existe e é validada (`AdmonitionsSchema`, default `true`), mas está subdocumentada. Só o guia de admonitions a menciona.
- **`:::` é a única sintaxe possível.** A sub-opção `tag` do v2 hoje é `Joi.any().forbidden()`, com a mensagem: *"It is not possible anymore to use a custom admonition tag. The only admonition tag supported is ':::' (Markdown Directive syntax)"*.

**O que acontece se você pular o passo 1:** `remark-directive` roda incondicionalmente, então `:::requisito` vira um `containerDirective` que ninguém consome — o plugin `unusedDirectives` emite um warning de build e **o bloco simplesmente não é renderizado de volta na forma original**. Some do conteúdo.

**2. Mapear tipo → componente**, ejetando `Admonition/Types` (`eject: safe`) — de novo, um objeto, então escrito à mão:

```tsx
// src/theme/Admonition/Types.tsx
import DefaultAdmonitionTypes from '@theme-original/Admonition/Types';
import AdmonitionLayout from '@theme/Admonition/Layout';

function Requisito(props) {
  return <AdmonitionLayout {...props} type="requisito" title={props.title ?? 'Requisito'}
                           className="alert alert--info">{props.children}</AdmonitionLayout>;
}
export default {...DefaultAdmonitionTypes, requisito: Requisito};
```

Sem o passo 2, o tipo cai no fallback `info` com um `console.warn`. Sem o passo 1, `:::requisito` nem vira admonition — o remark não reconhece a directive.

Resultado: `:::requisito` no MDX, com classe estável `theme-admonition-requisito` para estilizar de `custom.css`.

#### Caminho B — componente MDX global (um passo)

Registrar um componente próprio em `MDXComponents` (§5.1) e usar `<Requisito>` em vez de `:::requisito`.

**A diferença que decide:**

| | `:::` (caminho A) | componente global (caminho B) |
| --- | --- | --- |
| Funciona em `.md` puro | **sim** | não |
| Aceita props arbitrárias | não (só `title`) | **sim** |
| Precisa de config em `docusaurus.config` | sim, por instância de plugin | não |
| Herda `Admonition/Layout`, ícone, i18n | **sim** | só se você chamar |
| Conteúdo aninhado complexo | limitado pela directive | **livre** |
| Custo de upgrade | dois pontos de acoplamento | um objeto |

Para o mapa: **`:::` para as variações de aviso** (que são admonitions de verdade e devem herdar layout e i18n) e **componente global para os componentes de conteúdo autorais** — Callout com props, CardGroup, Steps, ParamField. A fronteira coincide com a que o domínio já traça entre chrome e componente de conteúdo.

### 5.3 Vanilla-first: o que custa dependência

| Técnica | Dependência nova |
| --- | --- |
| Registrar componente global em `MDXComponents` | **nenhuma** |
| `admonitions: {keywords, extendDefaults}` | **nenhuma** — o remark plugin vem no `@docusaurus/mdx-loader` |
| Ejetar `Admonition/Types` / `Admonition/Type/*` | **nenhuma** |
| Componentes de conteúdo próprios em `src/components` com CSS Modules | **nenhuma** |
| Diagnóstico de conteúdo com `npx docusaurus-mdx-checker` | **nenhuma** — `npx` não persiste no `package.json` |
| Plugin remark/rehype de terceiros (containers custom, directives extras) | **sim — fora do axioma 2** |
| Importar snippet de código como texto | `raw-loader` — **fora** (e a doc marca o recurso como experimental) |
| Equações matemáticas | `remark-math` + `rehype-katex` — **fora** |
| Mermaid | `@docusaurus/theme-mermaid` — **fora**, e o componente `Mermaid` do classic é um stub sem ele |

Tudo que este documento recomenda cabe no preset `classic` sem instalar nada.

**As duas dependências fantasma.** `clsx` e `@docusaurus/theme-common` existem em `node_modules` porque são dependências do `theme-classic` — importá-las de `src/` **funciona hoje por hoisting** e quebra em silêncio sob `pnpm` estrito ou numa mudança de árvore de dependências. Todo componente ejetado as importa. Duas saídas honestas: declarar as duas explicitamente no `package.json` do site (`clsx` tem ~500 bytes e zero deps transitivas), ou evitá-las em código próprio (`[a, b].filter(Boolean).join(' ')` no lugar de `clsx`). **Declarar é a escolha certa** — o axioma 2 proíbe dependência *nova*, não proíbe tornar explícita uma que já está no grafo. O que ele não tolera é dependência implícita que quebra na máquina de outra pessoa.

### 5.4 MDX v2 → v3: o que muda

O enquadramento vem da própria doc de migração: *"The transition from MDX v1 to MDX v3 is the main challenge to the adoption of Docusaurus v3. **Most breaking changes come from MDX v2, and MDX v3 is a relatively small release.**"* Do lado upstream, o v3 do MDX é essencialmente Node 16+, `baseUrl` obrigatório em `evaluate`/`run`, automatic JSX runtime e renomeações de API — **nada que afete quem escreve conteúdo**.

O que dói é o parser ter ficado estritamente CommonMark + JSX. Como o conteúdo deste projeto nasce em v3, isto é **regra de escrita**, não migração — e importa porque exemplos de API em pt-BR usam `{` e `<` naturalmente:

| Padrão | O que acontece | Saída sem dependência |
| --- | --- | --- |
| `{username: string}` | erro: `Could not parse expression with acorn` | inline code, `&#123;`, ou `\{` |
| `Array<T>`, `versão <5` | erro: tag JSX não fechada | inline code, `&lt;`, ou `\<` |
| `<http://exemplo.com>` | autolink GFM deixou de funcionar | `[texto](url)` — MDX já autolinka literais |
| `AWS re:Invent` | `:` + letra vira *text directive*; o texto **some** | `&#58;`, espaço após `:`, ou `\:` |
| Bloco indentado por 4 espaços | **não é mais code block** — e não dá erro | triple backticks |
| JSX multi-linha com Markdown dentro | ganha um `<p>` extra — e não dá erro | JSX numa linha, ou envolver em `{ }` |
| `<div style="color:red">` | é JSX, não HTML | `style={{color: 'red'}}`, `class` → `className` |
| `**` com espaço ou pontuação adjacente | ênfase não abre/fecha | seguir CommonMark estrito |

Os três casos **sem erro de compilação** (parágrafo extra, code block indentado, ênfase) são os perigosos: passam no build e saem errados.

**As flags de compatibilidade** — `siteConfig.markdown.mdx1Compat`, todas `true` por padrão:

```ts
markdown: { mdx1Compat: { comments: true, admonitions: true, headingIds: true } }
```

- `comments` — permite `<!-- -->`. A doc recomenda migrar para `{/* */}` e desligar.
- `admonitions` — permite `:::note Título` (sintaxe v2) além de `:::note[Título]` (v3). Recomenda-se migrar e desligar.
- `headingIds` — permite `### Título {#id-explicito}`. **Manter ligada:** a doc é explícita — *"We recommend to keep this compatibility option on for now, until we provide a new syntax compatible with newer versions of MDX."* Sem ela, seria preciso escrever `\{#id}` em todo heading com id.

**Ferramentas.** `npx docusaurus-mdx-checker` lista arquivos que falham a compilação — mas *"will only report compilation errors"*, não os três casos silenciosos, para os quais a recomendação é teste de regressão visual. E **Prettier não suporta MDX v3**: as saídas são `{/* prettier-ignore */}` ou `*.mdx` no `.prettierignore`. O Prettier inclusive **corrompe admonitions** (junta `::: note Hello world:::`) — o antídoto é linha vazia antes e depois das diretivas.

---

## 6. Armadilhas de upgrade

### 6.1 Por modo de swizzle

| Risco | `--wrap` | `--eject` |
| --- | --- | --- |
| Componente removido/renomeado | erro de build (import falha) — **ruidoso, bom** | silencioso: seu arquivo continua respondendo pelo alias |
| Props mudam | erro de tipo com `--typescript`; runtime sem TS | idem, mais o risco do interior |
| Interior reescrito upstream | **transparente** | você não recebe |
| Correção de a11y/i18n/perf upstream | **recebe** | **não recebe**, e nada avisa |
| Subcomponente muda contrato | n/a | ejetado importa `@theme/Sub` novo → bug de runtime |
| Rastreabilidade de origem | trivial | **o header de licença é removido no eject** — sem marca de versão |

### 6.2 Disciplinas concretas

1. **Anotar a versão de origem em todo arquivo ejetado.** O eject apaga o cabeçalho; sem anotação, ninguém saberá contra qual versão diffar no upgrade.
2. **Congelar `swizzle --list` como artefato.** Rodar no upgrade e diffar contra a tabela de §4.4 detecta mudança de status (`safe → unsafe`), componente novo e componente removido — antes de qualquer sintoma visual.
3. **Diffar o upstream dos ejetados.** Para cada componente ejetado, comparar `node_modules/@docusaurus/theme-classic/lib/theme/<X>` antes e depois do upgrade. É o único jeito de recuperar as correções perdidas.
4. **`--typescript` mesmo em projeto JS.** `WrapperProps<typeof XType>` transforma mudança de props em erro de build. Sem TS, vira bug de runtime em produção. Bônus: sem `--typescript`, o eject copia o JS transpilado de `lib/`, não o fonte — pior de ler e de manter.
5. **Preferir CSS a swizzle sempre que empatar.** Um override de variável não tem custo de upgrade; um wrapper tem custo baixo; um eject tem custo alto e crescente. A ordem de escolha é variável → classe estável → wrap → eject.
6. **Orçamento explícito de eject.** O número de componentes ejetados é a métrica de dívida de tema do projeto. Vale cravar um teto na spec.

### 6.2.1 A falha silenciosa que mais custa

A doc oficial de swizzling diz, sobre componentes swizzlados:

> Theme authors might have to update their theme over time: changing the component props, name, file system location, types... Moreover, internal components may simply disappear. **If a component is called `Sidebar` and it's later renamed to `DocSidebar`, your swizzled component will be completely ignored.**

Isso **não gera erro**. O alias simplesmente deixa de ser sombreado e o seu arquivo em `src/theme` vira código morto — o site volta ao componente do tema, e a customização some. É por isso que o diff de `swizzle --list` (disciplina 2) vale mais que qualquer teste visual: ele pega a renomeação antes de o sintoma aparecer.

O guia de migração v3 é ainda mais direto sobre a expectativa do projeto — a primeira linha de troubleshooting é: *"In case of any upgrade problem, the first things to try are: (...) **delete all your swizzled components**"*.

### 6.2.2 Evidência: o que já quebrou dentro do v3

Não é hipótese. Do CHANGELOG, dentro de **minors** do v3:

| Versão | Mudança | `@theme/*` atingidos |
| --- | --- | --- |
| 3.2.0 | datas passam a ser formatadas client-side | `BlogPostItem/Header/Info`, `LastUpdated` |
| 3.2.0 | structured data de blog: microdata → JSON-LD | `BlogListPage/StructuredData`, `BlogPostPage/StructuredData` |
| 3.7.0 | wrapper TS gerado passa a retornar `ReactNode` em vez de `JSX.Element` | **o próprio boilerplate de wrap** — wrappers antigos falham type-check |
| 3.8.0 | `CodeBlock` quebrado em componentes menores + `CodeBlockContextProvider` | toda a subárvore `CodeBlock/*` |
| 3.9.0 | copy migra para Clipboard API | `CodeBlock/Buttons/CopyButton` |
| 3.9.0 | `useColorMode()` corrigido para remount do provider | `ColorModeToggle`, `Navbar/ColorModeToggle` |
| 3.10.0 | **`DocCard` dividido** em `Heading/{Icon,Text}`, `Description`, `Layout` | subárvore `DocCard/*` inteira |
| 3.10.0 | **`Tabs` migra para React Context** | `Tabs`, `TabItem` |
| 3.10.0 | linha de code block muda de `<span>` para `<div>` | `CodeBlock/Line` — e todo CSS que dependia do seletor |
| 3.10.0 | hook `useKeyboardNavigation` **removido** | quem ejetou `Layout`/`Layout/Provider` e o importava |
| 3.10.0 | aliases deixam de ser criados para arquivos de teste e `.d.ts` | resolução de `@theme/*` |
| 3.10.0 | `MDXComponents/Li` **adicionado** ao swizzle config | antes era default-unsafe |

Três dos alvos mais óbvios de customização visual — **`CodeBlock`, `Tabs` e `DocCard`** — foram reestruturados dentro de minors do v3. Quem ejetou `CodeBlock` em 3.7 e subiu para 3.8 herdou um componente que já não existe na mesma forma. É exatamente o cenário que a política `unsafe` autoriza.

Note também `3.10.0: CodeBlock/Line <span> → <div>`: **CSS pode quebrar em minor mesmo sem swizzle nenhum**, se ancorado em nome de tag em vez de classe estável. Mais um argumento para a doutrina da §3.

### 6.3 O que muda entre versões

- **Infima está pinado em versão exata** (§0), então a superfície de variáveis só muda com upgrade do Docusaurus. Em compensação, sendo `0.2.0-alpha`, ele não oferece contrato próprio.
- **`ThemeClassNames` é contrato explícito** — *"Please do not modify the classnames! This is a breaking change"*. É a superfície de estilização com a garantia mais forte de todas. CSS ancorado nela é o mais durável do projeto.
- As classes de CSS Module do theme-classic (75 arquivos `styles.module.css`, **zero CSS global próprio**) são hasheadas e **não têm garantia nenhuma**. CSS que dependa de estrutura interna do tema é dívida por construção.
- Há `// TODO Docusaurus v4: remove old classes?` sobre `wrapper.{main,blogPages,docsPages,mdxPages}` em `ThemeClassNames`. **Evitar `main-wrapper`, `docs-wrapper`, `blog-wrapper`, `mdx-wrapper`**; usar `theme-layout-main` e as classes de página (`docs-doc-page` etc.), que são as substitutas.
- Comentários `// TODO Docusaurus v4` marcam APIs legadas de `useColorMode` (`isDarkTheme`, `setLightTheme`, `setDarkTheme`). Código próprio deve usar `colorMode` / `colorModeChoice` / `setColorMode`.

### 6.4 Herança do salto v2 → v3

O atrito de MDX v3 não está no swizzle, e sim no **conteúdo** — ver §5.4, com a tabela de padrões que quebram e as três `mdx1Compat`. Como o conteúdo deste projeto nasce em v3, é regra de escrita, não migração.

---

### 6.5 Duas armadilhas fora do swizzle, verificadas em código

**`postBuild` não roda em `docusaurus start`.** O lifecycle é invocado num único lugar — `@docusaurus/core@3.10.2`, `src/commands/build/buildLocale.ts`:

```ts
// Plugin Lifecycle - postBuild.
await PerfLogger.async('postBuild()', () => executePluginsPostBuild({plugins, props, collectedData}));
```

Nada em `src/commands/start/` o invoca. Qualquer verificação, geração de artefato ou checagem de link escrita em `postBuild` é **invisível no loop de desenvolvimento** e só aparece no `build`.

**E o dev server devolve 200 para qualquer rota.** `src/commands/start/webpack.ts`:

```ts
historyApiFallback: {
  rewrites: [{from: /\/*/, to: baseUrl}],
},
```

O padrão `/\/*/` casa com **todo** caminho. Em `docusaurus start`, uma rota inexistente não dá 404 do servidor: devolve **200 com o shell da SPA**, e o roteador client-side é que renderiza o componente de 404 depois da hidratação.

As duas juntas formam uma armadilha silenciosa: um link quebrado **parece funcionar** em desenvolvimento (200) e a checagem que o pegaria não roda em desenvolvimento (`postBuild`). Consequência prática para o projeto: **verificação de link e de rota é portão de `build`, nunca de `start`** — e qualquer smoke test que use `curl -o /dev/null -w '%{http_code}'` contra o dev server é inútil por construção; tem que inspecionar o HTML, ou rodar contra `docusaurus build && docusaurus serve`.

---

## 7. A pergunta nova: quanto do chrome do Mintlify o Docusaurus vanilla alcança

Contexto medido por outra pesquisa: FastMCP, Devin, Perplexity e Trigger.dev servem o **mesmo CSS do Mintlify, byte a byte** — quatro das sete referências são, visualmente, um produto só. E é esse o chrome que o projeto quer replicar. A pergunta deixa de ser "o que dá para customizar" e vira **"o que separa o theme-classic desse alvo específico, e quanto custa cada passo"**.

O quadro abaixo cruza cada peça do chrome com a tabela medida em §4.4. A coluna que importa é a última.

| Peça do chrome | Alavanca no Docusaurus | Nível | Custo |
| --- | --- | --- | --- |
| **Ícone por item de sidebar** | `className` por item em `sidebars.ts` + `::before` com `mask-image` | **sem swizzle** | baixo |
| **Agrupamento/seção na sidebar** | categorias nativas + `type: 'html'` para cabeçalho de grupo | **sem swizzle** | baixo |
| **Hierarquia visual por profundidade** | `theme-doc-sidebar-item-{link,category}-level-<n>` (classe estável) | **sem swizzle** | baixo |
| **Cor/tipografia/densidade da sidebar** | `--ifm-menu-*` (8 vars) + `--doc-sidebar-width` | **sem swizzle** | baixo |
| **Bloco acima da nav da sidebar** (troca de seção, versão, busca) | `DocSidebar` — **`wrap: safe`** | **wrap** | baixo |
| **Navbar: itens, CTA, dropdown, HTML arbitrário** | `themeConfig.navbar.items` com `type: 'html'`, `className`, `custom-*` | **sem swizzle** | baixo |
| **Navbar: altura, cor, sombra, estados de link** | `--ifm-navbar-*` (15 vars) | **sem swizzle** | baixo |
| **Toggle de tema com desenho próprio** | `ColorModeToggle`, `Icon/LightMode`, `Icon/DarkMode` — todos **safe** | wrap/eject | baixo |
| **Busca com UI própria** | `SearchBar` — **safe nas duas ações** (é um placeholder vazio por default) | wrap/eject | baixo |
| **TOC: cor, borda, espaçamento** | `--ifm-toc-*` + `.table-of-contents__link` + `theme-doc-toc-desktop` | **sem swizzle** | baixo |
| **TOC: profundidade de heading** | `themeConfig.tableOfContents.{min,max}HeadingLevel` | **sem swizzle** | baixo |
| **Admonitions/callouts com desenho próprio** | `--ifm-alert-*` + `Admonition/Layout` e `Type/*` (**safe**) | wrap/eject | baixo |
| **Cards, Steps, CodeGroup, ParamField** | componentes próprios via `MDXComponents` (§5.1) | **sem swizzle** | baixo |
| **Breadcrumb como eyebrow** | `DocBreadcrumbs` → **`unsafe`**; só `.breadcrumbs__*` + `theme-doc-breadcrumbs` para estilo | CSS ou `--danger` | **médio** |
| **Navbar: reposicionar busca / reestruturar layout** | `Navbar/*`, `NavbarItem/*` → **todos `unsafe`** | `--danger` | **médio** |
| **TOC: estrutura nova** (barra de progresso, seções extras) | `TOC`, `TOCItems`, `DocItem/TOC/Desktop` → **`unsafe`** | `--danger` | **médio** |
| **Largura da coluna de leitura** | sem variável; `max-width: 75% !important` em classe hasheada (§3.4) | CSS estrutural ou eject `unsafe` | **médio** |
| **Injetar qualquer coisa no corpo da página de doc** | `DocItem/Layout`, `DocItem/Content` → **`unsafe`** | `--danger` | **alto** |
| **Reestruturar o grid da página de doc** | `DocRoot/Layout/*`, `DocItem/Layout` → **`unsafe`** | eject `--danger` | **alto** |
| **Breakpoint diferente de 996/997px** | compilado no CSS (§1.8) | reescrever media queries | **alto** |

### 7.1 O achado central

**Não existe um único ponto `safe` dentro de uma página de doc.** `DocItem/Layout`, `DocItem/Content`, `DocItem/Footer`, `DocItem/TOC/*`, `DocBreadcrumbs`, `DocRoot/Layout/*` — nenhum aparece nas 55 entradas do `getSwizzleConfig`, todos caem no default `unsafe` (§4.4). A confirmação é direta: o config declara nível para **55 componentes**, e nenhum deles pertence à árvore de renderização de uma página de doc, exceto `DocSidebar` (wrap) e `DocCardList`.

Traduzindo: **tudo que o Mintlify põe dentro da página** — eyebrow acima do título, bloco de metadados, "foi útil?" no rodapé, CTA lateral, qualquer coisa entre o breadcrumb e o corpo — exige `--danger` no Docusaurus vanilla. É a fronteira mais dura que esta pesquisa encontrou, e ela não é contornável por CSS: não se injeta nó no DOM por folha de estilo.

Duas escapatórias parciais, ambas com preço:

- **`src/theme/Root.tsx`** (§2.3) alcança o app inteiro sem swizzle, mas não sabe onde está o corpo da doc — serve para overlay e provider, não para inserir no fluxo.
- **MDX** alcança o corpo, mas por página: um componente no topo/rodapé de cada arquivo, ou um snippet importado. Sem swizzle, mas exige disciplina de autoria em todo arquivo — o que o conteúdo mockado deste projeto pode absorver, e um site real com centenas de páginas, não.

### 7.2 A boa notícia, que é maior do que parece

Quase todo o **contorno** do chrome é alcançável barato. Sidebar com ícones e agrupamento — a assinatura visual mais reconhecível do Mintlify — sai inteira de `className` + CSS, **sem swizzle nenhum**, porque `className` e `customProps` estão no schema base de todo item de sidebar (`plugin-content-docs@3.10.2`, `src/sidebars/validation.ts`) e no `_category_.json`. `DocSidebarItem/Link` aplica esse `className` no `<li>`, o que dá um gancho estável por item:

```ts
// sidebars.ts
{type: 'doc', id: 'quickstart', className: 'si-rocket'}
```

```css
/* custom.css */
.si-rocket > .menu__link::before {
  content: ''; width: 1rem; height: 1rem; margin-right: .5rem;
  background: currentColor; mask: url('/img/icons/rocket.svg') center/contain no-repeat;
}
```

`mask` + `currentColor` faz o ícone herdar cor de estado (ativo, hover, dark) de graça — sem SVG duplicado por tema, e sem tocar em componente.

Note que **`customProps` não serve para isso**: ele só é legível de dentro de um componente swizzlado. Para estilo, `className` é o gancho certo; `customProps` só se justifica quando já se está pagando swizzle por outro motivo.

### 7.3 A leitura estratégica para o mapa

A distância até o alvo se separa em três faixas, e a proporção é favorável:

1. **Cor, tipografia, densidade, ícone, agrupamento, navbar, footer, callout, componentes de conteúdo** — variável, classe estável e `className`. **Sem swizzle.** É a maior parte da percepção visual.
2. **Sidebar com bloco próprio, toggle, busca, admonition, code block** — `wrap` em componente `safe`. Custo de upgrade baixo e ruidoso.
3. **Estrutura interna da página de doc, navbar reestruturada, TOC com anatomia nova, largura de leitura** — `unsafe`. Cada item é uma decisão de dívida explícita, com diff obrigatório a cada minor (§6.2.2 mostra que `CodeBlock`, `Tabs` e `DocCard` já foram reestruturados dentro do v3).

O que isso sugere para a spec: **cravar a faixa 3 como orçamento fechado e pequeno**, decidido item a item, e resolver o máximo possível nas faixas 1 e 2. A assimetria que o mapa já postulou — chrome se entorta, conteúdo se autora — sobrevive ao encontro com o alvo real: o que o Mintlify faz de mais visível na sidebar é alcançável por CSS, e o que ele faz dentro da página é justamente onde o Docusaurus cobra caro.

---

## 8. O que isto fecha para o mapa

**Fronteira 1 — variável.** Cor, raio, sombra, espaçamento base, ritmo vertical, altura de navbar, largura de sidebar, cor de código destacado: `custom.css` em `:root`, sem seletor, sem custo de upgrade. A arquitetura de tokens do axioma 3 mora aqui, e a skin trocável é literalmente um arquivo do array `customCss`.

**Fronteira 2 — classe estável.** Chrome que precisa de regra e não tem variável: classes do Infima (287) e `ThemeClassNames` (o único contrato explícito). Escopo por seção via `html.<page-class>`. `theme-doc-sidebar-item-*-level-<n>` resolve hierarquia de sidebar sem swizzle.

**Fronteira 3 — wrap.** Injeção, envelopamento e transformação de props em componentes `safe`. Footer inteiro, `DocSidebar`, `ColorModeToggle`, ícones, `SkipToContent`, `CodeBlock`, `DocCardList`, `NotFound`, `SearchBar`. Mais `src/theme/Root.tsx`, que não é nem swizzle.

**Fronteira 4 — objeto.** `MDXComponents`, `Admonition/Types`, `NavbarItem/ComponentTypes`, `prism-include-languages`: `eject: safe` mas custo real de wrap, porque nenhuma implementação é copiada. É onde os componentes de conteúdo autorais entram no MDX.

**Fronteira 5 — eject `unsafe`.** Tudo o mais do chrome. Navbar, TOC, `DocItem/Layout`, breadcrumbs, paginação, e **toda a árvore de uma página de doc**. Cada um é uma decisão de dívida explícita, com diff de upgrade obrigatório a cada minor. **173 dos 220 componentes vivem aqui.**

**Fora do alcance sem sair do preset:** breakpoints (996/997 compilados), tipografia fluida, tokens de foco, elevação em dark, e qualquer coisa que exija plugin remark/rehype de terceiros.

**As três decisões que este documento coloca na mesa do mapa:**

1. **Qual é o orçamento de `unsafe`.** A faixa 3 da §7.3 é onde mora o custo de manutenção do projeto inteiro. Um teto numérico na spec (ex.: no máximo N componentes `unsafe`, nomeados) transforma dívida difusa em decisão registrada.
2. **O que acontece dentro da página de doc.** Não há ponto `safe` ali (§7.1). Se a spec quiser eyebrow, bloco de feedback ou CTA lateral, isso é `--danger` ou disciplina de MDX por arquivo — e a escolha precisa ser explícita, porque as duas têm custo permanente.
3. **Foco e elevação em dark.** Duas lacunas do Infima que o axioma 4 torna obrigatórias (§1.8). Não são customização; são preenchimento de buraco, e precisam de token próprio na arquitetura de tokens desde o primeiro dia.

---

## Fontes

Pacotes publicados no npm, lidos localmente via `npm pack` (todos em 3.10.2, salvo o Infima):

- `@docusaurus/theme-classic@3.10.2` — `src/index.ts`, `src/options.ts`, `src/getSwizzleConfig.ts`, `src/inlineScripts.ts`, `src/theme/**` (211 componentes, 75 `styles.module.css`)
- `@docusaurus/core@3.10.2` — `src/commands/swizzle/{actions,components,config,common}.ts`, `src/commands/cli.ts`, `src/commands/build/buildLocale.ts`, `src/commands/start/webpack.ts`, `src/webpack/aliases/index.ts`, `src/client/theme-fallback/**`
- `@docusaurus/theme-common@3.10.2` — `src/utils/ThemeClassNames.ts`, `src/contexts/colorMode.tsx`, `src/components/Details/**`
- `@docusaurus/mdx-loader@3.10.2` — `src/remark/admonitions/index.ts`
- `@docusaurus/plugin-content-docs@3.10.2` — `src/sidebars/validation.ts`
- `infima@0.2.0-alpha.45` — `dist/css/default/default.css` (3.054 linhas, o artefato realmente servido) e `styles/**/*.pcss` (39 arquivos-fonte)

Documentação oficial (docusaurus.io/docs): Styling and Layout, Swizzling, Themes configuration, `preset-classic`, `plugin-content-docs`, Markdown features (React, Admonitions), Migration to v3, Static site generation.

Upstream MDX: `mdxjs.com/blog/v3/`, `mdxjs.com/migrating/v3/`, `mdxjs.com/docs/troubleshooting-mdx/`.

`CHANGELOG.md` do `facebook/docusaurus` — releases 3.0.0 a 3.10.2, para a tabela de quebras em minor (§6.2.2).

Registro npm: `registry.npmjs.org/@docusaurus/{core,theme-classic}` e `registry.npmjs.org/infima` para versão estável, datas de publicação e árvore de dependências.
