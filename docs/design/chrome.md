# Chrome

O shell da página de documentação: proporções, navbar com faixa de tabs, sidebar, TOC, eyebrow, subtítulo, paginação e footer.

**Nenhum valor numérico nasce neste documento.** Todos os comprimentos moram em [`tokens.md`](tokens.md) e são citados aqui **por nome de token**. Os outros números que aparecem são identificadores — número de ADR, de issue e de portão — ou o limiar de media query, que é o único comprimento que a linguagem não sabe ler de custom property.

> **Três parágrafos citam valor, e são os únicos.** O §1 traz a cadeia de proporções com o número ao lado do nome do token, porque ela é a única coisa deste documento que **ou fecha na tela, ou não fecha** — e uma cadeia sem número não é conferível. Ali os números são **evidência de medição**, não fonte: quem os edita edita `tokens.md`, e este documento passa a estar errado. O §11 e o §12 trazem o **alvo medido na âncora**, que é a outra ponta: ali os números não descrevem o que temos, e sim o que se quer atingir. Eles vêm de `research/paridade-devin`, não de `tokens.css`, e quem os edita está afirmando que a âncora mudou.

Chrome não se autora: se **entorta**. Tudo neste documento é degrau 0 (variável do Infima), degrau 1 (classe estável) ou degrau 2 (opção pública) da escada do [ADR 2](../adr/0002-politica-de-swizzle.md), **com duas exceções de degrau 3** — a marca, que está em [`icones.md`](icones.md), e o subtítulo do §6. As duas estão no ledger de [`swizzle.md`](swizzle.md). O orçamento `unsafe` continua em zero.

Tudo aqui é obrigatório. Não há bloco `Livre` — o chrome inteiro é geometria herdada ou consequência de restrição, e não sobra latitude para nomear dono.

> **Leia antes:** [ADR 1 — Doutrina de CSS](../adr/0001-doutrina-de-css.md) e [ADR 2 — Política de swizzle](../adr/0002-politica-de-swizzle.md).

---

## 1. A cadeia de proporções, elo por elo

Uma cadeia, e cada elo deriva do anterior. **Ou os números fecham na tela, ou não fecham** — não há meio-termo, e todo o resto do site assume que fecharam.

| Elo | Token | Valor | Como sai |
| --- | --- | ---: | --- |
| **Congelamento** | `--sd-congelamento` | **1408** | derivado — `sidebar + container`. Consumidor desde a #96: o `max-width` do grupo que centraliza sidebar + conteúdo + TOC, ver abaixo. Era 1472 (com um termo de gutter) até a #96 fechar as margens simétricas — ver a nota logo depois da tabela |
| Container | `--sd-container-width` | 1120 | medido. Era 1152 até a #96; ver a nota abaixo |
| Sidebar | `--sd-sidebar-width` | 288 | medido |
| Coluna de conteúdo | `--sd-doc-width` | 816 | derivado, container − TOC — não é mais fração de grid. Era 864 antes da #96 (grid), depois 848 (container ainda em 1152), ver §1.2 |
| Coluna do TOC | `--sd-toc-width` | 304 | **origem própria** — bate com a âncora desde a #96. Era 288, derivado do grid, até §1.2 |
| Separação do TOC | `--sd-space-6` | 24 | **origem própria** — inalterada; a lista muda de valor porque a caixa mudou, não a separação |
| Lista do TOC | — | **280** | herdado — 304 − 24, era 264 quando a caixa era 288 |
| Medida de prosa | `--sd-prose-width` / `--sd-container-width` | **720 / 1120** | **origem própria (correção, #96)** — duas larguras, não uma constante; ver §1.5. Com TOC visível o número NÃO mudou — a âncora já batia em 720 antes da #96 |
| Navbar, linha 1 | `--sd-navbar-height` | 64 | herdado |
| Faixa de tabs | `--sd-tabs-height` | 48 | herdado |
| Topo grudado | `--sd-topo-grudado` | **112** | derivado — a soma dos dois acima |
| Gutter | `--sd-gutter` | 16 → 32 | dobra a partir de 997 |
| Topo do conteúdo | `--sd-space-10` | 40 | herdado — abaixo do topo grudado |
| Recuo do subtítulo | `--sd-subtitulo-recuo` | 10 | herdado |

**Não há cartão, não há interior e não há breakout.** Os três morreram juntos — ver §2.

**O congelamento ganhou consumidor na #96, e é o que fecha a queixa central da issue-pai #92: a sidebar colada em `x=0` com toda a folga indo para a direita.** `html.docs-doc-page div:has(> main) { max-width: var(--sd-congelamento); margin-inline: auto }` centraliza o par sidebar+`<main>` como um bloco só. O seletor é estrutural, não nominal: o elemento que precisa do `max-width` é o flex que envolve os dois — hoje uma classe hasheada de CSS Module, sem nome estável —, mas `<main>` é landmark HTML5 e é sempre filho direto dele. `:has(> main)` alcança o pai sem citar o hash, e sem custar `unsafe`. **Provado em protótipo antes da implementação**, por exigência da issue — o protótipo usou 1472 como valor de teste, ainda sem a correção de container que vem a seguir, e confirmou só o MECANISMO: `div:has(> main)` casa exatamente um elemento na página, a centralização funciona, e o TOC continua `sticky`. Veredito e evidência na branch descartável `prototype/96-centralizacao`.

**O congelamento e o container encolheram DEPOIS do protótipo, e por um motivo que só apareceu medindo o site inteiro.** `sidebar(288) + container(1152) = 1440` não cabe num quadro de 1408 — que é o que as margens simétricas da âncora exigem em §11 (52px a 1512, 256px a 1920) somado ao próprio `<main>` perder o preenchimento horizontal que tinha (ver a nota depois da tabela de §1.1). Container caiu para 1120 para fechar a conta: `288 + 1120 = 1408`, e o congelamento é essa soma direta — sem termo de gutter, porque o gutter deixou de ter algo a completar. Confirmado em navegador, não só em álgebra: a 1920, `sidebar.left = 256` e `viewport − TOC.right = 256`, os dois iguais, batendo com o alvo de §11.

### 1.1 O congelamento, e a correção de premissa que aterrissa aqui

O congelamento é a largura a partir da qual **nada mais se mexe na tela**. Até a #96 ele era `sidebar + container + 2 × (gutter − 16)`, com os 16 subtraídos sendo o preenchimento que o Infima já põe no `.container` e o `<main>` completando o resto pelo próprio preenchimento.

**O *"shell total = container + sidebar"* das redações anteriores nunca foi o congelamento.** Ele ignorava o preenchimento do `<main>` e errava para menos — dava 1416 onde a tela entregava 1472. A frase saiu, e o número que entrou era medido, não derivado no papel.

**Medido em navegador**, contra a página publicada de ANTES da #96, três viewports:

| viewport | container | coluna | lista do TOC | prosa |
| ---: | ---: | ---: | ---: | ---: |
| 1471 | 1151 | 863,3 | 263,8 | 720 |
| **1472** | **1152** | **864** | **264** | **720** |
| 1920 | 1152 | 864 | 264 | 720 |

**Esta medição inteira é de ANTES da #96**, e fica porque é ela quem prova, por precedente, que este tipo de tabela (viewport crescente até um ponto fixo) é a forma certa de mostrar um congelamento — não porque o número 1472 continue valendo. Ele não continua: ver a nota que fecha §1, acima. As QUATRO colunas envelheceram — não só as três de conteúdo, mas o próprio congelamento também mudou de número, coisa que não acontecia antes da #96 (ele era considerado fixo desde a correção do parágrafo anterior). Hoje: congelamento 1408, container 1120, coluna 816/840/1120 conforme a configuração de §2.1, lista 280, prosa 720/1120 conforme §1.5.

**O congelamento de ANTES da #96 caía exatamente em 1472** — um pixel abaixo a cadeia ainda estava crescendo, um pixel acima ela já não se mexia. Depois da #96 ele cai em **1408**, pelo mesmo critério, com o mesmo tipo de precisão de um pixel — só que agora medido contra a margem simétrica de §11, não contra o container sozinho.

### 1.2 O elo que fechou

**A coluna do TOC dava 288 contra os 304 da âncora.** Ela era 25% de um grid de doze que não se mexia, e mover isso exigiria quebrar o 75/25 — que vivia numa classe hasheada de CSS Module e custaria `unsafe` em `DocItem/Layout`.

**A lista, que é o que se vê, já batia exato.** A separação do TOC é o único número desta tabela escolhido em vez de medido, e ela foi escolhida para isso: `--sd-space-6` no lugar do `--sd-space-8` anterior derruba a lista de 256 para 264. Isso não mudou.

> **Correção de fato — #96.** O parágrafo acima descrevia uma restrição real, não uma decisão, e a restrição morreu com o grid de doze que a criava. `main > .container > .row` continua `display: flex` do Infima — não se toca —, mas `.col--3` deixou de ler fração de 12 e passa a ler `--sd-toc-width` direto, um comprimento explícito (`chrome.css` §1). Uma largura explícita não tem 75/25 a quebrar: **a coluna do TOC agora É 304**, o valor da âncora, sem custar `unsafe` em lugar nenhum — `DocItem/Layout` continua intocado, e o portão 7 passa com a largura nova montada. O elo que não fechava fechou porque a premissa que o prendia (grid percentual) deixou de existir, não porque alguém pagou o `unsafe` que a redação original temia.

É a diferença entre divergir na caixa e divergir na tinta — e agora não diverge em nenhuma das duas.

### 1.3 As DUAS variáveis de container recebem o mesmo valor

O Infima tem duas: uma normal e uma `-xl`, e **a segunda assume acima de 1440px**. Fixar só a primeira faz a coluna **alargar sozinha em tela larga**, que é exatamente a oscilação que a medida constante existe para eliminar.

É a armadilha mais barata de cair e a mais cara de perceber: o defeito só aparece num monitor que quem implementa pode não ter — e, com o congelamento em 1408 (era 1472 até a #96), **num monitor mais estreito que o congelamento ela nem se manifesta**.

### 1.4 Quatro declarações fazem a cadeia fechar, e as quatro são mecânicas

**(a) O gutter mora no `<main>`, não no `.container`.** A margem negativa da `.row` é calibrada contra o preenchimento do container, e o `.col` de 75% mede a row. Trocar o preenchimento do container quebra os três de uma vez.

**(b) O `.col` perde o preenchimento horizontal, e só onde a cadeia existe.** Sem isso a coluna de conteúdo nasce com a largura pretendida **menos** duas vezes o preenchimento de coluna do Infima, e a conta não fecha — verdade tanto quando a largura era 75% do grid quanto agora, que é `--sd-doc-width` explícito ou o `flex: 1 0` da coluna nua. Os dois lados são cobrados por dentro da largura, não por fora. **Abaixo do limiar a regra se inverte** — não há largura pretendida a fechar, e mantê-la encosta o texto na borda da viewport. Ver §9.

**(c) A coluna do TOC recebe a separação de um lado só.** Com preenchimento nos dois, a borda direita do TOC não fecha com a borda direita do container e sobra uma faixa vazia.

**(d) O topo do conteúdo completa no `<main>` o que o container já dá** — exatamente como o gutter horizontal de (a). E aqui isso não é simetria de estilo: é a **única rota**. O `DocRoot/Layout/Main` cola `padding-top--md` no container, e essa classe do Infima é `!important` — nenhuma declaração de folha de estilo a vence sem escrever um `!important` de volta, que é o que este projeto não faz em lugar nenhum. Somando por fora, a conta fecha sem brigar. Sem ela a página começa 24px cedo demais.

### 1.5 A medida da prosa acompanha o TOC, como na âncora

> **Correção de fato — #96.** Até aqui esta seção dizia *"`--sd-prose-width` sempre, tenha a página TOC ou não"*, e classificava a oscilação da âncora como *"efeito colateral, não desenho"*. A frase não sai — o raciocínio de então era honesto com o que o grid de doze permitia —, mas a decisão que ela produziu está revertida: a #96 mata o grid, e a medida constante era filha dele tanto quanto o elo do TOC em §1.2 era.

**A prosa agora tem DUAS larguras, e a que aparece depende do TOC estar no DOM E visível — as duas condições, não uma.** Com TOC visível (`.col--3` presente e acima do limiar de 1280, §1.6): `--sd-prose-width`, **720** — o MESMO número de antes da #96, porque a âncora já batia em 720 com o TOC presente; o que a #96 muda não é esse número, é ele deixar de ser o único. Sem TOC visível — página sem subtítulos, página com `hide_table_of_contents`, ou viewport entre 997 e 1279 onde o TOC existe mas está escondido: `--sd-container-width`, **1120**. É a MESMA oscilação da âncora, pela mesma causa que ela tem — a largura do texto depende de a página ter subtítulos visíveis —, e não mais um efeito colateral recusado.

**Uma configuração não alcança nem uma largura nem outra.** Página sem heading e sem `hide_table_of_contents` aciona `docItemCol` (`max-width: 75% !important`, hasheada) mesmo sem `.col--3` ao lado, e o `!important` não se vence sem escrever outro — o que este projeto não faz. Essa configuração fica em **840** — 75% de 1120, o container depois da correção de §1 —, entre as duas larguras declaradas. Não é meio-termo escolhido: é o teto que o upstream impõe sem ponto de fuga por CSS. Ver `chrome.css`, comentário do "cartão morreu", configuração B.

**O breakout continua morto.** Código e tabela medem o `<article>` inteiro, nunca uma lista de filhos — só que o `<article>` já não é um número fixo. Conferido em navegador nas três configurações.

**O custo, declarado, e ele não mudou:** a medida larga dá mais caracteres por linha do que o teto clássico. Aceito porque documentação se varre mais do que se lê corrido, e porque heading, lista e bloco de código quebram a linha longa o tempo todo — **mas só se sustenta com a entrelinha generosa** que `tokens.md` trava. Baixar a entrelinha do corpo reabre esta decisão, nas três larguras.

### 1.6 Dois limiares no projeto inteiro, não três

> **Correção de fato — #96.** Esta seção dizia *"um limiar só no projeto inteiro"*. A #96 abriu essa linha em voz alta — o próprio portão 1 já prometia fazer isso "no dia em que um CSS Module precisar do limiar" — e o resultado é DOIS, não o um de antes nem os três que a issue pedia. O parágrafo original fica, porque continua verdadeiro para o eixo que ele media; o que muda é que agora há um segundo eixo, que não brigava com aquele por não precisar do mesmo mecanismo.

As media queries de **sidebar, gutter e faixa de tabs** continuam alinhadas aos **literais compilados do Infima**, 996 e 997 — não aos 1024 da âncora. Isto não é preferência: `NavbarMobileSidebar` só MONTA a gaveta quando `windowSize` do React está em `'mobile'`, e esse estado lê um limiar de 996 HARDCODED em `@docusaurus/theme-common` — o próprio comentário-fonte diz *"this value is also hardcoded in Infima [...] Updating this JS value alone is not enough"*. Não é ponto de swizzle: é lógica de contexto React sem opção pública. Esconder a sidebar embutida antes de 1024 sem mover ESSE limiar junto abriria uma faixa morta entre 997 e 1023 — sidebar invisível, gaveta que não monta, sem rota até o menu. A #96 mediu o custo e não o pagou; ver a perda nova em §10.

**O TOC ganhou limiar próprio: 1280, o ponto em que a âncora o esconde.** Este eixo não briga com o do framework pelo motivo oposto: esconder `.col--3` é decisão só de CSS sobre um `<div>` que o projeto já controla por inteiro — `DocItemTOCDesktop` está montado (nível React) em toda a faixa `windowSize === 'desktop'`, de 997 a infinito, então não há estado de React a reabrir. 1280 é só onde a âncora muda de ideia visualmente.

Isto é cobrado por portão: a segunda perna do portão 1 reprova qualquer media query cujo limiar não esteja na lista fechada — 996/997 e 1280.

---

## 2. O cartão morre, e a caixa invisível fica

`.theme-doc-markdown` **deixa de ser superfície**. Sem fundo, sem anel, sem preenchimento, sem raio e sem sombra: a página fica plana. Conferido em navegador, e conferível por `grep` — a classe não aparece mais como superfície em lugar nenhum.

O que sobrevive do cartão é o `max-width`, e ele **muda de dono**: sobe do corpo para a coluna. Até a #96 ele segurava a página no MESMO pixel com ou sem TOC — a decisão que §1.5 revertia. Hoje ele segura dois pixels diferentes, um por configuração:

```css
html.docs-doc-page main > .container > .row > .col:not(.col--3) :is(article, .pagination-nav) {
  max-width: var(--sd-container-width);
  margin-inline: auto;
}

@media (min-width: 1280px) {
  html.docs-doc-page main > .container > .row:has(> .col--3) > .col:not(.col--3) {
    max-width: var(--sd-doc-width);
  }

  html.docs-doc-page main > .container > .row:has(> .col--3) > .col:not(.col--3) :is(article, .pagination-nav) {
    max-width: var(--sd-doc-width);
  }
}
```

**A decisão está no seletor.** Um elemento e uma classe do Infima seguram a caixa, como antes; o que entra na #96 é `:has(> .col--3)`, porque `.col--3` continua no DOM entre 997 e 1279 mesmo escondido — ver §1.6 — e `:has()` enxerga presença, não `display`. Sem essa segunda condição a prosa ficaria estreita numa faixa onde o TOC nem aparece. Com a lista de onze morreu a superfície que produziu o defeito do `<header>`: **não há mais lista da qual um elemento possa escapar**, e o conserto mergeado no [PR #64](https://github.com/panlabs-tech/shinydoc-docusaurus/pull/64) continua sem assunto.

O `.pagination-nav` entra pelo mesmo motivo que o `<article>`: ele é **irmão** dele e não filho, então sem a segunda linha a paginação mediria a coluna inteira enquanto o texto acima dela mede a prosa.

**O ancestral não é gosto de especificidade.** A referência gerada tem layout próprio, com o `<article>` dela dentro de uma `.row` cujo filho **não é `.col`**. Sem o escopo, a paginação daquela página encolheria para a prosa e sairia do prumo com a coluna de texto que ela fecha. Conferido: na página gerada a paginação mede a grade inteira, e o `<article>` continua com a largura que a aritmética do painel lhe dá.

### 2.1 As três configurações de coluna, e a que nenhuma página usa

**Correção de premissa, medida em 3.10.2.** O mapa escreveu que *"o Docusaurus só monta a coluna de TOC quando há heading; sem ela, a coluna de conteúdo vai a 100% da linha em vez de 75%"*. Não é o que o `DocItem/Layout` faz.

A classe de 75% é aplicada sempre que `hide_table_of_contents` **não** está no front matter — independentemente de haver heading. O que depende de heading é a coluna do TOC.

> **A tabela abaixo mudou na #96 — não o que o `DocItem/Layout` faz, que é fato de framework e não muda, mas o que a CAIXA INVISÍVEL faz, que é regra nossa.** Antes da #96 a caixa segurava as três configurações no MESMO pixel — 864 —, de propósito: era a decisão que §1.5 revertia. Hoje ela segura duas larguras diferentes, e a terceira escapa das duas por um `!important` que nenhuma delas alcança.

| configuração | coluna de conteúdo | coluna do TOC | o que a caixa invisível faz |
| --- | --- | --- | --- |
| com heading, TOC visível (≥ 1280) | 816 | renderizada | **inerte** — o `flex: 1 0` da coluna nua já entrega 816 sozinho, `--sd-doc-width` só confirma |
| com heading, TOC no DOM mas escondido (997–1279) | **menos que 840** — 75% do que a viewport dá | presente, sem efeito visível | **não alcança**, e o teto **também não morde**: `max-width: 75%` é percentual da largura real, e nessa faixa o layout ainda não congelou. O 840 é inalcançável aqui |
| sem heading (as **3** páginas sem `##`), a partir de 1408 | 840 | ausente | **não alcança** — `docItemCol` aplica `max-width: 75% !important` (840, 75% de `--sd-container-width`) antes de qualquer regra nossa rodar, e `!important` não se vence sem escrever outro |
| `hide_table_of_contents: true` | 1120 | ausente | **não trava mais** — a #96 removeu o `:not(:has(> .col--3))` da lista de exceções; ver §1.5 |

Verificado no fonte **e no artefato**: com `hide_table_of_contents: true` a coluna sai do build com `class="col"` e mais nada — a classe hasheada não é aplicada, então não há `!important` a vencer, e a coluna cresce para o container inteiro. Medido em navegador nessa configuração: **coluna em 1120, prosa em 1120** — a mais larga das três, de propósito, desde a #96.

O 840 não é escolha: é o que sobra depois de `docItemCol` vencer. Fica **entre** as duas larguras que a #96 declarou (816 e 1120), e a spec registra o número em vez de fingir que não existe.

> **Estas duas linhas eram uma só, e a fusão escondia que o 840 vale numa perna e não na outra.** A redação anterior lia *"com heading, TOC no DOM mas escondido (997–1279), **ou** sem heading"* e cravava 840 nas duas. **Em 997–1279 o 840 é inalcançável:** o teto é um percentual, o layout só congela em 1408 (`--sd-congelamento`), e até lá 75% da largura real é sempre menos que 840 — o `!important` está lá, mas não tem o que cortar. **Na perna sem heading o 840 vale**, e vale a partir de 1408, que é onde o container para de crescer. Um `ou` juntando uma faixa em que o número não acontece com outra em que ele acontece é o tipo de linha que passa em revisão e falha em medição.
>
> A perna sem heading tem **três** páginas medidas no build, e não é hipótese: `procedimentos/ambiente/indice`, `ferramentas/skills/rotacao-de-segredo` e `ferramentas/skills/scaffold-de-esteira` — as únicas 3 das 46 autorais sem um `##`. A primeira é a mesma que serve de fixture de página curta em [`informacao.md`](informacao.md).

### 2.2 O ritmo vertical é assimétrico

**48 antes de um cabeçalho, 16 depois, com `h2` e `h3` abrindo idêntico.**

É a regra que uma reprodução ingênua erraria. O Infima escala o ar de cima com o tamanho do título — `h2` a duas vezes o leading, `h3` a uma vez e meia —, o que é o gesto intuitivo e o errado: **o que separa uma seção da anterior não tem relação com o corpo do título dela.**

Ela resgata `--sd-space-12`, que perderia os **dois** consumidores que tinha — o preenchimento do cartão e a metade dele no estreito — e ficaria órfão, que é o defeito do Infima que este projeto nomeou.

A regra vence por especificidade, sem `!important` e **sem reescrever `--ifm-*-vertical-rhythm-*` fora do adaptador** — o que abriria uma sexta exceção com escopo contra a lista fechada de cinco do [ADR 1](../adr/0001-doutrina-de-css.md).

---

## 3. Navbar — duas linhas, e a segunda sangra de ponta a ponta

A marca e o cluster da direita ficam na linha 1; as três tabs caem numa faixa de largura total abaixo dela.

| Posição | Item | Tipo |
| --- | --- | --- |
| linha 1, esquerda | a marca | `custom-marca` — ver [`icones.md`](icones.md) |
| linha 1, direita | `Buscar` · `PT` · `GitHub` | `search`, `localeDropdown`, link |
| linha 1, direita | alternância de tema | **não declarável** |
| — | o espaçador que abre a faixa | `html` — degrau 2 |
| faixa | `Jornadas` · `Procedimentos` · `Ferramentas` | `docSidebar`, uma por instância |

**A ordem à direita é declarada, menos a última.** O `Navbar/Content` renderiza a alternância de tema depois dos itens da direita, por construção.

**As tabs trocam a sidebar inteira.** Cada uma aponta para uma instância de `plugin-content-docs`, e é isso que faz a URL ler o eixo. Ver [`informacao.md`](informacao.md).

### 3.1 A faixa — três peças, um item de config, zero `unsafe`

**Isto era a perda 4, e a perda 4 estava errada.** Ver §9.

1. **A altura do topo**, em `tokens.md`. `.navbar` tem `height` fixo e **não** `min-height`; sem o token novo a segunda linha **transborda e pinta sobre o conteúdo da página**. `--ifm-navbar-padding-vertical` vai a zero junto — com ele, as duas linhas ficam dentro de uma caixa de conteúdo mais curta que o `<nav>` e desalinham da faixa. Degrau 0.
2. **A quebra.** `flex-wrap: wrap` em `.navbar__items`, mais um espaçador de base 100% e altura 0 que abre a linha. Degrau 1.
3. **A altura determinada da linha 1**, por `min-height` no `.navbar__brand` e `align-self: flex-start` no cluster da direita. Sem ela a linha 1 encolhe para a altura natural da marca e a faixa não casa com as tabs. Degrau 1.

**O sangramento saiu na #96.** Era a quarta peça: parada dura de `linear-gradient` no próprio `.navbar`, pintando uma faixa cinza atrás das tabs. A issue-pai chamou a faixa de invenção sem par na âncora — *"a faixa em cinza não caiu bem"* —, e ela sai sem substituto de superfície: a linha de tabs lê **transparente sobre o fundo da página**, como o resto do `<nav>`. O que fecha a separação agora é um HAIRLINE de 1px no rodapé do `.navbar` inteiro — as duas linhas, não só a de baixo —, e o item ativo ganha sublinhado em vez de a faixa ganhar fundo. Ver `chrome.css` §2.

**São DUAS linhas, e a segunda entrou depois.** A âncora não desenha um hairline — desenha dois, e eles têm recuos diferentes de propósito. O de baixo, descrito acima, sangra de ponta a ponta da viewport. O outro fecha o rodapé da **fileira do topo** e para exatamente onde a marca começa e onde o último ícone da direita termina — Δ zero nas duas bordas, medido na âncora e confirmado por varredura de pixel, não só por caixa. O shinydoc tinha só o de ponta a ponta; a linha da fileira entrou por `::before` no `.navbar__inner`, com a altura de `--sd-navbar-height` e a mesma cor e espessura do outro.

A escolha do `.navbar__inner` como dono não é conveniência: **essa caixa já é, por medição, a identidade que a âncora pede** — o `.navbar__brand` começa no mesmo x em que ela começa, e o alternador de tema termina no mesmo x em que ela termina, acima do congelamento. E é pseudo-elemento absoluto, não borda na fileira, porque **a fileira 1 não é um elemento**: ela são dois — a marca e o cluster da direita —, e uma borda em cada um daria dois segmentos com o vão do meio aberto entre eles. O escopo de 997 é obrigatório: abaixo do limiar a navbar tem uma fileira só, e o `.navbar__inner` volta a `position: static`, o que subiria o containing block até o `<nav>` e desmancharia o recuo.

**Acrescenta, não move.** Mover o hairline de baixo para o `.navbar__inner` foi testado em página viva antes de escolher: a linha de ponta a ponta encurta de cada lado e deixa de sangrar — que é exatamente a propriedade que a âncora mantém.

**O `.navbar__inner` passa a centralizar no MESMO container que agrupa sidebar, conteúdo e TOC** — mesmo `max-width: var(--sd-congelamento)`, mesmo `margin-inline: auto`. Sem isso a marca ficaria alinhada ao viewport enquanto o cabeçalho de grupo da sidebar se move com o congelamento (ver §1), e os dois se desencontrariam a partir da primeira largura em que o grupo centraliza. O preenchimento horizontal do `.navbar` (herdado, intocado) é o que põe a marca na mesma vertical da sidebar — ver §4.1 —, e essa conta só fecha se os dois lados tiverem o mesmo inset esquerdo.

> **Correção medida.** A frase acima dizia *"na mesma vertical do **preenchimento** da sidebar"*, e isso não se sustenta em largura nenhuma sozinha: o alvo troca de lado no congelamento. Acima dele a marca casa com a **borda da caixa** da sidebar, e o **texto** do item cai um recuo à direita; abaixo dele é o inverso — o texto casa e a caixa não. O que este bloco entrega é o inset esquerdo comum entre navbar e **caixa** da sidebar acima do congelamento, e é dele que a linha da fileira do topo depende. Alinhar a vertical do **texto** é outro ticket: mexeria no recuo do item, não aqui.

**O espaçador é opção pública** — um item `{type: 'html', position: 'left'}` entre a marca e as tabs. Escolhido em vez de dar `flex-basis: 100%` à marca porque **não acopla a faixa à existência de uma marca**, e o estilo é replicável como template da casa.

**Três armadilhas medidas, todas de falha silenciosa:**

- `type: 'html'` **recusa `value` vazio** — o build reprova com `"navbar.items[N].value" is not allowed to be empty`. Um comentário HTML satisfaz o schema e não renderiza nada;
- a sobrescrita de token precisa casar **`:root[data-theme]`** — (0,2,0) contra (0,1,0). Escrever em `:root` não pega, e é a armadilha de especificidade do [ADR 1](../adr/0001-doutrina-de-css.md) reencontrada em campo;
- o escopo **`@media (min-width: 997px)` é obrigatório** — sem ele, `.navbar-sidebar__brand` e `.navbar-sidebar__items` leem o token novo e o cabeçalho do drawer infla no estreito.

`--sd-tabs-height` nasce **literal e não derivado de `--sd-space-12`**, ainda que os dois entreguem 48: altura de chrome não tem relação com escala de espaço, e derivar por coincidência de número é a derivação falsa que o bloco de foco de `tokens.md` já recusa por escrito.

### 3.2 O que a faixa custa — três perdas nomeadas

1. **A ordem de foco passa a divergir da leitura visual.** Medido: `marca@y0 → 3 tabs@y64 → Buscar@y16 → PT → GitHub → tema`. O `Tab` desce para a faixa e **volta a subir**, porque o DOM tem dois blocos — esquerda inteira, depois direita inteira — enquanto a faixa distribui a esquerda em duas linhas. **Não é contornável nesta rota**, e é **o único ponto do projeto onde a conta do `unsafe` voltaria à mesa**. Ver [`foco.md`](foco.md) §10.
2. **A largura útil das tabs é a do `.navbar__inner`, não a da viewport.** Isto não mudou de fato desde a #96 — mudou de causa: antes, era o fundo sangrando por trás de um conteúdo mais estreito; hoje não há mais fundo a sangrar, e o limite é o `max-width: var(--sd-congelamento)` do próprio `.navbar__inner`. As tabs alinham à coluna de conteúdo, não ao viewport, nas duas versões.
3. **São 48px de chrome vertical em toda página.**

### 3.3 O que foi conferido em navegador, com a faixa montada

| Ponto | Medido |
| --- | --- |
| Hairline de baixo | 1px, `--sd-border-subtle`, no rodapé do `.navbar` inteiro — abaixo das duas fileiras, sangrando de ponta a ponta da viewport |
| Hairline da fileira do topo | 1px, `--sd-border-subtle`, `::before` no `.navbar__inner`, altura `--sd-navbar-height` — começa no `left` da marca e termina no `right` do alternador de tema, Δ **0px** nas duas bordas, conferido a 1512, 1280 e 1100 |
| As duas linhas juntas | recuos diferentes de propósito: a de cima acompanha a caixa do conteúdo, a de baixo ignora e sangra. É o que a âncora desenha |
| Hairline da fileira abaixo de 997 | **não existe** — uma fileira só, e o `.navbar__inner` é `position: static` |
| Aba ativa | sublinhado de acento, `border-block-end` de 2px, sem somar altura ao chrome |
| A faixa | três tabs, numa linha só, altura 48, começando em y=64, sem fundo próprio |
| Sticky | rolando a 800px: `navTop=0`, `navBottom=112` — grudado, na altura nova |
| Dropdown de locale | abre por hover de verdade, atravessa a faixa, passa abaixo do `<nav>` sem recorte, os dois links clicáveis |
| Abaixo de 997 | token volta a uma linha, `<nav>` mede 64, **zero tabs visíveis** |
| Drawer a 390, aberto | cabeçalho em 64 e lista em `viewport − 64` — o escopo por media query segurou |
| Portão 7 | **passa com a faixa montada**, não depois de desmontá-la |

### 3.4 O que acontece quando a busca não existe

**Nada, e isso é medido.** O `Navbar/Search` do upstream tem `:empty { display: none }` no próprio módulo — enquanto o `SearchBar` do tema for o placeholder vazio, o contêiner some sozinho.

Um transplante corporativo que remova a busca não deixa buraco no navbar: o `SearchBar` lê o dado global, não o encontra, e devolve `null`. A superfície da busca é de [`busca.md`](busca.md).

**`localeDropdown` com rótulo curto**, e o argumento **enfraqueceu de propósito**: ele foi escrito para a *única faixa apertada do navbar*, e a faixa de tabs levou o aperto junto ao tirar as três tabs da linha 1. O rótulo curto fica, porque continua sendo uma linha de config e o nome por extenso continua sendo o item mais largo que a navbar carregaria — mas ele deixou de ser a diferença entre caber e não caber.

**GitHub entra como palavra, não como glifo.** Não há marca de terceiro no manifesto de ícones, e gastar o único slot livre num logotipo de plataforma seria decidir por acidente o que o orçamento deixou reservado sem nome.

---

## 4. Sidebar

Largura `--sd-sidebar-width`, e **nada aqui custa swizzle**.

**O número é medido, não default.** *Dissenso registrado:* ele aperta aninhamento profundo, porque o Docusaurus indenta por nível e ainda há um ícone à esquerda. O teto de profundidade — 3, com o nível 3 usado uma vez, em `Ferramentas › Bibliotecas › Biblioteca C` (ver [`informacao.md`](informacao.md) §3.1) — é o que o segura; aprofundar mais reabre este número.

### 4.1 Ícone por folha

`className` no arquivo de sidebar, mais `::before` com `mask-image` e `currentColor`. O `className` é **contrato público do schema de item de sidebar**, e é ele que produz a assinatura visual mais reconhecível do alvo — sem uma linha de swizzle.

Duas propriedades caem de graça e valem escrita:

- a máscara é pintada com `currentColor`, então **o estado ativo pinta o ícone junto com o texto**, sem uma regra a mais;
- **não existe segundo desenho para o modo escuro.** O axioma 4 é satisfeito sem custo.

O `::before` mora no **link**, não no `<li>`, para herdar a cor dele.

**A regra é *toda folha tem ícone, nenhum cabeçalho de grupo tem* — issue #97, o inverso do que valia até ela.** Até aqui o `className` do manifesto marcava a categoria de topo, e a folha ficava muda; a âncora faz o oposto (ver [`icones.md`](icones.md) §8). A folha nunca ganha o `<button class="menu__caret">` que a categoria tem — não tem filho para colapsar —, então ela nunca é envolvida pelo bloco colapsável que obrigava a categoria a cobrir duas formas de DOM (categoria real, e categoria sem filhos normalizada para link). Um seletor só basta numa folha.

O marcador continua sendo o **`className` do manifesto**, e não o número de nível: uma folha em `Biblioteca C` (nível 3) herda a família da categoria de topo que a contém (`--bibliotecas`), não uma família própria do nível 3 — o ícone é da **seção**, não do degrau.

O alinhamento não é coincidência: o preenchimento horizontal do item de menu foi escolhido para que, somado ao preenchimento que o `DocSidebar` põe na lista, o ícone caia **na mesma vertical do preenchimento do navbar**.

Os onze pares seção→ícone estão em [`icones.md`](icones.md), verbatim; a regra de obrigatoriedade está no §8 de lá.

### 4.2 Hierarquia, recuo e item ativo

A hierarquia sai de `theme-doc-sidebar-item-category-level-<n>` e `theme-doc-sidebar-item-link-level-<n>`, que são `ThemeClassNames`. O teto de profundidade é 3 (ver [`informacao.md`](informacao.md) §3.1), e existem **três degraus a desenhar** — o terceiro só aparece em `Ferramentas › Bibliotecas › Biblioteca C`.

**O recuo por nível mora inteiro no link, não na lista — issue #97.** Até aqui o Docusaurus somava dois mecanismos: a lista aninhada (`.menu__list` dentro de `.menu__list`) ganhava `padding-left` por nível, e o próprio link tinha o seu — a soma dos dois é que produzia o degrau visual. A âncora não divide assim, e copiar o resultado sem copiar a decisão produz recuo que parece certo no nível 2 e se desfaz no nível 3, ou em qualquer nível que a árvore ganhe depois. A #97 zera o `padding-left` da lista aninhada e escreve o recuo inteiro no link, por nível, com `--sd-space-4` (16px) por degrau — o mesmo total que a soma antiga já dava; a issue move o mecanismo, não a métrica.

**O item ativo é uma pílula preenchida, largura cheia, no acento a 12% — issue #97.** `--ifm-menu-color-background-active` já era esse preenchimento antes da issue; o que faltava era o raio (a base do Infima crava 0,25rem) e a folha ganhar ícone — sem ícone na folha, o item ativo pintava só o texto na cor de acento, nunca um glifo junto. Sem barra lateral, sem borda, sem sombra: a âncora não usa nenhuma das três no ativo, e este projeto nunca desenhou nenhuma aqui.

**O item ativo ganha falso-negrito por `text-shadow`, não por `font-weight`.** Trocar o peso reflui o texto e faz o item **pular de largura** no instante em que o leitor navega — a mesma técnica de sempre, e agora a única fonte de ênfase textual da sidebar: peso e entrelinha são uniformes entre cabeçalho de grupo e folha (400 · 24px, ver [`tokens.md`](tokens.md) §13), e o degrau que antes separava os dois visualmente saiu junto com o ícone de cabeçalho.

**O respiro entre grupos não mudou na #97, e é lacuna nomeada, não folga silenciosa.** A issue pede que ele bata com o da âncora, mas nenhum documento desta spec publica o número — nem esta tabela, nem `tokens.md` §13 — e inventar um aqui seria exatamente o que o axioma 5 proíbe: procedência de medição, não de decisão de quem implementa. O que fica em pé é o `margin-top: 0,25rem` que o Infima já cravava entre categorias antes desta issue, inalterado. Fechar este critério pede uma medição de primeira mão contra a âncora — o mesmo processo que produziu a tabela do §11 —, e fica pendente para quem fizer essa medição.

### 4.3 O divisor sai, a barra de rolagem se esconde, o topo desvanece — três queixas da issue-pai, três respostas puramente CSS

**O divisor vertical entre sidebar e conteúdo não era pedido de ninguém.** `DocRoot/Layout/Sidebar` (hasheada) declara `border-right: 1px solid var(--ifm-toc-border-color)` — vazamento do substrato nativo. Não se toca a classe hasheada: `ThemeClassNames.docs.docSidebarContainer` está no MESMO elemento, e uma borda declarada nela tem a mesma especificidade e carrega depois no cascade. `--ifm-toc-border-color` não se zera no adaptador, porque a mesma variável também pinta o contorno do botão de recolher a sidebar (`DocSidebar/Desktop/CollapseButton`) — apagar os dois juntos removeria peça que ninguém pediu que saísse.

**A barra de rolagem fica transparente em repouso e tingida no hover.** O elemento que rola não é `.theme-doc-sidebar-container` — é o `<nav class="menu thin-scrollbar">` dentro dele; `theme-doc-sidebar-menu` é o `<ul>` filho, estático. `scrollbar-color` (Firefox) e os pseudo-elementos `::-webkit-scrollbar-*` que `.thin-scrollbar` do Infima já declara (WebKit) citam os mesmos tokens, para não haver segunda paleta de barra de rolagem no projeto. `scrollbar-gutter: stable` reserva o espaço sempre, para a lista não pular de largura quando a barra aparece — o mesmo defeito de salto que o falso-negrito acima evita, mesma resposta.

**O desvanecimento de topo é `mask-image`, puro CSS.** A máscara é relativa à CAIXA que rola, não ao conteúdo dentro dela — funciona em qualquer posição de scroll, sem listener de JS.

### 4.3 O divisor sai, a barra de rolagem se esconde, o topo desvanece — três queixas da issue-pai, três respostas puramente CSS

**O divisor vertical entre sidebar e conteúdo não era pedido de ninguém.** `DocRoot/Layout/Sidebar` (hasheada) declara `border-right: 1px solid var(--ifm-toc-border-color)` — vazamento do substrato nativo. Não se toca a classe hasheada: `ThemeClassNames.docs.docSidebarContainer` está no MESMO elemento, e uma borda declarada nela tem a mesma especificidade e carrega depois no cascade. `--ifm-toc-border-color` não se zera no adaptador, porque a mesma variável também pinta o contorno do botão de recolher a sidebar (`DocSidebar/Desktop/CollapseButton`) — apagar os dois juntos removeria peça que ninguém pediu que saísse.

**A barra de rolagem fica transparente em repouso e tingida no hover.** O elemento que rola não é `.theme-doc-sidebar-container` — é o `<nav class="menu thin-scrollbar">` dentro dele; `theme-doc-sidebar-menu` é o `<ul>` filho, estático. `scrollbar-color` (Firefox) e os pseudo-elementos `::-webkit-scrollbar-*` que `.thin-scrollbar` do Infima já declara (WebKit) citam os mesmos tokens, para não haver segunda paleta de barra de rolagem no projeto. `scrollbar-gutter: stable` reserva o espaço sempre, para a lista não pular de largura quando a barra aparece — o mesmo defeito de salto que o falso-negrito acima evita, mesma resposta.

**O desvanecimento de topo é `mask-image`, puro CSS.** A máscara é relativa à CAIXA que rola, não ao conteúdo dentro dela — funciona em qualquer posição de scroll, sem listener de JS.

---

## 5. TOC

A largura é `--sd-toc-width`, **explícita** — não é mais fração de grid desde a #96. O que se escolhe é a **separação**, e ela continua sendo o único número da cadeia escolhido em vez de medido: ver §1.2.

O comportamento sticky vem do upstream. O **mecanismo** não se toca — `position: sticky` no slot, sem swizzle — mas o **offset** foi reescrito, e a distinção é o que a linha `TOC grudado em` do §11 cobra.

> **Correção de fato — S3-3.** Esta seção dizia que o sticky *"se realinhou sozinho ao topo grudado novo, porque lê `--ifm-navbar-height`"*. Ele realinhou-se ao topo grudado e **parou ali**: a folha do `theme-classic` declara `top: calc(var(--ifm-navbar-height) + 1rem)`, o que dava **128** medido — os 112 do topo grudado mais a respiração de 16 que o upstream escolheu. O alvo do §11 é **152**, que é onde a prosa ao lado abre. `npm run paridade` acusava `Δ −24` desde que a linha foi publicada.
>
> O offset agora é `--sd-topo-conteudo` — `--sd-topo-grudado` mais `--sd-space-10`, a mesma respiração que o `<main>` já dá ao `<article>` (§1.1). O índice deixa de subir acima do texto que ele indexa. O `max-height` veio junto por obrigação aritmética: o do upstream é `100vh − 144`, e com o topo em 152 a caixa ultrapassaria a viewport em 8px numa janela curta.
>
> **O número não foi escolhido: ele fecha por duas medições da âncora publicadas separadamente.** O §11 mede o navbar dela em `112px`; o §12 registra o ritmo vertical dela como *"40 do navbar ao cabeçalho"*. 112 + 40 = 152, e é o mesmo 152 que `referencia.md` §8 cobra do trilho. Três leituras independentes da mesma medição, e nenhuma delas foi editada para fechar.
>
> **Dissenso.** Grudar em 152 compra 40px de ar sob a barra ao rolar, contra os 16 do Docusaurus — mais ar do que qualquer doc costuma dar, e 24px a menos de lista visível. A resposta é que a tabela do §11 mede uma coisa só, o alinhamento com a âncora, e trocá-la por altura de rolagem interna seria escolher o que nenhuma medição sustenta. **Reabre quando** alguém remedir a âncora e achar outro número, ou quando o TOC passar a transbordar em janela de laptop — que é medida, não opinião: numa viewport de 900, o teto resolve em **708px** e a lista mais longa das rotas sondadas mede **160**.

> **Correção de fato — #96.** Esta seção dizia que a âncora usa um painel mais largo e que alcançá-lo custaria `unsafe`. Não custa: ver §1.2. A largura hoje bate exato com a âncora.

**Limiar próprio: esconde abaixo de 1280**, como a âncora — ver §1.6. `.col--3`, o slot inteiro, some por `display: none`; não só o conteúdo dele, senão a prosa não recuperaria o espaço (ver §1.5 e o comentário em `chrome.css`).

---

## 6. O subtítulo — a linha que toda página ganha

Toda página do site ganha uma linha abaixo do `h1`: **`--sd-type-lg`, num bloco de prosa próprio, a `--sd-subtitulo-recuo` do título**, saindo do `description` do front matter.

**A fonte é uma só.** O mesmo campo já alimenta o `<meta name="description">`, o `llms.txt` e o índice de busca. Um componente aqui obrigaria o autor a digitar a mesma frase duas vezes e criaria a possibilidade de o subtítulo e o `<meta>` divergirem.

### 6.1 A rota, e o degrau que ela custa

Um **override da chave `h1` no registro de `@theme/MDXComponents`, degrau 3**, lendo `useDoc().frontMatter.description` — API pública, já consumida pelo `ApiDocItem`.

A condição estava escrita em [`swizzle.md`](swizzle.md) §4, na nota da perda 10, e está conferida: **61 de 61 páginas escrevem o próprio `# Título`**, nenhuma escreve dois, e 61 de 61 já têm `description` — as 46 autorais mais as 15 traduções. **Quem confere hoje não é uma varredura de mão:** a cobrança 10 do portão 4 percorre `conteudo/` e a árvore de tradução e reprova a primeira página sem o campo.

A alternativa era injetar nó no corpo da página, que é a **perda 1** do ledger e exige `DocItem/Layout` ou `DocItem/Content` — os dois `unsafe`, os dois proibidos. A rota escolhida não encosta neles.

**Superfície nova no mesmo degrau:** é a primeira vez que o registro **redefine um elemento de HTML para acrescentar nó** em vez de trocar anatomia. Não é degrau novo — continua sendo objeto espalhado com chave a mais —, e o portão 7 continua passando porque **nenhum arquivo novo entra em `src/theme/`**: o componente mora dentro do próprio registro.

### 6.2 Obrigatório, e a ausência quebra o build

Na âncora o subtítulo é **condicional**. **Aqui ele é obrigatório**, e `description` ausente reprova o build — mesma doutrina de nome de ícone inexistente: falha alto, nunca degradação silenciosa.

Conferido, removendo o campo de uma página e rodando o build:

```
Error: Página sem `description` no front matter:
  @site/conteudo/procedimentos/ambiente/indice.md
```

A mensagem **nomeia o arquivo**, que é a metade da doutrina que uma exceção genérica não entrega.

### 6.3 A ordem no topo, e o termo que fica morto

**`h1` → subtítulo → `<Untranslated />` → corpo.** O `<Untranslated />` é escrito pelo autor logo abaixo do título, e o subtítulo é injetado pelo override — então ele nasce antes dele **sem ninguém mexer no MDX**.

O recuo é do subtítulo e não do título, e isso é mecânico: margens de irmãos adjacentes **colapsam para a maior das duas**, então o ar de baixo do `h1` venceria e o recuo medido nunca apareceria. Zerar o do `h1` é o que deixa o do subtítulo mandar. Conferido em navegador: recuo de 10, corpo de 18.

**Peso e cor não são declarados**, e isso é fiel: na âncora o subtítulo herda o bloco de prosa.

**O termo `lead` fica morto e não volta.** O nome é **subtítulo**. Um termo que já enganou uma vez não se recicla com significado novo.

---

## 7. Eyebrow e paginação

### 7.1 O breadcrumb vira a eyebrow por subtração

Escondendo o item de home, o item ativo e o separador que sobra, resta **exatamente o nome da categoria** — e ele já está no lugar onde a eyebrow da âncora fica, acima do título. Tudo classe do Infima, degrau 1, zero swizzle e **zero nó novo no DOM**.

O `BreadcrumbsStructuredData` continua emitido **intacto**: ele é um `<script type="application/ld+json">` irmão do `<nav>`, e nada aqui o alcança. O que sai é pixel, não dado.

O separador escondido é o do **último item visível**, e não todos: numa trilha de três níveis os separadores entre categorias sobrevivem. O teto de profundidade é 2 hoje, e a regra não quebra no dia em que ele subir.

**A metade real da perda 2 fica de pé**, e vale escrita porque subtração é fácil de confundir com alcance: **não dá para pôr eyebrow em página sem categoria, nem alterar a ordem, nem inserir texto novo.** O que a subtração alcança é o caso comum, não o mecanismo.

Consequência medida e aceita: **numa página que É a visão geral da categoria, a eyebrow sai vazia** — o breadcrumb dela é `home → categoria(ativa)`, e os dois itens são justamente os que a subtração esconde. A alternativa seria repetir o nome da categoria logo acima de um título que já é o dela.

### 7.2 A eyebrow ganha corpo, peso e cor — e o `h1`/`h2` que a acompanham foram medidos vencidos

**Dois defeitos medidos na #96, sem ticket que os cobrisse antes:** a eyebrow renderizava 12,8px em vez dos 14 que `chrome.css` já declarava, e `h1`/`h2` do `<article>` renderizavam 48px/32px em vez dos 36px/24px que `tokens.css` já declarava. Nos dois casos a escala do projeto **já estava certa** — o número não alcançava o elemento.

A causa é a mesma nos dois: o Infima declara a propriedade **direto no seletor do elemento** — `.breadcrumbs__link { font-size: calc(1rem * var(--ifm-breadcrumb-size-multiplier)) }`, `.markdown h1:first-child` e `.markdown > h2` redeclarando a custom property de tamanho —, e herança perde para declaração direta no mesmo elemento, **independente de quão específico for o seletor de onde o valor deveria vir**. A resposta é redeclarar a propriedade normal (`font-size`) no MESMO seletor que o Infima usa, carregado depois: especificidade igual, ordem de carga desempata, sem `!important`, sem tocar `--ifm-*` fora do adaptador.

**A eyebrow ganha, junto, corpo maior — 14px, que já era o alvo —, peso forte (`--sd-weight-heading`, 600) e cor de acento**, revertendo `--sd-text-muted`. É a leitura da âncora: sobrancelha em acento, acima de um título que segue neutro. Alvo em §12.

### 7.3 A paginação é plana

Sem borda, sem fundo, sem preenchimento e **sem nenhuma classe responsiva**: os dois cartões de paginação eram a última superfície levantada do corpo da página, e o cartão que os justificava morreu.

**Perda nomeada, e ela é mais funda do que parecia.** A decisão era *"rótulo anterior/próximo só em `aria-label`"* — mover a palavra do texto para o atributo. **Não é alcançável:** `PaginatorNavLink`, `DocPaginator` e `DocItem/Paginator` são os três `Unsafe` nas duas ações no artefato congelado do portão 7, e não há opção pública, classe nem variável que acrescente atributo a um nó. O rótulo não muda de lugar; ele **sai**.

O que sobra, medido em vez de suposto: o nome acessível do link é o **título da página vizinha**, que é descritivo por si; a direção continua no `«` e no `»` que o Infima desenha por pseudo-elemento e que o navegador expõe na árvore de acessibilidade; e a região tem o `aria-label` do `DocPaginator`. O critério de propósito de link continua satisfeito — o que se perde é a palavra redundante, não a orientação.

---

## 8. Footer

**Uma linha.** Links à esquerda, copyright à direita, fio de ponta a ponta, sem preenchimento próprio, sem ícone, sem coluna, sem elevação — e **sem uma única linha no ledger de swizzle**. As oito peças de `Footer` são `safe` nas duas ações e nenhuma é exercida.

É o resultado que mais contraria a intuição do mapa inteiro: o footer parecia o candidato óbvio a swizzle do chrome, e é a única superfície que não custa nada.

### 8.1 Os links, e a regra que os escolheu

> **Entra no footer só o que não está em nenhum outro lugar do site.**

É a regra que impede o rodapé de virar segunda cópia da navegação — o *chrome inerte* que a arquitetura de tokens nomeou.

| Rótulo | Por que existe |
| --- | --- |
| `Changelog` | é o **único** canal de comunicação de versão dos artefatos, e está enterrado no nível 3 de `Ferramentas` |
| `llms.txt` | é o único artefato do site sem nenhuma entrada de navegação, logo indescobrível sem este link |

**Eram quatro, e são dois.** `Status` e `Suporte` saíram com o produto anterior: o primeiro apontava para um host de status, o segundo para uma caixa de e-mail, e o acervo não tem nem um nem outro — **a empresa nunca é nomeada**, então não há domínio a citar, e **o desenvolvedor não tem nome**, então não há para quem escrever. Ver [`informacao.md`](informacao.md) §1.1.

A regra fica **mais** satisfeita do que antes, e não menos: os dois que sobraram são exatamente os dois que nenhuma outra superfície do site alcança.

**O `llms.txt` entra por `pathname://`**, e é degrau 2 — escotilha pública do Docusaurus para apontar a um arquivo que **não é rota**. Sem ela, o `<Link>` tentaria `history.push()` numa rota que não existe e o verificador de links reprovaria o build.

**Nenhum abre em nova aba, e isso precisa ser declarado.** Correção de premissa medida: o `<Link>` do Docusaurus injeta `target="_blank"` **sozinho** em todo `href` externo.

Isso é pré-requisito do parágrafo seguinte, não detalhe: o ícone de link externo é escondido, e escondê-lo só é honesto se o anúncio dele for falso.

**O ícone de link externo sai, e o motivo não é estética.** `Icon/ExternalLink` não está no `getSwizzleConfig` — cai no default `unsafe` — e vem de um sprite injetado. A regra da política responde sem enumerar: **o que só é alcançável por `unsafe` não é trocado**.

**Sem logotipo e sem wordmark estilizado no copyright.** O schema de logo exige um arquivo de imagem, e a marca deste sistema é **só a palavra** — ver [`icones.md`](icones.md) §3. Consequência limpa: o footer consome **zero** dos 60 ícones, e o navbar também.

### 8.2 As três divergências obrigatórias contra o Infima

| Ponto | O Infima entrega | Por que não serve |
| --- | --- | --- |
| Preenchimento | um degrau da escala de ênfase | seria um **terceiro** nível de superfície |
| Peso do título de coluna | 700 | esse peso **não existe** na escala de três pesos do sistema |
| Entrelinha de link | 2 | contra a entrelinha de UI |

O terceiro caso tem uma nota: a porta fica **fechada na spec**, porque `links` é lista plana e o schema do tema recusa misturar plana com coluna.

**Sem sombra, e é decisão.** A escada de elevação é para superfície que sobe. O footer não sobe — ele **é** a página. A separação é o fio.

### 8.3 O alinhamento à coluna de doc

O `<Footer/>` é **irmão do `main-wrapper`**, não filho da página de doc — isto não mudou na #96. O que mudou é o quadro de referência dos dois lados.

> **Correção de fato — #96.** Esta seção dizia que a correção "soma o gutter" numa declaração de `padding-left` no `<footer>`, compensando o `.container` dele centrar na viewport enquanto o da doc centrava em `100% − sidebar`. A regra existia porque a doc, antes da #96, tinha exatamente ESSE desalinho — sidebar sem centralização própria, toda a folga indo para a direita (a queixa central da issue-pai). A #96 remove a causa em vez de compensar o sintoma: agora o `.container` do rodapé usa o MESMO `max-width: var(--sd-congelamento)` e o MESMO `margin-inline: auto` do grupo que centraliza sidebar + conteúdo + TOC (§1). O que falta depois disso não é mais compensação de um desalinho: é só o que a doc tem antes do texto e o rodapé não.

> **Correção de fato — S3-8: *"coincidem sempre"* era a afirmação, e ela não fechava em largura nenhuma exceto uma.** Este parágrafo dizia que os dois insets *"coincidem sempre, não só na largura em que alguém mediu"*, e que o termo que faltava era `sidebar + gutter`. Medido em sete larguras, comparando a borda esquerda do primeiro link do rodapé com a do `<article>`:
>
> | largura | prosa | rodapé | Δ |
> | ---: | ---: | ---: | ---: |
> | 997 | 288 | 352 | +64 |
> | 1300 | 288 | 352 | +64 |
> | 1360 | 312 | 352 | +40 |
> | 1408 | 336 | 352 | +16 |
> | 1440 | 352 | 352 | **0** |
> | 1512 | 388 | 372 | −16 |
> | 1920 | 592 | 576 | −16 |
>
> O único zero é **1440**, e ele é coincidência aritmética entre duas causas de sinal contrário — não é a fórmula fechando.
>
> **Qual borda é o alvo: a prosa.** A coluna de doc é caixa invisível por construção (§2) — alinhar com ela seria alinhar com uma borda que a tela não tem. O que o leitor compara é o texto que acabou de ler com o texto do rodapé.
>
> **As duas causas, e as duas foram consertadas.** *(1)* O termo estava errado: o que separa a sidebar da **prosa** não é o gutter (32), é a metade da folga da caixa invisível — `(--sd-doc-width − --sd-prose-width) / 2` = 48 —, porque o `<article>` é centralizado dentro da coluna. O número do rodapé era o de antes da #96 ter criado essa folga. *(2)* O `<footer>` paga `padding-inline: var(--sd-gutter)` que o grupo de doc não paga: abaixo de 1472 isso empurra o container 32 para dentro enquanto a sidebar cola em 0. Acima do congelamento o `margin-inline: auto` ultrapassa os 32 e o defeito some sozinho — que é exatamente por que ele nunca apareceu na largura de referência de 1512. O eixo esquerdo passou para o `.container`; o direito fica no `<footer>`, porque é ele que impede o copyright de encostar na borda, e o fio de ponta a ponta continua fora de qualquer preenchimento.
>
> **Medido depois: Δ = 0 em 1408, 1440, 1512 e 1920.** Entre 997 e o congelamento ele cai de +64 para **+48** a 997 e **+24** a 1360. E **abaixo de 997 ele já era zero e continua**: no estreito não há sidebar nem coluna, e rodapé e artigo partem da mesma borda — medido a 390, 768 e 996, os dois abrem em `16`.
>
> **O que não fecha, e fica escrito em vez de prometido.** Entre 997 e o congelamento a coluna encolhe, a folga de centralização da prosa vai de 48 a 0, e **nenhum preenchimento constante acompanha um alvo que varia**. A faixa que não fecha é a de **uma media query só**. Reproduzi-lo num `calc()` acoplaria o rodapé ao container, ao TOC e ao limiar do TOC — três acoplamentos para comprar alinhamento num regime em que a página já não está na proporção que o §1 publica.
>
> **Dissenso.** A frase antiga era mais forte e mais curta, e a alternativa honesta seria alinhar com a **coluna de doc** em vez da prosa: aí um preenchimento constante fecha em toda largura, sem regime nenhum. A resposta é que isso alinharia com uma borda invisível e deixaria o desalinho visível de 48px de pé — trocar a promessa correta pela promessa cumprível. **Reabre quando** a caixa invisível deixar de centralizar o artigo, ou quando o congelamento mudar: os dois movem o 48.

**O fio continua de ponta a ponta** — mora no `<footer>`, fora do preenchimento, como antes.

A classe de página de doc vem do `DocRoot`, então isto vale para as **três** instâncias — e hoje elas são o site inteiro. A única rota que não é doc é a **raiz**, e ela não é página: é um salto para o índice da primeira jornada, montado com `noFooter`. O rodapé nem chega a existir ali, então não há segundo alinhamento a descrever.

**Perda nomeada, e sobrevive à #96 sem mudar:** com a sidebar recolhida pelo leitor (o botão de esconder, não a gaveta do estreito), `Main` troca para `docMainContainerEnhanced` e ocupa a largura toda — mas o padding do footer continua supondo a sidebar visível. O estado mora em classe de CSS Module hasheada; alcançá-la por `html:has(…)` é o mesmo custo que já se recusou ao desistir da proporção 56/44 em §1.2.

---

## 9. Tela estreita

Abaixo de 997px — o mesmo limiar em que a sidebar vira gaveta, em que o gutter volta ao passo curto e em que a faixa de tabs some.

**Três dos quatro comportamentos se resolvem por construção, e a única peça que custa declaração é a que sai:**

- **o cartão não está mais lá para encolher.** A história inteira dele no estreito era uma declaração de meio preenchimento, e ela morre junto com a superfície que a consumia;
- **o breakout já resolveu para zero**, e agora nos dois lados do limiar — não há lista de escape em lugar nenhum;
- **o gutter NÃO se preservava sozinho, e esta é a correção que a implementação achou.** A regra (b) do §1.4 zera o preenchimento do `.col` para a cadeia fechar no largo. Abaixo do limiar não há 75%, não há coluna de 816 (era 864 antes da #96) e não há cadeia a fechar — mas a regra continuava valendo, e o texto encostava na borda da viewport sem uma segunda declaração. Até a #96 quem dava zero ali era a conta do `<main>` (`gutter − 16`, que no estreito é `16 − 16`); a #96 tirou o preenchimento horizontal do `<main>` de vez — ver §1 —, e o resultado no estreito é o mesmo zero, só que agora por ausência de declaração, não por conta que zera. Medido a 390: eyebrow, título e cada parágrafo em `x=0`, encostados na borda da viewport. **O `.col` recupera o preenchimento no estreito**, e ele recupera pelo token — nunca pelo valor que o Infima por acaso também usa. A faixa de tabs, essa sim, some sozinha do outro lado do mesmo limiar;
- **o TOC móvel sai.** É o único lugar onde o critério *"mais perto da âncora"* **remove** uma peça de navegação, e por isso ele é uma **declaração** e não uma omissão: se um dia doer, é uma linha que se apaga. O leitor troca o índice colapsado pela rolagem, e o que ele ganha é a página começando no conteúdo.

**A linha do footer quebra e não empilha**, revertendo deliberadamente o Infima. Ele transforma cada link em bloco, o que faz *uma linha* virar cinco — e "uma linha" é a decisão inteira do rodapé.

Duas notas de implementação que a decisão original não previa:

- o Infima **zera** o preenchimento horizontal do footer no estreito, e a declaração dele mora no próprio `.footer` — mais perto do elemento que o `:root` do adaptador, logo ela vence. A restauração declara a **propriedade**, não a variável: reescrever a variável do Infima fora do adaptador abriria uma sexta exceção com escopo contra a lista fechada do [ADR 1](../adr/0001-doutrina-de-css.md);
- o link do rodapé vira `inline-flex` em vez de `inline`, porque **elemento `inline` ignora altura mínima em silêncio** e o piso de alvo de toque do [ADR 4](../adr/0004-contrato-de-estado-de-entrada.md) não alcançaria justamente a superfície mais estreita do site.

---

## 10. As perdas nomeadas — seis, mas não as mesmas seis

Consequência direta do orçamento `unsafe` zero — quatro delas — mais uma consequência de estado de React sem opção pública, que a #96 nomeou pela primeira vez. Cada linha é perda escrita, não silêncio.

| # | Perda | Por quê |
| ---: | --- | --- |
| 1 | **Qualquer nó injetado dentro do corpo da página** — bloco de feedback no rodapé, CTA lateral | `DocItem/Layout` e `DocItem/Content` são `unsafe`, e **não é contornável por CSS**. *O subtítulo saiu desta lista:* ele é injetado pelo registro de `MDXComponents`, ancorado no `h1`, sem tocar nos dois |
| 2 | **Breadcrumb reestruturado** — eyebrow em página sem categoria, ordem trocada, texto novo | `DocBreadcrumbs` é `unsafe`. *A metade visível foi comprada por subtração* (§7.1); o que fica é o mecanismo |
| 3 | **TOC com anatomia nova** — barra de progresso, seções extras | `TOC` e `TOCItems` são `unsafe`. Estilo e profundidade seguem alcançáveis |
| 4 | **Ícone preso dentro de componente `unsafe`** mantém o desenho do Docusaurus | a regra responde sem enumerar; ver [`icones.md`](icones.md) |
| 5 | **Footer dentro da coluna de prosa**, como a âncora faz | `<Footer/>` é irmão do `main-wrapper`. Irmã da perda 2: divergência por restrição |
| 6 | **A sidebar embutida some no limiar da âncora (1024), independente do TOC** | a gaveta só monta quando `windowSize` do React está em `'mobile'`, e esse estado lê 996 HARDCODED em `@docusaurus/theme-common` — não é ponto de swizzle, é lógica de contexto sem opção pública. Ver §1.6 |

**Eram sete, e a que saiu não foi comprada — foi FECHADA.** A antiga perda 3, *"a proporção da âncora entre conteúdo e painel"*, morreu com o grid de doze que a produzia: a #96 mede a coluna do TOC em 304, o valor da âncora, sem `unsafe` em lugar nenhum. Ver §1.2.

**Uma perda nova entrou no lugar, e ela é de outra família.** As cinco que ficam são todas orçamento `unsafe`; a sexta — sidebar sem limiar próprio — não é. Nada em `getSwizzleConfig` a resolveria, porque não há componente para ejetar: é estado de contexto React (`windowSize`) sem prop pública para o limiar, hardcoded ao lado do CSS compilado do Infima. Nomeada aqui porque a alternativa era pagá-la muda — implementar um limiar de sidebar que parece funcionar até o leitor abrir a janela numa largura entre 997 e 1023 e não achar navegação nenhuma.

**Duas perdas antigas continuam encolhidas sem sair.** A perda 1 perdeu o subtítulo — a rota de ancorar no `h1` estava registrada e foi exercida. A perda 2 perdeu a eyebrow visível, e ficou com o mecanismo: a subtração alcança o caso comum e nada além dele.

---

## 11. Alvo medido — o chrome da âncora, em números

A âncora deste projeto é o `docs.devin.ai`, e a spec declara **zero delta deliberado** contra ela. Até aqui a distância era prosa — *"a coluna do TOC dá 288 contra os 304 da âncora"* — e prosa não reprova nada, o que é exatamente por que *"ficou aquém"* só apareceu semanas depois, no olho do dono.

Esta tabela é o alvo. `npm run paridade` mede o site **construído** contra ela e imprime a lista do que não fecha.

Os números **não nascem aqui**: são medição de primeira mão da âncora, registrada em `research/paridade-devin` §4. Editá-los é afirmar que a âncora mudou — não que nós mudamos. A largura de referência é **1512**, que é onde a âncora foi medida por inteiro.

A tolerância é parte do alvo, e não um detalhe do script: `exato` é para o que só tem dois estados — uma borda existe ou não existe, um raio é o que a folha diz. `±1` é para o que atravessa arredondamento de subpixel e zoom de layout.

| Sonda | Alvo | Tolerância |
| --- | --- | --- |
| Sidebar `left` | `52px` | ±1 |
| Sidebar largura | `288px` | ±1 |
| Sidebar `border-right` | `0px` | exato |
| Coluna de texto | `720,81px` | ±1 |
| Caixa do TOC | `304px` | ±1 |
| TOC `border-left` | `0px` | exato |
| Navbar altura | `112px` | ±1 |
| Margem direita | `52px` | ±1 |
| A 1920, margem esquerda | `256px` | ±1 |
| A 1920, margem direita | `256px` | ±1 |
| TOC visível a 1100 | `não` | exato |
| Item de sidebar altura | `36px` | ±1 |
| Item de sidebar raio | `12px` | exato |
| Item de sidebar recuo | `16px` | exato |
| TOC grudado em | `152px` | ±1 |

**Uma linha saiu desta tabela, e não por ter fechado — S3-7.** Ela era `Sidebar visível a 1010 = não`, tolerância `exato`, e a paridade media `sim` desde o dia em que foi publicada. O §10 classifica **a mesma coisa** como perda 6: a gaveta do estreito só monta quando o `windowSize` do React está em `'mobile'`, e esse estado lê **996 hardcoded** em `@docusaurus/theme-common` — não é ponto de swizzle, é lógica de contexto sem opção pública. Ver §1.6 e o comentário longo em `chrome.css` §4.

Um alvo que a plataforma proíbe alcançar não é alvo; é perda, e ela já estava nomeada no §10, no mesmo documento. Publicá-la nos dois lugares fazia a tabela carregar uma linha que **nunca** fecharia — e uma linha que nunca fecha treina quem lê o relatório a ignorá-lo, que é o oposto do que este instrumento existe para fazer. A sonda `chrome.1010.sidebar` e o cenário `prosa@1010/escuro` saíram junto: sonda sem alvo publicado vira `sem-alvo` no relatório, que é ruído com outro nome.

**Dissenso.** Tirar a linha esconde a distância até a âncora, que é justamente o que o §11 existe para publicar — e o §10 é prosa, que *"não reprova nada"* pela abertura desta seção. A resposta é que a distância continua escrita, com o mecanismo medido junto, e que o §10 não é prosa solta: ele é lista numerada, citada por [`swizzle.md`](swizzle.md) §4 e pelo [ADR 2](../adr/0002-politica-de-swizzle.md). **Reabre quando** o Docusaurus expuser o limiar de `windowSize` como opção pública, ou quando o orçamento de `unsafe` deixar de ser zero — nos dois casos a linha volta para cá, com o número que a âncora medir.

**Uma linha fechou com esta issue, e o conserto foi de CSS — S3-3.** `TOC grudado em` media 128 contra o alvo de 152: o offset do `theme-classic` é `calc(var(--ifm-navbar-height) + 1rem)`, e a respiração de 16 dele não é a nossa. O §5 tem o mecanismo, a derivação do número e o dissenso.

Três linhas merecem leitura, porque não são medida direta:

**As duas margens a 1920** não foram medidas na âncora nessa largura — elas são **derivadas** da regra do wrapper que foi medida: `max-width: 1472px`, `margin-inline: auto`, `padding-inline: 32px`. A 1920 sobram `(1920 − 1472) ÷ 2 = 224` de cada lado, mais os 32 de padding. Que as duas sejam **iguais** é o alvo de verdade; o valor absoluto é consequência. É a correção principal da issue-pai: hoje a sidebar cola em `x = 0` e toda a folga vai para a direita.

**O limiar é sondado fora do número redondo.** A âncora esconde o TOC abaixo de 1280 e a sidebar abaixo de 1024; nós escondemos os dois abaixo de 997. Medir *em* 1280 pegaria os dois lados de acordo e não diria nada — **1100** cai dentro da faixa onde âncora e produto discordam, e é lá que a sonda tem trabalho. *A sonda irmã, a 1010 para a sidebar, saiu com a linha dela — ver acima.*

**O acento não tem linha aqui, nem em [`tokens.md`](tokens.md).** A cor de marca é divergência declarada: violeta, e não o azul da âncora. Publicar o azul como alvo mandaria copiar exatamente o que a decisão registrada recusa.

**A caixa do TOC é a coluna, não a lista.** A âncora publica 304 para a caixa e 264 para a lista visível, e a nossa lista **já dá os 264 dela** — o §1.2 diz isso em prosa há tempo. A sonda desta tabela mede a **coluna**, que é onde a dívida de 16px mora; medir a lista contra o alvo da caixa acusaria 40px de dívida onde há 16, e a linha contradiria o próprio §1.2.

---

## 12. Alvo medido — o cabeçalho do artigo

A âncora abre a página com três faixas e **sem banda cinza**: sobrancelha, título e subtítulo, planos sobre o fundo. Os valores são de `research/paridade-devin` §6, a 1512.

| Sonda | Alvo | Tolerância |
| --- | --- | --- |
| Sobrancelha tamanho | `14px` | exato |
| Sobrancelha peso | `600` | exato |
| Subtítulo tamanho | `18px` | exato |
| Subtítulo entrelinha | `28px` | exato |

**O título não tem linha aqui.** Ele é o `h1`, e o `h1` já tem alvo na escala de tipo de [`tokens.md`](tokens.md) §13. Publicá-lo nos dois lugares criaria duas verdades sobre o mesmo número — que é o defeito que este instrumento inteiro existe para não repetir.

**A sonda da sobrancelha mede o link, não o `<nav>`.** O invólucro herda 14px do chrome e passaria no alvo enquanto o texto que o leitor vê renderiza 12,8. Sonda em elemento errado é a pior falha possível num instrumento de medição: ela não erra o número, ela erra de cara verde.

O ritmo vertical da âncora — 40 do navbar ao cabeçalho, 2 até a sobrancelha, 10 até o `h1`, 8 até o subtítulo, 32 até o conteúdo — **não tem linha**: são cinco distâncias entre irmãos, e a sonda deste instrumento lê um elemento de cada vez. Fica para a avaliação visual, declarado aqui para não passar por esquecimento.

---

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| **O alvo medido do §11** | **medido em referência** | as três medições de primeira mão da âncora, em `research/paridade-devin` §4 — [#93](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/93) |
| **As margens a 1920 do §11** | **origem própria (consequência)** | a regra do wrapper medida a 1512 (`max-width 1472`, `margin-inline auto`, `padding-inline 32`), estendida à largura maior |
| **O limiar sondado a 1100** | **origem própria (implementação)** | o número redondo põe âncora e produto de acordo e não mede nada; a sonda tem que cair dentro da faixa onde discordam. *Eram dois: a sonda a 1010 saiu com a linha da sidebar — §11, S3-7* |
| Container, coluna, TOC, prosa | herdado + origem própria (consequência) | [#50](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/50), [#56](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/56) |
| **O congelamento em 1408** | **origem própria (correção)** | 1472 até a #96 — o *"shell total"* ignorava o preenchimento do `<main>`, medido em navegador. A #96 encolheu para 1408 (com `--sd-container-width` indo a 1120) para as margens simétricas de §11 fecharem exatas, confirmado em navegador a 1512 e 1920 |
| **A separação do TOC em `--sd-space-6`** | **origem própria** | escolhida para a lista cair em 264, que é o número medido |
| **A aba do navbar e a lista do TOC na escala de UI** | **origem própria (correção)** | **S9-8** — as duas divergiam do alvo de `14px` de [`tokens.md`](tokens.md) §13 por mecanismos opostos do Infima: a aba **não tinha declaração** e herdava os 16 do `<html>` (`Δ +2`); a lista do TOC tinha declaração cravada no filho, `.table-of-contents { font-size: 0.8rem }`, que vencia o `--sd-type-sm` do slot em volta (`Δ −1,2`, com o slot medindo 14 certinho — falso verde). Ausência de declaração no upstream não aparece em `grep`; foi `npm run paridade` que apontou |
| **O offset de sticky do TOC em `--sd-topo-conteudo`** | **origem própria (correção)** | **S3-3** — o `theme-classic` declara `top: calc(var(--ifm-navbar-height) + 1rem)`, que dá 128; o §11 cobra 152 e `npm run paridade` acusava `Δ −24`. O número não foi movido: `112 + 40` são o navbar do §11 e o ritmo vertical do §12, medidos na âncora em separado. O `max-height` veio junto por aritmética — o do upstream é `100vh − 144` e transbordaria 8px. Ver §5 |
| **A linha `Sidebar visível a 1010` sai do §11** | **lacuna por restrição** | **S3-7** — alvo `exato` que a paridade media `sim` e que o §10 já classificava como perda 6; o `windowSize` do React lê 996 hardcoded e não há rota sem `unsafe`. Ver §11 |
| **A coluna do TOC bate com a âncora, em 304** | **origem própria (correção)** | era 25% de um grid de doze; o grid morreu, e a largura virou explícita — ver §1.2 |
| Largura da sidebar, prosa, navbar, faixa | herdado | medido |
| **`--sd-tabs-height` literal, não derivado** | **origem própria** | altura de chrome não deriva de escala de espaço; a coincidência de número seria derivação falsa |
| **A linha da fileira do topo, recuada** | **herdado** | a âncora desenha **duas** linhas na navbar, com recuos diferentes; a de cima para no `left` da marca e no `right` do último ícone, Δ 0 nas duas bordas. Medida de primeira mão em navegador, por caixa **e** por varredura de pixel do screenshot, nos dois temas e com e sem rolagem. O shinydoc tinha só a de baixo |
| **O dono da linha ser o `.navbar__inner`, e não a fileira** | **origem própria (implementação)** | a fileira 1 não é um elemento — são dois, com o vão do meio entre eles, e uma borda em cada daria dois segmentos. O `.navbar__inner` já é a caixa marca→último ícone por medição (Δ 0 a 1512, 1280 e 1100), então o pseudo-elemento absoluto herda a identidade sem número novo |
| **O escopo de 997 da linha da fileira** | **origem própria (consequência)** | cai de duas regras que a spec já carregava: abaixo do limiar a navbar tem uma fileira só (§3.1), e o `.navbar__inner` volta a `position: static`, o que subiria o containing block até o `<nav>` |
| **A vertical da marca casa com a caixa da sidebar, não com o texto do item** | **origem própria (correção)** | o §3.1 afirmava *"a mesma vertical do preenchimento da sidebar"*, e a medição desmente em toda largura: acima do congelamento casa a **caixa** e o texto cai um recuo à direita; abaixo, o inverso. A afirmação quebrou quando o congelamento entrou, e só apareceu porque a linha da fileira dependia dela |
| As **duas** variáveis de container | origem própria | armadilha fechada antes de virar sintoma |
| Gutter, e o ponto onde ele troca | herdado + origem própria | — |
| **O cartão morre** | herdado | [#50](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/50) — zero elevação em conteúdo, em seis páginas medidas |
| **A caixa invisível em dois seletores** | **origem própria (implementação)** | [#54](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/54) — uma lista de onze crescia a cada componente novo |
| **O escopo por `.col` na caixa invisível** | **origem própria (implementação)** | sem ele a paginação da referência gerada sai do prumo com a prosa dela |
| **O breakout morre** | herdado | a âncora tem uma largura só |
| Medida de prosa oscila com o TOC | **origem própria (correção)** | era classificada delta deliberado; a âncora oscila pelo mesmo motivo — ver §1.5 |
| As três configurações de coluna | **origem própria (correção)** | medido em `DocItem/Layout@3.10.2`: a classe de 75% não depende de heading |
| **Ritmo vertical assimétrico 48/16** | herdado | o Infima escala o ar de cima com o corpo do título, e isso é o gesto errado |
| Limiar 996/997 (sidebar, gutter, faixa) | **delta deliberado** | `windowSize` do React trava a gaveta em 996, hardcoded fora do alcance de CSS — ver §1.6 |
| Limiar 1280 (TOC) | **origem própria** | puro CSS, sem estado de React no caminho; bate com a âncora — ver §1.6 |
| **A faixa de tabs, e o zero `unsafe` intacto** | **origem própria (medição)** | [#51](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/51) — medido num 3.10.2 real, com o portão 7 verde e a faixa montada |
| **O espaçador como item `html`** | **origem própria** | não acopla a faixa à existência de uma marca |
| **A divergência entre ordem de foco e leitura visual** | **lacuna por restrição** | consequência de o DOM ter dois blocos e a faixa distribuir um deles em duas linhas |
| Três tabs no navbar, uma por instância | herdado | — |
| Rótulo curto de locale | herdado | medido contra o default; **o argumento do aperto enfraqueceu com a faixa** |
| GitHub como palavra | **origem própria** | consequência do teto de ícones |
| O slot de busca vazio custa zero | **origem própria (verificação)** | `Navbar/Search` tem `:empty { display: none }` no próprio módulo |
| Ícone de sidebar por `className` mais máscara | herdado | única rota zero-swizzle |
| O rótulo de seção é marcado por `className`, não por nível | **origem própria (medição)** | categoria sem filhos é normalizada para link; com seletor de nível a falha seria muda |
| Falso-negrito por `text-shadow` | herdado | medido nas referências |
| **O subtítulo existe, sai do `description`, mede 18 e fica a 10 do `h1`** | herdado | [#60](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/60) §2 |
| **Chrome e não componente** | **origem própria (implementação)** | o campo já existe; componente duplicaria a fonte |
| **Rota por override de `h1`, degrau 3** | **origem própria (verificação)** | a rota estava registrada em `swizzle.md` §4; 61/61 confere a condição, e o portão 4 passou a cobrá-la |
| **Obrigatório, ausência quebra o build** | **origem própria** | a âncora o faz condicional; a doutrina da casa é falhar alto |
| **A eyebrow por subtração** | **origem própria (implementação)** | três `display: none` sobre classes do Infima; o JSON-LD é irmão e não é alcançado |
| **A eyebrow vazia na visão geral de categoria** | **origem própria (consequência)** | o breadcrumb dela é `home → categoria(ativa)`, e os dois são o que a subtração esconde |
| **Paginação plana** | herdado | [#50](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/50) — nenhum componente de conteúdo tem elevação na âncora |
| **O TOC móvel sai** | **delta deliberado** | o único lugar onde *"mais perto da âncora"* remove navegação; declaração, não omissão |
| Footer em uma linha, fio superior, muito ar | herdado | a única medição que existe do rodapé da âncora |
| A linha quebra e não empilha no estreito | **delta deliberado** | contra o comportamento entregue pelo Infima |
| Conteúdo do footer alinhado à **prosa**, não à coluna de doc | **origem própria (correção)** | **S3-8** — era *"alinhado à coluna de doc"*, com o carimbo *"não medido; deriva da medida constante"*. Medido em sete larguras: o desalinho era **+64** a 997, **+16** a 1408 e **−16** a 1512, cruzando o zero em 1440 por coincidência. Duas causas — o termo era o gutter (32) onde a folga da caixa invisível é 48, e o `<footer>` pagava um preenchimento lateral que o grupo de doc não paga. Depois: **Δ = 0 do congelamento para cima**. A exceção *"na landing, não"* caiu com [#94](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/94): a raiz monta com `noFooter` e o alinhamento passou a valer no site inteiro. Ver §8.3 |
| **O alinhamento não fecha entre 997 e o congelamento** | **origem própria (consequência)** | **S3-8** — a folga de centralização da prosa varia de 0 a 48 conforme a coluna cresce, e preenchimento constante não segue alvo variável. Medido: **0** abaixo de 997 (sem sidebar, mesma borda), **+48** a 997, **+24** a 1360, **0** de 1408 para cima |
| Os links do footer, e a regra que os escolheu | **origem própria** | regra é *só o que não está em outro lugar* |
| `target` declarado nos links externos | **origem própria (correção)** | o `<Link>` injeta `target="_blank"` sozinho |
| Ícone de link externo escondido | origem própria | consequência de `Icon/ExternalLink` ser `unsafe` e vir de sprite |
| Link do rodapé em `inline-flex` no estreito | **origem própria (implementação)** | `inline` ignora altura mínima |
| Footer dentro da coluna de prosa | **lacuna por restrição** | é o que a âncora faz e o Docusaurus não permite sem `unsafe` |
