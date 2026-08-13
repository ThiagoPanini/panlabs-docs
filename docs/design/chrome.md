# Chrome

O shell da página de documentação: proporções, navbar com faixa de tabs, sidebar, TOC, eyebrow, subtítulo, paginação e footer.

**Nenhum valor numérico nasce neste documento.** Todos os comprimentos moram em [`tokens.md`](tokens.md) e são citados aqui **por nome de token**. Os outros números que aparecem são identificadores — número de ADR, de issue e de portão — ou o limiar de media query, que é o único comprimento que a linguagem não sabe ler de custom property.

> **O §1 cita valor, e é o único que cita.** A cadeia de proporções aparece uma vez com o número ao lado do nome do token, porque ela é a única coisa deste documento que **ou fecha na tela, ou não fecha** — e uma cadeia sem número não é conferível. Ali os números são **evidência de medição**, não fonte: quem os edita edita `tokens.md`, e este documento passa a estar errado.

Chrome não se autora: se **entorta**. Tudo neste documento é degrau 0 (variável do Infima), degrau 1 (classe estável) ou degrau 2 (opção pública) da escada do [ADR 2](../adr/0002-politica-de-swizzle.md), **com duas exceções de degrau 3** — a marca, que está em [`icones.md`](icones.md), e o subtítulo do §6. As duas estão no ledger de [`swizzle.md`](swizzle.md). O orçamento `unsafe` continua em zero.

Tudo aqui é obrigatório. Não há bloco `Livre` — o chrome inteiro é geometria herdada ou consequência de restrição, e não sobra latitude para nomear dono.

> **Leia antes:** [ADR 1 — Doutrina de CSS](../adr/0001-doutrina-de-css.md) e [ADR 2 — Política de swizzle](../adr/0002-politica-de-swizzle.md).

---

## 1. A cadeia de proporções, elo por elo

Uma cadeia, e cada elo deriva do anterior. **Ou os números fecham na tela, ou não fecham** — não há meio-termo, e todo o resto do site assume que fecharam.

| Elo | Token | Valor | Como sai |
| --- | --- | ---: | --- |
| **Congelamento** | — | **1472** | derivado — `sidebar + container + 2 × (gutter − 16)` |
| Container | `--sd-container-width` | 1152 | medido |
| Sidebar | `--sd-sidebar-width` | 288 | medido |
| Coluna de conteúdo | `--sd-doc-width` | 864 | derivado, 75% do container — é o `.col--9` do grid de doze |
| Coluna do TOC | `--sd-toc-width` | 288 | derivado, o quarto restante |
| Separação do TOC | `--sd-space-6` | 24 | **origem própria** — escolhida para a lista cair em 264 |
| Lista do TOC | — | **264** | herdado |
| Medida de prosa | `--sd-prose-width` | **720** | herdado (720,8 na âncora) |
| Navbar, linha 1 | `--sd-navbar-height` | 64 | herdado |
| Faixa de tabs | `--sd-tabs-height` | 48 | herdado |
| Topo grudado | `--sd-topo-grudado` | **112** | derivado — a soma dos dois acima |
| Gutter | `--sd-gutter` | 16 → 32 | dobra a partir de 997 |
| Topo do conteúdo | `--sd-space-10` | 40 | herdado — abaixo do topo grudado |
| Recuo do subtítulo | `--sd-subtitulo-recuo` | 10 | herdado |

**Não há cartão, não há interior e não há breakout.** Os três morreram juntos — ver §2.

### 1.1 O congelamento, e a correção de premissa que aterrissa aqui

O congelamento é a largura a partir da qual **nada mais se mexe na tela**. Ele é `sidebar + container + 2 × (gutter − 16)`, e os 16 subtraídos são o preenchimento que o Infima já põe no `.container`: o `<main>` completa só o que falta.

**O *"shell total = container + sidebar"* das redações anteriores nunca foi o congelamento.** Ele ignorava o preenchimento do `<main>` e errava para menos — dava 1416 onde a tela entrega 1472. A frase sai, e o número que entra é medido, não derivado no papel.

**Medido em navegador**, contra a página publicada, três viewports:

| viewport | container | coluna | lista do TOC | prosa |
| ---: | ---: | ---: | ---: | ---: |
| 1471 | 1151 | 863,3 | 263,8 | 720 |
| **1472** | **1152** | **864** | **264** | **720** |
| 1920 | 1152 | 864 | 264 | 720 |

O congelamento cai **exatamente** em 1472: um pixel abaixo a cadeia ainda está crescendo, um pixel acima ela já não se mexe.

### 1.2 O elo que não fecha, e ele vai escrito

**A coluna do TOC dá 288 contra os 304 da âncora.** Ela é 25% de um grid de doze que não se mexe, e mover isso exigiria quebrar o 75/25 — que vive numa classe hasheada de CSS Module e custaria `unsafe` em `DocItem/Layout`.

**A lista, que é o que se vê, bate exato.** A separação do TOC é o único número desta tabela escolhido em vez de medido, e ela foi escolhida para isso: `--sd-space-6` no lugar do `--sd-space-8` anterior derruba a lista de 256 para 264.

É a diferença entre divergir na caixa e divergir na tinta. A caixa diverge; o que o leitor mede com o olho, não.

### 1.3 As DUAS variáveis de container recebem o mesmo valor

O Infima tem duas: uma normal e uma `-xl`, e **a segunda assume acima de 1440px**. Fixar só a primeira faz a coluna **alargar sozinha em tela larga**, que é exatamente a oscilação que a medida constante existe para eliminar.

É a armadilha mais barata de cair e a mais cara de perceber: o defeito só aparece num monitor que quem implementa pode não ter — e, com o congelamento em 1472, **num monitor mais estreito que o congelamento ela nem se manifesta**.

### 1.4 Quatro declarações fazem a cadeia fechar, e as quatro são mecânicas

**(a) O gutter mora no `<main>`, não no `.container`.** A margem negativa da `.row` é calibrada contra o preenchimento do container, e o `.col` de 75% mede a row. Trocar o preenchimento do container quebra os três de uma vez.

**(b) O `.col` perde o preenchimento horizontal, e só onde a cadeia existe.** Sem isso a coluna de conteúdo nasce com os 75% **menos** duas vezes o preenchimento de coluna do Infima, e a conta não fecha. Os dois lados são cobrados por dentro dos 75%. **Abaixo do limiar a regra se inverte** — não há 75% a fechar, e mantê-la encosta o texto na borda da viewport. Ver §9.

**(c) A coluna do TOC recebe a separação de um lado só.** Com preenchimento nos dois, a borda direita do TOC não fecha com a borda direita do container e sobra uma faixa vazia.

**(d) O topo do conteúdo completa no `<main>` o que o container já dá** — exatamente como o gutter horizontal de (a). E aqui isso não é simetria de estilo: é a **única rota**. O `DocRoot/Layout/Main` cola `padding-top--md` no container, e essa classe do Infima é `!important` — nenhuma declaração de folha de estilo a vence sem escrever um `!important` de volta, que é o que este projeto não faz em lugar nenhum. Somando por fora, a conta fecha sem brigar. Sem ela a página começa 24px cedo demais.

### 1.5 A medida da prosa é constante, e não há de onde escapar

`--sd-prose-width` **sempre**, tenha a página TOC ou não.

A âncora oscila — a coluna de texto encolhe quando o TOC existe —, e essa oscilação **não é desenho: é efeito colateral** de a largura do texto depender de a página ter subtítulos. Páginas vizinhas da mesma seção leem com larguras diferentes, sem motivo visível ao leitor.

**O breakout morreu.** Código e tabela ficam nos mesmos 720 do texto: a âncora tem **uma largura só**, e a medida agora é do `<article>` inteiro em vez de uma lista de filhos. Conferido em navegador — parágrafo, tabela e bloco de código medem os mesmos 720.

**O custo, declarado:** a medida dá mais caracteres por linha do que o teto clássico, e ela cresceu. Aceito porque documentação se varre mais do que se lê corrido, e porque heading, lista e bloco de código quebram a linha longa o tempo todo — **mas só se sustenta com a entrelinha generosa** que `tokens.md` trava. Baixar a entrelinha do corpo reabre esta decisão.

### 1.6 Um limiar só no projeto inteiro

As media queries se alinham aos **literais compilados do Infima**, 996 e 997, e não aos 1024 da âncora. É o mesmo limiar que mostra e esconde a sidebar, que dobra o gutter e que monta a faixa de tabs — então o site tem **um** evento visual em vez de três brigando.

Isto é cobrado por portão: a segunda perna do portão 1 reprova qualquer media query cujo limiar não seja o único do projeto.

---

## 2. O cartão morre, e a caixa invisível fica

`.theme-doc-markdown` **deixa de ser superfície**. Sem fundo, sem anel, sem preenchimento, sem raio e sem sombra: a página fica plana. Conferido em navegador, e conferível por `grep` — a classe não aparece mais como superfície em lugar nenhum.

O que sobrevive do cartão é o `max-width`, e ele **muda de dono**: sobe do corpo para a coluna, para segurar a página no mesmo pixel quando não há coluna de TOC.

```css
html.docs-doc-page main > .container > .row > .col:not(.col--3) {
  max-width: var(--sd-doc-width);
}

html.docs-doc-page main > .container > .row > .col:not(.col--3) :is(article, .pagination-nav) {
  max-width: var(--sd-prose-width);
  margin-inline: auto;
}
```

**A decisão está no seletor.** Dois seletores estáveis — um elemento e uma classe do Infima — no lugar de uma lista de onze elementos de prosa que crescia a cada componente novo do catálogo. Com a lista morre a superfície que produziu o defeito do `<header>`: **não há mais lista da qual um elemento possa escapar**, e o conserto mergeado no [PR #64](https://github.com/panlabs-tech/shinydoc-docusaurus/pull/64) deixa de ter assunto.

O `.pagination-nav` entra pelo mesmo motivo que o `<article>`: ele é **irmão** dele e não filho, então sem a segunda linha a paginação mediria a coluna inteira enquanto o texto acima dela mede a prosa.

**O ancestral não é gosto de especificidade.** A Referência da API tem layout próprio, com o `<article>` dela dentro de uma `.row` cujo filho **não é `.col`**. Sem o escopo, a paginação daquela página encolheria para a prosa e sairia do prumo com a coluna de texto que ela fecha. Conferido: na página de API a paginação mede a grade inteira, e o `<article>` continua com a largura que a aritmética do painel lhe dá.

### 2.1 As três configurações de coluna, e a que nenhuma página usa

**Correção de premissa, medida em 3.10.2.** O mapa escreveu que *"o Docusaurus só monta a coluna de TOC quando há heading; sem ela, a coluna de conteúdo vai a 100% da linha em vez de 75%"*. Não é o que o `DocItem/Layout` faz.

A classe de 75% é aplicada sempre que `hide_table_of_contents` **não** está no front matter — independentemente de haver heading. O que depende de heading é a coluna do TOC.

| configuração | coluna de conteúdo | coluna do TOC | o que a caixa invisível faz |
| --- | --- | --- | --- |
| com heading | 75% | renderizada | **inerte** — 75% de 1152 já é `--sd-doc-width` |
| sem heading | 75% | ausente | **inerte**, pelo mesmo motivo |
| `hide_table_of_contents: true` | 100% | ausente | **segura** a coluna em `--sd-doc-width` |

Verificado no fonte **e no artefato**: com `hide_table_of_contents: true` a coluna sai do build com `class="col"` e mais nada — a classe hasheada não é aplicada, então não há `!important` a vencer. Medido em navegador nessa configuração, a 1472 e a 1600 de viewport: **coluna em 864 e prosa em 720**, o mesmo pixel das outras duas.

A declaração serve uma configuração que **nenhuma página usa hoje**, e existe para o defeito não voltar mudo no dia em que alguém escrever a linha de front matter.

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

### 3.1 A faixa — quatro peças, um item de config, zero `unsafe`

**Isto era a perda 4, e a perda 4 estava errada.** Ver §9.

1. **A altura do topo**, em `tokens.md`. `.navbar` tem `height` fixo e **não** `min-height`; sem o token novo a segunda linha **transborda e pinta sobre o conteúdo da página**. `--ifm-navbar-padding-vertical` vai a zero junto — com ele, as duas linhas ficam dentro de uma caixa de conteúdo mais curta que o `<nav>` e desalinham da faixa pintada. Degrau 0.
2. **A quebra.** `flex-wrap: wrap` em `.navbar__items`, mais um espaçador de base 100% e altura 0 que abre a linha. Degrau 1.
3. **A altura determinada da linha 1**, por `min-height` no `.navbar__brand` e `align-self: flex-start` no cluster da direita. Sem ela a linha 1 encolhe para a altura natural da marca e a faixa pintada não casa com as tabs. Degrau 1.
4. **O sangramento**, por parada dura de `linear-gradient` no próprio `.navbar`. O `<nav>` já mede a viewport inteira, e **só o fundo precisa sangrar; o fundo não é das tabs**. Zero DOM novo, zero pseudo-elemento. Degrau 1.

**O espaçador é opção pública** — um item `{type: 'html', position: 'left'}` entre a marca e as tabs. Escolhido em vez de dar `flex-basis: 100%` à marca porque **não acopla a faixa à existência de uma marca**, e o estilo é replicável como template da casa.

**Três armadilhas medidas, todas de falha silenciosa:**

- `type: 'html'` **recusa `value` vazio** — o build reprova com `"navbar.items[N].value" is not allowed to be empty`. Um comentário HTML satisfaz o schema e não renderiza nada;
- a sobrescrita de token precisa casar **`:root[data-theme]`** — (0,2,0) contra (0,1,0). Escrever em `:root` não pega, e é a armadilha de especificidade do [ADR 1](../adr/0001-doutrina-de-css.md) reencontrada em campo;
- o escopo **`@media (min-width: 997px)` é obrigatório** — sem ele, `.navbar-sidebar__brand` e `.navbar-sidebar__items` leem o token novo e o cabeçalho do drawer infla no estreito.

`--sd-tabs-height` nasce **literal e não derivado de `--sd-space-12`**, ainda que os dois entreguem 48: altura de chrome não tem relação com escala de espaço, e derivar por coincidência de número é a derivação falsa que o bloco de foco de `tokens.md` já recusa por escrito.

### 3.2 O que a faixa custa — três perdas nomeadas

1. **A ordem de foco passa a divergir da leitura visual.** Medido: `marca@y0 → 3 tabs@y64 → Buscar@y16 → PT → GitHub → tema`. O `Tab` desce para a faixa e **volta a subir**, porque o DOM tem dois blocos — esquerda inteira, depois direita inteira — enquanto a faixa distribui a esquerda em duas linhas. **Não é contornável nesta rota**, e é **o único ponto do projeto onde a conta do `unsafe` voltaria à mesa**. Ver [`foco.md`](foco.md) §10.
2. **A largura útil da faixa é a de `.navbar__items`, não a da viewport.** O fundo sangra; o conteúdo não. As tabs alinham ao preenchimento do navbar, não à coluna de conteúdo.
3. **São 48px de chrome vertical em toda página.**

### 3.3 O que foi conferido em navegador, com a faixa montada

| Ponto | Medido |
| --- | --- |
| Sangramento | cinco pontos varridos na altura da faixa, em 1440 de viewport — **os cinco dentro do `<nav>`** |
| A faixa | três tabs, numa linha só, altura 48, começando em y=64 |
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

**O número é medido, não default.** *Dissenso registrado:* ele aperta aninhamento profundo, porque o Docusaurus indenta por nível e ainda há um ícone à esquerda. O teto de profundidade 2 é o que o segura — se a árvore ganhar um terceiro nível, este número reabre.

### 4.1 Ícone por categoria de topo

`className` no arquivo de sidebar, mais `::before` com `mask-image` e `currentColor`. O `className` é **contrato público do schema de item de sidebar**, e é ele que produz a assinatura visual mais reconhecível do alvo — sem uma linha de swizzle.

Duas propriedades caem de graça e valem escrita:

- a máscara é pintada com `currentColor`, então **o estado ativo pinta o ícone junto com o texto**, sem uma regra a mais;
- **não existe segundo desenho para o modo escuro.** O axioma 4 é satisfeito sem custo.

O `::before` mora no **link**, não no `<li>`, para herdar a cor dele.

**A regra cobre duas formas, e a segunda foi medida no artefato.** O Docusaurus **normaliza categoria sem filhos para link**: o `<li>` conserva o `className`, mas o rótulo deixa de ser envolvido pelo bloco colapsável. Com um seletor só, uma seção perderia o ícone e a tipografia de topo no dia em que a última folha dela saísse — e a falha seria **muda**.

Por isso o marcador do rótulo de seção é o **`className` do manifesto**, e não o número de nível.

O alinhamento não é coincidência: o preenchimento horizontal do item de menu foi escolhido para que, somado ao preenchimento que o `DocSidebar` põe na lista, o ícone caia **na mesma vertical do preenchimento do navbar**.

Os doze pares seção→ícone estão em [`icones.md`](icones.md), verbatim.

### 4.2 Hierarquia e item ativo

A hierarquia sai de `theme-doc-sidebar-item-category-level-<n>` e `theme-doc-sidebar-item-link-level-<n>`, que são `ThemeClassNames`. Como o teto de profundidade é 2, existem **exatamente dois degraus a desenhar**.

**O item ativo ganha falso-negrito por `text-shadow`, não por `font-weight`.** Trocar o peso reflui o texto e faz o item **pular de largura** no instante em que o leitor navega.

---

## 5. TOC

A largura é **derivada do grid** — a coluna é o `.col--3`, um quarto do container. O que se escolhe aqui é a **separação**, e ela é o único número da cadeia escolhido em vez de medido: ver §1.2.

O comportamento sticky vem do upstream e não se toca. Ele se realinhou sozinho ao topo grudado novo, porque lê `--ifm-navbar-height` — que o adaptador escreve a partir de `--sd-topo-grudado`.

**Perda registrada:** a âncora usa um painel à direita mais largo. Alcançar isso exigiria quebrar o 75/25, que vive numa classe hasheada de CSS Module e custaria `unsafe` em `DocItem/Layout`.

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

### 7.2 A paginação é plana

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

O `<Footer/>` é **irmão do `main-wrapper`**, não filho da página de doc. Então o `.container` dele centra na **viewport**, enquanto o da doc centra dentro do que sobra depois da sidebar. Em tela larga isso são mais de cem pixels de desalinhamento.

A correção é uma declaração, e ela **soma o gutter**. E há uma segunda metade que só aparece implementando: o `.container` do rodapé perde o preenchimento próprio, que sobe para o `<footer>`.

**O fio, porém, é de ponta a ponta** — ele mora no `<footer>`, fora do preenchimento.

A classe de página de doc vem do `DocRoot`, então isto vale para as **três** instâncias. Na landing a classe não existe e o footer centra na viewport junto com o conteúdo de lá.

**Perda nomeada:** com a sidebar recolhida pelo leitor, o layout troca para a largura escondida e o footer não acompanha. O estado mora em classe de CSS Module hasheada.

---

## 9. Tela estreita

Abaixo de 997px — o mesmo limiar em que a sidebar vira gaveta, em que o gutter volta ao passo curto e em que a faixa de tabs some.

**Três dos quatro comportamentos se resolvem por construção, e a única peça que custa declaração é a que sai:**

- **o cartão não está mais lá para encolher.** A história inteira dele no estreito era uma declaração de meio preenchimento, e ela morre junto com a superfície que a consumia;
- **o breakout já resolveu para zero**, e agora nos dois lados do limiar — não há lista de escape em lugar nenhum;
- **o gutter NÃO se preservava sozinho, e esta é a correção que a implementação achou.** A regra (b) do §1.4 zera o preenchimento do `.col` para a cadeia fechar no largo. Abaixo do limiar não há 75%, não há coluna de 864 e não há cadeia a fechar — mas a regra continuava valendo, e aí a conta do `<main>` (`gutter − 16`) dá **zero**. Medido a 390: eyebrow, título e cada parágrafo em `x=0`, encostados na borda da viewport. **O `.col` recupera o preenchimento no estreito**, e ele recupera pelo token — nunca pelo valor que o Infima por acaso também usa. A faixa de tabs, essa sim, some sozinha do outro lado do mesmo limiar;
- **o TOC móvel sai.** É o único lugar onde o critério *"mais perto da âncora"* **remove** uma peça de navegação, e por isso ele é uma **declaração** e não uma omissão: se um dia doer, é uma linha que se apaga. O leitor troca o índice colapsado pela rolagem, e o que ele ganha é a página começando no conteúdo.

**A linha do footer quebra e não empilha**, revertendo deliberadamente o Infima. Ele transforma cada link em bloco, o que faz *uma linha* virar cinco — e "uma linha" é a decisão inteira do rodapé.

Duas notas de implementação que a decisão original não previa:

- o Infima **zera** o preenchimento horizontal do footer no estreito, e a declaração dele mora no próprio `.footer` — mais perto do elemento que o `:root` do adaptador, logo ela vence. A restauração declara a **propriedade**, não a variável: reescrever a variável do Infima fora do adaptador abriria uma sexta exceção com escopo contra a lista fechada do [ADR 1](../adr/0001-doutrina-de-css.md);
- o link do rodapé vira `inline-flex` em vez de `inline`, porque **elemento `inline` ignora altura mínima em silêncio** e o piso de alvo de toque do [ADR 4](../adr/0004-contrato-de-estado-de-entrada.md) não alcançaria justamente a superfície mais estreita do site.

---

## 10. As perdas nomeadas — agora seis

Consequência direta do orçamento `unsafe` zero. Cada linha é perda escrita, não silêncio.

| # | Perda | Por quê |
| ---: | --- | --- |
| 1 | **Qualquer nó injetado dentro do corpo da página** — bloco de feedback no rodapé, CTA lateral | `DocItem/Layout` e `DocItem/Content` são `unsafe`, e **não é contornável por CSS**. *O subtítulo saiu desta lista:* ele é injetado pelo registro de `MDXComponents`, ancorado no `h1`, sem tocar nos dois |
| 2 | **Breadcrumb reestruturado** — eyebrow em página sem categoria, ordem trocada, texto novo | `DocBreadcrumbs` é `unsafe`. *A metade visível foi comprada por subtração* (§7.1); o que fica é o mecanismo |
| 3 | **A proporção da âncora entre conteúdo e painel** | vive numa classe hasheada de CSS Module |
| 4 | **TOC com anatomia nova** — barra de progresso, seções extras | `TOC` e `TOCItems` são `unsafe`. Estilo e profundidade seguem alcançáveis |
| 5 | **Ícone preso dentro de componente `unsafe`** mantém o desenho do Docusaurus | a regra responde sem enumerar; ver [`icones.md`](icones.md) |
| 6 | **Footer dentro da coluna de prosa**, como a âncora faz | `<Footer/>` é irmão do `main-wrapper`. Irmã da perda 2: divergência por restrição |

**Eram sete.** A que saiu é a antiga perda 4 — *faixa de tabs de largura total abaixo do navbar* —, e ela não saiu por ter sido comprada com `unsafe`: **ela era fato errado.** A faixa custa degraus 0, 1 e 2, e `Navbar/Layout` e `Navbar/Content` continuam `unsafe` e **intocados**. A errata está no [ADR 2](../adr/0002-politica-de-swizzle.md) e o ledger em [`swizzle.md`](swizzle.md) §4.

**Duas perdas encolheram sem sair.** A perda 1 perdeu o subtítulo — a rota de ancorar no `h1` estava registrada e foi exercida. A perda 2 perdeu a eyebrow visível, e ficou com o mecanismo: a subtração alcança o caso comum e nada além dele.

---

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| Container, coluna, TOC, prosa | herdado + derivado | [#50](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/50), [#56](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/56) |
| **O congelamento em 1472** | **origem própria (correção)** | o *"shell total"* ignorava o preenchimento do `<main>`; medido em navegador, o ponto é exato |
| **A separação do TOC em `--sd-space-6`** | **origem própria** | escolhida para a lista cair em 264, que é o número medido |
| **A coluna do TOC diverge da âncora** | **lacuna por restrição** | é 25% de um grid de doze; quebrar o 75/25 custa `unsafe` |
| Largura da sidebar, prosa, navbar, faixa | herdado | medido |
| **`--sd-tabs-height` literal, não derivado** | **origem própria** | altura de chrome não deriva de escala de espaço; a coincidência de número seria derivação falsa |
| As **duas** variáveis de container | origem própria | armadilha fechada antes de virar sintoma |
| Gutter, e o ponto onde ele troca | herdado (par) + origem própria (limiar) | — |
| **O cartão morre** | herdado | [#50](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/50) — zero elevação em conteúdo, em seis páginas medidas |
| **A caixa invisível em dois seletores** | **origem própria (implementação)** | [#54](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/54) — uma lista de onze crescia a cada componente novo |
| **O escopo por `.col` na caixa invisível** | **origem própria (implementação)** | sem ele a paginação da Referência da API sai do prumo com a prosa dela |
| **O breakout morre** | herdado | a âncora tem uma largura só |
| Medida de prosa constante | **delta deliberado** | a âncora oscila, e a oscilação é efeito colateral |
| As três configurações de coluna | **origem própria (correção)** | medido em `DocItem/Layout@3.10.2`: a classe de 75% não depende de heading |
| **Ritmo vertical assimétrico 48/16** | herdado | o Infima escala o ar de cima com o corpo do título, e isso é o gesto errado |
| Limiar único 996/997 | **delta deliberado** | o Infima vence os 1024 da âncora |
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
| **Rota por override de `h1`, degrau 3** | **origem própria (verificação)** | a rota estava registrada em `swizzle.md` §4; 73/73 confere a condição |
| **Obrigatório, ausência quebra o build** | **origem própria** | a âncora o faz condicional; a doutrina da casa é falhar alto |
| **A eyebrow por subtração** | **origem própria (implementação)** | três `display: none` sobre classes do Infima; o JSON-LD é irmão e não é alcançado |
| **A eyebrow vazia na visão geral de categoria** | **consequência declarada** | o breadcrumb dela é `home → categoria(ativa)`, e os dois são o que a subtração esconde |
| **Paginação plana** | herdado | [#50](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/50) — nenhum componente de conteúdo tem elevação na âncora |
| **O TOC móvel sai** | **delta deliberado** | o único lugar onde *"mais perto da âncora"* remove navegação; declaração, não omissão |
| Footer em uma linha, fio superior, muito ar | herdado | a única medição que existe do rodapé da âncora |
| A linha quebra e não empilha no estreito | **delta deliberado** | contra o comportamento entregue pelo Infima |
| Conteúdo do footer alinhado à coluna de doc | **origem própria** | não medido; deriva da medida constante |
| Os links do footer, e a regra que os escolheu | **origem própria** | regra é *só o que não está em outro lugar* |
| `target` declarado nos links externos | **origem própria (correção)** | o `<Link>` injeta `target="_blank"` sozinho |
| Ícone de link externo escondido | origem própria | consequência de `Icon/ExternalLink` ser `unsafe` e vir de sprite |
| Link do rodapé em `inline-flex` no estreito | **origem própria (implementação)** | `inline` ignora altura mínima |
| Footer dentro da coluna de prosa | **lacuna por restrição** | é o que a âncora faz e o Docusaurus não permite sem `unsafe` |
