# Chrome e arquitetura de informação das sete referências

> Pesquisa da issue [#2](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/2).
> Coleta: **2026-08-04**, contra os sites em produção.

## Sumário executivo

**Quatro das sete referências são Mintlify** (FastMCP, Devin, Perplexity, Trigger.dev), e as quatro
servem **o mesmo CSS byte a byte** — mesmo MD5, 436 KB, em hosts diferentes. Vapi é **Fern**;
Neon e Clerk são Next.js autorais.

Como o alvo estético do projeto são justamente FastMCP, Devin e Perplexity, a pergunta útil deixa de
ser "como cada site é" e passa a ser **"se o CSS é idêntico, o que sobra para customizar?"**.

A resposta, medida: **17 variáveis CSS injetadas inline**. É isso. Três cores de marca, duas de
fundo, **onze degraus de cinza** e uma de tooltip. Fora disso há só dois escapes — trocar a família
tipográfica e injetar CSS próprio.

E o achado que mais importa para a spec: **a rampa de cinza é tingida com o matiz da marca**.
Não é um cinza neutro compartilhado — cada site recebe onze degraus derivados da sua cor primária.
FastMCP puxa para o violeta, Devin para o azul, Trigger.dev para o verde, e a Perplexity — cuja
marca é acromática — recebe cinza puro (spread 0). **Essa é a arquitetura de tokens a replicar**,
e ela cabe inteira no Infima do Docusaurus.

---

## Como isto foi medido

Cada afirmação tem uma fonte que a possui, nesta ordem de confiança:

1. **Headers HTTP e HTML servido** — `curl` contra a URL de produção.
2. **CSS servido** — download dos bundles e leitura das regras.
3. **JS servido** — 38 chunks baixados, para o que só existe em runtime.
4. **Config de primeira mão** — `docs.json` nos repos públicos e o `docsConfig` embutido no RSC.
5. **Documentação oficial da plataforma** — para separar default de customização.

**Não havia navegador nesta sessão.** Portanto **não foram medidos**: computed styles, scroll-spy,
comportamento de sticky em movimento, colapso de grupo, animação, e o modal de busca aberto.
Onde isso aparece, está escrito **`não medido`**. Nenhum número aqui é estimativa.

Conversão `1rem = 16px`, **verificada**: o bundle do Mintlify não declara `font-size` em
`:root`/`html`; o do Fern declara `html{font-size:var(--text-base)}` com `--text-base: 1rem`.

---

## 1. Quem é Mintlify, e a prova de que é um build só

| Referência | Plataforma | Evidência primária |
| --- | --- | --- |
| **FastMCP** | **Mintlify** | `x-mintlify-client-version: 0.0.3395`; `<meta name="generator" content="Mintlify"/>` |
| **Devin** | **Mintlify** | idem |
| **Perplexity** | **Mintlify** | idem |
| **Trigger.dev** | **Mintlify** | idem, servido por Cloudflare com basePath `/docs` |
| **Vapi** | **Fern** | `<meta name="generator" content="https://buildwithfern.com"/>`; classes `fern-*` |
| **Neon** | Next.js autoral | `x-nextjs-prerender: 1`, **sem** `meta generator` |
| **Clerk** | Next.js autoral | `x-powered-by: Next.js`, **sem** `meta generator` |

Os quatro Mintlify carregam `a2c16a79b30ca688.css` e `a336fa455c02e881.css`. Baixados de dois
domínios distintos, são byte-idênticos:

| Arquivo | `gofastmcp.com` | `trigger.dev` |
| --- | --- | --- |
| `a2c16a79b30ca688.css` (4 KB) | `c7e1d31ed09ce7762776a23c61bb82b9` | `c7e1d31ed09ce7762776a23c61bb82b9` |
| `a336fa455c02e881.css` (436 KB) | `1c16329d6f2dc8a91cbf4ebf84b53360` | `1c16329d6f2dc8a91cbf4ebf84b53360` |

FastMCP, Devin e Perplexity compartilham até o mesmo projeto Vercel
(`prj_NdMUpHpUIb41Po1H8c6hrChv2bgr`).

O eixo de escolha que o Mintlify oferece são **nove temas nomeados**
([mintlify.com/docs/themes](https://mintlify.com/docs/themes)): Mint, Maple, Palm, Willow, Linden,
Almond, Aspen, Sequoia, Luma. Os quatro usam três (`data-docs-theme` no `<html>`):
**`almond`** (FastMCP, Perplexity), **`mint`** (Devin), **`maple`** (Trigger.dev).

---

## 2. O chrome do Mintlify, medido

Tudo desta seção sai de `a336fa455c02e881.css` e do HTML servido.

### 2.1 Anatomia: os elementos nomeados

O Mintlify expõe o chrome por **ID estável** — é a lista de peças a reproduzir em Docusaurus:

`#navbar` · `#banner` · `#sidebar` · `#sidebar-content` · `#navigation-items` ·
`#content-container` · `#content-area` · `#content` · `#content-side-layout` (TOC) ·
`#header` (bloco do título) · `#page-title` · `#page-context-menu` · `#pagination` · `#footer` ·
`#search-bar-entry` · `#assistant-entry` · `#chat-assistant-sheet`

E os componentes de conteúdo por `data-component-part`: `card-title`, `card-icon`, `card-image`,
`callout-icon`, `callout-content`, `field-name`, `field-meta`, `field-info-pill`, `code-block-root`,
`code-group-tab-bar`, `code-group-tab-content`, `pagination-title`, `pagination-label`,
`scroll-area-viewport`.

### 2.2 Navbar

- `<header id="navbar">`, `z-30`.
- **Posicionamento diverge por tema:** `almond` é `fixed top-0`; `mint` é `fixed lg:sticky top-0`
  (vira sticky a partir de 1024px); `maple` **não tem navbar** — o elemento existe, é
  `class="z-45 hidden"` e está **vazio**, com toda a navegação na sidebar.
- **Altura:** o token `--mintlify-slot-header-height` **não tem valor único** — o bundle carrega
  cinco fallbacks (`3.5rem` 21×, `4rem` 14×, `7rem` 13×, `6rem` 12×, `3rem` 8×), por tema e
  contexto. O valor efetivo em runtime **não foi medido**. Do HTML servido dá para cravar:

  | Site | Composição do topo |
  | --- | --- |
  | FastMCP (`almond`) | fallback `3.5rem` = **56px**, sem faixa de tabs |
  | Perplexity (`almond`) | `3.5rem` = 56px, e `7rem` = **112px** onde há tabs (tem 3 tabs, 8 `role=tablist`) |
  | Devin (`mint`) | `calc(4rem + var(--topbar-tabs-height))` = 64 + **48** = **112px** (o site injeta `--topbar-tabs-height: 3rem`) |
  | Sequoia (no CSS) | `3rem` = 48px, `6rem` = 96px com tabs |

  Em resumo: **topo de 48–64px, dobrando para 96–112px quando há linha de tabs.**
- `almond` encolhe o navbar quando o painel de IA abre:
  `style="width:calc(100% - var(--assistant-sheet-width, 0px))"`.
- Comportamento no scroll (esconder/encolher): **não medido**.

### 2.3 Banner

`--banner-height: 2.5rem` = **40px** (default), vira `0px` quando ausente. Estado em
`data-banner-state` no `<html>`. Devin e Trigger.dev injetam `--banner-height: 0px!important`
(desligam). FastMCP e Perplexity tinham banner ativo na coleta.

### 2.4 Sidebar

| | FastMCP / Perplexity (`almond`) | Devin (`mint`) | Trigger.dev (`maple`) |
| --- | --- | --- | --- |
| Elemento | `#sidebar-content` | `#sidebar` | `#sidebar` |
| Largura | **`16.5rem` = 264px** | **`18rem` = 288px** | **`19rem` = 304px** |
| Posição | `fixed`, `left-0 bottom-0` | `sticky self-start shrink-0` | `fixed left-0 top-0 bottom-0` |
| Topo | `calc(header + banner)` | `calc(4rem + tabs)` = 112px | `top-0` (não há navbar) |
| Altura | `calc(100vh - header - banner)` | `calc(100dvh - 112px)` | `top-0 bottom-0` |
| Borda | — | — | `border-r` |
| Compensação no conteúdo | `lg:ml-66` (=16.5rem) | — | `lg:ml-[19rem]` |

- **Visibilidade:** `hidden … lg:flex` / `lg:block` → a sidebar só existe **a partir de 1024px**.
  Abaixo é drawer mobile; anatomia do drawer **não medida**.
- **Agrupamento:** vem do `docs.json` (`group` dentro de `tab`/`dropdown`/`version`). Ícones são
  opcionais por grupo/dropdown.
- **Indentação por nível** (medida em `gofastmcp.com/servers/tools`, `style="padding-left"` inline):
  **1rem (16px)** em 54 links, **2rem (32px)** em 9, **1.75rem (28px)** em 4.
- **Indicador de ativo — medido**, vem no SSR:

  | | Ativo | Inativo |
  | --- | --- | --- |
  | Atributo | `aria-current="page"` | — |
  | Fundo | `bg-primary/10` · `dark:bg-primary-light/10` — **10% da primária** | transparente; hover `bg-gray-600/5` · `dark:bg-gray-200/5` |
  | Texto | `text-primary` · `dark:text-primary-light` | `text-gray-700` · `dark:text-gray-400` |
  | Peso | **falso-negrito via `text-shadow`** | normal |

  O truque merece registro: `[text-shadow:-0.2px_0_0_currentColor,0.2px_0_0_currentColor]` engorda
  o glifo **sem** mudar a métrica da fonte, então o item ativo não desloca o layout da sidebar.
  Barato de reproduzir em Docusaurus e resolve um problema real de swizzle.

  Geometria comum: `rounded-xl` (raio 12px), `py-1.5` (6px), `pr-3` (12px), `outline-offset-[-1px]`.
- Colapso/expansão de grupo: **não medido**.

### 2.5 TOC à direita

- Elemento `#content-side-layout`.
- Classes: `hidden xl:flex self-start sticky xl:flex-col max-w-[28rem]`.
- **Só existe a partir de `xl` = 1280px.** Largura máxima **`28rem` = 448px**. É `sticky`.
- Offsets divergem porque dependem da composição do topo de cada site:
  Devin `h-[calc(100vh-9.5rem)] top-[9.5rem]`; Perplexity `h-[calc(100vh-6.5rem)] top-0`;
  Trigger.dev `h-[calc(100vh-4rem)] top-[2.5rem]`.
- Profundidade de heading e scroll-spy: **não medidos** (conteúdo hidratado).

### 2.6 Grid e largura de prosa

O achado desta seção foi **provado no mesmo site, no mesmo tema**:

> **A coluna de prosa encolhe quando o TOC existe.**
> `gofastmcp.com/getting-started/welcome` — sem `#content-side-layout` → `#content-area` é `max-w-3xl`.
> `gofastmcp.com/servers/tools` — com `#content-side-layout` → `#content-area` é `max-w-xl`.

Resolvendo contra a escala do bundle (`--container-xl: 36rem`, `--container-2xl: 42rem`,
`--container-3xl: 48rem`):

| Página | Classe | Prosa |
| --- | --- | --- |
| FastMCP `/getting-started/welcome` (sem TOC) | `max-w-3xl` | **768px** |
| FastMCP `/servers/tools` (com TOC) | `max-w-xl` | **576px** |
| Perplexity `/docs/getting-started/quickstart` | `max-w-xl` | **576px** |
| Trigger.dev `/docs/realtime/overview` | `max-w-xl`, `2xl:max-w-2xl` | **576px**, **672px** ≥1536px |
| Devin `/get-started/devin-intro` | `xl:w-[calc(100%-28rem)]` | **fluida**, descontando o TOC |

Duas filosofias dentro da mesma plataforma: `almond` e `maple` **fixam** a prosa; **`mint` a deixa
fluida** e apenas reserva a faixa do TOC.

**Gutters e padding** (`almond`, Perplexity): `px-8 pt-8 lg:pt-12 lg:px-16` → **32px** lateral no
mobile, **64px** a partir de 1024px; topo 32 → 48px.
Marca do `almond`: o conteúdo vive **dentro de um cartão** —
`rounded-2xl bg-background-light dark:bg-background-dark border border-gray-200/70 dark:border-white/[0.07]`.
Em `maple` não há cartão: `pt-40 px-4 lg:pt-10 lg:pl-16 lg:pr-10`.

Outros tokens: `--page-padding` alterna **16 / 20 / 32px**; `max-w-8xl` = **92rem = 1472px**
(largura máxima do shell); `--assistant-sheet-width` comprime tudo quando o painel de IA abre.

**Breakpoints** (ocorrências no CSS compartilhado): 640px (10×), 768px (4×), 1024px (6×),
1280px (4×), 1536px (2×), mais dois customizados em **1650px** e **2100px**.

| Breakpoint | O que muda |
| --- | --- |
| **1024px** (`lg`) | **entra a sidebar**; padding lateral 32 → 64px; paginação vira 2 colunas |
| **1280px** (`xl`) | **entra o TOC**; a prosa passa a dividir espaço com o rail de 448px |
| **1536px** (`2xl`) | `maple` alarga a prosa de 576 → 672px |
| 1650px / 2100px | ajustes de folga em telas muito largas (efeito específico **não medido**) |

### 2.7 Breadcrumbs, cabeçalho de página, paginação, footer

- **Breadcrumb visual: não existe.** `BreadcrumbList` aparece só como **JSON-LD** (SEO); não há
  seletor de breadcrumb no CSS. O papel de "onde estou" é da **eyebrow** — uma linha acima do H1 com
  o nome do grupo: `class="eyebrow h-5 text-primary dark:text-primary-light text-sm font-semibold"`.
  *(Contraste: o Fern tem breadcrumb visual de verdade — seção 5.)*
- **Cabeçalho de página** (`#header`): eyebrow + `h1#page-title`
  (`text-3xl sm:text-4xl tracking-tight font-semibold` → **30px**, **36px** ≥640px)
  + `#page-context-menu` ("Copy page"), que aparece só em container ≥520px
  (`@[520px]/page-header:flex` — **container query**, não media query).
- **Paginação** (`#pagination`): `<nav aria-label="Pagination" class="grid lg:grid-cols-2 gap-4">`.
  Uma coluna até 1024px, duas acima. Cada lado é cartão `border rounded-xl py-3 px-4` com
  `pagination-title` e `pagination-label`.
- **Footer** (`#footer`): `flex gap-12 justify-between pt-10 border-t pb-28`. Conteúdo do `docs.json`
  (`footer.socials`; Trigger.dev também usa `footer.links`).

### 2.8 Busca

- Entrada: `<button id="search-bar-entry" aria-label="Open search">` com lupa 18×18 (`size-4`),
  idêntica nos quatro; mais `#search-bar-entry-mobile`.
- **O motor é do próprio Mintlify.** Endpoints verbatim nos chunks:
  `/_mintlify/api/search` (autenticado) e `/_mintlify/api-public/search/{subdomain}` (público).
- O código **suporta Algolia como provedor alternativo** (ramos `"algolia" !== e`). Nenhum dos quatro
  usava Algolia na coleta.
- **O assistente de IA é entrada separada da busca**: `#assistant-entry` abre `#chat-assistant-sheet`
  (painel lateral, largura em `--assistant-sheet-width`). Há inclusive um
  `data-page-mode="assistant"` que troca a página inteira por um chat.
- **Atalho de teclado: não medido.** Não há `<kbd>` com a tecla no HTML servido, e não localizei nos
  chunks minificados uma associação `metaKey`+`"k"` que se possa citar sem chutar.
- Anatomia do modal aberto e do resultado: **não medidos**.

> **Nota de método.** Um grep por `trieve` nos chunks do Mintlify devolve 5 ocorrências — **todas
> são `retrievedAt`**. Não há Trieve aqui. Registrado porque é o tipo exato de falso positivo que
> vira "fato" quando se copia write-up de terceiro.

---

## 3. Onde FastMCP, Devin e Perplexity divergem entre si

Se o CSS é idêntico, **toda** divergência é configuração, tema e conteúdo. Mapear isso é mapear a
superfície de customização real — que é o que precisa ser replicado em Docusaurus.

### 3.1 O contrato: 17 variáveis injetadas inline

Extraídas dos blocos `<style>` do HTML servido. Presentes nos quatro, com valores diferentes:

| variável | FastMCP | Devin | Perplexity | Trigger.dev |
| --- | --- | --- | --- | --- |
| `--primary` | `#2D00F7` | `#317CFF` | `#121516` | `#A8FF53` |
| `--primary-light` | `#4CC9F0` | `#317CFF` | `#F7F7F8` | `#A8FF53` |
| `--primary-dark` | `#F72585` | `#317CFF` | `#121516` | `#A8FF53` |
| `--background-light` | `#EEEEEE` | `#FCFCFC` | `#F7F7F8` | `#FFFFFF` |
| `--background-dark` | `#222831` | `#141414` | `#121516` | `#121317` |
| `--gray-50` | `#F4F2FA` | `#F4F6FA` | `#F3F3F3` | `#F7FAF5` |
| `--gray-100` | `#EFEEF5` | `#EFF1F5` | `#EEEEEE` | `#F3F5F0` |
| `--gray-200` | `#DFDEE6` | `#DFE2E6` | `#DFDFDF` | `#E3E6E1` |
| `--gray-300` | `#CFCED5` | `#CFD1D5` | `#CECECE` | `#D3D5D0` |
| `--gray-400` | `#9F9EA6` | `#A0A2A6` | `#9F9F9F` | `#A3A6A1` |
| `--gray-500` | `#716F77` | `#717377` | `#707070` | `#757772` |
| `--gray-600` | `#514F57` | `#515357` | `#505050` | `#555752` |
| `--gray-700` | `#3F3E46` | `#404246` | `#3F3F3F` | `#434641` |
| `--gray-800` | `#26252C` | `#26292D` | `#252526` | `#2A2D27` |
| `--gray-900` | `#18161E` | `#181A1E` | `#171717` | `#1B1E19` |
| `--gray-950` | `#0B0A11` | `#0B0D11` | `#0A0A0A` | `#0F110C` |
| `--tooltip-foreground` | `#FFFFFF` | `#FFFFFF` | `#FFFFFF` | `#000000` |

Os valores são servidos como **triplas RGB separadas por espaço** (`45 0 247`), o que permite
`rgb(var(--primary) / 10%)` — é assim que o fundo do item ativo da sidebar (`bg-primary/10`) funciona
sem precisar de uma segunda variável. **Esse padrão é diretamente transplantável para o Infima.**

### 3.2 O achado: a rampa de cinza é tingida pela marca

Os onze cinzas **não** são compartilhados. Medindo o desvio R/G/B do degrau central:

| Site | `--gray-500` | Spread | Matiz | Primária |
| --- | --- | --- | --- | --- |
| FastMCP | `rgb(113,111,119)` | 8 | puxa **azul/violeta** | `#2D00F7` (violeta) |
| Devin | `rgb(113,115,119)` | 6 | puxa **azul** | `#317CFF` (azul) |
| Trigger.dev | `rgb(117,119,114)` | 5 | puxa **verde** | `#A8FF53` (lima) |
| **Perplexity** | `rgb(112,112,112)` | **0** | **neutro puro** | `#121516` (acromática) |

A rampa é derivada do matiz da primária. Onde a marca é acromática, a rampa sai neutra.
**É a arquitetura de tokens do axioma 3 funcionando em produção**: uma cor de marca entra, um sistema
inteiro de superfícies sai — e trocar a marca re-marca a doc inteira sem tocar em layout.

### 3.3 Os dois escapes além do contrato

Contagem de variáveis inline **além** das 17:

| Site | Extras | O que são |
| --- | --- | --- |
| Devin | **2** | `--banner-height: 0px!important`, `--topbar-tabs-height: 3rem` |
| FastMCP | **4** | fonte (`--font-family-body-custom`, `--font-family-headings-custom` = **Google Sans**) + 2 de cor |
| Trigger.dev | **23** | banner off + **paleta Shiki completa** (`--shiki-token-keyword`, `-function`, `-string`, …) |
| Perplexity | **44** | fonte (**GT Standard**, peso 300) + sistema próprio de badges `--cb-*` por API + URLs de assets |

Ou seja, os escapes são exatamente dois:

1. **Tipografia** — `--font-family-{body,headings}-custom` e `--font-weight-*-custom`.
   FastMCP usa Google Sans; Perplexity, GT Standard 300 auto-hospedada; Devin e Trigger.dev ficam no
   default da plataforma (**Inter** + **paperMono**, carregadas pelas classes
   `inter_1d81deff-module__…` / `papermono_89c757f2-module__…` no `<html>` dos quatro).
2. **CSS próprio** — para o que o contrato não cobre: tema de syntax highlight (Trigger.dev) e
   vocabulário visual de domínio (os badges `--cb-agent-api-*`, `--cb-search-api-*`,
   `--cb-embeddings-api-*` da Perplexity, um par bg/fg por família de API).

### 3.4 Divergência estrutural entre os três preferidos

| | FastMCP (`almond`) | Perplexity (`almond`) | Devin (`mint`) |
| --- | --- | --- | --- |
| Sidebar | `#sidebar-content`, **264px**, `fixed` | `#sidebar-content`, **264px**, `fixed` | `#sidebar`, **288px**, `sticky` |
| Topo | 56px, sem tabs | 56px + tabs (112px) | 64px + tabs 48px = **112px** |
| Conteúdo | **fixo** 768/576px | **fixo** 576px | **fluido** `calc(100% - 28rem)` |
| Cartão no conteúdo | sim (`rounded-2xl` + borda) | sim | não |
| Navbar no scroll | `fixed` | `fixed` | `fixed lg:sticky` |
| Eixo de navegação | **versions** → dropdowns | **anchors globais + tabs** | **languages** → tabs |
| Aparência | `system`, não estrito | (default) | (default) |

**A decisão que a medição não resolve:** FastMCP e Perplexity usam o mesmo tema (`almond`) e mesmo
assim entregam páginas com larguras de prosa diferentes (768 vs 576px), porque uma tem TOC e a outra
não. E Devin, no `mint`, abandona a largura fixa. **Escolher entre prosa fixa e prosa fluida é
chamada explícita nossa** — os três preferidos não concordam entre si.

### 3.5 Arquitetura de informação: quatro eixos diferentes

Mesma plataforma, mesmo schema, quatro estruturas de topo incompatíveis:

- **FastMCP — eixo versão.**
  `versions (3)` → `dropdowns` (Documentation [book], SDK Reference [code]) → `groups`
  (Get Started 4, Servers 8, Apps 7, Clients 6, Integrations 5, More 6).
- **Devin — eixo idioma, depois produto.**
  `languages (7: de, en, es, fr, it, ja, zh)` → `tabs (7: Cloud, API, CLI, Desktop, Enterprise,
  Federal, Use Cases)` → `groups (11)`. É o único dos sete com **localização real** de primeira classe.
- **Perplexity — eixo âncora global + tab.**
  `anchors (3: Community, Blog, Changelog — externos)` + `tabs (3: Docs, API Reference, Cookbook)`
  → `groups (24)`. A IA mais larga, e a única que usa âncoras para mandar o leitor **para fora**.
- **Trigger.dev — eixo natureza do conteúdo.**
  `dropdowns (3)`: Documentation (16 grupos), API reference (13 grupos), Guides & examples (8 grupos,
  com 18 example projects + 23 example tasks). A separação mais limpa entre **aprender / consultar /
  copiar**.

Fontes: `docs.json` dos repos [FastMCP](https://raw.githubusercontent.com/jlowin/fastmcp/main/docs/docs.json)
e [Trigger.dev](https://raw.githubusercontent.com/triggerdotdev/trigger.dev/main/docs/docs.json);
`docsConfig` embutido no RSC para Devin e Perplexity.

**Não existe "o jeito Mintlify" de organizar a navegação de topo.** Versão, idioma, produto, natureza
e âncora externa são cinco eixos oferecidos, e cada referência elegeu um. Essa escolha é nossa e
**não sai da medição** — é exatamente a chamada explícita que o axioma 5 prevê.

---

## 4. Tipos de página e como se distinguem

### 4.1 Medido pelos componentes que a página usa

`data-component-part` permite classificar objetivamente:

| Página | Componentes dominantes | Tipo |
| --- | --- | --- |
| FastMCP `/getting-started/welcome` | `card-title` ×5, `card-image` ×3, `card-icon` ×2, `columns-container` ×5, `grid-cols-2/3/4` | **Landing** — grade de cartões, **sem TOC**, prosa larga (768px) |
| Trigger.dev `/docs/introduction` | `card-title` ×**35**, `card-image` ×19, `card-icon` ×16 | **Landing/índice** — catálogo de cartões, sem TOC |
| FastMCP `/servers/tools` | `code-block-root` ×45, `field-name`/`field-meta`/`field-info-pill` ×16–17, `callout-*` ×11, `code-group-tab-*` ×12 | **Referência** — campos de parâmetro, callouts, grupos de código, **com TOC**, prosa 576px |

**A distinção visual entre landing e página interna não vem de um flag** — os quatro sites estavam em
`data-page-mode="none"`, inclusive nas landings. Vem de (a) o conteúdo ser grade de cartões e
(b) a ausência de headings suficientes para gerar TOC, o que por sua vez **alarga a prosa**.
É um efeito em cascata, não uma configuração.

### 4.2 Os modos que existem de fato

Documentação oficial ([mintlify.com/docs/organize/pages](https://mintlify.com/docs/organize/pages)),
verbatim:

| `mode` | Efeito |
| --- | --- |
| *(default)* | Sidebar e TOC visíveis. |
| `wide` | "hides the side panel, which includes the table of contents, `<Panel>` components, and API request and response examples." |
| `custom` | "removes all elements except for the top navbar. This mode hides the sidebar, table of contents, and footer." |
| `frame` | Mantém a sidebar, canvas minimalista. **Só em Aspen, Almond, Luma e Sequoia.** |
| `center` | "removes the sidebar and table of contents, and centers the content." |
| `assistant` | "renders the page as a full-screen assistant experience." |

O `mode` **é** usado pontualmente: a Perplexity marca `"mode":"frame"` nas páginas de visão geral e
de modelos Sonar (`/docs/sonar/models`, `/docs/sonar/models/sonar`) — coerente com ela ser `almond`,
um dos quatro temas que suportam `frame`.

Outros controles de frontmatter: `title`, `description`, `icon`, `sidebarTitle`, `hidden`, `noindex`,
`searchable`, `deprecated`, `groups`.

### 4.3 Tipos declarados na IA

Dos nomes de grupo nos configs: `Get Started` / `Getting Started`, `Fundamentals`, `Guides`,
`Use cases`, `Example projects`, `Example tasks`, `API reference`, `SDK Reference`,
`Troubleshooting`, `Self-hosting`, `Release Notes` / `Changelog`, `Cookbook`, `Migration guides`.

**Nenhum deles tem layout próprio no Mintlify.** Quickstart, conceitual, guia, tutorial, SDK e
troubleshooting são todos a mesma página; o que muda é o conteúdo. As únicas rupturas reais de
layout são landing (cartões, sem TOC) e os `mode` da tabela acima.

---

## 5. Contraponto: o que Vapi, Neon e Clerk fazem diferente

Só o que diverge do Mintlify e vale considerar.

### 5.1 Vapi (Fern) — três coisas que o Mintlify não faz

**a) Chrome nomeado em vez de sopa de utilitários.** O Fern serve classes semânticas para cada peça:
`fern-breadcrumb`, `fern-sidebar-link`, `fern-toc`, `fern-footer-nav`, `fern-footer-prev/next`,
`fern-back-to-top`, `fern-page-heading`, `fern-page-subtitle`, `fern-header-tabs`, `fern-page-actions`,
`fern-card`, `fern-callout`, `fern-code-block`, `fern-search-hit-*`.
Para uma spec de Docusaurus vanilla isso é o modelo certo — chrome nomeado e estável é o que um
swizzle disciplinado produz.

**b) Escala Radix completa derivada de uma cor.** O Fern emite inline
`--accent-1` … `--accent-12` **e** `--accent-a1` … `--accent-a12` (alfa), mais `--grayscale-1..12`
e alfas. O chrome é escrito **contra os degraus** (`--accent-a3` fundo ativo, `--accent-a11` texto
ativo, `--grayscale-a11` texto secundário), nunca contra hex literal.
É a mesma ideia do tingimento de cinza do Mintlify, levada mais longe — 24 degraus contra 11.

**c) Tipos de página são layouts de verdade.** Existem `.fern-layout-guide`, `.fern-layout-overview`,
`.fern-layout-page`, `.fern-layout-reference` (+ `-aside`, `-content`), `.fern-layout-changelog`.
Verificado no mesmo site: `/assistants/examples/docs-agent` → `fern-layout-guide`;
`/api-reference/calls/list` → **`fern-layout-reference` + `-aside` + `-content`**.
**A API reference troca o layout inteiro** para duas colunas com aside de código — coisa que no
Mintlify não acontece (o `data-page-mode` continuou `none`).

**Números, para comparar com o Mintlify:** header `--header-height-real` default `4rem` = 64px
(Vapi sobrescreve para **80px**, e o total com tabs vai a **124px**); sidebar default `18rem` = 288px
(Vapi: **300px**); **prosa default `40rem` = 640px, e a Vapi alargou para `880px`** — bem mais larga
que os 576–768px do Mintlify; shell default `88rem` = 1408px (Vapi: **`100vw`**, full-bleed).
O TOC entra em **1280px**, igual ao Mintlify.

**Busca:** Algolia, com evidência — `"appId":"P6VYURBGG0"`, `"indexName":"fern_docs_search"`, chave
escopada por request (`restrictIndices=fern_docs_search&validUntil=…`). O resultado distingue tipo:
`.fern-search-hit-endpoint-path` usa **fonte mono** para caminho de endpoint, e há
`--fern-search-hit-preview-width: 24rem` (**painel de preview** no modal) — os dois passos além do
Mintlify. (O mesmo cuidado de método: as 29 ocorrências de `trieve` no HTML da Vapi são todas
`Retrieve…` do conteúdo da API. Não há Trieve.)

### 5.2 Neon — desktop-first

Divergência estrutural: **todos os breakpoints são `max-width`** — `47.9375rem` (767px, 29×),
`39.9375rem` (639px, 17×), `63.9375rem` (1023px, 9×), `79.9375rem` (1279px, 8×), `99.9375rem` (1599px, 7×).
É um sistema **desktop-first**, o oposto do mobile-first `min-width` do Mintlify e do Fern.

Header: `sticky h-28` = **112px** no mobile, virando `lg:relative lg:h-14` = **56px** e **não sticky**
a partir de 1024px — inverte a expectativa (o header *deixa* de ser fixo no desktop).
Token `--docs-header-height: 112px`. Sidebar `<nav>` com `h-[calc(100vh-7rem)]`, `border-r`,
`overflow-y-scroll`, `pt-11 pr-8 pb-16 pl-1`.
Tem assistente de IA próprio (`aria-label="Open Neon AI"`) e grupos colapsáveis explícitos
(`aria-label="Expand ORMs"`, `"Expand Languages"`, `"Expand Frameworks"`).
A `/docs/introduction` não traz "On this page" — é landing.

### 5.3 Clerk — o seletor de SDK é o diferencial

O que nenhum outro faz: **a navegação inteira é reescrita por SDK**. Evidência no HTML:
`id="clerk-docs-sdk-provider"`, `aria-label="Show available SDKs"` aparecendo **9 vezes**
(seletores inline dentro do conteúdo, não só no topo), `id="docs-navigation-element"`, e um
`aria-label="Documentation version"` separado. O repo `clerk/clerk-docs` é público.

Chrome: header `fixed top-1 left-1 h-16 rounded-t-xl border-b` — **64px**, e com inset de 4px e
cantos arredondados no topo, um header "flutuante" que nenhum dos outros seis usa.
Conteúdo: `max-w-[43.5rem]` = **696px**, subindo para `xl:max-w-5xl` = **1024px**.
Sidebar: `lg:w-[min(var(--content-width), calc(100vw - 19.5rem - 1.75rem))]` → **19.5rem = 312px**
de sidebar + 28px de gutter.
TOC: `aria-label="On this page"` com trilho de 1px (`before:left-4 before:w-px`) e itens numerados
via `data-step` — mais estruturado que o do Mintlify.
Breakpoints em **`em`** (40/48/64/80/96em + 27.5em), mobile-first.
Tema com três estados explícitos: Light / Dark / System.

---

## 6. O que isto implica para a spec em Docusaurus

Consequências diretas, sem inventar decisão:

1. **O sistema de tokens é o produto, e ele é pequeno.** 17 variáveis cobrem o alvo estético inteiro.
   Três primárias, duas de fundo, onze cinzas, uma de tooltip — tudo em tripla RGB para permitir
   `rgb(var(--x) / α)`. Cabe em `:root` / `[data-theme='dark']` do Infima sem nenhuma dependência.
2. **A rampa de cinza precisa ser derivada, não escolhida.** É o que separa os quatro sites entre si,
   e é o que faz uma skin trocável de verdade. Cravar onze hex neutros mataria o axioma 3.
3. **Os dois escapes precisam existir na spec**: troca de família tipográfica e um slot de CSS
   próprio (syntax highlight e vocabulário visual de domínio moram lá).
4. **Duas chamadas ficam abertas, e a medição não as resolve** — os três preferidos divergem:
   - prosa **fixa** (FastMCP/Perplexity, 576–768px) ou **fluida** (Devin);
   - conteúdo **dentro de cartão** (`almond`) ou **solto** (`mint`/`maple`).
5. **Alvos numéricos**, se a escolha for reproduzir `almond`: sidebar **264px** (≥1024px),
   TOC **≤448px** (≥1280px), prosa **576px com TOC / 768px sem**, topo **56px** (112px com tabs),
   gutter **32px → 64px** em 1024px, shell máximo **1472px**, raio **12px** em item de sidebar e
   **16px** no cartão de conteúdo.
6. **Dois truques baratos que valem copiar:** o falso-negrito por `text-shadow` no item ativo da
   sidebar (não desloca layout) e a container query no cabeçalho de página (`@[520px]`), que reage
   à largura da coluna e não à da janela — exatamente o que se quer quando a prosa muda de largura
   conforme o TOC aparece.
