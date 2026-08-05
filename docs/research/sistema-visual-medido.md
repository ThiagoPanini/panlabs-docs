# Sistema visual medido das sete referências

> Pesquisa da issue [#3](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/3). Medição em **2026-08-04**.
> Registro **por site**, sem média nem síntese entre eles — a chamada de coerência é outro ticket.

## Método e o que conta como "medido"

Toda cor, tamanho, raio, duração e breakpoint deste documento foi lido **literalmente** de um destes três tipos de fonte primária:

1. **CSS servido em produção**, baixado por URL direta com `curl` (não a página renderizada, a folha em si).
2. **Config de tema embutida no HTML servido** — o payload RSC do Next.js carrega o `docs.json`/`mint.json` do cliente, com `colors`, `fonts`, `background`, `appearance`.
3. **Classes utilitárias presentes no markup servido** — para sites Tailwind, o token aplicado é o que está no atributo `class`; contar as ocorrências mede qual valor de fato governa a página, não qual está disponível.

Quando os três se contradizem, o documento diz qual venceu e por quê.

### Limites — o que NÃO foi medido

Isto é declarado para que nada aqui seja lido como mais forte do que é:

- **Computed style de browser real: não medido.** Não havia browser headless no ambiente. Tudo que dependeria de resolver a cascata em runtime (o valor final de um elemento após todas as camadas) está fora. Os valores abaixo são os declarados nas fontes acima.
- **Densidade da sidebar em px: não medido** para todos os sete. Padding e altura de item da sidebar não saíram limpos do CSS minificado — são utilitários resolvidos em componentes React que não estão no markup inicial.
- **Paleta de sintaxe dos quatro sites Mintlify: não medida.** O Mintlify referencia temas Shiki por **nome**, não por cores inline (ver a tabela por site). Os hex de cada token existem no bundle do Shiki, não no CSS servido.
- **Scroll-triggered animation: não medido** em nenhum dos sete. Detectar isso exige inspecionar o JS em runtime, não o CSS.
- **Escala de espaçamento aplicada (padding de card/callout em px): parcialmente não medida.** A escala base saiu (`--spacing`), mas os valores por componente vivem em utilitários gerados sob demanda.

---

## Achado estrutural que condiciona todo o resto

**As sete referências são quatro plataformas, não sete.**

| Site | Plataforma | Origem do CSS |
| --- | --- | --- |
| FastMCP | Mintlify | `gofastmcp.com/mintlify-assets/_next/static/chunks/` |
| Devin | Mintlify | `docs.devin.ai/mintlify-assets/_next/static/chunks/` |
| Perplexity | Mintlify | `docs.perplexity.ai/mintlify-assets/_next/static/chunks/` |
| Trigger.dev | Mintlify | `trigger.dev/docs/_next/static/chunks/` |
| Vapi | Fern | `app.buildwithfern.com/_next/static/chunks/` |
| Neon | Next.js próprio | `neon.com/_next/static/chunks/` |
| Clerk | Next.js próprio | `clerk.com/_next/static/chunks/` |

Os quatro sites Mintlify servem o **mesmo arquivo, byte a byte**. Verificado por MD5 dos dois chunks base baixados de cada host separadamente:

```
c7e1d31ed09ce7762776a23c61bb82b9  a2c16a79b30ca688.css   (4.195 B)   — 4/4 hosts
1c16329d6f2dc8a91cbf4ebf84b53360  a336fa455c02e881.css   (436.139 B) — 4/4 hosts
```

Consequência para a leitura deste documento: **FastMCP, Devin, Perplexity e Trigger.dev não têm sistemas visuais independentes.** Têm um sistema (o do Mintlify) e quatro conjuntos de ~20 variáveis injetadas. Quatro dos sete "pontos de dado" são o mesmo ponto de dado com tinta diferente. Isso não é uma síntese entre sites — é uma propriedade medida da amostra, e precisa aparecer aqui porque muda o peso de cada linha.

---

# 1. Mintlify — o núcleo compartilhado por quatro sites

Medido em `a336fa455c02e881.css` (436.139 B, minificado, Tailwind v4).

## 1.1 Tokens base (bloco `:root,:host`, 51 declarações)

O Tailwind v4 emite em `@theme` só os tokens realmente usados. Os 51 abaixo são a lista completa emitida — não um recorte.

| Token | Valor |
| --- | --- |
| `--spacing` | `.25rem` (4px — a escala base inteira deriva daqui) |
| `--text-xs` … `--text-7xl` | `.75rem` · `.875rem` · `1rem` · `1.125rem` · `1.25rem` · `1.5rem` · `1.875rem` · `2.25rem` · `3rem` · `4.5rem` |
| `--font-weight-*` | light `300`, normal `400`, medium `500`, semibold `600`, bold `700` |
| `--tracking-*` | tighter `-.05em`, tight `-.025em`, normal `0em`, wide `.025em` |
| `--leading-*` | tight `1.25`, normal `1.5`, relaxed `1.625` |
| `--container-xs` … `--container-6xl` | `20rem` · `24rem` · `28rem` · `32rem` · `36rem` · `42rem` · `48rem` · `56rem` · `64rem` · `72rem` |
| `--ease-in` | `cubic-bezier(.4,0,1,1)` |
| `--ease-out` | `cubic-bezier(0,0,.2,1)` |
| `--ease-in-out` | `cubic-bezier(.4,0,.2,1)` |
| `--default-transition-duration` | `.15s` |
| `--default-transition-timing-function` | `cubic-bezier(.4,0,.2,1)` |
| `--animate-spin` | `spin 1s linear infinite` |
| `--animate-pulse` | `pulse 2s cubic-bezier(.4,0,.6,1) infinite` |
| `--default-font-family` | `var(--font-inter),ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji",…` |
| `--default-mono-font-family` | `var(--font-paper-mono),ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,…` |
| `--color-primary` | `rgb(var(--primary))` |
| `--color-background-light` | `rgb(var(--background-light))` |
| `--color-background-dark` | `rgb(var(--background-dark))` |

As três últimas linhas são o mecanismo de tematização inteiro: o CSS compartilhado consome `--primary`, `--background-light`, `--background-dark` como **triplas de canais RGB sem função de cor**, e cada site injeta as suas num `<style>` inline. É por isso que o CSS pode ser byte-idêntico.

**Ruído a descartar:** o mesmo arquivo carrega ~250 custom properties com prefixo `--c15t-*`, `--consent-*`, `--accordion-*`, `--button-*`. São da biblioteca de banner de consentimento de cookies (c15t), não do tema de documentação. Não foram consideradas.

## 1.2 Tipografia de prosa longa (camada `.prose`)

O Mintlify parte do Tailwind Typography e sobrescreve. Onde há duas regras para o mesmo seletor, a **segunda** (override Mintlify) vence. Valores em `em`, relativos ao contexto.

| Papel | Tailwind Typography base | Override Mintlify | Efetivo |
| --- | --- | --- | --- |
| `h1` | `2.25em` / peso `800` / lh `1.11111` / mt `0` / mb `.888889em` | — | igual à base |
| `h2` | `1.5em` / peso `700` / lh `1.33333` / mt `2em` / mb `1em` | mb `.666667em` | `1.5em` / `700` / `1.33333` / mt `2em` / mb `.666667em` |
| `h3` | `1.25em` / peso `600` / lh `1.6` / mt `1.6em` / mb `.6em` | mt `2.4em`, lh `1.4` | `1.25em` / `600` / **`1.4`** / mt **`2.4em`** / mb `.6em` |
| `h4` | peso `600` / lh `1.5` / mt `1.5em` / mb `.5em` | `font-size:1.125em`, mt `2em` | `1.125em` / `600` / `1.5` / mt `2em` / mb `.5em` |
| `p` | mt `1.25em` / mb `1.25em` | — | `1.25em` acima e abaixo |
| `code` inline | `.875em` / peso `600` / `::before`+`::after` com `content:"\`"` | peso `500`, `font-variant-ligatures:none` | `.875em` / **`500`** / sem ligaduras |
| `pre` | `.875em` / lh `1.71429` / radius `.375rem` / padding `.857143em 1.14286em` | `border-radius:var(--rounded-xl,.75rem)`, `padding:1.25rem`, `color:rgb(var(--gray-50))`, `display:flex`, mt `1.42857em`, mb `2.28571em` | `.875em` / lh `1.71429` / radius **`.75rem`** / padding **`1.25rem`** |
| `blockquote` | itálico / peso `500` / borda `.25rem` / pl `1em` | `font-style:normal`, `font-weight:400`, `border-left-width:4px`, `border-color:rgb(var(--gray-200))`, `color:rgb(var(--gray-700))`, `padding-left:1.5rem` | **romano**, peso `400`, borda `4px` gray-200, pl `1.5rem` |
| `ul` | `padding-inline-start:1.625em`, `list-style-type:disc` | `padding-left:0`, `list-style-type:none` | marcador próprio via `::before` |
| `ol` | `padding-inline-start:1.625em` | `padding-inline-start:2.125em` | `2.125em` |
| `li` | mt `.5em` / mb `.5em` | — | `.5em` |
| `hr` | borda `1px` / margem `3em` | `border-color:rgb(var(--gray-100))` | `1px` gray-100, margem `3em` |
| `table` | `.875em` / lh `1.71429` | `font-size:.875rem`, `line-height:1.25rem`, `display:block`, `overflow:auto` | `.875rem` / `1.25rem`, rola sozinha |
| `thead` | borda inferior `1px` | `color:rgb(var(--gray-700))`, `border-bottom-color:rgb(var(--gray-200))` | gray-700 sobre borda gray-200 |

Duas sobrescritas Mintlify no próprio `.prose`: `color:rgb(var(--gray-700))` e `max-width:none`.
`.prose-sm` = `font-size:.875rem` / `line-height:1.71429`.

**O título da página não usa `.prose`.** Medido no markup servido dos quatro sites (idêntico nos quatro):

```html
<h1 id="page-title" class="text-3xl sm:text-4xl text-gray-900 tracking-tight
    dark:text-gray-200 [overflow-wrap:anywhere] font-semibold">
```

Ou seja: `1.875rem` (30px) abaixo de 640px, `2.25rem` (36px) a partir de 640px; peso **600**, não os 800 de `.prose h1`; `letter-spacing:-.025em`. Os `h2` do corpo trazem `font-semibold` no markup, então o peso efetivo é **600**, não os 700 do `.prose`.

## 1.3 Escala de UI aplicada (contagem no markup servido)

Não é a escala disponível — é a que a página usa.

| Site | `text-sm` | `text-base` | `text-xs` | `text-3xl` | `text-lg` | `sm:text-4xl` |
| --- | --- | --- | --- | --- | --- | --- |
| FastMCP | 26 | 11 | 3 | 3 | 3 | 1 |
| Devin | 28 | 12 | 3 | 3 | 3 | 1 |
| Perplexity | 76 | 28 | 8 | 3 | 3 | 1 |
| Trigger.dev | 47 | 1 | 4 | 3 | 3 | 1 |

`text-sm` (`.875rem`/14px) domina a UI nos quatro. `tracking-tight` (`-.025em`) aparece 1× em três dos sites e 3× no Trigger.dev — é do título, não do corpo.

## 1.4 Forma e profundidade

`--rounded-xl` **não é definido em lugar nenhum** do CSS servido; `.rounded-xl{border-radius:var(--rounded-xl,.75rem)}` cai sempre no fallback. Logo `rounded-xl` = `.75rem` (12px).

Raios aplicados no markup, por site:

| Site | Raio dominante | Distribuição medida |
| --- | --- | --- |
| FastMCP | `rounded-xl` | xl 40× · md 18× · 2xl 15× · full 8× · lg 6× · `[0.85rem]` 1× |
| Devin | `rounded-xl` | xl 69× · 2xl 22× · md 10× · lg 4× · full 4× |
| Perplexity | `rounded-2xl` | 2xl 54× · xl 49× · md 37× · `[inherit]` 29× · lg 18× |
| Trigger.dev | `rounded-md` | md 12× · xl 9× · lg 4× · full 4× · 2xl 3× |

Valores: `rounded-md` `.375rem`, `rounded-lg` `.5rem`, `rounded-xl` `.75rem`, `rounded-2xl` `1rem`, `rounded-full` `9999px`.

`border-width` no CSS: só `0`, `1px` e `2px` (21 ocorrências). **Sombra é quase ausente**: os quatro sites usam apenas `shadow-xs` (6–10 ocorrências cada) e `children:shadow-none!`. Nenhum usa `shadow-md` ou maior. A separação é feita por borda de 1px, não por elevação.

## 1.5 Motion

Base: `--default-transition-duration:.15s`, `--default-transition-timing-function:cubic-bezier(.4,0,.2,1)`.

Durações efetivamente aplicadas no markup:

| Site | Durações medidas | Easings |
| --- | --- | --- |
| FastMCP | `duration-200` 3× · `duration-300` 2× · `duration-100` 1× | `ease-in-out` 2× |
| Devin | `duration-500` 1× · `duration-300` 1× | não medido no markup |
| Perplexity | `duration-300` 22× · `duration-75` 10× · `duration-200` 3× · `duration-100` 1× | não medido no markup |
| Trigger.dev | `duration-500` 1× | não medido no markup |

`@media (prefers-reduced-motion:reduce)` está presente no CSS base — os quatro respeitam.
O que anima no hover e o que anima na entrada: **não medido** (exige runtime).

## 1.6 Breakpoints

Os 19 `@media` distintos do CSS base. Escala Tailwind padrão mais dois pontos altos próprios:

`640px` · `768px` · `1024px` · `1280px` · `1536px` · **`1650px`** (usado como `not all and (width>=1650px)`) · **`2100px`**
Máximos: `480px`, `640px`.
Features: `prefers-reduced-motion` (reduce e no-preference), `hover:hover`, `hover:none`, `pointer:fine`, `pointer:coarse`, `forced-colors:active`, `print`.

O que muda em cada um: **não medido** por breakpoint. O único ponto confirmado é `sm` (640px), onde o `h1` sobe de `text-3xl` para `text-4xl`.

## 1.7 Callouts

O CSS base traz apenas os **fallbacks neutros**, não as cores por tipo:

```css
--callout-bg-color-light      → fallback #71717a1a   (zinc-500 a 10%)
--callout-border-color-light  → fallback #71717a33   (zinc-500 a 20%)
--callout-bg-color-dark       → fallback #71717a1a
--callout-border-color-dark   → fallback #71717a4d   (zinc-500 a 30%)
```

O tipo é marcado por `data-callout-type` (confirmado `tip` no markup do FastMCP), e as cores por tipo são injetadas inline pelo componente. **Cores semânticas de callout por tipo (info/aviso/perigo/sucesso): não medidas** — não estão no CSS servido nem no markup inicial.

---

# 2. Os quatro sites Mintlify — o que cada um injeta

Tudo abaixo veio de duas fontes que se confirmam mutuamente: o `<style>` inline no HTML servido (triplas RGB) e a config `docs.json` no payload RSC (hex). Onde as duas batem, está marcado ✓.

## 2.1 FastMCP — `gofastmcp.com`

Config medida: `"colors":{"primary":"#2d00f7","light":"#4cc9f0","dark":"#f72585"}` · `"appearance":{"default":"system","strict":false}` · `"theme":{"light":"snazzy-light","dark":"dark-plus"}` · `"background":{"decoration":"gradient","color":{"light":"#EEEEEE","dark":"#222831"}}`

| Token | Tripla injetada | Hex | Confere com config |
| --- | --- | --- | --- |
| `--primary` | `45 0 247` | `#2D00F7` | ✓ |
| `--primary-light` | `76 201 240` | `#4CC9F0` | ✓ |
| `--primary-dark` | `247 37 133` | `#F72585` | ✓ |
| `--background-light` | `238 238 238` | `#EEEEEE` | ✓ |
| `--background-dark` | `34 40 49` | `#222831` | ✓ |
| `--tooltip-foreground` | `255 255 255` | `#FFFFFF` | — |

Rampa de cinza injetada (11 degraus), **tingida de violeta** — o Mintlify gera a rampa a partir do primary:

| | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| hex | `#F4F2FA` | `#EFEEF5` | `#DFDEE6` | `#CFCED5` | `#9F9EA6` | `#716F77` | `#514F57` | `#3F3E46` | `#26252C` | `#18161E` | `#0B0A11` |

Fonte própria, injetada por `<style>` inline e `<link>` para o Google Fonts:

```css
--font-family-headings-custom: "Google Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif
--font-family-body-custom:     "Google Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif
```

Pesos carregados do Google Fonts: `400;500;600;700;800` e as itálicas correspondentes. **É o único dos quatro que troca a fonte de corpo e de display por uma família própria, e a mesma para os dois papéis.**

Gradiente de marca medido (banner): `linear-gradient(135deg, #2d00f7 0%, #4cc9f0 100%)`.
CSS custom próprio: `css/style.css`, `css/banner.css`, `css/python-sdk.css`, `css/version-badge.css`, `dynamic-tailwind.css` — todos inlined, nenhum acessível na raiz (404). Do `version-badge.css` saiu: badge claro `#ff5400` sobre `#fef2f2` com borda `rgba(220,38,38,0.3)`; escuro `#f1f5f9` sobre `#334155` com borda `#64748b`; `transition: box-shadow 0.2s, transform 0.15s`; hover `translateY(-1px) scale(1.03)` + `box-shadow: 0 2px 8px 0 rgba(160,132,252,0.1)`.

Sintaxe de código: temas Shiki **`snazzy-light`** (claro) e **`dark-plus`** (escuro). Hex dos tokens: não medidos.

## 2.2 Devin — `docs.devin.ai`

Config medida: `"colors":{"primary":"#317CFF","light":"#317CFF","dark":"#317CFF"}` · `"styling":{"latex":true,"codeblocks":"system"}` · `"background":{"color":{"light":"#FCFCFC","dark":"#141414"}}`

| Token | Tripla | Hex | Confere |
| --- | --- | --- | --- |
| `--primary` / `-light` / `-dark` | `49 124 255` | `#317CFF` | ✓ |
| `--background-light` | `252 252 252` | `#FCFCFC` | ✓ |
| `--background-dark` | `20 20 20` | `#141414` | ✓ |
| `--tooltip-foreground` | `255 255 255` | `#FFFFFF` | — |

Rampa de cinza, **tingida de azul**:

| | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| hex | `#F4F6FA` | `#EFF1F5` | `#DFE2E6` | `#CFD1D5` | `#A0A2A6` | `#717377` | `#515357` | `#404246` | `#26292D` | `#181A1E` | `#0B0D11` |

**Um único primary para claro e escuro** — não diferencia por modo.
Tipografia: nenhuma família própria injetada. Fica no `--font-inter` / `--font-paper-mono` do Mintlify.
Sintaxe de código: `"codeblocks":"system"` — segue o tema do sistema, sem tema Shiki nomeado.
CSS custom: `custom.css` e `onboard-devin/repo-setup.css`. Do segundo saiu apenas `.scroll-anchor{position:relative;top:calc(-2rem - var(--scroll-mt))}`.

## 2.3 Perplexity — `docs.perplexity.ai`

Config medida: `"colors":{"primary":"#121516","light":"#F7F7F8","dark":"#121516"}` · `"fonts":{"family":"GT Standard","weight":300,"source":"fonts/GT-Standard-S-Standard-Light.woff2","format":"woff2"}` · `"background":{"color":{"light":"#F7F7F8","dark":"#121516"}}`

| Token | Tripla | Hex | Confere |
| --- | --- | --- | --- |
| `--primary` | `18 21 22` | `#121516` | ✓ |
| `--primary-light` | `247 247 248` | `#F7F7F8` | ✓ |
| `--primary-dark` | `18 21 22` | `#121516` | ✓ |
| `--background-light` | `247 247 248` | `#F7F7F8` | ✓ |
| `--background-dark` | `18 21 22` | `#121516` | ✓ |

Rampa de cinza **neutra pura** (sem tingimento — consequência de o primary ser quase preto):

| | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| hex | `#F3F3F3` | `#EEEEEE` | `#DFDFDF` | `#CECECE` | `#9F9F9F` | `#707070` | `#505050` | `#3F3F3F` | `#252526` | `#171717` | `#0A0A0A` |

**A cor de acento é a cor de fundo do outro modo.** `primary` = `#121516` = `background-dark`; `primary-light` = `#F7F7F8` = `background-light`. Não há cor de marca cromática nenhuma no sistema — é um esquema estritamente acromático.

Fonte própria: **GT Standard**, peso `300`, servida como `.woff2` do próprio domínio (`fonts/GT-Standard-S-Standard-Light.woff2`). É a única das sete que declara peso 300 como peso de família.
Sintaxe de código: `"codeblocks":"system"`.
É o site Mintlify com mais utilitários no markup (8.545 tokens de classe, 730 distintos) e o de maior densidade de `text-sm` (76×).

## 2.4 Trigger.dev — `trigger.dev/docs`

Config medida: `"colors":{"primary":"#A8FF53","light":"#A8FF53","dark":"#A8FF53"}` · `"appearance":{"default":"dark","strict":true}` · `"background":{"color":{"light":"#fff","dark":"#121317"}}`

**`"strict":true` com `"default":"dark"` — este site não oferece modo claro.** É o único dos sete que trava o modo. Os tokens de modo claro existem no CSS mas são inalcançáveis pelo usuário.

| Token | Tripla | Hex | Confere |
| --- | --- | --- | --- |
| `--primary` / `-light` / `-dark` | `168 255 83` | `#A8FF53` | ✓ |
| `--background-light` | `255 255 255` | `#FFFFFF` | ✓ |
| `--background-dark` | `18 19 23` | `#121317` | ✓ |
| `--tooltip-foreground` | `0 0 0` | `#000000` | — |

`--tooltip-foreground` é **preto**, contra branco nos outros três — consequência direta de o primary ser um verde-limão claro, que precisa de texto escuro por cima.

Rampa de cinza, **tingida de verde**:

| | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| hex | `#F7FAF5` | `#F3F5F0` | `#E3E6E1` | `#D3D5D0` | `#A3A6A1` | `#757772` | `#555752` | `#434641` | `#2A2D27` | `#1B1E19` | `#0F110C` |

**Armadilha de medição registrada:** o payload RSC do `trigger.dev` contém um segundo conjunto de tokens — `--primary: 17 120 102`, `--primary-light: 74 222 128`, `--primary-dark: 22 101 52`, `--background-dark: 15 17 23`. É o **tema padrão do Mintlify** no shell SSR, sobrescrito pelo `<style>` inline. Confirmado pela config, que traz `#A8FF53`. Quem medisse só o payload RSC registraria a cor errada.

Tipografia: nenhuma família própria. Fica no Inter/Paper Mono do Mintlify.
CSS custom: `style.css`, inlined. Contém regras de galeria com hex diretos no modo escuro: título `#ffffff`, subtítulo `#e4e4e7`, label `#71717a`, chip com borda `#3f3f46` e texto `#a1a1aa`, hover de borda `#71717a`.
Raio dominante `rounded-md` (`.375rem`) — o único dos quatro Mintlify que não é dominado por `xl`/`2xl`. Visualmente mais anguloso que os irmãos.

---

# 3. Vapi — `docs.vapi.ai` (plataforma Fern)

Medido em `app.buildwithfern.com/_next/static/chunks/2twgrs-huo4cc.css` (404.652 B) mais 96 blocos `<style>` inline no HTML servido, que é onde o Fern injeta o tema do cliente.

## 3.1 Sistema de cor: Radix Colors, 12 degraus + 12 alfas

Diferente de todos os outros seis. Não há rampa de 50–950; há **escala Radix de 1 a 12**, mais uma escala alfa paralela (`a1`–`a12`) para sobreposição.

**Acento (`--accent-*`) — o mesmo hue nos dois modos, degraus invertidos:**

| Degrau | Claro | Escuro |
| --- | --- | --- |
| 1 | `#fafefd` | `#09100f` |
| 2 | `#f3fbf9` | `#101c19` |
| 3 | `#dff8f3` | `#0e2d28` |
| 4 | `#ccf3eb` | `#043b34` |
| 5 | `#b7ebe1` | `#0b4840` |
| 6 | `#a1ded3` | `#16574e` |
| 7 | `#83cdc0` | `#1e695f` |
| 8 | `#54b9a9` | `#217f72` |
| 9 | **`#12a594`** | **`#12a594`** |
| 10 | `#009888` | `#009888` |
| 11 | `#008071` | `#55d2c0` |
| 12 | `#0f3d36` | `#aaf0e3` |

Os degraus **9 e 10 são idênticos nos dois modos** — é a âncora de marca (teal `#12a594`), e o resto da escala gira em volta. `--accent-contrast: #fff` nos dois modos. `--accent-indicator` e `--accent-track` = `#12a594` nos dois.

A mesma escala é declarada **duas vezes**, em hex e em OKLCH/display-p3, com `@media (color-gamut:p3)` presente no CSS — o navegador de gamut alto recebe `oklch(64.9% 0.1136 182)` no degrau 9, os demais recebem `#12a594`.

**Cinza (`--grayscale-*`) — modo escuro medido:**

| 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `#111113` | `#18191b` | `#212225` | `#272a2d` | `#2e3135` | `#363a3f` | `#43484e` | `#5a6169` | `#696e77` | `#777b84` | `#b0b4ba` | `#edeef0` |

Modo claro (parcial medido): `1 #fbfdfc` · `2 #f7f9f8` · `3 #eef1f0` · `4 #e6e9e8` · `5 #dfe2e0`.

Escala alfa do escuro, para sobreposição: `a1 #00000000` · `a2 #d8f4f609` · `a3 #ddeaf814` · `a4 #d3edf81d` · `a5 #d9edfe25` · `a6 #d6ebfd30` · `a7 #d9edff40` · `a8 #d9edff5d` · `a9 #dfebfd6d` · `a10 #e5edfd7b` · `a11 #f1f7feb5` · `a12 #fcfdffef`.

**Semânticos do modo escuro:**

```css
.dark {
  color-scheme: dark;
  --accent: rgba(18, 165, 148, 1);      /* #12A594 */
  --background: rgba(14, 14, 19, 1);    /* #0E0E13 */
  --border: initial;
  --sidebar-background: initial;
  --header-background: rgba(14, 14, 19, 1);
  --card-background: initial;
  --theme-color: #0e0e13;
}
```

`--border`, `--sidebar-background` e `--card-background` são `initial` — a separação vem das escalas alfa, não de cores sólidas dedicadas.

## 3.2 Layout — os únicos números de layout explícitos das sete referências

Injetados por `<style>` inline. **Nenhum outro dos sete declara suas dimensões de layout como tokens.**

| Token | Valor |
| --- | --- |
| `--content-width` | `880px` |
| `--sidebar-width` | `300px` |
| `--header-height` | `124px` |
| `--header-height-real` | `80px` |
| `--mobile-header-height-real` | `64px` |
| `--logo-height` | `22px` |
| `--page-width` | `100vw` |

## 3.3 Tipografia

```css
--font-body:    ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', …
--font-heading: ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', …
--font-code:    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, …
```

Mais aliases de compatibilidade: `--typography-body-font-family`, `--typography-heading-font-family`, `--typography-code-font-family`.

**Vapi não serve nenhuma webfont.** Corpo e display são a stack de sistema, e são a mesma stack. É o único dos sete cuja tipografia é inteiramente nativa.

Escala com line-height pareado no `@theme` (o Fern declara os pares, o Mintlify não):

| | xs | sm | base | lg | xl | 2xl | 4xl |
| --- | --- | --- | --- | --- | --- | --- | --- |
| size | `.75rem` | `.875rem` | `1rem` | `1.125rem` | `1.25rem` | `1.5rem` | `2.25rem` |
| lh | `1.33333` | `1.42857` | `1.5` | `1.55556` | `1.4` | `1.33333` | `1.11111` |

Aplicado no markup: `text-sm` 51× · `text-base` 9× · `lg:text-sm` 6× · `text-xs` 1×. **Nenhum `tracking-*` aplicado** — letter-spacing fica no default em toda a página.

## 3.4 Forma e profundidade

Raio paramétrico, único entre os sete: `--radius-1:var(--radius)`, `--radius-3\/2:calc(var(--radius)*1.5)`, `--radius-3:calc(var(--radius)*3)`, `--radius-full:calc(var(--radius)*9999)`. Todo o raio da UI é múltiplo de um valor base.

Aplicado: `rounded-2` 17× · `rounded-3/2` 6× · `rounded-1` 4× · `rounded-3` 3× · `rounded` 2× · `rounded-sm` 1×.

Sombra por token nomeado: `shadow-card-grayscale` 8× · `shadow-border-default` 1× · `shadow-[inset_0_-1px_0_0]` 1×.

## 3.5 Motion — o mais elaborado dos sete

Easings próprios, nomeados por intenção:

```css
--ease-collapse: cubic-bezier(.25,.46,.45,.94)
--ease-shift:    cubic-bezier(.16,1,.3,1)
--ease-slide:    cubic-bezier(.87,0,.13,1)
--ease-out:      cubic-bezier(0,0,.2,1)
--ease-in-out:   cubic-bezier(.4,0,.2,1)
```

Animações declaradas como tokens completos:

```css
--animate-slide-down-and-fade:  slide-down-and-fade  .4s var(--ease-shift)
--animate-slide-left-and-fade:  slide-left-and-fade  .4s var(--ease-shift)
--animate-slide-up-and-fade:    slide-up-and-fade    .4s var(--ease-shift)
--animate-slide-right-and-fade: slide-right-and-fade .4s var(--ease-shift)
--animate-slide-down:           slide-down           .4s var(--ease-slide)
--animate-dropdown-expand:      dropdown-expand      .3s var(--ease-shift)
--animate-overlay-show:         overlay-show         .15s var(--ease-shift)
--animate-thumb-rock:           thumb-rock           .5s both
--animate-shine:                shine                5s ease-in-out infinite
--animate-spin:                 spin                 1s linear infinite
--animate-ping:                 ping                 1s cubic-bezier(0,0,.2,1) infinite
--animate-pulse:                pulse                2s cubic-bezier(.4,0,.6,1) infinite
```

`--default-transition-duration:.15s`, `--default-transition-timing-function:cubic-bezier(.4,0,.2,1)`.
Aplicado no markup: `duration-500` 6× · `duration-200` 2× · `duration-300` 1×.
`prefers-reduced-motion` presente (reduce e no-preference).

## 3.6 Breakpoints

19 `@media` distintos. **Mistura `rem` e `px` no mesmo sistema** — nenhum outro dos sete faz isso:

Em rem: `40rem` (640px) · `48rem` (768px) · `64rem` (1024px) · `80rem` (1280px) · `96rem` (1536px).
Em px: `768px` · `999px` · `1024px` · `1100px`, e máximo `1199px`.
Features: `hover:hover`, `pointer:fine`, `pointer:coarse`, `color-gamut:p3`, `prefers-reduced-motion`.

Os pontos em px (`999px`, `1100px`, `1199px`) não coincidem com nenhum ponto da escala em rem — são quebras de layout ad hoc sobre a grade regular.

---

# 4. Neon — `neon.com/docs` (Next.js próprio)

Medido em `neon.com/_next/static/chunks/11v8mx_eyw.mn.css` (500.107 B).

## 4.1 Mecanismo de modo escuro e superfícies

Classe `.dark`, aplicada via `:is(.dark *)`. A regra de superfície raiz é a mais extrema das sete:

```css
body:is(.dark *) { color: #fff; background-color: #000 }
```

**Preto absoluto `#000` e branco absoluto `#fff`.** Nenhum outro dos sete usa preto puro como fundo de página — o mais escuro depois deste é o Trigger.dev com `#121317`.

Superfícies medidas no modo escuro: linha destacada de código `#242427`; palavra destacada fundo `#202127` borda `#3c3f44`; diff add `#2c4830`; diff remove `#481e1e`.

## 4.2 Sintaxe de código — a única paleta de sintaxe medida das sete

O Neon declara os tokens Shiki como custom properties, nos dois modos. Este é o dado que os quatro Mintlify não expõem.

| Token | Claro | Escuro |
| --- | --- | --- |
| `--shiki-foreground` | `#131415` | `#f9fafa` |
| `--shiki-background` | `transparent` | `transparent` |
| `--shiki-token-constant` | `#ec6f09` | `#94b5f7` |
| `--shiki-token-string` | `#8458d0` | `#ffed9c` |
| `--shiki-token-comment` | `#797d86` | `#797d86` |
| `--shiki-token-keyword` | `#2d8665` | `#34d59a` |
| `--shiki-token-parameter` | `#a35200` | `#ff990a` |
| `--shiki-token-function` | `#ec6f09` | `#f7b983` |
| `--shiki-token-string-expression` | `#426ce0` | `#af93ea` |
| `--shiki-token-punctuation` | `#18191b` | `#fff` |
| `--shiki-token-link` | `#078345` | `#47d18c` |
| `--shiki-token-operator` | `#a86624` | `#ba8c5e` |
| `--shiki-token-embed` | `#18191b` | `#fff` |

Duas propriedades medidas dessa paleta: o fundo é `transparent` nos dois modos (o bloco de código herda a superfície da página, não tem cor própria), e `--shiki-token-comment` é `#797d86` **idêntico nos dois modos** — o único token que não vira.

## 4.3 Tipografia

```css
--font-inter:      var(--font-inter), ui-sans-serif, system-ui, sans-serif, …   (13 usos de mono, 3 de sans)
--font-geist-mono: var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, …
--font-esbuild:    var(--font-esbuild), ui-sans-serif, system-ui, sans-serif, …
```

Mais `IBM Plex Sans` e `IBM Plex Sans Fallback` declarados diretamente (5 ocorrências cada).
Corpo: Inter. Mono: Geist Mono (13 ocorrências — a mais usada de todas as famílias). Há uma terceira família (`--font-esbuild`) e IBM Plex Sans em uso paralelo.

Line-heights pareados por calc, no `@theme`:

```css
--text-xs--line-height:   calc(1 / .75)      /* 1.3333 */
--text-sm--line-height:   calc(1.25 / .875)  /* 1.4286 */
--text-base--line-height: calc(1.5 / 1)      /* 1.5 */
--text-lg--line-height:   calc(1.75 / 1.125) /* 1.5556 */
--text-xl--line-height:   calc(1.75 / 1.25)  /* 1.4 */
--text-2xl--line-height:  calc(2 / 1.5)      /* 1.3333 */
--text-3xl--line-height:  calc(2.25 / 1.875) /* 1.2 */
--text-4xl--line-height:  calc(2.5 / 2.25)   /* 1.1111 */
--text-5xl--line-height:  1
```

Aplicado no markup (10.057 tokens de classe — o mais denso dos sete): `text-sm` 117× · `text-base` 22× · `text-xs` 6× · `text-lg` 6× · `text-xl` 5× · `text-2xl` 2× · `md:text-lg` 2×.

**Letter-spacing é o traço mais forte do Neon.** É o único dos sete que aplica tracking em escala:

| Classe | Valor medido | Ocorrências |
| --- | --- | --- |
| `tracking-extra-tight` | `-.02em` (custom, `.tracking-extra-tight{--tw-tracking:-.02em;letter-spacing:-.02em}`) | **276×** |
| `tracking-tight` | `-.025em` | 27× |
| `tracking-tighter` | `-.05em` (custom `-.04em` também presente no CSS, 8 ocorrências) | 12× |
| `tracking-normal` | `0em` | 6× |

No CSS: `-.02em` 25× · `var(--tracking-tight)` 17× · `-.04em` 8× · `.02em` 3×. O aperto negativo é sistemático, não pontual.

## 4.4 Forma e profundidade

Escala de raio própria no `@theme`: `--radius-sm:.25rem` · `--radius-md:.375rem` · `--radius-lg:.5rem` · `--radius-xl:.75rem` · `--radius-2xl:1rem`.

Aplicado — **a distribuição mais concentrada dos sete**:

| Classe | Valor | Ocorrências |
| --- | --- | --- |
| `rounded-sm` | `.25rem` (4px) | **226×** |
| `rounded-full` | `9999px` | 24× |
| `rounded-[40px]` | `40px` | 3× |

Três valores no site inteiro, e 226 das 253 ocorrências são o mesmo raio de 4px. É quase um raio único.

Sombras, sempre pareadas claro/escuro com o escuro mais opaco:

```css
shadow-[0px_14px_20px_0px_rgba(0,0,0,.1)]   /  dark:shadow-[0px_14px_20px_0px_rgba(0,0,0,.5)]
shadow-[0px_10px_20px_0px_rgba(0,0,0,.06)]  /  dark:shadow-[0px_8px_20px_0px_rgba(0,0,0,.4)]
```

Blurs disponíveis: `--blur-sm:8px` · `--blur-md:12px` · `--blur-lg:16px` · `--blur-xl:24px` · `--blur-2xl:40px` · `--blur-3xl:64px`.

## 4.5 Motion

`--default-transition-duration:.15s`, `--default-transition-timing-function:cubic-bezier(.4, 0, .2, 1)`.
`--ease-in:cubic-bezier(.4, 0, 1, 1)`, `--ease-in-out:cubic-bezier(.4, 0, .2, 1)`.

Aplicado — **o site que mais anima dos sete, por larga margem**:

| Classe | Ocorrências |
| --- | --- |
| `duration-200` | **354×** |
| `before:duration-200` | 76× |
| `after:duration-300` | 6× |
| `duration-150` | 3× |

439 declarações de duração no markup, contra 6 no FastMCP e 1 no Trigger.dev. O uso de `before:`/`after:duration` mostra que a animação está nos pseudo-elementos — sublinhados, indicadores, estados de hover construídos em `::before`.

## 4.6 Layout e breakpoints

`--docs-header-height:112px` (e `0px` numa variante). `--error-tooltip-bg:#000`.
Containers do `@theme`: `--container-xs` `20rem` até `--container-7xl` `80rem`.

21 `@media` distintos, **desenhados de cima para baixo** (predominam `max-width`), o oposto de Vapi e Clerk:

Em rem (max): `25.8125rem` (413px) · `39.9375rem` (639px) · `47.9375rem` (767px) · `63.9375rem` (1023px) · `70.4375rem` (1127px) · `79.9375rem` (1279px) · `99.9375rem` (1599px) · `119.938rem` (1919px).
Em px (max): `413px` · `767px` · `1023px` · `1279px` · `1599px` · `1919px`.
Em px (min): `1280px` · `1921px`, mais a faixa `(min-width:1280px) and (max-width:1366px)`.

Os valores `.9375rem` são `−1px` convertidos (639px = 39.9375rem) — a escala max-width é a escala min-width menos um pixel. E há uma faixa dedicada a **1280–1366px**, a resolução de laptop, com regra de `background-position` própria.

---

# 5. Clerk — `clerk.com/docs` (Next.js próprio)

Medido em `clerk.com/_next/static/chunks/071ew3oiql4iw.css` (871.802 B — o maior dos sete).

**Ressalva de escopo declarada:** este arquivo mistura o CSS do site de documentação com o do widget de autenticação da Clerk (o produto). Tokens com prefixo `--cb-*`, `--clerk-modal-*`, `--input-*` e `--card-radius` pertencem ao widget. Onde não deu para separar com confiança, está dito. Os `--typography-*` são inequivocamente do site de docs.

## 5.1 Mecanismo de modo escuro

Classe `.dark` (934 ocorrências de `.dark ` / `.dark,` no CSS). Também há `[data-theme=a]`, `[data-theme=b]` e `[data-theme=default]` — sistema de temas secundário, escopo não determinado.

## 5.2 Escala de texto semântica — a mais explícita das sete

O Clerk é o único dos sete que declara a escala de texto inteira como **pares nomeados por papel**, um por modo. Isto responde diretamente à pergunta "a escala inteira, do máximo ao apagado":

| Papel | Modo claro | Modo escuro |
| --- | --- | --- |
| `--typography-heading` | `--color-gray-950` `#131316` | `--color-white` `#fff` |
| `--typography-heavy` | `--color-gray-950` `#131316` | `--color-white` `#fff` |
| `--typography-strong` | `--color-gray-950` `#131316` | `--color-gray-200` `#d9d9de` |
| `--typography-color` (corpo) | `--color-gray-700` `#42434d` | `--color-gray-400` `#9394a1` |
| `--typography-link` | `--color-gray-950` `#131316` | `--color-gray-200` `#d9d9de` |
| `--typography-link-hover` | `--color-gray-950` `#131316` | `--color-white` `#fff` |
| `--typography-underline` | `--color-gray-200` `#d9d9de` | `--color-gray-600` `#5e5f6e` |
| `--typography-underline-hover` | `--color-gray-950` `#131316` | `--color-white` `#fff` |
| `--typography-code` | `--color-gray-950` `#131316` | `--color-gray-100` `#eeeef0` |
| `--typography-code-bg` | `--color-white` `#fff` | `--color-gray-900` `#212126` |
| `--typography-code-border` | `--color-gray-200` `#d9d9de` | `--color-gray-800` `#2f3037` |
| `--typography-thead-border` | `--color-gray-200` `#d9d9de` | `--color-gray-800` `#2f3037` |
| `--typography-tbody-border` | `--color-gray-100` `#eeeef0` | `--color-gray-900` `#212126` |
| `--typography-link-indicator` | `--color-gray-100` `#eeeef0` | `--color-gray-800` `#2f3037` |
| `--typography-link-indicator-hover` | `--color-gray-950` `#131316` | `--color-gray-600` `#5e5f6e` |
| `--typography-link-icon` | `--color-gray-400` `#9394a1` | `--color-gray-500` `#747686` |
| `--typography-link-icon-hover` | `--color-gray-950` `#131316` (medido como par) | `--color-white` `#fff` |
| `--typography-link-icon-bg` | `--color-gray-100` `#eeeef0` | `--color-gray-800` `#2f3037` |
| `--typography-link-icon-bg-hover` | `--color-gray-950` `#131316` | `--color-gray-600` `#5e5f6e` |

Três observações medidas: o corpo no claro é `gray-700` e no escuro `gray-400` — **não é uma inversão simétrica**, o escuro é proporcionalmente mais apagado. O bloco de código no claro tem fundo **branco** (mais claro que a página) com borda; no escuro tem fundo `gray-900` (mais escuro que a página). E o link não tem cor de marca em nenhum dos modos — é a cor do heading, diferenciado por sublinhado.

`.dark` também declara `--focus-outline:var(--color-white)` e `color-scheme:dark`, mais o par `--light: ;` / `--dark:initial` (truque de space-toggle para alternar valores sem media query).

## 5.3 Rampa de cinza — própria, não a do Tailwind

| | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| hex | `#f7f7f8` | `#eeeef0` | `#d9d9de` | `#b7b8c2` | `#9394a1` | `#747686` | `#5e5f6e` | `#42434d` | `#2f3037` | `#212126` | `#131316` |

Levemente azulada. Convive com as rampas `zinc` e `slate` do Tailwind, também presentes.

Marca: `--color-purple-500:#6c47ff`, com rampa completa de `purple-50 #f4f2ff` a `purple-950 #230b6a`. A paleta declarada é a maior dos sete (255 declarações no `:root,:host`), com red, orange, amber, yellow, green, emerald, sky, blue, indigo, violet, purple, pink, rose, slate, gray, zinc — muitas com valores **customizados**, não os do Tailwind (ex.: `--color-green-500:#22c543` contra `#22c55e` do Tailwind; `--color-sky-500:#00aee3` contra `#0ea5e9`).

## 5.4 Tipografia

```css
--font-sans: var(--font-geist-numbers), var(--font-suisse)
--font-mono: var(--font-soehne-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, …
```

**Duas fontes empilhadas no sans**, na ordem: `--font-geist-numbers` primeiro, `--font-suisse` depois. É uma substituição só de algarismos — Geist cobre os dígitos, Suisse cobre o resto. Nenhum outro dos sete faz isso.
Mono: **Söhne Mono**, licenciada.

Aplicado no markup: `text-sm` 35× · `text-xs` 4× · `sm:text-lg` 1×. Apenas três tamanhos aplicados no HTML servido — o menor repertório dos sete. `tracking-[inherit]` 1× é o único tracking.

Pesos no `:root`: não medidos como bloco isolado neste arquivo.

## 5.5 Forma e profundidade

Escala de raio: `--radius-xs:.125rem` · `--radius-sm:.25rem` · `--radius-md:.375rem` · `--radius-lg:.5rem` · `--radius-xl:.75rem`, mais `--card-radius:calc(var(--radius-xl) - .03125rem)` (= `.71875rem`, um ajuste de meio-pixel para raio interno). 106 valores distintos de `border-radius` no arquivo, o maior espalhamento dos sete — mas isso inclui o widget de auth.

Aplicado no markup: `rounded-md` 49× · `before:rounded-md` 36× · `rounded-lg` 30× · `rounded` 18× · `rounded-2xl` 18× · `rounded-xl` 17×. Dominante `rounded-md` = `.375rem` (6px).

Sombras — **as mais elaboradas das sete**, multi-camada com inset e pareadas por modo:

```css
shadow-[0_1px_rgba(0,0,0,0.03),0_1px_#FFF_inset,0_4px_8px_rgba(32,42,54,0.05),
        0_0_0_1px_rgba(32,42,54,0.08),0_1px_5px_-4px_rgba(19,19,22,0.7)]

dark:shadow-[0_1px_rgba(0,0,0,0.03),0_1px_rgba(255,255,255,0.07)_inset,
             0_4px_8px_rgba(32,42,54,0.05),0_0_0_1px_rgba(0,0,0,0.28),
             0_1px_5px_-4px_rgba(19,19,22,0.7)]

md:shadow-[0_1px_5px_-4px_rgba(19,19,22,0.4),0_2px_5px_rgba(32,42,54,0.06)]

dark:md:shadow-[0_-1px_rgba(255,255,255,0.06),0_4px_8px_rgba(0,0,0,0.05),
                0_1px_6px_-4px_#000]

shadow-[0_1px_--theme(--color-white/0.075)_inset,0_1px_3px_--theme(--color-gray-900/0.2),
        0_0_0_1px_--theme(--color-gray-900)]
```

Padrão medido: cada sombra combina (a) um realce interno de 1px — branco no claro, branco a 7% no escuro, (b) uma borda simulada por `0 0 0 1px`, e (c) uma projeção de 4–8px. A borda é feita com sombra, não com `border`. E há uma sombra `md:` — a elevação **muda por breakpoint**, coisa que nenhum outro dos sete faz.

## 5.6 Motion

Aplicado: `duration-300` 23× · `before:duration-300` 15×. Um único valor de duração no site inteiro, também aplicado a pseudo-elementos.
`@keyframes` no arquivo: `fade-in`, `letter-reveal`, `blink`, `float`, `spin`, `pulse`. `letter-reveal` e `float` sugerem animação de entrada; **em quais elementos: não medido**.
`prefers-reduced-motion` presente (reduce e no-preference).

## 5.7 Layout e breakpoints

`--content-width` com dois valores medidos: `43.5rem` (696px) e `64rem` (1024px) — responsivo, mas **qual vale em qual breakpoint: não medido**.

58 `@media` distintos, o maior número dos sete. A grade principal é **inteiramente em `em`**, não em `px` nem `rem`:

`40em` (640px) · `48em` (768px) · `64em` (1024px) · `80em` (1280px) · `96em` (1536px)

Mais pontos ad hoc: `23.4375em` (375px — iPhone) · `26.5625rem`–`39.9375rem` (faixa) · `27em` (432px) · `28rem` · `32rem` · `32.125em` · `32.125rem` · `46.5em` (744px — iPad mini), e máximo `32rem`.

Usar `em` em media query faz os breakpoints responderem ao tamanho de fonte do navegador. É uma escolha de acessibilidade, e o Clerk é o único dos sete que a faz.

---

# 6. Índice do que ficou por medir

Para que nada aqui seja lido como completo:

| Item | Sites | Por quê |
| --- | --- | --- |
| Computed style de browser real | todos os 7 | Sem browser headless no ambiente |
| Paleta de sintaxe de código | FastMCP, Devin, Perplexity, Trigger.dev, Vapi, Clerk | Mintlify referencia tema Shiki por nome; hex vivem no bundle JS. Só o Neon declara em CSS |
| Cores semânticas de callout por tipo | os 4 Mintlify | CSS só traz os fallbacks neutros; a cor por tipo é injetada inline pelo componente |
| Cores semânticas de callout | Vapi, Neon, Clerk | Não localizadas como bloco de tokens no CSS servido |
| Densidade da sidebar em px | todos os 7 | Utilitários resolvidos em componentes ausentes do markup inicial |
| Padding de card e callout em px | todos os 7 | Idem |
| O que muda em cada breakpoint | todos os 7 | Só o `sm` do Mintlify foi confirmado (h1 `text-3xl`→`text-4xl`) |
| O que anima no hover / na entrada | todos os 7 | Exige runtime |
| Scroll-triggered animation | todos os 7 | Exige runtime |
| `--content-width` por breakpoint | Clerk | Dois valores medidos, sem a condição de cada um |
| Pesos de fonte declarados | Clerk | Não isolados neste arquivo |

---

## Procedência

Todos os arquivos foram baixados por `curl` em 2026-08-04 com user-agent de Chrome 126, direto das URLs abaixo. Os hashes dos chunks Mintlify estão na seção "Achado estrutural".

| Site | Recursos medidos |
| --- | --- |
| FastMCP | `gofastmcp.com/getting-started/welcome` (484.153 B) · `/mintlify-assets/_next/static/chunks/a2c16a79b30ca688.css` · `…/a336fa455c02e881.css` · 8 blocos `<style>` inline |
| Devin | `docs.devin.ai/get-started/devin-intro` (400.024 B) · mesmos dois chunks · 6 blocos `<style>` |
| Perplexity | `docs.perplexity.ai/docs/getting-started/quickstart` (1.179.545 B) · mesmos dois chunks · 7 blocos `<style>` |
| Vapi | `docs.vapi.ai/assistants/examples/docs-agent` (2.257.807 B) · `app.buildwithfern.com/_next/static/chunks/10vxt885iw7bs.css` · `…/2twgrs-huo4cc.css` · `…/310xlwgz_h4zb.css` · 96 blocos `<style>` |
| Neon | `neon.com/docs/introduction` (398.306 B) · `/_next/static/chunks/05rq.ruumb35n.css` · `…/0kz8.lfy8jzs4.css` · `…/11v8mx_eyw.mn.css` |
| Clerk | `clerk.com/docs/nextjs/getting-started/quickstart` (1.130.329 B) · `/_next/static/chunks/071ew3oiql4iw.css` · `…/0uoappzyb6~7p.css` |
| Trigger.dev | `trigger.dev/docs/realtime/overview` (385.349 B) · `/docs/_next/static/chunks/a2c16a79b30ca688.css` · `…/a336fa455c02e881.css` · 4 blocos `<style>` |

As URLs de chunk carregam query `?dpl=…` de deploy; os arquivos foram baixados sem a query, com resposta idêntica. Um redeploy de qualquer um dos sites troca o nome do chunk e pode mudar valores — os hashes acima fixam o que foi medido.
