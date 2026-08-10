# A faixa de tabs de largura total, e se ela custa um `unsafe`

Pesquisa da [#51](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/51), do [mapa #49](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/49).
Medido no **Docusaurus 3.10.2** deste repositório — `npm ci`, `npm run build`, `npm run serve`, e a geometria lida de um Chrome de verdade.

---

## 0. O veredito, antes do material

| Pergunta da issue | Resposta |
| --- | --- |
| **A rota de CSS puro existe?** | **Sim.** Medida, não deduzida: a faixa fica de pé com **quatro peças de CSS** e **um item de navbar declarado na config**. |
| **Qual o degrau mais barato, e é `unsafe`?** | Degrau **0 + 1 + 2** da escada do [ADR 2](../adr/0002-politica-de-swizzle.md). **Não é `unsafe`.** Nenhum arquivo novo em `src/theme/`. |
| **Qual dos cinco zeros cai?** | **Nenhum.** `npm run portao:7` passou com a faixa montada: *220 componentes no artefato, 10 arquivos em src/theme/ com endereço, zero `unsafe`*. |
| **A faixa sangra de ponta a ponta?** | **Sim.** Quem a pinta é o próprio `<nav>`, que já vai de `x=0` a `x=100vw`. Sem DOM novo e sem pseudo-elemento. |

**Consequência que ultrapassa o ticket: a perda 4 está errada.** [`swizzle.md`](../design/swizzle.md) §4, [`chrome.md`](../design/chrome.md) §8 e o ADR 2 «Consequências» item 4 registram *"Faixa de tabs de largura total abaixo do navbar — exigiria reestruturar `Navbar/*`"*. **Não exige.** A correção é a §9 deste documento.

---

## 1. O que foi medido, e com o quê

A convenção deste repositório é a da pesquisa [#8](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/8): **escrever o código, rodar o build, olhar o resultado.** Aqui "olhar" é literal — `getBoundingClientRect()` num Chrome headless dirigido por Chrome DevTools Protocol.

**O instrumento não acrescenta dependência.** O Node 24 tem `WebSocket` nativo, então o CDP é dirigido direto, sem `puppeteer` e sem `playwright`. O axioma 2 vale também para o instrumento de medição. Ele está em [`faixa-de-tabs/medir.mjs`](faixa-de-tabs/medir.mjs), com as instruções de reprodução no cabeçalho.

O que foi exercitado, e em que largura:

| Cenário | Larguras | O que cobra |
| --- | --- | --- |
| Geometria da faixa | 997, 1000, 1024, 1100, 1200, 1440 | as tabs numa linha só, abaixo da marca |
| Os dois locales | 1440 em `pt-BR` e `en` | rótulo mais longo não abre terceira linha |
| Hambúrguer | 996, 900, 390 | a faixa **não existe** no estreito |
| `position: sticky` | 1440, rolando a 800px | o navbar gruda, e no tamanho novo |
| Dropdown de locale | 1440, **hover de verdade** | abre, não é recortado, os dois links são clicáveis |
| Drawer do estreito | 390, **aberto** | a alta do token não o estraga |
| Ordem de foco | 1440 | a sequência de `Tab` contra a leitura visual |

---

## 2. A anatomia real do navbar em 3.10.2

### 2.1 O DOM que o tema emite

`Navbar/index.js` é só composição — `<NavbarLayout><NavbarContent/></NavbarLayout>`. O que sai, medido no HTML servido:

```
<nav class="navbar navbar--fixed-top ...">      ← height fixo, padding 8px 24px, sticky, z-index 200
  <div class="navbar__inner">                   ← display:flex, FLEX-WRAP:WRAP, justify-content:space-between
    <div class="navbar__items">                 ← display:flex, align-items:center, flex:1, min-width:0
      <button class="navbar__toggle">           ← display:none acima de 996px
      <a class="navbar__brand">                 ← vazio; escondido por `:empty` em chrome.css
      <a class="navbar__brand marca">           ← o `custom-marca` do projeto
      <a class="navbar__item navbar__link"> ×3  ← AS TABS
    </div>
    <div class="navbar__items navbar__items--right">   ← flex:0 0 auto, justify-content:flex-end
      <div class="navbarSearchContainer_…">
      <div class="navbar__item dropdown …">     ← locale
      <a class="navbar__item navbar__link">     ← GitHub
      <div class="…colorModeToggle_…">
    </div>
  </div>
  <div class="navbar-sidebar__backdrop">
  <div class="navbar-sidebar">                  ← o drawer do estreito
</nav>
```

**O fato que decide tudo: as tabs não são filhas de `.navbar__inner`.** Elas são **netas** — filhas de `.navbar__items`. `.navbar__inner` tem só dois filhos, o bloco da esquerda e o da direita.

`splitNavbarItems` (em `@docusaurus/theme-common`) só conhece duas gavetas, `left` e `right`. **Não existe terceira posição, nem slot de segunda linha.** O `Navbar/Content` carrega dois `// TODO stop hardcoding items?` no próprio código.

### 2.2 As regras do Infima que governam a caixa

Lidas do CSS servido pelo build (`build/assets/css/styles.*.css`), verbatim:

```css
.navbar            { background-color:…; box-shadow:…; height:var(--ifm-navbar-height);
                     padding:var(--ifm-navbar-padding-vertical) var(--ifm-navbar-padding-horizontal) }
.navbar--fixed-top { position:sticky; top:0; z-index:var(--ifm-z-index-fixed) }
.navbar__inner     { display:flex; flex-wrap:wrap; justify-content:space-between; width:100% }
.navbar__items     { align-items:center; display:flex; flex:1; min-width:0 }
.navbar__items--right { flex:0 0 auto; justify-content:flex-end }
.navbar__item      { display:inline-block; padding:… }
```

Três coisas importam, e as três são boas notícias:

1. **`.navbar__inner` já tem `flex-wrap: wrap`.** A mecânica de quebra existe no upstream; não é preciso ligá-la.
2. **`navbar--fixed-top` é `sticky`, não `fixed`.** O `<nav>` ocupa fluxo, então o conteúdo abaixo dele não precisa de compensação de offset quando ele cresce.
3. **`.navbar` tem `height`, não `min-height`.** É a única má notícia, e é a que a §4.1 resolve.

### 2.3 O limiar do hambúrguer

Do CSS servido, dentro de `@media (max-width:996px)`:

```css
.navbar__toggle { display:inherit }
.colorModeToggle_…, .navbar__item, .rodape_…, .tableOfContents_… { display:none }
```

**Abaixo de 997px todo `.navbar__item` some** — as três tabs, o locale, o GitHub. É o que torna a faixa um fenômeno exclusivo do largo, e o que permite escopá-la inteira numa `@media (min-width: 997px)`.

### 2.4 Quem consome `--ifm-navbar-height`

Nove lugares, e é isso que faz a alta do token funcionar em vez de estilhaçar:

| Consumidor | Regra |
| --- | --- |
| `.navbar` | `height` |
| `.navbar-sidebar__brand` | `height` — cabeçalho do drawer |
| `.navbar-sidebar__items` | `height: calc(100% - …)` |
| `.tableOfContents_…` | `top: calc(… + 1rem)` e `max-height` — o TOC sticky |
| `.sidebar_…` (DocSidebar/Desktop) | `padding-top` |
| `.sidebarLogo_…` | `min-height` / `max-height` |
| `.docSidebarContainer_…` | `margin-top: calc(-1 * …)` |
| `.anchorTargetStickyNavbar_…` | `scroll-margin-top: calc(… + .5rem)` |
| `useHideableNavbar` | **mede o DOM**, não lê o token — se adapta sozinho |

**A sidebar de docs é presa ao navbar por um par acoplado** — margem negativa no contêiner, `padding-top` compensatório na sidebar —, e os dois leem **o mesmo token**. Subir o token move os dois juntos. É por isso que o degrau 0 alcança.

> **Não confirmado, e vale escrito:** `scroll-padding-top` e `--doc-sidebar-height` **não existem** em 3.10.2. O ancoramento usa `scroll-margin-top` no alvo, não `scroll-padding` no scroller.

---

## 3. `swizzle --list`, com o nome do componente

Rodado no worktree, no 3.10.2 instalado:

```
npx docusaurus swizzle @docusaurus/theme-classic --list --typescript
```

Linhas verbatim da tabela:

```
│ Navbar                                   │ Unsafe    │ Unsafe    │ N/A │
│ Navbar/Content                           │ Unsafe    │ Unsafe    │ N/A │
│ Navbar/Layout                            │ Unsafe    │ Unsafe    │ N/A │
│ Navbar/ColorModeToggle                   │ Unsafe    │ Unsafe    │ N/A │
│ Navbar/Logo                              │ Unsafe    │ Unsafe    │ N/A │
│ Navbar/MobileSidebar                     │ Unsafe    │ Unsafe    │ N/A │
│ Navbar/Search                            │ Unsafe    │ Unsafe    │ N/A │
│ NavbarItem                               │ Unsafe    │ Unsafe    │ N/A │
│ NavbarItem/HtmlNavbarItem                │ Unsafe    │ Unsafe    │ N/A │
│ NavbarItem/ComponentTypes                │ Forbidden │ Safe      │ The Navbar item components mapping. …│
```

**Resposta direta ao item 2 da issue: `Navbar/Layout` e `Navbar/Content` são `Unsafe` nas duas ações — `wrap` e `eject`.**

E a razão importa, porque muda como se lê o rótulo: **`getSwizzleConfig.ts` do `theme-classic` não tem entrada nenhuma para `Navbar`, `Navbar/Layout` ou `Navbar/Content`.** Eles caem no fallback do CLI:

```js
const FallbackSwizzleActionStatus = 'unsafe';
```

Ou seja, `Unsafe` aqui **não é um aviso deliberado dos mantenedores** sobre esses componentes em particular — é ausência de declaração. Isso não os torna mais seguros: a doc oficial diz que `unsafe` significa *"breaking changes might happen within a theme **minor** version"*, e o ADR 2 já mediu três exercícios disso dentro do v3. Mas explica por que a vizinhança inteira do navbar é `Unsafe` em bloco.

**Não existe costura `safe` que acrescente um irmão ao `.navbar__inner`.** As três costuras seguras que tocam o navbar — `ColorModeToggle`, `SearchBar`, `NavbarItem/ComponentTypes` — desembocam todas **dentro** de `.navbar__items`.

Se a faixa exigisse DOM novo em posição nova, o preço seria `Navbar/Layout` ou `Navbar/Content` em `--eject`, com `--danger`. **Ela não exige.**

---

## 4. A rota de CSS puro, peça por peça

Quatro peças, e nenhuma delas é swizzle.

### 4.1 A altura, e a armadilha que ela escondeu — degrau 0

`.navbar` tem `height` fixo. Uma segunda linha **transborda** em vez de esticar. A primeira tentativa mediu exatamente isso: `.navbar__items` cresceu para 84px enquanto o `<nav>` continuou em 56, e as tabs foram desenhadas **por cima do conteúdo da página**.

A correção é degrau 0 — variável do Infima:

```css
--ifm-navbar-height: 104px;        /* 56 da linha 1 + 48 da faixa */
--ifm-navbar-padding-vertical: 0;  /* senão as duas linhas cabem em 88px e desalinham 9px */
```

> **Correção de premissa, medida, e ela custou uma iteração.** A primeira versão escreveu a sobrescrita em `:root`. **Não pegou.** `tokens.css` declara os tokens sob **`:root[data-theme]`** — especificidade (0,2,0) contra (0,1,0) de um `:root` puro. É a mesma armadilha de especificidade que a pesquisa [#5](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/5) registrou, reencontrada aqui em campo. **Qualquer sobrescrita de token deste projeto tem que casar `:root[data-theme]`.**

O segundo valor tem motivo próprio: com `padding: 8px 24px`, as duas linhas dividem uma caixa de conteúdo de 88px, e a faixa pintada desalinha das tabs em 9px. Zerado o preenchimento vertical, as linhas mandam na altura e a conta fecha: **0–56 é a linha 1, 56–104 é a faixa**.

### 4.2 A quebra — degrau 2, e não a marca

`.navbar__items` ganha `flex-wrap: wrap`, e um item de base 100% e altura 0 abre a segunda linha:

```css
.navbar__items:not(.navbar__items--right) { flex-wrap: wrap; align-content: flex-start }
.navbar__items > .quebra-de-faixa         { flex: 0 0 100%; height: 0; padding: 0; margin: 0 }
```

O espaçador é **um item de navbar declarado na config** — `type: 'html'`, opção pública, degrau 2:

```js
{type: 'html', position: 'left', className: 'quebra-de-faixa', value: '<!--quebra-->'},
```

Ele nasce como `<div class="navbar__item quebra-de-faixa">` dentro de `.navbar__items`, entre a marca e as tabs. Com base 100% ele não cabe ao lado da marca, então **abre a linha 2 e a esgota**; as tabs vão para a linha 3, que é a primeira linha visível depois da marca. Como a linha do espaçador tem altura 0, o resultado são **duas faixas visíveis**.

Duas coisas medidas sobre ele, e as duas são armadilhas:

- **`value` não pode ser vazio.** O schema recusa: `"navbar.items[1].value" is not allowed to be empty`. Um comentário HTML satisfaz o schema e não renderiza nada.
- **Ele é `.navbar__item`, então `@media (max-width:996px)` o esconde junto com as tabs.** Isso não é efeito colateral, é o comportamento desejado: no estreito não há quebra porque não há faixa.

> **Por que não usar a marca para abrir a linha.** A primeira versão deu `flex: 0 0 100%` a `.navbar__brand.marca`, e **funciona** — está medido. Foi descartada porque acopla a faixa à existência de uma marca no bloco da esquerda, e o mapa [#49](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/49) quer o estilo replicável como template da casa. O espaçador declarado não depende de haver marca.

### 4.3 A altura determinada da linha 1 — degrau 1

Sem isto a linha 1 encolhe para a altura natural da marca — **medido: 24,5px** — e a faixa pintada não casa com as tabs:

```css
.navbar__items > .navbar__brand { min-height: 56px; align-items: center }
.navbar__items--right           { align-self: flex-start; height: 56px }
```

`.navbar__brand` é classe do Infima, não do projeto — degrau 1. O `align-self` no bloco da direita é o que impede que busca, locale e GitHub fiquem **centrados contra as duas linhas** em vez de sentados na primeira.

### 4.4 O sangramento — degrau 1, e sem DOM novo

Este é o ponto que parecia exigir componente, e não exige:

```css
.navbar {
  background-image: linear-gradient(to bottom,
    transparent            0    56px,
    var(--sd-border-subtle) 56px 57px,
    var(--sd-surface-card)  57px 104px);
}
```

**Quem pinta a faixa é o próprio `<nav>`.** Ele já mede `x=0, w=100vw` — medido: `{x:0, w:1440}` numa viewport de 1440. Uma parada dura de gradiente recorta a faixa dentro dele: o fio de 1px em 56–57, a superfície em 57–104.

Isso resolve o que seria a objeção óbvia. As tabs vivem dentro de `.navbar__items`, que é **inset** 24px e mede só 1010,7px de largura — elas nunca chegariam às bordas. Mas **só o fundo precisa sangrar**, e o fundo não é delas: é do `<nav>`.

Verificação: cinco pontos varridos em `y=80` (dentro da faixa) numa viewport de 1440 — `x = 2, 20, 720, 1420, 1438`. **Todos os cinco caem dentro do `<nav>`.** A faixa vai de ponta a ponta.

---

## 5. Os testes de sobrevivência

Todos contra o `npm run build` real, com o CSS na folha do projeto — não injetado.

### 5.1 A geometria, nas seis larguras de desktop

| Largura | token | `<nav>` | tabs em `y` | numa linha só | `main` começa | TOC em `y` |
| ---: | ---: | ---: | ---: | :-: | ---: | ---: |
| 1440 `pt` | 104px | 104 | 56 | sim | 104 | 120 |
| 1200 `pt` | 104px | 104 | 56 | sim | 104 | 120 |
| 1440 `en` | 104px | 104 | 56 | sim | 104 | 120 |
| 1100 | 104px | 104 | 56 | sim | — | — |
| 1024 | 104px | 104 | 56 | sim | — | — |
| 997 | 104px | 104 | 56 | sim | — | — |

`main` começa exatamente em 104 — **sem buraco e sem sobreposição**. O TOC gruda em 120 = `104 + 1rem`, que é a fórmula do Infima resolvida com o valor novo. **A alta do token propagou sozinha para os nove consumidores.**

### 5.2 Terceira linha: não acontece, e há folga medida

A largura útil da faixa é a de `.navbar__items`, que divide a linha 1 com o bloco da direita. É o ponto mais estreito do desenho, então foi medido no pior caso:

| Largura | `.navbar__items` | soma das 3 tabs | folga | linhas |
| ---: | ---: | ---: | ---: | :-: |
| 997 | 567,7 | 382,4 | **185,3** | 1 |
| 1000 | 570,7 | 382,4 | 188,3 | 1 |
| 1024 | 594,7 | 382,4 | 212,3 | 1 |
| 1100 | 670,7 | 382,4 | 288,3 | 1 |

**Em 997px — o primeiro pixel de desktop, onde a faixa nasce — sobram 185px.** O `en` é mais curto que o `pt` (371 contra 406,4 de extremidade), então o `pt-BR` é o pior caso e é ele que está na tabela.

### 5.3 O hambúrguer, abaixo de 997px

| Largura | token | `<nav>` | tabs visíveis | `.navbar__toggle` | `main` começa |
| ---: | ---: | ---: | :-: | --- | ---: |
| 996 | 56px | 56 | 0 | `flex` | 56 |
| 900 | 56px | 56 | 0 | `flex` | 56 |
| 390 | 56px | 56 | 0 | `flex` | 56 |

A `@media (min-width: 997px)` devolve o navbar ao estado original abaixo do limiar. **Nada da faixa vaza para o estreito.**

### 5.4 O drawer do estreito, aberto

Este era o risco real da alta do token: `.navbar-sidebar__brand` e `.navbar-sidebar__items` leem o mesmo `--ifm-navbar-height`, e um cabeçalho de drawer com 104px seria defeito visível.

Medido a 390px, com o drawer **efetivamente aberto** (clique no hambúrguer, `navbar-sidebar--show` confirmada):

```
{"aberto":true, "token":"56px", "brandH":56, "itemsH":744, "viewportH":800}
```

`brandH` é 56 e não 104; `itemsH` é 744 = 800 − 56. **O escopo por media query fecha o risco**, porque o drawer só existe onde o token não subiu.

### 5.5 O dropdown de locale, por hover de verdade

Não por classe forçada — `Input.dispatchMouseEvent` com `mouseMoved` sobre o gatilho, que é o caminho que o `dropdown--hoverable` do Infima usa:

```
{"abertoDeFato":true, "rect":{"y":45.8,"h":87.4}, "navBottom":104,
 "recortado":false, "links":[{"t":"PT","acerta":true},{"t":"EN","acerta":true}]}
```

O menu abre em 45,8 e termina em 133,2 — **atravessa a faixa e passa 29px abaixo do `<nav>`**. Não é recortado, porque `.navbar` continua com `overflow: visible`. Os dois links respondem ao teste de acerto por `elementFromPoint`. **O dropdown sobrevive.**

### 5.6 `position: sticky`

A 1440px, rolando a 800px: `{"navTop":0, "navBottom":104, "grudado":true}`. O navbar gruda no topo **na altura nova**, e o conteúdo passa por baixo dele. O `sticky` não é afetado por a caixa ter duas linhas.

---

## 6. O custo, na escada do ADR 2

| Peça | Degrau | O que custa no upgrade |
| --- | :-: | --- |
| `--ifm-navbar-height`, `--ifm-navbar-padding-vertical` | **0** | nada |
| `.navbar` (gradiente), `.navbar__inner`, `.navbar__items`, `.navbar__brand`, `.navbar__item` | **1** | nada — são classes do Infima |
| `themeConfig.navbar.items` com `type: 'html'` | **2** | nada — opção pública |
| — | **3, 4, 5** | **não usados** |
| — | `unsafe` | **não usado** |

**A faixa não desce abaixo do degrau 2.** O ledger de [`swizzle.md`](../design/swizzle.md) §3 não ganha linha nos degraus 3, 4 ou 5, e `src/theme/` não ganha arquivo.

### O portão 7, com a faixa montada

```
$ npm run portao:7
Portão 7 passou — 220 componentes no artefato, 10 arquivos em src/theme/ com endereço, zero `unsafe`.
```

**Nenhum dos cinco zeros cai.** Os outros quatro também não são tocados: não há dependência npm nova (nem no instrumento de medição), não há serviço externo, não há JS de interação no catálogo, e não há autor novo de modelo de interação — a faixa é CSS e uma linha de config.

---

## 7. O que a rota **não** entrega — perdas nomeadas

O veredito é "sim", mas não é "sim, e de graça". Quatro coisas ficam de fora, e cada uma é perda escrita.

**1. A ordem de foco diverge da leitura visual.** Medido a 1440px:

```
Trilho @y0 → Documentação @y56 → Referência da API @y56 → Receitas @y56
  → Buscar @y11.4 → PT @y17 → GitHub @y6 → alternador de tema @y12
```

`Tab` desce para a faixa e **volta a subir** para o cluster da direita. É consequência direta de o DOM ter dois blocos — esquerda inteira, depois direita inteira — enquanto a faixa distribui a esquerda em duas linhas. Hoje, com tudo em uma linha, a sequência é monotônica da esquerda para a direita.

Não é contornável nesta rota: `order` de flexbox pioraria o problema em vez de resolver, e reordenar o DOM é exatamente o `Navbar/Content` que a rota evita. **Se isto for inaceitável, é aqui — e só aqui — que a conta do `unsafe` volta a ser feita.**

**2. As tabs alinham ao preenchimento do navbar, não à coluna de conteúdo.** Elas começam em `x=24`, que é `--ifm-navbar-padding-horizontal`. Alinhá-las à coluna de doc é decisão estética separada, alcançável por `padding-left` na linha 2 — não foi medido porque a geometria alvo ainda não fechou no mapa.

**3. A largura útil da faixa é a de `.navbar__items`, não a da viewport.** O fundo sangra; **o conteúdo não**. Uma tab encostada na borda direita da tela é impossível nesta rota. Com folga medida de 185px no pior caso, isso não morde hoje — mas é teto, e teto não anunciado vira surpresa.

**4. A altura total é 104px, não os 112px do Devin.** Porque a linha 1 deste projeto é 56px e a do Devin é 64px. A faixa é 48px nos dois. Se o mapa quiser os 112, o que muda é `--sd-navbar-height`, não a rota.

---

## 8. O que o CSS escrito ainda não é

O apêndice A **reprova no portão 1**:

```
$ npm run portao:1
Portão 1 REPROVOU — literal de cor, comprimento, tempo ou curva fora de src/css/tokens.css:
  9 ocorrências em faixa.css — 104px, 48px, 0px, 56px, 57px, 56px, 48px, 56px
```

Isso **não é defeito da rota**, é o CSS de evidência não ter passado pela disciplina do projeto. Os seis valores distintos — 104, 56, 48, 57, 1 e 0 — nascem como token em `tokens.css` e são citados por nome. É trabalho de implementação, não risco de viabilidade, e está nomeado aqui para que a spec não o descubra depois.

Por isso o `faixa.css` deste branch mora em `docs/research/faixa-de-tabs/` e **não** em `src/css/`: o portão 1 varre `src/`, e um branch de pesquisa não deveria carregar um portão vermelho.

---

## 9. A correção de premissa

Três documentos afirmam que a faixa exige `Navbar/*`. **A medição os desmente.**

| Documento | O que diz hoje | O que a medição mostra |
| --- | --- | --- |
| [ADR 2](../adr/0002-politica-de-swizzle.md), «Consequências» item 4 | *"**Faixa de tabs de largura total abaixo do navbar.** Exigiria reestruturar `Navbar/*`."* | Não exige. Degraus 0+1+2. |
| [`swizzle.md`](../design/swizzle.md) §4, perda 4 | *"Faixa de tabs de largura total abaixo do navbar · `Navbar/*`"* | A perda 4 **sai** da lista. |
| [`swizzle.md`](../design/swizzle.md) §3, degrau 4 | *"a faixa de tabs … sairia por envolver `DocSidebar` (`wrap: safe`)"* | **Também errado, por outro motivo.** `DocSidebar` é `Safe` para `wrap`, mas ele é a sidebar de docs — não tem como emitir uma faixa acima de si, na largura da janela, dentro do `<nav>`. O degrau 4 continua vazio, e agora por um motivo mais forte: a faixa nem precisa dele. |
| [`chrome.md`](../design/chrome.md) §8, perda 4 | *"exigiria reestruturar `Navbar/*`"* | idem |

**Quem corrige não é esta pesquisa.** A convenção do mapa [#49](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/49) é que `docs/design/` e `docs/adr/` mudam **na implementação**, slice a slice. O que esta pesquisa entrega é o achado; a correção entra quando a spec for reescrita.

Vale notar o que **não** muda: as outras nove perdas de `swizzle.md` §4 continuam de pé. `DocItem/Layout`, `DocBreadcrumbs`, `TOC` e `DocRoot/Layout` seguem `unsafe`, e nada aqui os alcança.

---

## 10. Rotas descartadas, e por quê

| Rota | Por que não |
| --- | --- |
| `swizzle Navbar/Layout` ou `Navbar/Content` | `Unsafe` nas duas ações. Proibido pelo ADR 2, e desnecessário. |
| `wrap` de `Navbar` | Também `Unsafe`, e renderizaria a faixa **fora** do `<nav>`, não dentro. |
| `flex-basis: 100%` na marca | Funciona — medido —, mas acopla a faixa à existência de uma marca. O espaçador declarado não. |
| `display: contents` em `.navbar__items` | Promoveria as tabs a filhas de `.navbar__inner`, que já envolve. Não foi preciso, e `display:contents` tem histórico de remover elementos da árvore de acessibilidade. |
| Pseudo-elemento `::after` para sangrar | Desnecessário: o `<nav>` já sangra, e uma parada dura de gradiente recorta a faixa sem DOM novo. |
| `src/theme/Root.js` | Alcançaria (é degrau 2 no ADR 2, e é route-aware), mas renderiza **acima** do navbar na árvore. Pôr a faixa abaixo exigiria `order` de flexbox, que é a mesma divergência de ordem de foco da §7.1 — com mais peças. |
| `injectHtmlTags` | HTML estático **fora** do `<div id="__docusaurus">`. Não reage à navegação SPA. |
| `clientModules` | A doc oficial manda usar swizzle quando a manipulação de DOM é estrutural. |

---

## Apêndice A — o CSS medido

**Isto é evidência, não proposta pronta.** Ele reprova no portão 1 (§8), alinha as tabs ao preenchimento do navbar e não à coluna (§7.2), e crava a altura de 104px que a spec ainda não decidiu. O arquivo está em [`faixa-de-tabs/faixa.css`](faixa-de-tabs/faixa.css).

```css
@media (min-width: 997px) {
  :root[data-theme] {
    /* Especificidade (0,2,0): `tokens.css` declara sob `:root[data-theme]`,
       e um `:root` puro (0,1,0) PERDE. */
    --ifm-navbar-height: 104px;        /* 56 da linha 1 + 48 da faixa */
    --ifm-navbar-padding-vertical: 0px; /* senão as linhas desalinham 9px */
  }

  /* A faixa SANGRA porque quem a pinta é o próprio <nav>, que já vai de
     x=0 a x=100vw. Zero DOM novo, zero pseudo-elemento. */
  .navbar {
    background-image: linear-gradient(to bottom,
      transparent             0    56px,
      var(--sd-border-subtle) 56px 57px,
      var(--sd-surface-card)  57px 104px);
  }

  .navbar__inner { align-items: flex-start }

  /* A quebra: o espaçador de base 100% e altura 0 abre a linha. */
  .navbar__items:not(.navbar__items--right) {
    flex-wrap: wrap; align-items: center; align-content: flex-start;
  }
  .navbar__items > .quebra-de-faixa {
    flex: 0 0 100%; height: 0; padding: 0; margin: 0;
  }

  /* A linha 1 precisa de altura DETERMINADA, senão encolhe para a altura
     natural da marca (medido: 24,5px). `.navbar__brand` é classe do Infima. */
  .navbar__items > .navbar__brand { min-height: 56px; align-items: center }

  .navbar__items:not(.navbar__items--right) > .navbar__item:not(.quebra-de-faixa) {
    height: 48px; display: flex; align-items: center;
  }

  .navbar__items--right { align-self: flex-start; height: 56px }
}
```

## Apêndice B — a config medida

Em `themeConfig.navbar.items`, **logo depois da marca e antes das três tabs**:

```js
// `value` NÃO pode ser vazio — o schema recusa com
// `"navbar.items[1].value" is not allowed to be empty`.
// Um comentário HTML satisfaz o schema e não renderiza nada.
{type: 'html', position: 'left', className: 'quebra-de-faixa', value: '<!--quebra-->'},
```

E `faixa.css` ao **fim** de `presets[0][1].theme.customCss` — depois de `tokens.css`, porque sobrescreve token.

## Apêndice C — como reproduzir

```bash
npm ci
# 1. copie docs/research/faixa-de-tabs/faixa.css para src/css/
# 2. aplique os dois trechos do apêndice B em docusaurus.config.js
npm run build
npm run serve -- --port 3213 &
node docs/research/faixa-de-tabs/medir.mjs
```

O instrumento imprime JSON com a geometria das cinco larguras, o dropdown por hover, o drawer aberto e a ordem de foco. Ele acha o Chrome no cache do puppeteer ou do playwright, ou aceita `CHROME=/caminho`. **Nenhum dos dois é dependência deste repositório** — o driver de CDP usa o `WebSocket` nativo do Node 24.

---

## Procedência

| Achado | Classe | Fonte |
| --- | --- | --- |
| `Navbar/Layout` e `Navbar/Content` são `Unsafe`/`Unsafe` | **medido** | `swizzle --list` no 3.10.2 do worktree |
| O `Unsafe` deles é fallback por omissão | **medido** | `getSwizzleConfig.ts` sem entrada; `FallbackSwizzleActionStatus = 'unsafe'` |
| `.navbar__inner` já tem `flex-wrap: wrap` | **medido** | CSS servido pelo build; `infima/dist/css/default/default.css` |
| `.navbar` tem `height`, não `min-height` | **medido** | idem — é o que faz a linha 2 transbordar |
| `navbar--fixed-top` é `sticky`, não `fixed` | **medido** | idem |
| Nove consumidores de `--ifm-navbar-height` | **medido** | grep no `theme-classic`, `theme-common` e Infima |
| A rota de CSS puro funciona | **medido** | build real, seis larguras, dois locales |
| A faixa sangra de ponta a ponta | **medido** | cinco pontos em `y=80` caem todos no `<nav>` |
| O drawer não é afetado | **medido** | 390px, drawer aberto: `brandH=56`, `itemsH=744` |
| O dropdown sobrevive | **medido** | hover real por CDP; menu passa 29px abaixo do `<nav>` |
| Zero `unsafe` | **medido** | `npm run portao:7` verde com a faixa montada |
| Sobrescrita de token precisa casar `:root[data-theme]` | **medido (correção)** | a primeira tentativa em `:root` não pegou |
| `type: 'html'` recusa `value` vazio | **medido** | o build reprovou no schema |
| A perda 4 do ADR 2 está errada | **correção de premissa** | consequência direta de tudo acima |
| A rota do degrau 4 por `DocSidebar` está errada | **correção de premissa** | `DocSidebar` não emite nó dentro do `<nav>` |
| Ordem de foco diverge da leitura visual | **lacuna nomeada** | medido a 1440px |
| O CSS reprova no portão 1 | **medido** | `npm run portao:1` |
