# Paridade com o `docs.devin.ai` — plano medido

Este documento é o **plano**, não a spec. Ele carrega os valores medidos no alvo e as decisões fechadas, para que a spec nasça conferível em vez de descritiva. Toda tabela abaixo é medição de primeira mão, feita em Chromium headless a 1512×950 DPR 1, com cor resolvida pintando o valor computado num canvas 1×1 e lendo o pixel.

Os dois lados foram medidos pela mesma régua: `docs.devin.ai/get-started/devin-intro` e uma página de endpoint em `/api-reference/v1/sessions/`, contra o `shinydoc` construído e servido localmente.

---

## 1. O diagnóstico

A spec vigente declara **"zero deltas deliberados"** (`docs/design/principios.md:47`) e nomeia o Mintlify como âncora com o Devin como referência única (`principios.md:11`, `docs/agents/domain.md:50`). O alvo, portanto, sempre esteve certo. O que faltava era **número**: as divergências existiam como prosa — *"o TOC dá 288 contra os 304 da âncora"* — e prosa não reprova em CI.

Dentro disso há **um erro mecânico**, e ele explica sozinho a queixa de cor:

A pesquisa `research/devin-mint` (#50) mediu que a rampa de onze cinzas do Mintlify é tingida com o matiz da marca. Está correto. Mas **o Devin não pinta a página com a rampa**:

```
--color-background-dark: rgb(20 20 20)   → #141414   ← cinza neutro puro, token próprio
--gray-950:              rgb(11 13 17)   → #0b0d11   ← levemente frio, serve borda e código
```

Nós pintamos a página com a rampa tingida:

```
--sd-surface-page  =  var(--sd-gray-950)  =  #0F0A0F   ← OKLCH h 330 (magenta)
```

Herdamos o mecanismo certo e o aplicamos numa superfície em que a âncora não o aplica. Com marca magenta, o chão inteiro do site ficou magenta. É a correção de maior efeito visual por menor volume de código de todo este plano.

Correção de registro: o índice de pesquisas afirma que *"o trilho do TOC é 304 e não 448"*. **Os dois valores existem** — 304 em página de prosa, 448 em página de API, onde o trilho de amostras substitui o TOC.

---

## 2. Decisões fechadas

| # | Decisão |
| --- | --- |
| 1 | A rampa neutra **desacopla** da marca. `--sd-brand` deixa de tingir qualquer neutro. `--sd-brand-tint` e o pin `c × tint = 0.0120` morrem. |
| 2 | Acento **violeta, OKLCH h ≈ 300**. Não é azul, não é o `#317CFF` do Devin, não é o magenta. |
| 3 | A **landing é removida** nesta versão. A raiz redireciona para a primeira doc. |
| 4 | Fidelidade **100% no estilo**. Conteúdo não é copiado do alvo **e não bloqueia o estilo**. |
| 5 | Escopo total: chrome e paleta primeiro, os 17 componentes depois. |
| 6 | Arquitetura de informação **não muda** — três abas, 11 categorias, 52 páginas, dez tipos. |
| 7 | Um único checkpoint humano, **no fim**. Verificação intermediária é o comparador headless, interno, sem portão de CI novo. |
| 8 | `unsafe` continua em **zero**. |
| 9 | Tema claro continua existindo, remedido contra o alvo. |

---

## 3. Paleta

### 3.1 O chão e a rampa

| Papel | Devin claro | Devin escuro | Hoje (escuro) |
| --- | --- | --- | --- |
| **Fundo da página** | `#fcfcfc` | **`#141414`** | `#0F0A0F` |
| Fundo da sidebar | transparente | transparente | transparente |
| Fundo do navbar | `#fcfcfc` | `#141414` | `#0F0A0F` |
| Superfície elevada (card) | `#ffffff` | `#141414` *(igual à página)* | `#2B262A` |
| Borda / hairline | `#eff1f5` | `#26292d` | `#1F1A1F` |
| Texto forte | `#181a1e` | `#dfe2e6` | `#FAF2F9` |
| Texto corpo | `#404246` | `#a0a2a6` | `#D6CED5` |
| Texto mudo | `#515357` → `#717377` | `#a0a2a6` → `#717377` | `#575056` / `#A69FA5` |
| Fundo de código | `#ffffff` | **`#0b0c0e`** | `#1D171C` |
| Código inline | `#eff1f5` @50% / `#101828` | `#ffffff` @5,1% / `#dfe2e6` | `#1D171C` / `#D6CED5` |
| Acento / link | `#317cff` | `#317cff` *(idêntico nos dois temas)* | `#93398D` / `#DB7CD4` |

A rampa do alvo, para herdar:

```
--gray-50   #f4f6fa      --gray-500  #717377
--gray-100  #eff1f5      --gray-600  #515357
--gray-200  #dfe2e6      --gray-700  #404246
--gray-300  #cfd1d5      --gray-800  #26292d
--gray-400  #a0a2a6      --gray-900  #181a1e
                         --gray-950  #0b0d11
```

Ela é **fria**, não neutra. O fundo da página é neutro puro e **não vem dela** — é `--color-background-light: rgb(252 252 252)` / `--color-background-dark: rgb(20 20 20)`.

### 3.2 O que muda aqui

1. `--sd-surface-page` ganha token próprio, neutro puro: `#fcfcfc` / `#141414`.
2. Os onze stops passam a ser os do alvo. A forma `oklch(from var(--sd-brand) …)` sai; a rampa deixa de derivar da marca.
3. `--sd-brand-tint` e o pin `c × tint = 0.0120` morrem.
4. `--sd-surface-raised` no escuro passa a ser **igual à página** — o alvo não eleva card por fundo, eleva por borda de 1px a 10,2%.
5. Acento violeta h ≈ 300. Os matizes de estado (`danger 27`, `warn 62`, `success 150`, `info 266`) ficam intocados — `tokens.md:1396` proíbe repintá-los, e h 300 não colide com nenhum. O ciano da sintaxe é skin fixa e também não colide.
6. `::selection` continua **sem regra**: o alvo não escreve nenhuma.

### 3.3 Risco nomeado

`scripts/contraste.mjs` tem avaliador OKLCH próprio que **relê e recalcula** `src/css/tokens.css` (`contraste.mjs:40`, `131-143`). Mudar a *forma* da derivação pode quebrar o parser, não só os números. Tratar como item, não como surpresa. Além disso o script **compara célula a célula, por string**, as tabelas publicadas em `docs/design/tokens.md` §10 e `docs/design/foco.md` §6 — toda mudança de paleta exige atualizar as duas.

---

## 4. Geometria

### 4.1 O container centralizado — a correção principal

O alvo tem **um wrapper que centraliza sidebar + conteúdo + TOC como grupo**:

```
max-width: 1472px ;  margin-inline: auto ;  padding-inline: 32px  (16px abaixo de lg)
```

Nós **não temos**. A sidebar cola em `x=0` e o container de 1152px centraliza só dentro do que sobra. O desalinho cresce com a tela:

| Largura | Margem esquerda | Margem direita |
| --- | --- | --- |
| 1280 | 0 | 16 |
| 1512 | 0 | 28,5 |
| **1920** | **0** | **232,5** |
| **2560** | **0** | **552,5** |

Existe até uma regra de compensação de rodapé por causa disso (`chrome.css:638-641`), com o comentário admitindo *"a 1600px isso é mais de cem pixels de desalinho"*. Ela morre junto com o problema.

### 4.2 Valores-alvo, a 1512

| Elemento | Devin | Hoje |
| --- | --- | --- |
| Wrapper | 1472, margens 20, padding 32 | — |
| Sidebar `left` | **52** | 0 |
| Sidebar largura | 288 | 288 ✓ |
| Sidebar útil (`pr-8`) | 256 | 288 |
| Rótulo da sidebar em x | **96** | 48 |
| Sidebar `border-right` | **`0px`** | 1px em x=287 |
| `main` | 340 / 1120 | 288 / 1209 |
| Linha interna | `flex-direction: row-reverse`, `gap 48`, `padding-top 40` | — |
| Coluna de texto (prosa) | 383,19 / **720,81** | 388,5 / 720 |
| Vão sidebar → texto | **43,19** | 28,5 |
| Caixa do TOC | 1156 / **304** | 1180,5 / 288 |
| Lista visível do TOC | 1196 / **264** | 1204,5 / 264 ✓ |
| TOC `border-left` | **`0px`** | 1px |
| TOC fixo em | `top: 152px` | `top: 128px` |
| Margem direita | **52** *(= a esquerda)* | 28,5 |
| Navbar altura | **112** (64 + 48) | 112 ✓ |
| Navbar interno | 1472 centralizado, padding 48 → logo em **x=68** | sangra, padding 24 → logo em x=24 |
| Navbar borda inferior | **1px** `#767676`@5,1% / `#ccccdd`@5,9% | nenhuma |
| **Faixa de abas** | **transparente** | `#2B262A`, y 65–111, sangrando |
| Aba ativa | **sublinhado**, `border-bottom 1px` | só cor de texto |
| Comportamento no scroll | fundo e borda idênticos em `scrollY` 0, 800 e 3000 — sem blur, sem elevação | idem |

O logo do alvo cai em **x=68**, que é exatamente onde cai o cabeçalho de grupo da sidebar. Alinhamento intencional, e ele se perde se o navbar continuar sangrando.

### 4.3 Limiares

| | Devin | Hoje |
| --- | --- | --- |
| Sidebar some abaixo de | **1024** | 997 |
| TOC some abaixo de | **1280** | 997 |
| Navbar vira `fixed`, 120px, barra de breadcrumb de 56px | 390 | — (64px, sem barra) |

O portão 1, perna B, exige que **todo** limiar seja `996px` ou `997px` (`portao-1-literais.sh:46`). A lista fechada abre para **{997, 1024, 1280}** — o portão continua fechando a lista, agora nos números do alvo.

### 4.4 A grade de 12 colunas sai

`chrome.md:58` afirma que mover o TOC de 288 para 304 *"exigiria quebrar o 75/25, que vive numa classe hasheada de CSS Module e custaria `unsafe` em `DocItem/Layout`"`. **Isso deixa de valer.** O custo era quebrar a proporção *dentro da grade do Infima*. O alvo não usa grade: usa flex com larguras explícitas. Trocando grade por flex em CSS, o 304 sai sem ejeção.

### 4.5 A coluna de texto passa a oscilar

`chrome.md:84` mediu o comportamento da âncora e o **rejeitou**: *"essa oscilação não é desenho: é efeito colateral"*. Sob fidelidade 100% a rejeição cai — ela era um `delta deliberado` num projeto que declara zero deles. A coluna de texto passa a encolher com a janela como no alvo (720,81 a 1512; 528,81 a 1280) em vez de segurar 720 e comer a margem.

### 4.6 Scrollbar

O alvo apaga a nativa e desenha a própria:

```css
.base-ui-disable-scrollbar              { scrollbar-width: none }
.base-ui-disable-scrollbar::-webkit-scrollbar { display: none }
```

e renderiza um trilho de **4px**, `border-radius: 9999px`, `margin: 16px 2px`, trilho `#fafafa`/`#262626`, polegar `#d4d4d4`/`#525252`, com `opacity: 0` em repouso e `opacity: 1` no hover, transição `opacity .15s cubic-bezier(.4,0,.2,1)` — e `duration: 0` enquanto rola. Nenhuma goteira reservada.

Hoje: `scrollbar-width: thin` + `scrollbar-gutter: stable` reserva **10px permanentes** mesmo sem overflow, e quando o polegar aparece ele é **cinza de sistema `#8b8b8b` sobre `#fcfcfc`** — as cores em variável nunca renderizam, porque `scrollbar-width: thin` vence e descarta os `::-webkit-`.

**Rota adotada:** `scrollbar-color: transparent transparent` em repouso, tingida no `:hover`, mantendo `scrollbar-gutter: stable` para não haver salto. Difere do alvo no desenho do trilho — ver §9.

O alvo também tem um **fade de topo**: `div` `sticky top-0`, 32px de altura, `linear-gradient(in oklab, <fundo> 0%, transparent 100%)`, mascarando itens que passam sob o navbar. Puro CSS, entra.

---

## 5. Tipo

Famílias já batem: **Inter** variável + **paperMono** variável, ambas auto-hospedadas nos dois lados.

| Papel | Devin | Hoje |
| --- | --- | --- |
| `h1` | **36 / 40 / 600 / −0,9px** | 48 / 53,3 / 600 / −1,2px |
| `h2` | **24 / 32 / 600 / −0,6px** | 32 / 42,7 / 600 / −0,8px |
| `h3` | **20 / 28 / 600 / −0,5px** | — *(ausente nas páginas amostradas)* |
| Prosa | **16 / 28 / 400** | 18 / 31,5 / 400 |
| Subtítulo | 18 / 28 / 400 | 18 / 31,5 / 400 |
| Sobrancelha | **14 / 20 / 600**, no acento | 12,8 / 22,4 / 500, mudo |
| Item de sidebar | 14 / **24** / **400** | 14 / 17,5 / **500** |
| Cabeçalho de grupo | 14 / 24 / 600 | 14 / — / 500 |
| Item de TOC | **14** / 24 / 500 | 12,8 / 19,2 / 400 |
| Aba do navbar | 14 / 20 / 500 | 16 / 28 / 500 |
| Código em bloco | 14 / 24 / 400 | 14,4 / 24,7 / 400 |
| Código inline | 14 / 21 / **500** | 14,4 / 25,2 / 400 |

`h1` e `h2` exigem matar as regras `.markdown` do Infima, que hoje vencem os tokens. A escala de token do repo já diz **36 / 24** — a correção **converge** com o alvo em vez de brigar com ele.

O alvo marca item ativo (sidebar, aba, TOC) com `text-shadow: -0.2px 0 0 currentColor, 0.2px 0 0 currentColor` — negrito óptico, não troca de peso. É a mesma técnica que o repo já usa em `--sd-negrito-optico`.

`body` do alvo carrega `antialiased` (`-webkit-font-smoothing: antialiased`).

---

## 6. Topo do artigo

O alvo **não tem breadcrumb e não tem banda**. O cabeçalho é plano sobre o fundo da página — todo ancestral até a raiz tem `background: transparent`.

Composição, a 1512:

| Faixa | Elemento | Métrica |
| --- | --- | --- |
| Sobrancelha | `div.eyebrow` — um `<div>`, não link | 14 / 20 / 600, `#317cff` **nos dois temas**, `margin-bottom 10px` |
| Título | `h1#page-title` | 36 / 40 / 600 / −0,9px |
| Descrição | `p` em `div.mt-2.text-lg` | 18 / 28 / 400, `margin-top 8px` |

Ritmo vertical medido:

```
navbar (112) → topo do header     40px
header → sobrancelha               2px
sobrancelha → h1                  10px
h1 → subtítulo                     8px
subtítulo → conteúdo              32px
```

A 390 o `h1` cai para **30 / 36**.

Hoje temos sobrancelha-por-subtração do breadcrumb (`chrome.css:484-506`), 12,8/500 em cor muda. Passa a 14/600 no acento.

O botão **"Copy page"** do alvo (156×34, `rounded-l-xl` + caret `rounded-r-xl`) **não entra** — ver §12.

---

## 7. Busca

### 7.1 Controle fechado

| | Devin | Hoje |
| --- | --- | --- |
| Posição | **centralizado** na linha 1 do navbar | à direita |
| Caixa | 300,75 × **36** | 148,25 × 32,5 |
| Raio | **12px** | 8px |
| Fundo | igual à página | transparente |
| Borda | **`box-shadow: 0 0 0 1px`** `#a0a2a6`@30% / `#515357`@30% | nenhuma |
| Hover | anel → `gray-600/30`; escuro → `gray-500/30` + `brightness(1.25)` | fundo wash |
| Foco | `outline: #317cff auto 1px` | anel de foco |
| Padding / gap | `0 12px 0 14px` / 8px | `4px 8px` / 8px |
| Ícone | 16×16, `stroke-width 1.5`, `#404246` / `#a0a2a6` | 16×16 |
| Placeholder | **"Search..."** 14/24/400 | *(sem placeholder — é botão)* |
| Dica de tecla | **texto puro** 12 / **600**, `#717377` — sem fundo, sem borda, sem raio, sem padding | `<kbd>` com pílula, borda, raio 4 e `box-shadow: inset` |

A pílula `<kbd>` morre. É texto.

### 7.2 Modal

| | Devin | Hoje |
| --- | --- | --- |
| Painel | **640 × top 54**, centralizado | 720 × top 64 |
| Raio | **20px** | 16px |
| Fundo | igual à página | `--sd-surface-raised` |
| Borda | `border-width: 0`; anel via `box-shadow 0 0 0 1px` `#0b0d11`@6% | 1px `--sd-border-subtle` |
| Sombra | `0 57px 34px /.01`, `0 25px 25px /.02`, `0 6px 14px /.02` | `--sd-shadow-float` |
| Overlay | `rgba(0,0,0,0.40)`, **sem `backdrop-filter`** | scrim 40%, sem blur ✓ |
| Entrada | `transition 250ms cubic-bezier(.22,1,.36,1)`, `origin-center` | `animation` + `allow-discrete` |
| Linha do campo | caixa interna 628×49, **raio 16**, borda 1px `#dfe2e6` | 718×66,5, sem caixa interna |
| Input | 16 / **500**, placeholder **"Search or ask a question..."** | 18 / 400, sem placeholder |
| Item de resultado | **h50, raio 14**, padding `6px 8px` | h86, raio 8 |
| Item realçado | `#000000`@3,1% / `#ffffff`@5,1% | `--sd-surface-wash` |
| Título do item | 14 / 500 / −0,1px | 16 |
| Linha de trilha | 12 / 400 / 16, com chevrons de 10×10 | 12 (`span.aba`) |
| `<mark>` | fundo transparente, **texto no acento + bold** | só peso |
| Rodapé | 12px, `border-top 1px`, teclas como **SVG de 14×14**, não `<kbd>` | 12px, teclas em `<kbd>` |
| Trava de scroll | `overflow: hidden` no `<html>` + `scrollbar-gutter: stable` | `<dialog>` nativo |

O alvo **não agrupa** resultados de documento e API — só a linha de IA tem cabeçalho. Como o "Ask Assistant" não entra (§12), some também o cabeçalho.

---

## 8. Sidebar

| | Devin | Hoje |
| --- | --- | --- |
| Item altura | **36** | ~33 (14/17,5 + padding 8) |
| Item padding | `6px 12px 6px 16px` | `8px 16px` |
| Item raio | **12px** | — |
| Passo entre itens | 37 (`margin-bottom: 1px`) | — |
| Ícone | **16×16, em toda folha**, 16px dentro do item, **gap 12** até o rótulo | 16×16, **só no cabeçalho de categoria**, gap 8 |
| Rótulo em x | 96 | 48 |
| Recuo por nível | **+12px**, todo no `<a>` — o `<ul>` aninhado não tem padding, margem nem borda esquerda | — |
| **Item ativo** | **pílula: `background: rgb(49 124 255 / 10%)`, raio 12, largura cheia**, texto e ícone no acento, sem barra lateral, sem borda, sem sombra | wash + negrito óptico |
| Hover | `gray-600/5` claro / `gray-200/5` escuro | — |
| Cabeçalho de grupo | 14 / 600, `padding-left 16`, `margin-bottom 10`, **sem ícone**, sem caixa alta | 14 / 500, **com ícone** |
| Entre grupos | `margin-top: 32px` | — |
| Seletor de versão/produto | **não existe na sidebar** — as abas vivem no navbar | idem ✓ |

**Os ícones trocam de lado.** O alvo põe ícone em toda folha e nenhum no cabeçalho de grupo; nós fazemos o inverso, com 11 pares. O manifesto vai para **~52**, um por página, e `npm run icones` cresce junto.

---

## 9. TOC

| | Devin | Hoje |
| --- | --- | --- |
| Caixa | 304 (`padding-left: 40`) | 288 (`padding-inline: 24 0`) |
| Lista visível | **264** | 264 ✓ |
| Item | 264 × **32**, `padding: 4px 0` | — |
| Tipo | 14 / 24 / 500 | 12,8 / 19,2 / 400 |
| Cor | `#515357` / `#a0a2a6`; **ativo no acento** | **todos no acento** |
| Estado ativo | **só cor** + negrito óptico — sem pílula, sem trilho, sem borda | idem |
| Recuo h3 | **16px** via `--toc-padding-left` | — |
| `border-left` | **`0px`** | 1px |
| Fixo em | `top: 152px` | `top: 128px` |
| Cabeçalho | ícone 12×12 + rótulo, 14 / 500 | — |

Correção principal aqui: hoje **todo** link do TOC é acento. No alvo, só o ativo.

---

## 10. Página de referência / API

**A forma já está certa.** O alvo também não tem TOC em página de endpoint — ele o substitui por um trilho fixo de amostras. Nosso `ApiDocItem` já é duas colunas com painel fixo. Erram os números, e falta o bloco de endpoint.

### 10.1 Moldura

Idêntica à página de prosa, **menos a largura do trilho**:

| | Prosa | API |
| --- | --- | --- |
| Coluna de texto | 383,19 / **720,81** | 383,19 / **576,81** |
| Trilho direito | 1156 / **304** | 1012 / **448** (`max-w-[28rem]`) |
| Vão texto → trilho | 52 | 52 |

Trilho: `sticky`, `top: 152px`, `height: calc(100vh − 9.5rem)`, `z-index: 21`.

### 10.2 Painéis de amostra

Dois empilhados, `gap 24`. Cada um: `padding 2px`, **raio 16**, fundo `#f4f6fa` / `#1f1f1f`, borda 1px `#0a0a14`@10,2% / `#ffffff`@10,2%.

- **Cabeçalho** 34px, padding `0 10px`: título 12/16/500; seletor de linguagem 84×28 raio 10, 12/16/500 `#717377`; botões de 26×26 raio 6, ícones 16×16, gap 6.
- **Painel de resposta** troca o título por abas de status — `200`, `422` — 12/16/500, raio 8, padding `2px 8px`, ativa no acento.
- **Superfície de código** dentro: raio **14**, padding **14px 16px**, texto **12 / 21,6** paperMono, fundo `#ffffff` / `#0b0c0e`, sem numeração de linha.

### 10.3 Barra de endpoint

Um bloco próprio, **24px abaixo** do cabeçalho do artigo: 576,81 × **46**, raio 16, padding 4, borda 1px `#e0e3e5`@70,2% / `#ffffff`@10,2%.

- **Pílula de método**: raio **8**, padding `2px 6px`, **14 / 20 / peso 700**, família **Inter** (não mono). POST 50,34×24 `#5fa5fa`@20% com texto `#1d4ed8`/`#60a5fa`; GET 40,36×24 `#4bdc82`@20% com texto `#15803d`/`#4ade80`; PUT amarelo; DELETE vermelho.
- **Caminho** em paperMono, `gap 2px`: separadores `/` 14/20/400 `#a0a2a6`; segmentos 14/20/**500** `#26292d`/`#ffffff`.
- Botão de copiar 26×26 raio 6, `opacity 0 → 1` no hover do grupo.

Na sidebar, cada rota carrega uma pílula menor: 8,8px peso 700, raio 6, `w-8`; a **ativa** é sólida `#3064E3` com texto branco.

### 10.4 Lista de parâmetros

Seção: `h4` 18/27/600 com regra `border-bottom 1px` e `padding-bottom 10`, `margin-top 36`.

Linha: `border-bottom 1px` `#eff1f5` / `#26292d`, `last:border-b-0`, `padding: 24px 0`. Sem recuo, sem fundo, sem zebra.

- **Nome** 14/20/**600**, mono, **no acento**, nos dois temas.
- **Chips** (`string`, `header`, `required`, `default:…`): 12/20/500, **raio 6**, padding `2px 8px`, `margin-right 8`. Tipo/local: fundo `#f5f5f3`@50% / `#ffffff`@5,1%, texto `#57534e` / `#e7e5e4`. `required`: fundo `#fde1e1`@50% / `#f57676`@10,2%, texto **`#dc2626`** / **`#fca5a5`**.
- **Descrição** `margin-top 16`, **14 / 24 / 400**.
- **Âncora da linha** no vão esquerdo, a **40px** da coluna, 24×24 raio 6, `opacity 0 → 1` no hover.
- **Aninhados** num `<details>` nativo, sumário **"Show child attributes"**: raio 12, borda 1px, padding `12px 14px`, 14/20/400, chevron 10×10; corpo com **21px** de recuo.

Portão 5 regenera a referência de `contratos/*.json` e reprova em `git diff` — mudar a forma renderizada mexe **no gerador e no componente**, nunca na página.

---

## 11. Os componentes

Medidos no alvo, a 1512, nos dois temas. Comuns: fundo de página `#fcfcfc` / `#141414`; coluna de prosa 720,81.

### Card / CardGroup
Grade `gap` **16px** em coluna, **0** em linha; `cols={2}` → 352,406px cada. Card: fundo `#ffffff` / `#141414`, borda **1px** `#0a0a14`@10,2% / `#ffffff`@10,2%, **raio 16**, `margin 8px 0`, **sem sombra**. Interior `padding 20px 24px`: ícone **24×24** (`#26292d` / `#eff1f5`), título 16/24/600 com `margin-top 16`, corpo 16/24/400 `#515357` / `#a0a2a6` com `margin-top 4`.
**Hover: só a cor da borda muda, para o acento.** Sem anel, sem sombra, sem elevação, sem mudança de fundo.

### Accordion / AccordionGroup
Isolado: fundo `#fcfcfc` / `#0b0c0e`, borda 1px `#e0e3e5`@70,2% / `#ffffff`@10,2%, **raio 16**, `margin-bottom 12`, fechado **54** de altura, sumário 52 com `padding 16px 20px`.
Marcador: triângulo sólido **12×12** — **▶ fechado, ▼ aberto**, troca de glifo, **não rotação**. Título 16/20/**500**.
Corpo aberto: `margin 8px 24px 16px`.
**Fundo aberto e fechado são idênticos.** Hover no sumário → `#eff1f5` / `#26292d`.
Grupo: borda 1px, **raio 12**, achata os filhos (`border-0`, `rounded-none`, `mb-0`) e separa por **`border-bottom 1px`** `#eff1f5` / `#26292d`. Item de 53 (52 + 1).

### Steps
Container `margin 40px 0 24px 14px`.
Marcador: **28×28**, círculo, fundo `#f4f6fa` / `#ffffff`@10,2%, numeral **12/16/600**, deslocado `−13px` à esquerda.
Conector: **1px** de largura, começa **44px** abaixo do topo do passo, `#e0e3e5`@70,2% / `#ffffff`@10,2%. **O último passo troca por um gradiente que desvanece.**
Conteúdo: `padding-left 32`; título 16/28/600 com `margin-top 8`; corpo 16/28/400.
Entre passos: `padding-bottom 20`.

### Tabs
Faixa 48 de altura, `column-gap 24`, regra inferior **1px** `#dfe2e6` / `#e2e2e2`@10,2%, `margin-bottom 24`.
Item 47, padding `12px 0 10px`, `margin-bottom −1px`, **14 / 24 / 600 em todos os estados**.
**Ativo: cor do acento + `border-bottom 1px` no acento** — sublinhado, não pílula, encaixando exatamente sobre a regra.
Inativo: `#181a1e` / `#dfe2e6`, borda transparente. Hover inativo: borda → `#cfd1d5` / `#404246`, **cor do texto não muda**.
Painel: **sem fundo, sem borda, sem padding**.

### CodeGroup
Casca: `margin 20px 0 32px`, `padding 2px`, **raio 16**, borda 1px, fundo `#f4f6fa` / `#1f1f1f`.
Faixa de abas 34: aba 42,9×24, padding interno `0 6px`, raio 8, **12 / 24 / 500**, ativa no acento.
**Indicador ativo: pílula de 2px de altura**, largura da aba, raio 9999, 4px abaixo da caixa da aba.
Código: raio **14**, padding `14px 16px`, **14 / 24** paperMono.
**Bloco de código simples**: mesmo raio 16 e mesma borda, **sem faixa e sem fundo de casca** — a superfície de código é o único preenchimento, raio 16, e os botões ficam absolutos em `top:12px right:16px`.

### Callout
Caixa comum: `margin 16px 0`, `padding 16px 20px`, **raio 16**, borda 1px, `display:flex`, `gap 12`. Corpo **14 / 20 / 400** começando a 49px da borda esquerda. Links herdam a cor da variante, peso 600, com borda inferior de 1px.

| Variante | Ícone | Claro: fundo / borda / texto | Escuro: fundo / borda / texto |
| --- | --- | --- | --- |
| Note | 16 | `#eff6ff` / `#bfdbfe` / `#1e40af` | `#17243f` / `#1e3a8a` / `#93c5fd` |
| Tip | 18 | `#f0fdf4` / `#bbf7d0` / `#166534` | `#14311f` / `#14532d` / `#86efac` |
| Check | 16 | `#f0fdf4` / `#bbf7d0` / `#166534` | `#14311f` / `#14532d` / `#86efac` |
| Warning | 20 | `#fefce8` / `#fef08a` / `#854d0e` | `#382c11` / `#713f12` / `#fde047` |
| Info | 20 | `#fafafa` / `#e5e5e5` / `#262626` | `#2b2b2b` / `#404040` / `#d4d4d4` |

Tip e Check compartilham paleta; muda só o glifo e o tamanho. **`Danger` não existe no alvo.**

### Tabela
Base 14 / 20. `thead` com `border-bottom 1px` `#dfe2e6` / `#404246`@50,2%. `th` 14/20/**600**, **alinhado à esquerda**, padding `0 8px 8px` (0 nas bordas externas). `tr` do corpo com `border-bottom 1px` `#eff1f5` / `#262a2e`@50,2%. `td` 14/20/400, padding **8px**. **Sem zebra.**

### Blockquote
`border-left` **4px** `#dfe2e6` / `#26292d`, `padding-left 24`, `margin 25,6px 0`, **sem fundo e sem raio**. Texto igual ao corpo.

### `<hr>`
`border-top 1px` `#eff1f5` / `#262a2e`@50,2%, largura da coluna, **`margin 48px 0`**.

### Expandable / Field
`details.expandable`: borda 1px, **raio 12**, `margin-top 16`, fechado 43,5; sumário `padding 12px 14px`, 14/17,5/400, chevron 10×10; corpo aberto com `border-top 1px` e `margin-x 12 / padding-x 8`.
`div.field`: `padding 10px 0 20px`, `margin 10px 0`, `border-bottom 1px` `#f4f6fa` / `#26292d`@50%. Cabeça em paperMono 14/20, nome como `button` 14/20/**600** no acento, chips idênticos aos da página de API.

### Frame
`padding 8`, **raio 16**, fundo `#f3f5f9`@50,2% / `#28282c`@25,1%, mais uma camada de **grade de pontos** (SVG em data-URI, mascarada por gradiente vertical) e uma hairline absoluta de **1px** `#000000`@5,1% / `#ffffff`@5,1%. Mídia interna com **raio 12**. Botão de expandir 18×18, circular, `#000000`@70,2%.
**Sem legenda** — o alvo não renderiza `figcaption`.

### Mermaid
**Sem moldura nenhuma** — nem fundo, nem borda, nem raio, nem padding, nem legenda. SVG cru na largura da coluna, `font-family: inherit`.

### Âncora de heading
`a` no vão esquerdo, **40px** à esquerda da coluna, alvo de 40×40. **`opacity: 0` em repouso, `1` no hover do heading.** Quadrado **24×24**, raio 6, fundo igual à página, ícone 12×12, sombra `0 0 0 1px oklab(…/.3), 0 1px 2px rgba(0,0,0,.05)`.

### Paginação anterior/próximo
`nav` de **20px de altura**, `gap 24`, **sem caixa, sem borda, sem raio, sem fundo** — links de texto puro nas duas pontas. Rótulo **14 / 20 / 600**; seta é um chevron de **3×6** do lado externo, `gap 12`. Hover muda só a cor do rótulo.
Rodapé do artigo acima dele: `border-top 1px`, `padding 40px 0 112px`, `gap 48`.

### Não existem no alvo
`Tooltip`, `Badge`/`Pill`, `Danger`, `Columns` autoral, componente `Mermaid`, `Snippet`, `Latex`, `Banner`, playground de API ("Try it"), TOC em página de API, zebra em tabela, e qualquer sombra ou elevação em hover de card.

Verificado buscando as tags nos **258** `.md` das páginas em inglês, mais sondagem no DOM renderizado.

---

## 12. A landing morre

`src/pages/index.js` deixa de ser landing e passa a `<Redirect>` do `@docusaurus/router` para `/jornadas/api-owner/indice`, primeiro item de `sidebars-jornadas.js`. `@docusaurus/router` já vem do core — **zero dependência nova**, e `scripts/cinco-zeros.sh:28` trava a lista em sete pacotes.

Sai junto:

- **Portão 8** (`scripts/portao-8-landing.sh`) — conta os seis efeitos da landing em número exato. **Oito portões viram sete**, em `.github/workflows/ci.yml`, `package.json` (`npm run portoes`) e `docs/design/README.md` §5.
- `docs/design/landing.md`, 666 linhas — o índice cai de 30 para 29 arquivos.
- O bloco `[data-sd-showcase]` da camada 3 de `tokens.css`, e com ele `--sd-glow`, `--sd-glow-2`, `--sd-glow-tamanho`, `--sd-glow-vale`, `--sd-glow-crista`.
- O único consumidor de `--sd-type-6xl`.
- A frase de assinatura em `principios.md:178` — *"…e uma única faixa de espetáculo onde a luz é emitida em vez de ocluída"* — precisa ser reescrita. O que sobra é *"uma documentação `mint` fiel"*.
- A classe de procedência `origem própria` provavelmente esvazia.

O quinto zero **não** é afetado: a única JS de interação é `src/theme/SearchBar/index.js`, cravada por nome em `cinco-zeros.sh:138`.

---

## 13. Divergências declaradas

| O quê | Restrição | Classe |
| --- | --- | --- |
| A raiz devolve **200 + JS**, não o **308** do alvo | GitHub Pages não faz redirect de servidor (`deploy.yml:50-67`) | `lacuna por restrição` |
| Sem **"Copy page"** no cabeçalho do artigo | o quinto zero — uma única JS de interação | `lacuna por restrição` |
| Sem **"Ask Assistant"** no navbar, no campo da busca e na lista de resultados | idem | `lacuna por restrição` |
| Scrollbar é a barra fina do navegador **tingida**, não a pílula de 4px do alvo | a do alvo é componente React (Base UI ScrollArea) — seria uma segunda JS | `lacuna por restrição` |

Nota de classificação: a restrição aqui é um axioma do projeto, não da plataforma. A spec precisa decidir se isso ainda cabe em `lacuna por restrição` ou se merece qualificador próprio — `principios.md:95` define a classe como *"dimensão medida e não alcançável"*, e a `delta deliberado` é declarada vazia.

---

## 14. O que muda na maquinaria

| Peça | O que muda |
| --- | --- |
| `scripts/portao-1-literais.sh:46` | a lista fechada de limiares abre para **{997, 1024, 1280}** |
| `scripts/portao-8-landing.sh` | **removido**, com a linha correspondente da CI e do `npm run portoes` |
| `scripts/contraste.mjs` | o avaliador OKLCH precisa aguentar a forma nova da rampa; as tabelas de `tokens.md` §10 e `foco.md` §6 são comparadas **por string** e têm que acompanhar |
| `scripts/espelho-tokens.mjs` | `--sincronizar` obrigatório a cada edição de `tokens.css` — o bloco `css` de `tokens.md` §3 é espelho byte a byte |
| `scripts/vendorizar-icones.mjs` | o manifesto vai de **11 para ~52** ícones, um por folha |
| `scripts/gerar-referencia.mjs` + `src/theme/ApiDocItem/` | forma nova da página de API: barra de endpoint, pílula de método, chips de parâmetro, trilho de 448 |
| `scripts/swizzle-list.txt` / portão 7 | **não muda** — nenhum swizzle novo |
| `scripts/cinco-zeros.sh` | **não muda** — nenhuma dependência nova, nenhuma JS nova |
| `docs/design/README.md` §3 e §5 | 29 arquivos, sete portões |

---

## 15. Ordem de execução

1. **Protótipo de centralização.** Provar por CSS, nas classes estáveis (`html.docs-doc-page`, `.main-wrapper`, `.theme-doc-sidebar-container`), que o grupo centraliza sem ejeção. **Se falhar, parar e trazer a conta antes de gastar `unsafe`.**
2. **Paleta.** Chão neutro, rampa do alvo, acento violeta, desacoplamento da marca; `espelho-tokens --sincronizar` e as tabelas de contraste.
3. **Geometria e chrome.** Wrapper, sidebar sem divisor, TOC 304 sem divisor, navbar centralizado, faixa cinza morta com aba sublinhada, scrollbar, limiares, grade → flex.
4. **Tipo e topo do artigo.** Escala do alvo, override do Infima morto, sobrancelha no acento.
5. **Landing.** Redirect, portão 8, os arquivos e tokens que saem.
6. **Busca.** Controle centralizado, dica em texto, modal 640/54/20, linhas de 50.
7. **Sidebar.** Pílula ativa, métrica de item, ícones nas folhas (manifesto para ~52).
8. **Página de referência.** Trilho de 448, barra de endpoint, chips de parâmetro.
9. **Os 17 componentes**, contra §11.

O corte, se houver, sai de **9**. Nunca de 1–7.

## 16. Verificação

Comparador headless que abre alvo e produto na mesma largura, extrai a mesma sonda e cospe a lista de diferenças. **Ferramenta de implementação, não portão de CI** — o juiz declarado é a análise visual humana sobre o produto final, num único checkpoint no fim. A lista de diferenças que sobrar é entregue junto com o produto, para que o que não fechou seja lido e não descoberto.

A CI continua sendo a lista de `.github/workflows/ci.yml`, menos o portão 8: portões 1–5 e 7, `npm test`, `npm run icones`, `espelho-tokens --verificar`, `npm run contraste`, `npm run invariantes`, `npm run build`, `npm run zeros`.
