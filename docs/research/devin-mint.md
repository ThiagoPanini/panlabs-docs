# O Devin remedido, no tema `mint`

> Pesquisa da issue [#50](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/50).
> Coleta: **2026-08-10**, contra `docs.devin.ai` em produção.
> Base anterior: [#2](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/2)
> (`research/chrome-referencias`) e [#3](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/3)
> (`research/sistema-visual-medido`), medidas em **2026-08-04**.

## Sumário executivo

O mapa elegeu o Devin como referência única e travou a troca de `almond` por `mint`. Esta pesquisa
remede o alvo com a resolução que uma decisão de geometria consome. Sete achados mandam:

1. **O CSS do Mintlify mudou, e a mudança é da plataforma, não do Devin.** O chunk principal foi
   renomeado de `a336fa455c02e881.css` (436.139 B) para `dc1e9a5f4ee7caeb.css` (**440.994 B**), MD5
   novo; o antigo responde **404**. Os quatro hosts Mintlify migraram juntos, e o arquivo novo é
   **byte-idêntico** entre eles. O chunk de fontes (4.195 B) não mudou um byte.
2. **`--page-padding` não é o gutter do `mint` — não é usado pelo Devin em lugar nenhum.** Os
   valores 16/20/32 que a #2 viu alternando não são responsivos: são três classes independentes,
   escolhidas por componente, e **zero delas aparece nas páginas servidas**. O gutter real vem de
   `px-4` → `lg:px-8` no shell (**16 → 32px**) mais `px-1` (4px) no `#content-area`.
3. **A prosa é fluida, sem teto, e tem duas descontinuidades** — cai de ~983px para ~625px em
   1024px, sobe até ~880px, e despenca para ~529px em 1280px quando o TOC entra. No largo estabiliza
   em **~721px**. A conta do mapa acerta o valor final por uma rota diferente; a faixa 1024–1280
   é que não tinha sido olhada.
4. **A página é plana, e a prova é forte.** Em seis páginas medidas há **zero** componentes de
   conteúdo com sombra. A única sombra do tema é um chip de 24px que aparece no hover de heading. A
   separação é hairline de 1px, e o token que a governa é `--default-border-color`.
5. **O `mint` precisa de dois limiares**, não cinco: **1024px** (sidebar, tabs, navbar, gutter) e
   **1280px** (TOC). O 640px só mexe no `h1` e em grade de cartão. 768/1536/1650/2100 são código
   morto no Devin.
6. **O ritmo vertical é assimétrico por desenho:** 48px antes de um cabeçalho, 16px depois. E os
   dois níveis de cabeçalho (`h2` e `h3`) abrem com exatamente os mesmos 48px.
7. **A anatomia tem um lead** que a medição anterior não registrou, e **a paginação mudou** — deixou
   de ser dois cartões numa grade e virou uma linha de texto sem borda.

---

## Como isto foi medido

Fonte primária, na ordem de confiança:

1. **Headers HTTP e HTML servido** — `curl` contra `docs.devin.ai`, user-agent de Chrome 131.
2. **CSS servido** — os dois chunks baixados por URL direta e conferidos por MD5.
3. **`docsConfig` embutido no payload RSC** do HTML servido.
4. **Os `.md` por rota, o `llms.txt` e os `.well-known/`** que o Mintlify publica.

Oito páginas de documentação, HTML e `.md` de cada: `/get-started/devin-intro`,
`/get-started/first-run`, `/api-reference/overview`,
`/api-reference/v1/sessions/create-a-new-devin-session`, `/enterprise/overview`, `/admin/billing`,
`/release-notes/overview`, `/ja/get-started/devin-intro`. O esqueleto de layout é **idêntico nas
oito**.

> **Nota de método.** Contagem de classe no HTML precisa descontar o payload RSC dentro de
> `<script>`, que duplica as strings. Onde este documento dá contagem, ela é sobre o **DOM
> renderizado**. Onde a #3 contou o arquivo bruto, os números divergem — está anotado.

### Limites — o que NÃO foi medido

Declarado para que nada aqui seja lido como mais forte do que é.

- **Computed style de navegador real: não medido.** Não havia navegador nesta sessão. Todo valor é o
  **declarado** na folha servida ou no atributo `class`. Onde houve conta de flexbox ou de colapso de
  margem, está escrito **derivado**, e a conta está exposta para ser conferida.
- **Diff byte a byte do CSS antigo contra o novo: impossível.** O chunk antigo responde 404 em todos
  os hosts, e o Wayback não tem captura dele (devolve a página de erro do Archive, não CSS). A
  comparação da §1.3 é contra os **valores documentados** nas pesquisas #2 e #3, não contra o
  arquivo. Onde a pesquisa antiga não registrou um valor, não dá para dizer se ele mudou ou se só
  não foi olhado — isso está marcado **`sem base de comparação`**.
- **O fundo pintado da página: não medido.** A folha servida **não tem regra de `background` em
  `html` nem em `body`**. No escuro só há `.dark{color-scheme:dark}`. Onde `#141414` entra na tela
  exige computed style.
- **Comportamento em movimento: não medido** — scroll-spy, o navbar virando opaco, colapso de grupo
  na sidebar, o TOC colapsando.
- **Tudo que é client-side: não medido.** O DOM do drawer mobile, do modal de busca, do menu
  suspenso, do tooltip e do painel do assistente **não está no SSR**. Verificado: `role="dialog"` =
  0, `data-state=` = 0, `role="menu"` = 0, `role="tablist"` = 0 nas páginas baixadas.
- **`blockquote`, `table`, `h4` puro e `img` dentro da prosa: sem confirmação de uso.** As regras
  existem no CSS e estão registradas, mas **nenhuma das páginas baixadas tem um exemplar** — os
  números vêm só da folha.
- **Contagem de uso de componente no corpus inteiro (1.740 páginas): fora de escopo.** Isso é da
  pesquisa [#4](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/4).

---

## 1. O CSS mudou — o quê, e de quem

### 1.1 A prova

| Arquivo | Bytes | MD5 | Situação |
| --- | --- | --- | --- |
| `a2c16a79b30ca688.css` (fontes) | 4.195 | `c7e1d31ed09ce7762776a23c61bb82b9` | **inalterado** desde 2026-08-04 |
| `a336fa455c02e881.css` (antigo principal) | — | — | **404 Not Found** |
| `dc1e9a5f4ee7caeb.css` (novo principal) | **440.994** | `6e609373767785fd929249958a41473f` | novo |

O arquivo cresceu **4.855 bytes** (+1,1%).

### 1.2 A mudança é da plataforma, não do Devin

Os quatro hosts Mintlify servem hoje o mesmo par de chunks — `docs.devin.ai`, `gofastmcp.com` e
`docs.perplexity.ai` em `/mintlify-assets/_next/static/chunks/`, `trigger.dev` em
`/docs/_next/static/chunks/`. E o chunk novo baixado de `docs.perplexity.ai` é **byte-idêntico** ao
baixado de `docs.devin.ai` (`cmp` limpo, 440.994 B nos dois).

**A identidade byte a byte entre hosts, que era o achado estrutural da #3, continua verdadeira.** O
que houve foi um *release* do Mintlify. `x-mintlify-client-version` subiu de **0.0.3395** para
**0.0.3421**; o projeto Vercel segue `prj_NdMUpHpUIb41Po1H8c6hrChv2bgr`.

### 1.3 O que mudou de relevante

| Item | Antes (documentado em #2/#3) | Agora (medido) | Veredito |
| --- | --- | --- | --- |
| **Paginação** | `grid lg:grid-cols-2 gap-4`, cada lado cartão `border rounded-xl py-3 px-4`, com `pagination-label` | `flex items-center gap-6 text-sm font-semibold`, sem borda, sem cartão, sem `pagination-label` | **mudou** (§7.4) |
| **Crase do `code` inline** | `::before`/`::after` com `content:"\`"` | anulada: `code:not(pre *):before,code:not(pre *):after{content:none!important}` — **não há crase na tela** | **mudou** |
| **`letter-spacing` do corpo** | "tracking é do título, não do corpo" | existe um terceiro bloco `.prose{--tw-tracking:-.0125rem;letter-spacing:-.0125rem}` — **−0,2px na prosa inteira** | **mudou ou não foi olhado** |
| **Atalho da busca** | `não medido` | **`⌘K`**, verbatim no HTML servido | **lacuna fechada** |
| **Idiomas** | 7 (`de,en,es,fr,it,ja,zh`) | **8** — entrou **`pt-BR`** | **mudou** |
| `data-component-part` no CSS | 14 nomes | 15, com `card-content`, `code-block-header`, `field-required-pill`, `step-*`, `tabs-list`, `accordion-content` | cresceu |
| ID novo no CSS | — | `#api-playground-2-operation-page` | playground v2 |
| CSS próprio do Devin | `custom.css` + `.scroll-anchor` | idem **mais ~9,4 KB** de galeria de use cases (`.gallery-*`, `.uc-*`) e uma regra que esconde a aba Federal | cresceu |
| `c15t` (banner de consentimento) | ~250 propriedades, descartado como ruído | segue lá — 805 ocorrências de `c15t`. **E é ele que traz `@media (width<=480px)` e `(width<=640px)` e as 16 regras de `prefers-reduced-motion`** | confirma, com consequência (§5.1) |

As 17 variáveis injetadas e o chunk de fontes **não mudaram nada**.

---

## 2. Os tokens do Devin — todos confirmam

Bloco `<style>` inline do HTML servido, verbatim. **Os 17 valores batem, um a um, com 2026-08-04.**

| variável | tripla RGB | hex |
| --- | --- | --- |
| `--primary` / `--primary-light` / `--primary-dark` | `49 124 255` | `#317CFF` |
| `--tooltip-foreground` | `255 255 255` | `#FFFFFF` |
| `--background-light` | `252 252 252` | `#FCFCFC` |
| `--background-dark` | `20 20 20` | `#141414` |
| `--gray-50` … `--gray-950` | `244 246 250` · `239 241 245` · `223 226 230` · `207 209 213` · `160 162 166` · `113 115 119` · `81 83 87` · `64 66 70` · `38 41 45` · `24 26 30` · `11 13 17` | `#F4F6FA` · `#EFF1F5` · `#DFE2E6` · `#CFD1D5` · `#A0A2A6` · `#717377` · `#515357` · `#404246` · `#26292D` · `#181A1E` · `#0B0D11` |

Mais os dois escapes, também iguais: `:root{--banner-height:0px!important}` e
`:root{--topbar-tabs-height:3rem}`.

> **Detalhe medido:** o `<html>` traz `data-banner-state="visible"` **e** o site injeta
> `--banner-height:0px!important`. O estado diz que há banner; a altura o anula. Reproduzir "sem
> banner" pela altura, e não pelo estado, é o que o Mintlify faz.

### 2.1 O token de borda que faltava

```css
:root { --default-border-color: var(--gray-100) }   /* Devin: #EFF1F5 */
.dark { --default-border-color: var(--gray-800) }   /* Devin: #26292D */
```

**É a régua do "anel mínimo" no nível do token**: a borda padrão do sistema é um degrau da rampa
tingida, não uma cor solta. `sem base de comparação` — a #3 não registrou este par.

### 2.2 O modo escuro é classe, sem media query

- **`prefers-color-scheme` não aparece nenhuma vez** no CSS servido (só em `<link media=…>` de
  favicon, no HTML).
- O gancho é a classe `.dark` no `<html>` — **812 ocorrências** como seletor.
- A única declaração de esquema é
  `.dark{--lightningcss-light: ;--lightningcss-dark:initial;color-scheme:dark}` — o truque de
  *space-toggle*, o mesmo que a #3 mediu no Clerk.
- O preferido do usuário tem **três estados** (`#theme-preference-menu-trigger` com
  `data-theme-preference-icon` = `system`/`light`/`dark`), resolvidos em JS, que escreve a classe.

Para a spec: **um gancho só na raiz, zero media query de cor.** É o mesmo mecanismo do
`html[data-theme='dark']` do Docusaurus — a transposição é de nome, não de arquitetura.

---

## 3. Tipografia

### 3.1 Inter + paperMono, confirmado na fonte

O chunk de 4.195 B é **só `@font-face`**, byte-idêntico ao de 2026-08-04:

- **Inter** — 14 faces (7 subconjuntos unicode × normal/itálico), `font-weight: 100 900` (**variável**),
  `font-display: swap`, `.woff2` auto-hospedado.
- **paperMono** — 1 face, `font-weight: 100 800` (variável), `font-display: swap`.
- Tokens vindos de classes de módulo no `<html>`:
  `--font-inter: "Inter",-apple-system,BlinkMacSystemFont,Segoe UI,system-ui,sans-serif` e
  `--font-paper-mono: "paperMono",ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,…`.
- Preload de três arquivos: Inter latin normal, Inter latin itálico, paperMono.

**O Devin não injeta família própria.** `"fonts":"$undefined"` no `docsConfig`; e
`--font-family-body-custom` / `--font-family-headings-custom` / `--font-weight-body-custom`
aparecem **só como fallback** no CSS do Mintlify, com **zero ocorrências** no HTML das páginas. Os
~10 KB de CSS inline do Devin têm **zero** ocorrências de `.prose`, `font-family` ou `--font-`.
**O Devin roda o `mint` de fábrica.**

E um detalhe que a medição antiga não pegou:

```css
html { font-feature-settings: "cv02","cv03","cv04","cv11"; height:100%; overflow-y:overlay }
```

**Quatro variantes de caractere da Inter ligadas globalmente.** É barato de copiar e é parte de por
que o texto do Devin não parece "Inter default". `sem base de comparação`.

### 3.2 A escala, e uma correção sobre line-height

| token | valor | px | line-height que o utilitário emite |
| --- | --- | --- | --- |
| `--text-xs` | `.75rem` | 12 | `1rem` (literal) |
| `--text-sm` | `.875rem` | 14 | `1.25rem` |
| `--text-base` | `1rem` | 16 | `1.5rem` |
| `--text-lg` | `1.125rem` | 18 | `1.75rem` |
| `--text-xl` | `1.25rem` | 20 | `1.75rem` |
| `--text-2xl` | `1.5rem` | 24 | `2rem` |
| `--text-3xl` | `1.875rem` | 30 | `2.25rem` |
| `--text-4xl` | `2.25rem` | 36 | `2.5rem` |
| `--text-5xl` | `3rem` | 48 | `var(--text-5xl--line-height)` = `1` |
| `--text-6xl` | **ausente** | — | utilitário não existe |
| `--text-7xl` | `4.5rem` | 72 | `var(--text-7xl--line-height)` = `1` |

**Correção da #3:** o CSS **não declara token pareado de line-height** para `xs`…`4xl`. Ele embute o
valor em `rem` dentro do utilitário, atrás de `var(--tw-leading, …)`. Só `5xl` e `7xl` usam token, e
os dois valem `1`.

O canal de override `--tw-leading` **não herda** (`@property --tw-leading{syntax:"*";inherits:false}`)
— é por isso que o `leading-none` do `#header` não vaza para o `h1`.

`--spacing: .25rem` e `--container-xs`…`--container-6xl` (`20/24/28/32/36/42/48/56/64/72rem`)
**confirmam** integralmente.

### 3.3 Pesos, leading e tracking aplicados

Declarados: `--font-weight-normal:400`, `medium:500`, `semibold:600`, `bold:700`. **Não há `light`,
`extrabold` nem `black`.**

Aplicados no DOM das seis páginas:

| classe | total | leitura |
| --- | --- | --- |
| `font-medium` | **181** | o peso de UI |
| `font-semibold` | **147** | títulos, eyebrow, sidebar ativa, paginação |
| `font-normal` | 34 | residual |
| `font-bold` | **9** | só em `api-session.html` |

**O par 500/600 carrega a interface inteira.**

| classe | total | resolve |
| --- | --- | --- |
| `leading-[inherit]` | 61 | — |
| `leading-6` | 56 | **24px** |
| `leading-tight` | 22 | 1.25 |
| `leading-none` | 6 | 1 |
| **`tracking-tight`** | **6** | `-.025em` — **uma por página, sempre no `h1#page-title`** |

`leading-normal`, `leading-relaxed`, `tracking-tighter`, `tracking-normal` e `tracking-wide`:
**zero usos**. Dos quatro tokens de tracking, **só `tight` é usado**.

Escala de UI aplicada:

| classe | total | leitura |
| --- | --- | --- |
| `text-sm` | **168** | domina |
| `text-xs` | **62** | 47 deles em `api-session` |
| `text-base` | 30 | corpo de cartão |
| `text-3xl` + `sm:text-4xl` | 6 + 6 | só o título de página |
| `text-lg` | 4 | o lead |
| `text-xl`, `text-4xl`, `text-5xl`, `text-6xl`, `text-7xl` | **0** | — |

**A UI inteira roda em `text-sm` + `text-xs`.**

### 3.4 O `h1` de página

```html
<h1 id="page-title" class="text-3xl sm:text-4xl text-gray-900 tracking-tight
    dark:text-gray-200 [overflow-wrap:anywhere] font-semibold">
```

| propriedade | <640px | ≥640px |
| --- | --- | --- |
| `font-size` | **30px** | **36px** |
| `line-height` | **36px** | **40px** |
| `font-weight` | **600** | 600 |
| `letter-spacing` | `-.025em` = −0,75px | −0,9px |

Confirma a #3 verbatim. `billing` e `enterprise` acrescentam `break-all`.

---

## 4. O ritmo vertical

A camada `.prose` é a base do Tailwind Typography com override do Mintlify. Onde há duas regras para
o mesmo seletor, **a segunda vence por ordem** (mesma especificidade, ambas em `@layer components`).

### 4.1 Cabeçalhos

| propriedade | `h1` | `h2` | `h3` | `h4` |
| --- | --- | --- | --- | --- |
| `font-size` | `2.25em` = 36px | `1.5em` = 24px | `1.25em` = 20px | `1.125em` = 18px *(override)* |
| `font-weight` | 800 | **700 no CSS / 600 na tela** ⚠ | 600 | 600 |
| `line-height` | 1.11111 | 1.33333 | **1.4** *(override)* | 1.5 |
| `margin-top` | 0 | **`2em` = 48px** | **`2.4em` = 48px** *(override)* | `2em` = 36px *(override)* |
| `margin-bottom` | `.888889em` = 32px | **`.666667em` = 16px** *(override)* | `.6em` = 12px | `.5em` = 9px |
| `letter-spacing` | `-.025em` | `-.025em` | `-.025em` | — |

**A abertura de seção é 48px para `h2` e para `h3`.** Os `em` são calibrados para cair no mesmo
número redondo na raiz: `2em × 1.5rem = 3rem` e `2.4em × 1.25rem = 3rem`. Os dois níveis abrem
idêntico e se distinguem só pelo fechamento e pelo corpo.

> ⚠ **O peso 700 do `h2` nunca chega à tela.** O markup aplica `font-semibold` em todo `h2`/`h3` de
> conteúdo (`<h2 class="flex whitespace-pre-wrap group font-semibold" id="…">`), e utilitário mora em
> `@layer utilities`, que vence `@layer components`. **O `h2` renderizado é 600.** Nas seis páginas:
> 23 `h2` e 4 `h3` com essa classe, e nenhum `h2` sem ela. Isso **corrige com ressalva** a leitura da
> #3, que registrou 700.

### 4.2 O espaço entre cabeçalho e parágrafo

Duas descobertas mudam a leitura, e as duas vêm de regras **sem `@layer`** (que vencem tudo):

```css
#content-area div.mdx-content.prose>span[data-as=p]{margin-top:1.25em;margin-bottom:1.25em;display:block}
#content-area div.mdx-content.prose>:is(h2,h3,h4)+span[data-as=p]{margin-top:0}
```

1. **O parágrafo em produção não é `<p>` — é `<span data-as="p">` com `display:block`.** Contagem no
   corpo `.prose`: 25 spans contra 3 `<p>` em `intro`; 23 contra 13 em `enterprise`; 17 contra 0 em
   `api-overview`. As regras `.prose p` só pegam a minoria.
2. **O `margin-top` do parágrafo depois de um cabeçalho é zerado.**

O ritmo efetivo, **derivado** (colapso de margem entre irmãos):

| transição | px | como resolve |
| --- | --- | --- |
| **`h2` → parágrafo** | **16px** | `mt` do span zerado; sobra só o `mb` do `h2` |
| **parágrafo → `h2`** | **48px** | `max(20, 48)` — o `mt` do `h2` domina |
| `h3` → parágrafo | 12px | idem |
| parágrafo → `h3` | 48px | idem |
| `h4` → parágrafo | 9px | idem |

**O ritmo é assimétrico por desenho: 48px antes do cabeçalho, 16px depois.** É a regra mais
transplantável desta pesquisa, e a que uma reprodução ingênua erraria.

### 4.3 Margens verticais dos demais blocos

| elemento | `mt` | `mb` | px (mt/mb) | fonte do elemento |
| --- | --- | --- | --- | --- |
| `p` / `span[data-as=p]` | `1.25em` | `1.25em` | 20 / 20 | 16px |
| `li` | `.5em` | `.5em` | 8 / 8 | 16px |
| `ul`, `ol` | `1.25em` | `1.25em` | 20 / 20 | 16px |
| lista aninhada | `.75em` | `.75em` | 12 / 12 | 16px |
| `blockquote` | `1.6em` | `1.6em` | 25,6 / 25,6 | 16px |
| `hr` | `3em` | `3em` | **48 / 48** | 16px |
| `pre` | `1.42857em` | `2.28571em` | **20 / 32** | 14px |
| `table` | `2em` | `2em` | 28 / 28 | 14px |
| `img` / `figure` | `2em` | `2em` | 32 / 32 | 16px |
| `figcaption` | `.857143em` | — | 12 / — | 14px |

Overrides do Mintlify que confirmam a #3 verbatim: `hr` em `rgb(var(--gray-100))`; `ul` com
`padding-left:0` + `list-style-type:none` e marcador `::before` de `.375em` (6px) em
`top:.6875em / left:.5em`, com `ul>li{padding-left:2em!important}` (32px); `ol` com
`padding-inline-start:2.125em` (34px); `blockquote` romano, peso 400, borda `4px`
`rgb(var(--gray-200))`, `padding-left:1.5rem`, `quotes:none`; `pre` com
`border-radius:var(--rounded-xl,.75rem)`, `padding:1.25rem`, `color:rgb(var(--gray-50))`,
`display:flex`; `table` com `font-size:.875rem`, `line-height:1.25rem`, `display:block`,
`overflow:auto`; `.prose{color:rgb(var(--gray-700));max-width:none}`; `code` inline `.875em` peso
`500` com `font-variant-ligatures:none`.

**O modelo é margem colapsante pura.** Não há `gap` nem `space-y-*` governando o corpo — só
`:first-child{margin-top:0}` / `:last-child{margin-bottom:0}`.

### 4.4 O topo da página

| degrau | classe | px |
| --- | --- | --- |
| padding do wrapper, <1024px | `pt-40` | **160** |
| padding do wrapper, ≥1024px | `lg:pt-10` | **40** |
| margem do bloco do header | `mt-0.5` | 2 |
| altura da eyebrow | `h-5` | 20 |
| gap eyebrow → título | `space-y-2.5` | 10 |

**Do topo da coluna de conteúdo até a borda superior do `h1`: 192px abaixo de 1024px, 72px a partir
dali.** *(derivado.)*

`#content-area` **não tem padding vertical nenhum** — o padding de topo mora no wrapper flex acima
dele. Do `h1` para baixo: 10px até o lead (o `mt-2` de 8px colapsa contra os 10px do
`space-y-2.5`), e o corpo abre com **`mt-8` = 32px** e fecha com **`mb-14` = 56px`**.

---

## 5. A geometria

### 5.1 Os limiares que o `mint` de fato usa

O CSS tem 19 preludes `@media` distintos, 79 ocorrências. Tudo em sintaxe Tailwind v4
(`(width>=…)`), nada de `min-width:` legado.

**Confirma a #2**: existem `640 / 768 / 1024 / 1280 / 1536`, mais `1650px` e `2100px`, mais máximos
`480px` e `640px`. **Três correções:**

1. **`1650px` não é um `min-width`.** É `@media not all and (width>=1650px)` — a forma que o
   Tailwind v4 emite para `max-[1650px]:`. Vale **abaixo** de 1650, e define uma única utilidade
   (`margin-inline:auto!important`) com **zero usos** no Devin.
2. **`2100px` é só mais um degrau da cadeia `.container`** (`.container{max-width:2100px}`).
   `class="container"` tem **zero ocorrências** no Devin.
3. **Os máximos `480px` e `640px` são exclusivamente do widget de consentimento `c15t`**, que não
   aparece em nenhuma página. Não é layout do `mint`.

Contagem de prefixo responsivo no markup servido:

| prefixo | ocorrências | vivas |
| --- | --- | --- |
| `lg:` (1024) | 583 | todas |
| `sm:` (640) | 96 | ~40 |
| `xl:` (1280) | 50 | ~34 |
| `max-lg:` (1024) | 24 | todas |
| `md:` (768) | 16 | **zero** — todas em ramos `is-custom`/`is-center`, que o navbar desliga |
| `2xl:` (1536) | **0** | — |

**Veredito: dois limiares para o esqueleto, mais um tipográfico opcional.**

- **1024px** — o único limiar estrutural. Entra a sidebar, entra a faixa de tabs, o navbar vai de
  `fixed` para `sticky`, o gutter vai de 16 para 32, o topo vai de 160 para 40, a busca troca de
  forma, o assistente aparece, `--scroll-mt` vai de `9.5rem` para `6.3rem`, e há uma trava em JS no
  mesmo ponto.
- **1280px** — só o TOC (e, nas páginas de API, o painel de exemplo).
- **640px** — não move nenhuma peça do shell. Faz duas coisas: `h1` de `text-3xl` para
  `sm:text-4xl`, e grade de cartão de 1 para N colunas. **Dá para replicar sem ele.**
- **768, 1536, 1650, 2100, max-480, max-640** — **descartáveis**, zero efeito sobre o `mint`.

> Isto responde a perna aberta do portão 1 no mapa: o `mint` **não** exige dois limiares de media
> query irredutíveis para o esqueleto — exige **1024 e 1280**, e o 1280 governa uma peça só.

**Container queries — 9 regras**, 3 contextos e 6 consultas. O contexto `page-header` está
confirmado e vale; `columns-container` também; **`navbar` existe no CSS e tem zero usos** no Devin
(`@[600px]`, `@[1100px]`, `@[1500px]`).

`@container page-header (width>=520px)` é o único que muda comportamento visível, e o mecanismo é
**duplicação no DOM** (§7.3).

> **Nota que não é breakpoint mas é limiar de replicação:** todas as classes `hover:` /
> `group-hover:` do markup estão dentro de `@media (hover:hover)`. É do build do Tailwind v4, não do
> tema, mas precisa ser reproduzido — senão o hover gruda no toque.

> **O `mint` não trata `prefers-reduced-motion`.** As 16 regras `reduce` do arquivo são todas do
> `c15t` (ausente), mais um `[data-slot=dialog-content]{animation:none}`. A única `no-preference` é
> `.motion-safe:active:scale-95`. Isso **corrige** a leitura da #3 de que "os quatro respeitam".

### 5.2 A cadeia de contenção, do `<html>` ao texto

| nível | elemento | `class` (verbatim, recortada) |
| --- | --- | --- |
| 0 | `<html>` | `inter_… papermono_… dark` |
| 1 | `<body>` | `antialiased` |
| 2 | `<div>` | `relative antialiased text-gray-500 dark:text-gray-400` |
| 3 | `<div>` | `max-lg:contents lg:flex lg:w-full` |
| 4 | `<div>` | `max-lg:contents lg:flex-1 lg:min-w-0 lg:overflow-x-clip` |
| 5 | `<div>` **(o shell)** | `…:max-w-8xl …:px-4 …:mx-auto …:lg:px-8 …:lg:flex` |
| 6 | `<main id="content-container">` | `lg:flex-1 lg:min-w-0` |
| 7 | `<div>` **(a linha)** | `flex flex-row-reverse gap-12 box-border w-full pt-40 lg:pt-10` |
| 8 | `<div id="content-area">` | `relative grow box-border flex-col w-full mx-auto px-1 lg:pl-[5.7rem] lg:-ml-12 xl:w-[calc(100%-28rem)]` |

`#sidebar` é irmão de `#content-container`, filho do shell.

Três coisas caem daqui:

- **`flex-row-reverse` explica a ordem do DOM.** O TOC vem **antes** do `#content-area` no HTML e
  mesmo assim renderiza à direita. Quem for swizzlar precisa saber.
- **`gap-12` = 48px** é o vão entre a coluna de texto e o trilho do TOC.
- **`pt-40` / `lg:pt-10`** = 160px / 40px de topo.

O shell resolvido: `.max-w-8xl{max-width:92rem}` = **1472px** (confirma a #2). O `#navbar` carrega
`peer is-not-custom peer is-not-center peer is-not-wide peer is-not-frame`, então **as regras ativas
são exatamente** `max-w-8xl` · `mx-auto` · `px-4` · `lg:px-8` · `lg:flex`. Todo o resto do class
list é modo morto.

### 5.3 O gutter — `--page-padding` não é a resposta

Este era o item mais pedido do ticket, e a resposta é negativa. As sete regras do bundle que citam o
token:

```css
.[--page-padding:16px]{--page-padding:16px}
.[--page-padding:20px]{--page-padding:20px}
.[--page-padding:32px]{--page-padding:32px}
.[&_[data-table-wrapper]]:![--page-padding:0px] [data-table-wrapper]{--page-padding:0px!important}
.px-(--page-padding){padding-inline:var(--page-padding)}
.-mx-(--page-padding){margin-inline:calc(var(--page-padding)*-1)}
.w-[calc(100%+(var(--page-padding)*2))]{width:calc(100% + (var(--page-padding)*2))}
```

Dois fatos fecham a questão:

1. **Nenhuma delas está dentro de media query.** Os três valores são **três classes independentes e
   incondicionais**, escolhidas por *contexto de componente*, não por viewport. A alternância que a
   #2 viu não é responsiva.
2. **O token aparece zero vezes nas páginas servidas.** É token de outro tema Mintlify, carregado
   junto no bundle compartilhado — o par `-mx-(--page-padding)` + `w-[calc(100%+…)]` é o padrão de
   *full-bleed* de tabela/código, e o `[data-table-wrapper]` confirma.

**Não replique `--page-padding`.** O gutter do `mint` é este:

| camada | classe verbatim | <1024px | ≥1024px |
| --- | --- | --- | --- |
| shell | `px-4` + `lg:px-8` | **16px** | **32px** |
| `#content-area` | `px-1` | 4px | 4px (só à direita) |
| `#content-area` | `lg:pl-[5.7rem]` | — | **91,2px** (só à esquerda) |
| `#content-area` | `lg:-ml-12` | — | **−48px** |

Resolvido para CSS puro — **é isto que a spec precisa carregar**:

```css
.shell        { max-width: 92rem; margin-inline: auto; padding-inline: 16px; }
.content-area { padding-inline: 4px; margin-inline: auto; width: 100%; flex-grow: 1; }

@media (width >= 1024px) {
  .shell        { padding-inline: 32px; display: flex; }
  .content-area { padding-left: 5.7rem; padding-right: 4px; margin-left: -48px; }
}
@media (width >= 1280px) {
  .content-area { width: calc(100% - 28rem); }
}
```

**Gutter externo efetivo**, da borda da janela à primeira letra:

| faixa | conta | total |
| --- | --- | --- |
| <1024px | `px-4` 16 + `px-1` 4 | **20px** |
| ≥1024px, esquerda | 32 + sidebar 288 + (91,2 − 48) | **363,2px** da borda |
| ≥1024px, direita | 32 + 4 (+ 352 do TOC a partir de 1280) | 36px (ou 388px) |

**Os 20px que a #2 atribuiu ao `--page-padding` existem mesmo, mas são `16 + 4` de duas camadas
distintas.** Coincidência de valor, não o token.

O par estranho `lg:pl-[5.7rem]` com `lg:-ml-12` é um ajuste ótico: a caixa invade 48px para a
esquerda e devolve 91,2px de padding, de modo que **o texto começa 43,2px à direita da borda da
sidebar**.

### 5.4 A largura da prosa — fluida, sem teto, com dois degraus

| elemento | `class` | valor |
| --- | --- | --- |
| `#sidebar` | `hidden lg:block sticky self-start shrink-0 w-[18rem]` | **288px** |
| linha (nível 7) | `flex flex-row-reverse gap-12` | **gap 48px** |
| `#content-side-layout` | `hidden xl:flex … max-w-[28rem] … top-[9.5rem]` | teto 448px |
| `#table-of-contents-layout` | `hidden xl:flex box-border max-h-full pl-10 w-[19rem]` | **304px, fixo** |
| `#content-area` | `grow … w-full … xl:w-[calc(100%-28rem)]` | — |

**Correção importante.** A #2 registrou o trilho do TOC como `28rem` = 448px, e o mapa fez a conta
com esse número. Os 448px são um **`max-width` que não vincula**: a coluna real do TOC é `w-[19rem]`
= **304px**, fixa. Sobram **144px constantes** de folga (448 − 304) que o `grow` do `#content-area`
reabsorve.

E `.prose` **não tem teto**: `.prose{color:rgb(var(--gray-700));max-width:none}`. Nem `#content` nem
`mdx-content` declaram largura. **Nada limita a medida além do shell de 1472px.**

**Derivado** (conta de flexbox resolvida à mão, conferida de forma independente por duas medições
desta sessão; *não* verificada em navegador):

- `<1024px`: largura do texto = `V − 40`
- `1024–1279px`: `= V − 399,2`
- `≥1280px`: `= V − 751,2`, travando em **720,8px** quando o shell bate no teto de 1472

| viewport | TOC? | largura do texto |
| --- | --- | --- |
| 375px | não | ≈ 335px |
| 1023px | não | ≈ **983px** |
| 1024px | não | ≈ **625px** |
| 1279px | não | ≈ **880px** |
| 1280px | **sim** | ≈ **529px** |
| 1440px | sim | ≈ 689px |
| ≥1472px | sim | ≈ **721px** (teto) |

**Duas descontinuidades, e as duas importam:**

- **1023 → 1024: de ~983px para ~625px.** Entram sidebar (288), gutter maior (32 vs 16) e o
  `pl-[5.7rem]` (91,2).
- **1279 → 1280: de ~880px para ~529px.** O degrau mais violento do tema. Entram o TOC (304) e o
  `gap-12` (48), e o `xl:w-[calc(100%-28rem)]` reserva 448 dos quais o `grow` devolve só 144.

**Tudo acima de 1472px de viewport é idêntico** — as faixas 1536–1649 e ≥1650 não diferem em nada.

#### O que isto faz com a decisão do mapa

O mapa registrou a objeção da largura de linha como **retirada**, com a conta
"shell 1472 − sidebar 288 − trilho 448 − gutter = ~672–704px".

- **No largo, a conclusão do mapa se sustenta.** Os ~721px em tela cheia estão logo acima da faixa
  estimada. A rota da conta era outra (o trilho não é 448, é 304; e há 95,2px de padding próprio),
  mas o resultado bate.
- **Na faixa 1024–1280px a objeção não foi retirada — ela não foi olhada.** Ali a prosa é fluida e
  sem teto e chega a **~880px** logo antes de o TOC entrar. É mais larga que qualquer referência
  `almond` (576–768px) e bem acima dos 672px do shinydoc de hoje. Um laptop de 1366px cai exatamente
  nessa faixa.

Isto é uma propriedade medida do `mint`, não uma objeção reaberta por gosto. **A decisão é do mapa;
a medição só recusa dizer que o risco não existe.**

#### As páginas de API têm outra aritmética

Em `api-session.html` **não existe TOC**. O `#content-side-layout` hospeda o painel de exemplo da
API, e este ocupa os `28rem` inteiros (`xl:w-[28rem]`), então o `grow` não devolve nada:

| viewport | prosa em página de doc | prosa em página de API |
| --- | --- | --- |
| 1280px | 528,8 | **384,8** |
| ≥1472px | 720,8 | **576,8** |

### 5.5 O topo, e os offsets que não batem entre si

| token / classe | valor |
| --- | --- |
| linha do navbar | `h-16` = **64px** |
| faixa de tabs | `h-12` = **48px** (= `--topbar-tabs-height: 3rem`) |
| **topo grudado, ≥1024px** | **112px** |
| linha de navegação mobile | `h-14` = **56px** |
| **topo fixo, <1024px** | **120px** |
| topo / altura da sidebar | `calc(4rem + 3rem)` = 112px / `calc(100dvh − 112px)` |
| topo do TOC | `top-[9.5rem]` = **152px** |
| padding de topo do conteúdo | `pt-40` = 160px / `lg:pt-10` = **40px** |
| `--scroll-mt` | **`9.5rem` = 152px** (base) |
| `--scroll-mt` ≥1024px | **`6.3rem` = 100,8px** |

O padrão é consistente: **40px de respiro entre o topo grudado e o conteúdo** nos dois regimes
(160 − 120 = 40; e `lg:pt-10` = 40), e o TOC começa nos mesmos 152px (112 + 40).

**Duas tensões medidas, não explicadas:**

- `--scroll-mt` ≥1024px é **100,8px**, menor que os 112px do topo grudado — uma âncora cairia ~11px
  atrás do header. O próprio Devin compensa no CSS dele
  (`.scroll-anchor{position:relative;top:calc(-2rem - var(--scroll-mt))}`).
- `--mintlify-slot-header-height` **nunca é declarado** — nem no CSS, nem no HTML. Todos os
  `top`/`height` da sidebar caem no fallback `calc(4rem + var(--topbar-tabs-height, 0rem))`.

### 5.6 Os quatro modos de página

| `mode` | classe no shell | largura |
| --- | --- | --- |
| *(default)* | `max-w-8xl` | **1472px**, com sidebar e TOC |
| `center` | `max-w-3xl` = `var(--container-3xl)` | **768px** |
| `wide` | `lg:*:last:max-w-216` → `calc(var(--spacing)*216)` | **864px** |
| `custom` | `max-w-none` | sem teto; o primeiro filho (a sidebar) some em todos os breakpoints |

A utilidade `max-w-216` só é emitida na forma prefixada pela variante, não como classe solta. O
Devin serve `data-page-mode="none"` em todas as páginas medidas — **nenhum modo é exercitado**.

---

## 6. Elevação e forma

A decisão que isto alimenta é *"a página é plana; o objeto tem anel mínimo"*. A medição sustenta a
posição com folga maior do que a #3 indicava.

### 6.1 A página é plana — a prova

Contagem de sombra no DOM renderizado das seis páginas:

| página | `shadow-xs` | `shadow-sm` | `shadow-md` ou maior |
| --- | --- | --- | --- |
| `intro` | 8 | 0 | **0** |
| `api-overview` | 8 | 0 | **0** |
| `api-session` | 0 | 16 | **0** |
| `enterprise` | 4 | 0 | **0** |
| `billing` | **0** | **0** | **0** |
| `ja-intro` | 8 | 0 | **0** |

**Existe exatamente um portador de sombra no site: o chip de link-âncora que aparece no hover ao
lado de cada heading.** É um quadrado de 24px (`size-6 rounded-md`), e a sombra é
`0 1px 2px 0 #0000000d` — alpha de 5%.

**Nenhum componente de conteúdo tem sombra.** Nem `Card`, nem `Frame`, nem bloco de código, nem
callout, nem paginação, nem o painel do assistente.

Duas notas de precisão sobre a #3:

- `.shadow-xs` e `.shadow-sm` são **byte-idênticos neste build** (`0 1px 2px 0 #0000000d`). Não é a
  escala oficial do Tailwind v4 — o Mintlify aliasou os dois. Os 16 `shadow-sm` da `api-session` são
  visualmente o mesmo que os `shadow-xs` das outras.
- A faixa não é "6–10 por site": é **0 a 16 por página**. `billing.html` tem **zero**.
- `children:shadow-none!` **não é decisão de elevação** — é reset do `<pre>` dentro do scroll do
  bloco de código.

O CSS **tem** `shadow-md`/`lg`/`xl`/`2xl` e algumas arbitrárias grandes (até
`0 25px 50px -12px #00000040`), e **nenhuma delas é usada pelo Devin**. Os dois únicos `box-shadow`
literais no HTML são CSS próprio do Devin, na galeria de use cases
(`box-shadow:0 4px 16px rgba(0,0,0,0.06)` no hover de cartão), **não** da skin `mint`.

### 6.2 O anel — três mecanismos, escolhidos por contexto

| mecanismo | regra | onde |
| --- | --- | --- |
| `ring-1` (box-shadow com spread) | `--tw-ring-shadow: 0 0 0 calc(1px + …) var(--tw-ring-color)` | controles flutuantes do chrome: busca, "Ask Assistant", chip de âncora |
| `border` 1px | — | caixas de conteúdo: `Card`, callout, bloco de código, accordion, menu de contexto |
| overlay absoluto com borda | `<div class="absolute inset-0 pointer-events-none border border-black/5 rounded-2xl dark:border-white/5">` | `Frame`, onde a mídia precisa preencher a caixa sem clipping do raio |

**Achado que corrige uma leitura fácil de errar:** `outline-offset-[-1px]` é o utilitário de "anel"
mais frequente do site (**366 ocorrências**, em todo item de sidebar) e **não desenha nada**. Não vem
com `outline-width` nem `outline-style`. Ele só puxa para dentro o anel de foco automático do
navegador, recolorido pela regra global:

```css
:focus-visible          { outline-color: rgb(var(--primary)/1) }
html.dark :focus-visible{ outline-color: rgb(var(--primary-light)/1) }
```

**Não há anel permanente em item de sidebar.** `ring-inset` existe no CSS com **zero usos**;
`inset-ring` (v4) não existe no arquivo.

`border-width` **confirma a #3**: 21 declarações do shorthand, valores `0`, `1px` e `2px`. Contando
as direcionais aparecem também `border-l-4` e `border-inline-start-width:.25rem`, **ambos com zero
usos** no Devin.

Cores de borda mais usadas:

| classe | claro | escuro |
| --- | --- | --- |
| `border-standard` | `color-mix(in oklab, rgb(var(--gray-200)) 70%, transparent)` | `#ffffff1a` |
| `border-gray-950/10` / `dark:border-white/10` | 10% do `gray-950` | `#ffffff1a` |
| `dark:border-white/[0.07]` | — | `#ffffff12` |
| `border-black/5` / `dark:border-white/5` | `#0000000d` | `#ffffff0d` |
| `border-gray-500/5` (navbar) | 5% do `gray-500` | `dark:border-gray-300/[0.06]` |

### 6.3 Elevação por componente

| componente | raio | borda | anel | sombra | fundo |
| --- | --- | --- | --- | --- | --- |
| **`Frame`** | `rounded-2xl` **16px** | overlay absoluto 1px `black/5` · `dark:white/5` | é o overlay | **não** | `bg-gray-50/50` · `dark:bg-gray-800/25` |
| **`Card`** | **16px** | 1px `gray-950/10` · `dark:white/10` | `ring-2 ring-transparent` (reservado, invisível) | **não** | `bg-white` · `dark:bg-background-dark` |
| `Card` hover (link) | 16px | `hover:border-primary!` | — | **não** | — |
| **bloco de código** | **16px** | 1px `gray-950/10` · `dark:white/10` | zera tudo dentro (`**:ring-0 **:outline-0`) | **não** | `bg-transparent`; `--shiki-dark-bg:#0B0C0E` |
| **code group** | 16px | 1px | não | **não** | `bg-gray-50` · `dark:bg-white/5` |
| **callout** (tip / note) | **16px** | 1px `green-200`/`blue-200` · `dark:green-900`/`blue-900` | não | **não** | `bg-green-50`/`bg-blue-50` · `dark:*-600/20` |
| **item ativo da sidebar** | `rounded-xl` **12px** | **nenhuma** | só no foco | **não** | `bg-primary/10` · `dark:bg-primary-light/10` |
| **paginação** | `rounded-sm` 2px (alvo de foco) | **nenhuma** | só no foco | **não** | **nenhum** |
| **`field-info-pill`** | `rounded-md` 6px | nenhuma | não | **não** | `bg-stone-100/50` · `dark:bg-white/5` |
| `field-required-pill` | 6px | nenhuma | não | não | `bg-red-100/50` · `dark:bg-red-400/10` |
| separador de campo | — | `border-b border-gray-100 dark:border-gray-800 last:border-b-0` | — | — | — |
| **navbar** | — | `border-b` 1px `gray-500/5` · `dark:gray-300/[0.06]` | não | **não** | `bg-background-*` |
| **tab ativa** | — | barra de **1.5px** `bg-primary` | não | não | — |
| **`#chat-assistant-sheet`** | **nenhum** | **nenhuma** | não | **não** | separação = tira de 1px `w-px bg-gray-100 dark:bg-gray-800` |
| **botão de busca / Ask AI** | **12px**, `h-9` | **nenhuma** | **`ring-1 ring-gray-400/30`** | **não** | `bg-background-*` + `dark:brightness-[1.1]` → `1.25` no hover |
| **CTA primário** | **12px** | nenhuma | não | **não** | camada absoluta `bg-primary-dark`; hover = `opacity-[0.9]` |
| **accordion** | 16px | `border-standard` 1px | não | não | `bg-background-light` · `dark:bg-codeblock` |
| tooltip / dropdown / modal de busca | — | — | — | — | **não medido** — client-side |

**O estado ativo nunca usa elevação nem borda** — é fundo tingido a 10% + cor de texto +
falso-negrito por `text-shadow`. Vale para sidebar e para tab de navbar.

**Elevação por brilho, não por sombra**: os controles do chrome no escuro usam
`dark:brightness-[1.1]` subindo para `1.25` no hover. É o substituto do Mintlify para hover-elevation.

### 6.4 Forma

Distribuição de `rounded-*` no DOM (página `intro`, com `api-session` para contraste):

| classe | intro | api-session | px |
| --- | --- | --- | --- |
| `rounded-xl` | **69** | 82 | **12px** |
| `rounded-2xl` | **22** | 7 | **16px** |
| `rounded-md` | 10 | 56 | 6px |
| `rounded-lg` | 4 | 13 | 8px |
| `rounded-full` | **2** | 4 | 9999px |
| `rounded-sm` | 1 | 2 | 2px |
| `rounded-xt` | 0 | **54** | **14px** |

**Confirma a #3** em `xl 69 · 2xl 22 · md 10 · lg 4`. **Corrige `rounded-full` de 4 para 2** — os
outros dois vinham do payload RSC, não do DOM.

**12px e 16px cobrem ~77% de todos os raios.** 6px e 8px são para controles pequenos; 2px e 9999px
são residuais.

Nenhum `--rounded-*` é declarado em lugar nenhum — nem no CSS principal, nem no base, nem nos seis
blocos `<style>` inline. **Todo raio cai no fallback**, o que confirma a #3. O único token de raio
declarado é `:root,:host{--radius-xl:var(--rounded-xl,.75rem)}`, que só repassa o mesmo fallback, e
tem um consumidor: `before:rounded-[calc(var(--radius-xl)-1px)]` — o clássico "raio interno = externo
− borda".

> **Defeito latente medido.** `.rounded-xt` lê `var(--rounded-xl, 14px)` — **o mesmo custom property
> de `.rounded-xl`, com fallback diferente**. Como o Devin não declara `--rounded-xl`, os dois
> divergem (12px vs 14px). Se qualquer site declarar `--rounded-xl`, os dois colapsam no mesmo valor
> e o `rounded-xt` deixa de existir. É bug do tema, não desenho. Registrado porque uma spec que
> declare o token herdaria a armadilha.

### 6.5 Callout — o fallback existe e não é usado

Os quatro fallbacks da #3 **confirmam verbatim** no CSS: `--callout-bg-color-light` `#71717a1a`,
`--callout-border-color-light` `#71717a33`, `--callout-bg-color-dark` `#71717a1a`,
`--callout-border-color-dark` `#71717a4d`. Existem ainda dois pares extra não listados antes:
`--callout-light-bg-color` (fallback `#7171711a` — note o cinza diferente) e
`--callout-light-border-color`.

**Mas os callouts do Devin não usam essas classes.** Usam cor semântica direta:
`border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-600/20` para `Tip`, e o par azul
para `Note`. **A cor semântica por tipo continua sendo decisão nossa** — o Mintlify a resolve no
componente, não no CSS servido.

---

## 7. A anatomia de uma página `mint`

### 7.1 A ordem, medida

```
#header                                   relative leading-none @container/page-header
└── div.mt-0.5.space-y-2.5                 → 10px entre os blocos
    ├── div.eyebrow                        → nome do grupo · text-sm font-semibold text-primary · h-5
    ├── div.flex.flex-col.sm:flex-row…     → h1 + menu de contexto lado a lado ≥640px
    │   ├── h1#page-title
    │   └── #page-context-menu             hidden @[520px]/page-header:flex
    ├── div.mt-2.text-lg.prose             → O LEAD · 8px acima · 18px
    └── #page-context-menu                 mt-3 · @[520px]/page-header:hidden — o mesmo ID de novo
#content        .mt-8 … .mb-14             → 32px acima da prosa, 56px abaixo
#pagination
#footer         .pt-10 … .pb-28
```

**Não há breadcrumb visual** — confirma a #2. `BreadcrumbList` só existe como JSON-LD. O papel de
"onde estou" é da eyebrow, e no estreito da linha de navegação de 56px do topo (§8.5).

### 7.2 O lead — o elemento que faltava

```html
<div class="mt-2 text-lg prose prose-gray dark:prose-invert [&>*]:[overflow-wrap:anywhere]">
  <p>Devin is the AI software engineer, built to help ambitious engineering teams crush their backlogs.</p>
</div>
```

- **É o `description` do frontmatter** — bate exatamente com o `<meta name="description">`.
- `mt-2` = 8px declarado, mas colapsa contra os 10px do `space-y-2.5` → **gap efetivo de 10px**.
- `text-lg` = **18px**, num bloco `prose` próprio.
- **É condicional**, e a eyebrow também:

| página | eyebrow | lead |
| --- | --- | --- |
| `/get-started/devin-intro` | `Get Started` | sim |
| `/get-started/first-run` | `Get Started` | sim |
| `/api-reference/overview` | `Getting Started` | sim |
| `/api-reference/v1/sessions/create-a-new-devin-session` | `Session Endpoints` | sim |
| `/ja/get-started/devin-intro` | `概要` | sim |
| `/admin/billing` | `Billing` | **não** |
| `/release-notes/overview` | `Release Notes` | **não** |
| `/enterprise/overview` | **não** | **não** |

### 7.3 O menu de contexto

Um **par de botões colados**, não um botão só:

- "Copy page": `rounded-l-xl px-3 py-1.5 border border-gray-200 dark:border-white/[0.07]
  bg-background-light hover:bg-gray-600/5 border-r-0`
- "More actions": `rounded-r-xl border aspect-square h-[34px]`, `aria-haspopup="menu"`

**Borda de 1px, sem sombra.** `min-w-[156px]`, `hidden @[520px]/page-header:flex`.

> **Defeito medido:** o `#page-context-menu` aparece **duas vezes na mesma página, com o mesmo
> `id`** — uma para cada ramo da container query. ID duplicado é HTML inválido e quebra
> acessibilidade. Registro porque um swizzle que copie a estrutura copiaria o defeito. A saída certa
> é **um elemento só, reposicionado por CSS**.

O contêiner `page-header` tem a largura da prosa, então o limiar de 520px **também dispara no
desktop nas páginas de API** (onde a prosa cai para ~385px em 1280px). Ou seja: o botão "Copy page"
desce para baixo do lead entre 1280 e ~1416px, **só na referência de API**.

As opções vêm do `docsConfig`:
`"contextual":{"options":["copy","view","devin","windsurf","chatgpt","claude"],"display":"header"}`.

### 7.4 A paginação mudou

**Antes** (#2): `grid lg:grid-cols-2 gap-4`, cada lado um cartão `border rounded-xl py-3 px-4` com
`pagination-title` e `pagination-label`.

**Agora**, verbatim e idêntico nas seis páginas:

```html
<nav id="pagination" aria-label="Pagination"
     class="px-0.5 flex items-center gap-6 text-sm font-semibold text-gray-700 dark:text-gray-200">
  <a rel="prev" aria-label="Previous: Introducing Devin" data-component-part="pagination-prev"
     class="group flex items-center min-w-0 focus-visible:outline-2 focus-visible:outline-offset-2
            focus-visible:outline-primary … gap-3 rounded-sm pagination-prev" href="…">
    <svg viewBox="0 0 3 6" data-component-part="pagination-chevron"
         class="h-1.5 shrink-0 stroke-gray-400 overflow-visible group-hover:stroke-gray-600">…</svg>
    <div class="truncate group-hover:text-gray-900 dark:group-hover:text-white"
         data-component-part="pagination-title">Introducing Devin</div>
  </a>
  <a rel="next" … class="… gap-3 rounded-sm ml-auto pagination-next" href="…">
    <div … data-component-part="pagination-title">Tutorial Library</div>
    <svg … class="… rotate-180">…</svg>
  </a>
</nav>
```

| | antes | agora |
| --- | --- | --- |
| layout | `grid lg:grid-cols-2 gap-4` | `flex items-center gap-6` (**24px**), `ml-auto` no "next" |
| cartão | `border rounded-xl py-3 px-4` | **nenhum** — sem borda, sem fundo, sem padding |
| rótulo | `pagination-label` visível | **sumiu do DOM**; só em `aria-label` |
| tipografia | — | `text-sm font-semibold text-gray-700 dark:text-gray-200` |
| seta | — | SVG `viewBox="0 0 3 6"`, `h-1.5` (**6px**), `stroke-gray-400`, `stroke-width="2"` |
| gap ícone↔texto | — | `gap-3` = 12px |
| responsivo | uma coluna → duas em 1024px | **nenhuma classe responsiva** |

Quando só há um vizinho, só um `<a>` é emitido. **É uma mudança de direção do Mintlify rumo ao
"plano"** — a paginação era o último cartão da página de conteúdo no `mint`, e deixou de ser.

### 7.5 O footer

```html
<footer id="footer" class="flex gap-12 justify-between pt-10 border-t border-gray-100
        sm:flex dark:border-gray-800/50 pb-28">
```

Confirma a #2. `pt-10` = 40px, `pb-28` = **112px**, borda de topo `gray-100` / `gray-800` a 50%.
O `sm:flex` é **no-op** — já é `flex` na base. **Nem paginação nem footer respondem a breakpoint.**

### 7.6 Um objeto novo: a barra flutuante de pergunta

Depois do `#pagination`, dentro do `#content-area`:

```html
<div class="left-0 right-0 sticky bottom-0 w-full overflow-hidden z-20 pointer-events-none print:hidden">
  <div class="chat-assistant-floating-input … translate-y-[100px] opacity-0">
    <div class="relative pb-4 sm:pb-6">
      <div class="flex flex-col w-full rounded-2xl pointer-events-auto bg-background-light
                  dark:bg-background-dark border border-gray-200 dark:border-white/30
                  focus-within:border-primary dark:focus-within:border-primary-light
                  transition-colors max-w-[386px] mx-auto">
        <textarea id="chat-assistant-textarea" placeholder="Ask a question..." …>
```

`sticky bottom-0`, centrada, **386px** de largura máxima, `rounded-2xl` (16px), borda de 1px que vira
a primária no foco, entrada animada (`translate-y-[100px] opacity-0` no SSR). **É o único objeto que
fica permanentemente sobre a coluna de texto** — e mesmo ele não tem sombra. `sem base de comparação`.

---

## 8. O chrome

### 8.1 Navbar

```html
<header id="navbar" class="z-30 fixed lg:sticky top-0 w-full peer is-not-custom peer is-not-center
        peer is-not-wide peer is-not-frame">
  <div id="navbar-transition" class="absolute w-full h-full flex-none transition-colors duration-500
       border-b border-gray-500/5 dark:border-gray-300/[0.06] bg-background-light
       dark:bg-background-dark" data-is-opaque="false"></div>
  <div class="max-w-8xl mx-auto relative">
    …
    <div class="flex items-center lg:px-12 h-16 min-w-0 mx-4 lg:mx-0">
```

- `fixed lg:sticky top-0`, `z-30` — o mais alto do shell. Confirma a #2.
- **O fundo sangra, o conteúdo não.** `#navbar-transition` é `absolute w-full` (ponta a ponta); o
  conteúdo vive num `max-w-8xl mx-auto` (1472px).
- **`data-is-opaque="false"` no SSR** + `transition-colors duration-500`: o navbar **nasce
  transparente e vira opaco no scroll**, em 500ms. A #2 tinha isto como `não medido`. **Não existe
  nenhuma regra CSS com seletor `[data-is-opaque]`** no bundle — o efeito é dirigido por JS.
- Altura `h-16` = **64px**; padding `mx-4` (16px) no estreito, `lg:px-12` (**48px**) no largo.
- Hairline: `border-gray-500/5 dark:border-gray-300/[0.06]` — **5% / 6% de alpha**. E há uma
  **segunda** borda, inset, na linha do logo.

**A busca:**

```html
<button id="search-bar-entry" class="group/search flex … rounded-xl w-full items-center text-sm
   leading-6 h-9 pl-3.5 pr-3 … bg-background-light dark:bg-background-dark dark:brightness-[1.1]
   dark:ring-1 dark:hover:brightness-[1.25] ring-1 ring-gray-400/30 hover:ring-gray-600/30 …">
  … <div class="truncate min-w-0">Search...</div>
  <span class="flex-none text-xs font-semibold">⌘<!-- -->K</span>
```

**`⌘K` está no HTML servido — lacuna da #2 fechada.** `h-9` = 36px, `rounded-xl` = 12px, separação
por `ring-1` a 30% de alpha.

**O CTA** (`#topbar-cta-button`): `pl-3 pr-2 py-2 text-sm font-medium`, fundo num `<span>` absoluto
`bg-primary-dark rounded-xl group-hover:opacity-[0.9]`, texto `text-white`.

**O tema**: `#theme-preference-menu-trigger`, três ícones. O `docsConfig` **não declara
`appearance`** → default do Mintlify (system, não estrito). Confirma a #2.

### 8.2 A faixa de tabs

```html
<div class="hidden lg:flex px-12 h-12">
  <div class="nav-tabs h-full flex text-sm gap-x-6">
    <a class="link nav-tabs-item group relative h-full gap-2 flex items-center font-medium
       text-gray-800 dark:text-gray-200 [text-shadow:-0.2px_0_0_currentColor,0.2px_0_0_currentColor]"
       data-active="true" aria-current="location" href="/get-started/devin-intro">Cloud
      <div class="absolute bottom-0 h-[1.5px] w-full left-0 bg-primary dark:bg-primary-light"></div>
    </a>
```

As quatro perguntas do ticket, respondidas:

| pergunta | resposta medida |
| --- | --- |
| **altura** | `h-12` = **48px**, batendo com `--topbar-tabs-height: 3rem` |
| **sangra de ponta a ponta?** | **não** — está dentro do `max-w-8xl mx-auto` do navbar, com `px-12` (48px). **Só o fundo e a borda inferior sangram**, porque vêm do `#navbar-transition`, que é `absolute w-full` |
| **rola junto ou fica?** | **fica** — é filha do `#navbar`, que é `fixed lg:sticky top-0`. Os 112px grudam inteiros |
| **some em qual largura?** | `hidden lg:flex` → **existe só a partir de 1024px** |

`gap-x-6` = 24px entre tabs; `text-sm font-medium`; indicador ativo é uma barra `absolute bottom-0
h-[1.5px] w-full` em `bg-primary`, com o mesmo **falso-negrito por `text-shadow`** da sidebar; no
hover a barra aparece em `gray-200`/`gray-700`; ativo marcado com `data-active="true"` **e**
`aria-current="location"`.

**`.nav-tabs` e `.nav-tabs-item` não têm nenhuma regra no bundle** — são classes-gancho vazias, como
`eyebrow`, `sidebar-group`, `pagination-title`. Todo o estilo é utilitário no markup. Para uma spec de
Docusaurus isso é o modelo certo: **chrome nomeado por gancho estável, estilo em camada própria**.

As **7 tabs** confirmam a #2, verbatim e na ordem: `Cloud` (`/get-started/devin-intro`) · `CLI` ·
`Desktop` · `Enterprise` · `Use Cases` · `API` · `Federal`.

### 8.3 A sidebar

```html
<nav aria-label="Pages" id="sidebar" class="z-20 hidden lg:block sticky self-start shrink-0
     w-[18rem] top-(--mintlify-slot-header-height,calc(4rem+var(--topbar-tabs-height,0rem)))
     h-[calc(100dvh-var(--mintlify-slot-header-height,calc(4rem+var(--topbar-tabs-height,0rem))))]">
```

**288px, `sticky`, a partir de 1024px, topo e altura em 112px** — confirma a #2 inteira. **Não existe
nenhuma regra CSS com seletor `#sidebar`** no bundle; o estilo é 100% utilitário.

Densidade, agora medida (a #3 tinha isto como `não medido`):

| peça | classe | valor |
| --- | --- | --- |
| tipografia | `lg:text-sm lg:leading-6` | **14px / 24px** |
| máscara de topo | `sticky top-0 h-8 bg-linear-to-b from-background-light` | gradiente de **32px** |
| viewport de scroll | `pr-8 pb-10 [--scroll-area-fade-size:32px]`, `scrollbar-width:none` | 32px / 40px |
| cabeçalho de grupo | `flex items-center gap-2.5 pl-4 mb-3.5 lg:mb-2.5 font-semibold text-gray-900` | pl **16px**, mb 14 → **10px** |
| lista do grupo | `space-y-px` | **1px** entre itens |
| item | `flex items-start pr-3 py-1.5 gap-x-3 rounded-xl w-full outline-offset-[-1px]` | py **6px**, pr **12px**, raio **12px** |
| indentação | `style="padding-left:1rem"` (62×) e `1.75rem` (8×) | **16px / 28px** |
| ícone | `size-4 bg-primary dark:bg-primary-light` (SVG mascarado) | **16px** |

**A sidebar do Devin é rasa**: cabeçalho de grupo + um nível de item em quase todo o site, com um
segundo nível (28px) aparecendo **só dentro da referência de API**. Oito grupos na página medida.

O item ativo confirma a #2 verbatim, incluindo o truque:

```html
<a class="group flex items-start pr-3 py-1.5 cursor-pointer gap-x-3 text-left
   focus-visible:-outline-offset-2 rounded-xl w-full outline-offset-[-1px]
   bg-primary/10 text-primary [text-shadow:-0.2px_0_0_currentColor,0.2px_0_0_currentColor]
   dark:text-primary-light dark:bg-primary-light/10"
   style="padding-left:1rem" aria-current="page" href="…">
```

### 8.4 O TOC

```html
<div id="content-side-layout" class="hidden xl:flex self-start sticky xl:flex-col max-w-[28rem]
     z-21 h-[calc(100vh-9.5rem)] top-[9.5rem]">
  <div id="table-of-contents-layout" class="z-10 hidden xl:flex box-border max-h-full pl-10 w-[19rem]">
    <div id="table-of-contents" class="min-w-0 text-gray-600 text-sm leading-6 w-[16.5rem] -mt-10">
```

| peça | valor |
| --- | --- |
| trilho | `max-w-[28rem]` = **448px — teto, não largura** |
| coluna real | `w-[19rem]` = **304px**, com `pl-10` = 40px |
| lista | `w-[16.5rem]` = **264px**, `text-sm leading-6` = 14/24px, `text-gray-600` |
| entrada | `xl:flex` → **só a partir de 1280px** |
| topo / altura | `top-[9.5rem]` = 152px / `calc(100vh − 9.5rem)` |
| espaçamento | `space-y-2` (8px) entre blocos, `py-1` (4px) por item |

O cabeçalho é **um botão**, não um rótulo:

```html
<h2 class="m-0 font-normal">
  <button class="text-gray-700 dark:text-gray-300 font-medium flex items-center space-x-2
                 hover:text-gray-900 transition-colors cursor-pointer">
    <svg…/><span>On this page</span>
```

**O TOC é colapsável.** A #2 não registrou isso.

Profundidade: `data-depth="0"` e `data-depth="1"` — **dois níveis** (h2 e h3). Indentação
paramétrica:

```html
<a style="--toc-padding-left:0rem" class="break-words py-1 block
     pl-[calc(var(--toc-padding-left)+var(--toc-focus-padding,0rem))]
     focus-visible:[--toc-focus-padding:0.25rem] focus-visible:-ml-1 …">
```

Nível 0 é `font-medium`; nível 1 não. O truque de foco: `--toc-focus-padding` sobe para `.25rem` e um
`-ml-1` compensa, de modo que **o anel de foco ganha 4px de folga sem deslocar o texto**. Mesma
família do falso-negrito da sidebar.

**Não há trilho de 1px nem numeração** — a separação é só tipográfica.

### 8.5 O que existe só no estreito

Abaixo de 1024px a faixa de tabs some e entra uma linha de navegação:

```html
<button class="flex items-center h-14 py-4 px-5 lg:hidden focus:outline-0 w-full text-left">
  <span class="sr-only">Navigation</span> <svg…>   ← hambúrguer
  <div class="ml-4 flex text-sm leading-6 whitespace-nowrap min-w-0 space-x-3 overflow-hidden">
    <div class="flex items-center space-x-3 shrink-0"><span>Get Started</span><svg…></div>
    <div class="font-semibold text-gray-900 truncate dark:text-gray-200 min-w-0 flex-1">Introducing Devin</div>
```

**56px de altura, `px-5` (20px), largura total.** É ao mesmo tempo o abridor do drawer e o único
breadcrumb do site: grupo › título da página, com o título em `font-semibold` e truncado.

**Ordem de degradação, medida:**

| elemento | <1024px | ≥1024px |
| --- | --- | --- |
| `#search-bar-entry` (campo largo, "Search… ⌘K") | oculto | visível |
| `#search-bar-entry-mobile` (ícone 32×32) | visível | oculto |
| `#assistant-entry` ("Ask Assistant") | **oculto** | visível |
| `#assistant-entry-mobile` (só ícone) | visível | oculto |
| menu "More actions" (⋮) | visível | oculto |
| seletor de idioma, CTA, links, tema | ocultos | visíveis |
| painel do assistente | `max-lg:hidden` | visível quando aberto |

O assistente tem ainda **uma trava em JS no mesmo 1024**, inline no HTML:
`if(window.matchMedia("(max-width: 1024px)").matches||!d){ … setAttribute("data-assistant-state","closed") }`.

**O drawer da sidebar: parcialmente `não medido`.** O painel **não está no SSR**. O que dá para ler do
CSS emitido — e é **inferência, não medição**, porque não consigo atribuir as utilidades ao
componente por fonte primária:

```css
--bleed: 3rem
.w-[calc(85dvw+var(--bleed))]      { width: calc(85dvw + 3rem) }
.min-w-[calc(19rem+var(--bleed))]  { min-width: calc(19rem + 3rem) }   /* 304 + 48 */
.max-w-[calc(22rem+var(--bleed))]  { max-width: calc(22rem + 3rem) }   /* 352 + 48 */
.-ml-(--bleed)                     { margin-left: -3rem }
```

Leitura provável: largura `85dvw` clampada entre 304 e 352px, com 48px de sangria puxada para fora
pela esquerda — **origem esquerda**. Overlay, animação e estrutura: **não medidos**.

---

## 9. Arquitetura de informação e superfície AI-era

### 9.1 A config, verbatim do payload RSC

```json
"theme": "mint",
"name": "Devin Docs",
"colors": { "primary": "#317CFF", "light": "#317CFF", "dark": "#317CFF" },
"api": { "playground": { "display": "simple" },
         "mdx": { "auth": { "method": "bearer" }, "server": "https://api.devin.ai" } },
"background": { "color": { "light": "#FCFCFC", "dark": "#141414" } },
"navbar": { "links": [{ "href": "mailto:support@cognition.ai", "label": "Support" }],
            "primary": { "type": "button", "label": "Devin", "href": "https://app.devin.ai" } },
"footer": { "socials": { "linkedin": "…", "x": "…" } },
"seo": { "metatags": { "canonical": "https://docs.devin.ai" } },
"contextual": { "options": ["copy","view","devin","windsurf","chatgpt","claude"], "display": "header" },
"styling": { "latex": true, "codeblocks": "system" },
"navigation": { "languages": ["en","es","ja","zh","fr","de","pt-BR","it"] },
"fonts": "$undefined",
"subdomain": "cognitionai"
```

Confirma `theme: mint`, as cores, o `styling` e a ausência de fonte própria. **`appearance` não é
declarado** → default. **Mudou:** os idiomas passaram de **7 para 8**, com a entrada de **`pt-BR`**.

Eixo de navegação: `languages` → `tabs` (7) → grupos. Confirma a #2.

**Não há landing.** `https://docs.devin.ai/` responde **308** para `/get-started/devin-intro`. A
primeira página do site é uma página de conteúdo comum — eyebrow, `h1`, lead e prosa. **O Devin não
tem página de rosto.** Isso é um dado a considerar contra a decisão 2 do mapa ("a landing concentra o
impacto"): a referência única **não tem** landing para copiar.

### 9.2 A superfície para agentes cresceu bastante

O header `Link:` de toda página anuncia seis recursos, mais o header próprio `x-llms-txt: /llms.txt`:

| recurso | status | tamanho | o que é |
| --- | --- | --- | --- |
| `/llms.txt` | 200 | 90.866 B, 562 linhas | índice de todas as páginas, `- [Título](url.md): descrição` |
| `/llms-full.txt` | 200 | **2.756.130 B** | o corpus inteiro em um arquivo |
| `/.well-known/agent-card.json` | 200 | 910 B | cartão A2A, `protocolVersion: 0.3`, `preferredTransport: HTTP+JSON` |
| `/.well-known/mcp/server-card.json` | 200 | 4.395 B | cartão de servidor MCP |
| `/.well-known/agent-skills/index.json` | 200 | 547 B | `schemas.agentskills.io/discovery/0.2.0`, com `digest: sha256:…` |
| `/.well-known/api-catalog` | **404** | — | anunciado no header e **não servido** |
| `/sitemap.xml` | 200 | 657.532 B | — |

**O `.md` por rota tem um preâmbulo injetado**, igual em todas as páginas medidas:

```markdown
> ## Documentation Index
> Fetch the complete documentation index at: https://docs.devin.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Introducing Devin

> Devin is the AI software engineer, built to help ambitious engineering teams crush their backlogs.

<Frame caption="Example Devin session, from prompt to PR">
  <video controls width="100%" playsInline />
</Frame>
```

Três coisas medidas aí: o `.md` **aponta o agente para o `llms.txt`** antes do conteúdo; o **lead vira
citação** logo abaixo do `h1`; e **as tags MDX vão cruas** (`<Frame>`, `<Tip>`, `<Note>`, `<Card>`,
`<CardGroup>`), sem degradar para Markdown puro.

`docs.json` na raiz responde **404** — a config só é legível pelo payload RSC.

---

## 10. Índice do que ficou por medir

Para que nada aqui seja lido como completo.

| item | por quê |
| --- | --- |
| Computed style / valores renderizados | Sem navegador na sessão. Toda largura da §5.4 e todo colapso de margem da §4 são **derivados** |
| Diff byte a byte do CSS antigo | Chunk antigo em 404; Wayback sem captura |
| O fundo pintado da página | Não há regra de `background` em `html`/`body` no CSS servido |
| DOM, overlay e animação do drawer mobile | Client-side; o SSR só traz o botão |
| Modal de busca, menu suspenso, tooltip, painel do assistente aberto | Client-side; `role="dialog"`/`role="menu"` = 0 no SSR |
| A que componente pertencem `w-[calc(85dvw+3rem)]` e companhia | As utilidades existem no bundle e não no markup; a leitura "drawer" é **inferência** |
| Transição de opacidade do navbar no scroll | Sem regra `[data-is-opaque]` no CSS; efeito em JS |
| `blockquote`, `table`, `h4` puro, `img` na prosa | **Zero exemplares** nas páginas baixadas; só a regra do CSS |
| Modo `is-wide`, `is-center`, `is-custom`, `frame` | O Devin serve `data-page-mode="none"` em todas as páginas; nenhum modo exercitado |
| Cor semântica de callout por tipo, como sistema | O CSS traz só o fallback neutro; a cor por tipo é escolha do componente |
| Paleta de sintaxe (Shiki) | `"codeblocks":"system"` — sem tema nomeado; os hex vivem no bundle JS |
| Scroll-spy do TOC, colapso de grupo na sidebar, colapso do TOC | Runtime |
| Contagem de componente no corpus (1.740 páginas) | Fora de escopo; é da #4 |

---

## Procedência

Tudo baixado por `curl` em **2026-08-10**, user-agent de Chrome 131, direto de `docs.devin.ai`.

| recurso | tamanho |
| --- | --- |
| `/mintlify-assets/_next/static/chunks/a2c16a79b30ca688.css` | 4.195 B — `c7e1d31ed09ce7762776a23c61bb82b9` |
| `/mintlify-assets/_next/static/chunks/dc1e9a5f4ee7caeb.css` | 440.994 B — `6e609373767785fd929249958a41473f` |
| `/get-started/devin-intro` + `.md` | 409.835 B + 7.886 B |
| `/get-started/first-run` + `.md` | 526.989 B + 20.380 B |
| `/api-reference/overview` + `.md` | 451.722 B + 4.222 B |
| `/api-reference/v1/sessions/create-a-new-devin-session` + `.md` | 557.048 B + 5.870 B |
| `/enterprise/overview` + `.md` | 494.579 B + 5.880 B |
| `/admin/billing` + `.md` | 346.919 B + 969 B |
| `/release-notes/overview` + `.md` | 789.150 B + 101.243 B |
| `/ja/get-started/devin-intro` + `.md` | 427.526 B + 11.243 B |
| `/llms.txt` · `/llms-full.txt` · `/sitemap.xml` | 90.866 B · 2.756.130 B · 657.532 B |
| `/.well-known/agent-card.json` · `mcp/server-card.json` · `agent-skills/index.json` | 910 B · 4.395 B · 547 B |
| 6 blocos `<style>` inline (≈10,2 KB) | — |

Verificação cruzada de host: `docs.perplexity.ai/mintlify-assets/_next/static/chunks/dc1e9a5f4ee7caeb.css`
baixado separadamente, **byte-idêntico** ao do Devin.

**Um redeploy de qualquer host Mintlify troca o nome do chunk e pode mudar valores — os MD5 acima
fixam o que foi medido.** Foi exatamente o que aconteceu entre 2026-08-04 e hoje.
