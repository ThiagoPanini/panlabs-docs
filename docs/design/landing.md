# Landing

A segunda das duas rupturas de layout do site — a primeira é a
[Referência da API](api-reference.md). **Quatro seções**, **uma** faixa de
espetáculo, **três** camadas de profundidade paradas, e a única licença de "wow"
do projeto.

**A licença não é adjetivo.** *"Impacto sem extravagância"* não passa por
revisão como frase; ele vira a **lista fechada de seis** da §7, cada linha uma
contagem que o **portão 8** confere a cada commit. Um sétimo item é
extravagância por definição.

**Nenhum valor numérico nasce aqui sem citar [`tokens.md`](tokens.md).** Os
comprimentos moram lá; este documento faz contas com eles, e a conta da §4 é o
único lugar do projeto onde uma restrição de layout decide o valor de um token
em vez do contrário. **Nesta revisão ela deixou de decidir**: nenhum token mudou
de valor por causa da dobra — quem pagou a conta foi o `<h2>` que saiu.

Tudo aqui é obrigatório. Não há bloco `Livre`.

> **Leia antes:** [`motion.md`](motion.md) §5 — a licença de movimento e as duas
> guardas —, e [`tokens.md`](tokens.md) §6, que é onde a ilha de espetáculo
> ganha mecanismo.

> **Aviso de fiscalização, para o axioma 5.** As seções 1 e 2 são **origem
> própria**, e esta é a procedência mais frágil do sistema inteiro. O que mudou
> nesta revisão é que ela **encolheu por dois lados**: a figura morreu, e com ela
> a peça mais inventada da página — o que resta de origem própria é **composição
> de partes que já existem**, não um desenho; e o carimbo ganhou **recibo**, que
> é a §8. A landing continua sendo a primeira coisa que quem revisar deve
> contestar.

---

## 1. O que mora na raiz

**`/` é `src/pages/index.js`, e não redireciona para a primeira página de doc.**

Correção de forma contra a resolução do mapa, que escreveu `index.tsx`: **o
projeto não tem TypeScript**, e ligá-lo custaria a dependência que o axioma 2
fecha. O arquivo é `.js`, como os componentes do catálogo e como todo o resto de
`src/`.

**A landing renderiza `<main>`.** Página de doc ganha um pelo layout; página em
`src/pages/` só tem se alguém escrever. Sem ele o skip link cai na reserva — o
invólucro inteiro do layout —, e o marco de página fica errado. Ver
[`foco.md`](foco.md) §7.

**A alternativa era o modelo medido**, e foi recusada: nas instâncias da âncora a
raiz *é* uma página de doc. Nesse modelo, `[data-sd-showcase]` e três dos seis
movimentos nomeados ficariam **sem nenhum consumidor no site inteiro** — e essa
perna do argumento continua valendo depois de tudo o que esta revisão cortou.

---

## 2. As quatro seções

| # | Seção | Conteúdo | É espetáculo? |
| ---: | --- | --- | --- |
| 1 | **Hero** | título, pitch, dois botões **e a laje de código**, numa seção só | **sim** — a ilha |
| 2 | **O que não funcionou** | três falhas em coluna, cada uma assinando o capítulo de origem | não |
| 3 | **As três portas** | `<CardGroup>` de 3, com ícone e **contagem** | não |
| 4 | **Footer** | o do site, sem variante | não |

**Eram cinco.** A grade de cinco cartões morreu inteira, e a seção do código
**fundiu com o hero**.

**A regra é conferível no DOM:** o `<main>` tem exatamente **três** `<section>`.
A quarta seção é o footer, que vem do `<Layout>` e mora fora do `<main>`.

### A laje não morreu; ela perdeu o `<h2>`

Quem nomeia a laje são **as abas do próprio `<CodeGroup>`** — a mesma tarefa nos
três lugares do cenário fixado: Python, GitHub Actions e o comando cru da AWS.

É o que um acervo tem no lugar de *"a primeira cobrança"*: **não um primeiro uso,
e sim a textura do material.** Um acervo pessoal não tem funil de integração; o
que ele tem é a mesma rotação de segredo escrita em três lugares, e a laje mostra
que os três moram no mesmo repositório.

**Tirar aquele `<h2>` não é economia de pixel** — são **56px** devolvidos ao
orçamento da dobra: 32 do heading (`--sd-type-2xl` × `--sd-leading-h2`) mais 24
do `gap` que o separava da laje. Ver a §4.

### `O que não funcionou` é a aposta desta resolução

Ela **sobe para antes das portas**, e o motivo é editorial: **argumento não mora
embaixo da navegação.** As portas ficam por último, que é onde o leitor vai
quando já decidiu entrar.

Duas propriedades que nenhuma outra seção tem:

- **ela consome direto o heading que o índice de jornada torna obrigatório e
  greppável** — o mesmo `## O que não funcionou` do décimo tipo de página, ver
  [`informacao.md`](informacao.md);
- **é a única coisa da landing que nenhuma documentação copia.** Impacto por
  **conteúdo**, não por efeito — que é a leitura estrita de *impacto dentro deste
  mesmo contexto*.

### O ritmo entre as seções virou ritmo de forma

Eram duas grades com contagens diferentes — cinco cartões pequenos contra três
grandes. **Com uma grade a menos, o ritmo é coluna contra grade**, que é uma
diferença de forma e não de densidade. O cartão perdeu a única aparição dupla que
tinha na página.

### As três portas ganham contagem

`2 jornadas · 10 capítulos` · `5 categorias · 19 páginas` ·
`4 famílias · 21 páginas`.

**Cartão de navegação com número é conteúdo; sem número é decoração.**

> **Elas anunciam os números finais da spec antes de o conteúdo existir.** Por um
> ticket, a landing promete uma árvore que o site ainda não tem, e os `href`
> apontam para a tab que hoje ocupa aquela posição — quem move `routeBasePath` é
> o ticket da árvore. É consequência da ordem escolhida, e está dita aqui em vez
> de aparecer como surpresa.

**A landing não inventa componente nenhum.** Ela compõe, no JSX dela, o que o
catálogo já tem — `card`, `card-group`, `code-group`, `code-block`, `icon`. A
contagem está na metade negativa do portão 8.

**A regra de `className` solto não alcança aqui, e é preciso dizer por quê.** O
catálogo proibiu `className` no MDX e declarou que não há válvula de escape.
Aquilo governa o **MDX** — o que o autor de documentação escreve. A landing é
JSX de rota com CSS Module, o mesmo território onde o reveal por rolagem já
morava. Ela não é exceção à regra; está fora do escopo dela.

**O footer é o mesmo da doc, sem variante.** Ele vem do `<Layout>`, fora do
`<main>`. Uma variante de footer para a landing custaria a **primeira entrada do
degrau 4** do ledger de swizzle, que está vazio por resultado e não por
coincidência — ver [`swizzle.md`](swizzle.md) §3.

---

## 3. As larguras — duas, e uma aresta esquerda só

**Não são três, e nenhuma raiz nova nasce.** A regra cabe numa linha:

> **Todo bloco da landing é o container. A medida de leitura é
> `max-inline-size` DENTRO do bloco, nunca um segundo bloco centrado.**

| O que | Token | Medida | Como |
| --- | --- | ---: | --- |
| todo bloco — título, botões, laje, lista, grade | `--sd-container-width` | 1152 | o bloco, mais dois gutters |
| pitch, lede, lista de falhas | `--sd-prose-width` | 720 | **teto dentro do bloco** |
| faixa de espetáculo (fundo) | — | **sangra** | ilha de espetáculo |

### Ela saiu de um defeito que só apareceu medindo o protótipo

Com o hero num bloco centrado de 720 e as seções noutro de 1152, as arestas
esquerdas ficam a **216px** uma da outra, e a página **gagueja de seção para
seção** — cada bloco centrado na própria largura.

**Conferido no navegador, depois da correção, a 1440 de viewport:** título,
pitch, botões, laje, lede, lista de falhas, grade e primeiro cartão começam
**todos em 144**.

**A laje toma o container**, e é isso que faz dela o argumento em vez de um
anexo: ela é o objeto mais largo da página.

**Cada bloco é a medida mais dois gutters**, e é isso que dispensa media query:
com espaço sobrando a medida sai exata; sem espaço, o gutter sobrevive. A laje
encolhe sozinha no estreito, e **mantém o gutter**, porque quem sangra é a faixa
atrás dela.

### A armadilha de falha silenciosa, medida

**Margem `auto` no eixo cruzado de um flex column CANCELA o `stretch`.**

Enquanto o conteúdo preenche a medida, ninguém percebe. Com blocos no container
contendo prosa mais estreita — que é exatamente esta composição —, **o bloco
encolhe para o conteúdo e a aresta esquerda foge**.

O conserto é uma declaração: **`inline-size: 100%` no bloco.**

> **Medido, e não deduzido.** Tirando a declaração dos quatro blocos que moram
> dentro das duas `.secao` — as duas seções de baixo são flex column —, as
> arestas esquerdas saem de 112 para **328, 341,5, 369 e 377,5**. Quatro valores
> diferentes, um por bloco, cada um centrado na própria largura de conteúdo.

---

## 4. A regra da dobra — a restrição que dimensionava o hero

**Viewport de referência: 375 × 667.** É o menor aparelho para o qual se
desenha, e o número foi medido na amostra como breakpoint ad hoc.

**Mede-se contra `svh`, não `vh` nem `dvh`.** No carregamento o navegador móvel
mostra a barra de ferramentas inteira, então o *small viewport* é o pior caso e
é o que o leitor vê no primeiro instante. `vh` superestima o espaço em ~100px: a
regra passaria no devtools e falharia no telefone.

**A borda de cima da laje de código aparece acima da dobra, com fatia visível de
no mínimo `--sd-radius-md`.** A fatia é derivada, não escolhida: abaixo do raio
da própria laje o canto ainda não completou a curva, e a aresta lê como linha
reta em vez de superfície começando.

### O teto

| | token | px |
| --- | --- | ---: |
| `100svh` a 375 × 667, com a barra visível | — | ~553 |
| − navbar grudado | `--sd-navbar-height` | 64 |
| − fatia visível da laje | `--sd-radius-md` | 12 |
| **= teto da faixa do hero** | | **477** |

> **A faixa de tabs não entra nesta conta, e é fato medido e não esquecimento:**
> ela some abaixo de 997, e esta régua é medida a 375 de largura. A dobra é regra
> do estreito, e o estreito não a vê.

### O que cabe dentro dele

| | token | px |
| --- | --- | ---: |
| ar de cima | `--sd-space-8` | 32 |
| headline, 2 linhas | `--sd-type-4xl` × `--sd-leading-h1` | 80 |
| headline → pitch | `--sd-space-4` | 16 |
| pitch, 4 linhas | `--sd-type-lg` × `--sd-leading-prose` | 126 |
| pitch → botões | `--sd-space-6` | 24 |
| botões, uma linha | 2 × `--sd-space-3` + `--sd-type-base` × `--sd-leading-ui` | 48 |
| fio do botão secundário | 2 × `--sd-border-width` | 2 |
| ar de baixo | `--sd-space-8` | 32 |
| **= topo da laje** | | **360** |

**Conferido no navegador: 360,0 medido contra 360 orçado.** Folga: **117px** —
contra os 62,5 da redação anterior. A fatia visível da laje sai em **129**,
contra o piso de 12.

### A regra subiu de nível: agora cobrem-se DUAS quaisquer

Duas linhas da tabela **não saem de token**: quantas linhas a headline e o pitch
ocupam depende de medida de fonte, e medida de fonte não é valor deste sistema.
Então a folga é orçada contra as três quebras que de fato podem acontecer —
**e cada custo abaixo foi medido no navegador, uma quebra de cada vez**:

| Quebra | Custo medido |
| --- | ---: |
| uma linha a mais de headline | **40** |
| uma linha a mais de pitch | **31,5** |
| os dois botões empilhando | **60** |

**Duas quaisquer cabem nos 117. As três, não** — elas somam 131,5, e o topo da
laje vai a 491,5 contra o teto de 477.

Conferido no navegador, par a par: `headline + pitch` → 431,5 · `headline +
botões` → 460 · `pitch + botões` → 451,5. Nenhum passa de 477.

> **Correção de fato contra a resolução, e ela é de 2px.** O custo do
> empilhamento foi escrito como **62** — 48 do botão, 12 do `gap`, 2 do fio. A
> medição dá **60**, porque o fio do botão secundário **já está na linha de base**
> da tabela acima: a fila de botões mede 50, e não 48. O 62 contava o mesmo fio
> duas vezes. A soma das três cai de 133,5 para **131,5**, e a conclusão não se
> mexe.

**De 997px o ar sobe junto com o título**, para `--sd-space-16`. O orçamento da
dobra é restrição do estreito, e acima do limiar ela deixa de mandar nos dois
valores. O limiar é o único do projeto.

### O tamanho do título, e quem manda nele

**No estreito o título do hero é `--sd-type-4xl`**, e no largo é
**`--sd-type-6xl`** — o degrau de display, 60px, com **exatamente um consumidor
no site inteiro**.

**`--sd-type-5xl` saiu da escala**, e a lápide vale a linha porque ele nasceu e
morreu na mesma superfície. Ele foi escolhido quando o hero era um bloco de prosa
de 672: naquela largura, 48px era o maior degrau que o orçamento tolerava, e o
degrau acima quebrava a headline em quatro linhas. Com o bloco do hero tomando o
container, o título cabe **numa linha só** em 60, e o `5xl` ficaria sem
consumidor — a variável inerte que este projeto nomeou no Infima para não copiar.

**Os dois botões ficam lado a lado no estreito**, e a regra **não depende de eles
caberem**: o custo do empilhamento está dentro da folga orçada, então se um dia
os rótulos crescerem os botões quebram e a laje continua acima da dobra.

---

## 5. A superfície de espetáculo — uma faixa, dois focos

**Uma faixa contínua, cobrindo a seção 1 inteira** — hero e laje —, do topo da
página até o fim do código.

- **Uma faixa é uma costura nova.** A de cima, com o navbar, existe em qualquer
  opção que encoste no topo. Duas faixas separadas custariam quatro costuras e
  uma tira clara no meio.
- **O critério que autoriza a ilha é emissão.** A luz emitida faz trabalho no
  hero e atrás do código. **Coluna de texto e grade de cartão são oclusão pura,
  e oclusão atravessa os modos sozinha** — escurecê-las seria escurecer por
  gosto, que é exatamente a licença que o critério existe para fechar.
- **O footer fica fora, e o motivo é mecânico:** ele aparece em **todas** as
  páginas. Se fosse ilha, toda página de doc no modo claro terminaria com barra
  escura, e a ilha deixaria de ser rara. Raridade é o que ela compra.

**A faixa sangra, e não tem raio.** Faixa escura arredondada flutuando é um
cartão; sangrando e sem raio ela lê como região, que é o que ela é.

**No modo escuro a landing é lisa.** A faixa é escura sobre página escura e não
se vê onde começa — a geometria é a mesma nos dois modos, e o claro apenas
**revela** uma borda que sempre esteve lá.

### O site plano é pré-requisito da ilha, não argumento contra

A spec já escrevia isso para movimento — *"um elemento vivo num sistema imóvel lê
como assinatura; dois é enfeite"* —, e a mesma frase vale para **emissão**. Com o
cartão morto, a ilha é **a única região do site que declara os próprios tokens**.

E o slice dos tokens a melhorou sem querer: com `--sd-surface-code` na parada
900, a laje **se vê** como superfície contra a página dentro da ilha — o que
antes só acontecia por ela estar dentro do cartão.

**Dentro da ilha a laje renderiza escura mesmo no modo claro**, e **sem uma linha
de CSS a mais**. O bloco continua **não** carregando substrato próprio: lê
`--sd-surface-code` do lugar onde está, e o lugar declara os tokens do escuro. O
mesmo vale para o fio, para as abas e para o anel de foco.

### Os dois focos

| Foco | Tom | Alfa | Onde | Respira? |
| --- | --- | ---: | --- | --- |
| primeiro | `--sd-accent` — o magenta | **30%** | centro na aresta de cima da laje | **sim** |
| segundo | `--sd-code-parameter` — o cyan | **24%** | canto oposto | não |

**O segundo foco não afrouxa o critério de emissão** — é luz emitida pelo mesmo
mecanismo, num tom diferente. Ele cita o tom do **identificador** da paleta de
sintaxe: dentro da ilha a laje é o material, e a segunda luz é a cor do material.
Nenhum hex novo.

**A confinação em `[data-sd-showcase]` é mecanismo e não estética.** Os dois
moram no escopo da ilha, na camada de componente, e **custam zero na superfície
de troca**, que continua em **dez linhas**. Conferido no navegador: numa página
de documentação, `--sd-glow` e `--sd-glow-2` resolvem para **string vazia**.

**São dois focos e uma respiração**, e é assim que o teto de *um loop por página*
se lê ao pé da letra. O par de amplitude alcança só o magenta.

> **O alfa do primeiro subiu de 12% para 30%, e o registro anterior estava errado
> sobre a origem.** A resolução do cyan escreveu o par `0,24 / 0,30` supondo que
> o `--sd-glow` publicado já fosse 0,30; ele era **12%, desde o primeiro commit**.
> O par estava certo sobre o destino e errado sobre a origem. Quem paga a
> diferença é a figura: sem desenho embaixo, a luz carrega o hero sozinha, e 12%
> não carrega.

> **Dissenso registrado, e é o mais caro desta revisão.** O par de alfas foi
> julgado **com fonte substituta na tela** — Inter e Paper Mono não estavam
> embarcadas no protótipo, e a pilha caiu para `system-ui` / `ui-monospace`. O
> peso óptico do texto contra a luz é exatamente o que essa substituição move.

---

## 6. As três camadas de profundidade

Eram quatro. **A camada 1 some inteira.**

| Camada | O que é | Como se comporta |
| ---: | --- | --- |
| 1 | **luz** — dois radiais, um deles respirando | `pointer-events: none` |
| 2 | **conteúdo do hero** — título, pitch, dois botões | o container, estático |
| 3 | **laje de código** — o `<CodeGroup>` | o container, sobre tudo, estático |

**Zero `z-index`.** A camada 1 é absoluta e vem **antes** no DOM; as 2 e 3 são
`position: relative` e vêm depois. Conteúdo posicionado pinta em ordem de árvore,
então a ordem sai da estrutura em vez de uma escala de números que alguém teria
que manter. O projeto continua sem escala de z-index.

### A figura morre, e é a decisão que mais encolhe a spec

Morrem junto: **`--sd-trilho-tinta`**, o contrato de seis linhas do slot, a
armadilha do `vector-effect`, o degradê interno à `<svg>` e a `<svg>` inteira.
**Não há nenhuma `<svg>` de figura em `src/pages/`.**

**O trilho era literal:** o produto se chamava Trilho. O `panlabs` **não tem
referente**, e qualquer figura nova seria invenção pura na página que já carrega
a procedência mais frágil do sistema.

**O custo, dito em voz alta:** a spec justificava o glow com *"figura e glow são
um objeto só: a luz na linha — um glow flutuando num fundo qualquer seria
enfeite"*. **Essa frase cai.**

**O âncora que a substitui é a laje.** O centro do primeiro foco fica na aresta
de cima do código, então a luz **nasce atrás do material** em vez de flutuar.
Mecanicamente isso não custa um segundo elemento decorativo: a caixa da camada 1
é o topo da seção, e a aresta de baixo dessa caixa **é** a aresta de cima da
laje.

> *Dissenso registrado:* a substituição é **reinterpretação, não medição**. E ela
> leva junto **a única imagem do site** — depois dela, não há nenhum desenho em
> nenhuma página, só glifos de 24px.

---

## 7. O motion licenciado, e a lista fechada de seis

*"Com parcimônia"* não sobrevive como advérbio, e *"impacto sem extravagância"*
não sobrevive como adjetivo. Os dois viram contagem.

### Os três movimentos, e onde cada um mora

| Movimento | Onde | Termina sozinho? | Sob `reduce` |
| --- | --- | --- | --- |
| `--sd-move-showcase` | a entrada da ilha — a luz sobe uma vez, no carregamento | sim | encurta com a escala |
| `--sd-move-ambient` | a respiração do magenta | **não** — infinito | **removido** |
| `--sd-move-reveal` | o reveal das seções 2 e 3 | **não** — dirigido por rolagem | **removido** |

**Um loop por página, e só dentro de `[data-sd-showcase]`.** Fora da ilha
`--sd-glow` não resolve para nada, e nem o par de amplitude nem a respiração
resolvem — **fato de escopo, não regra a lembrar**.

**O que respira é a luz, nunca a matéria.** A camada animada é decorativa, atrás
do conteúdo, com `pointer-events: none`.

**Só `opacity` e `transform`.** Nada de animar `filter` ou `blur`.

**A amplitude é par declarado sobre o alfa do glow, não número novo.**
`--sd-glow-vale` e `--sd-glow-crista` são **fatores**; a crista é 1, ou seja o
glow como o token o define.

**A respiração é desligada por uma regra no bloco `reduce` de `tokens.css`, e o
magenta é alcançado por `data-sd-part`.** Movimento infinito é **removido** sob
`prefers-reduced-motion: reduce`, não encurtado. `animation: none` precisa
alcançar um elemento que mora numa classe de CSS Module **hasheada**, e a camada
de token não a conhece; o contrato de partes é o gancho que sobra.

> **O cyan NÃO ganha parte publicada, e isso é o contrato de partes funcionando.**
> Parte se publica quando o CSS não alcança a peça de outro jeito. O cyan não
> respira, então não há nada que precise alcançá-lo do lado de fora — quem a skin
> repinta é `--sd-glow-2`. Publicar `glow-2` seria alargar um contrato para
> nenhum consumidor, e despublicar depois quebraria quem já dependesse.

### O reveal

**Por `animation-timeline: view()`, zero JavaScript.** Não
`IntersectionObserver`: a rota com observador é a única em que existe de verdade
o modo de falhar *conteúdo permanentemente invisível*.

**Duas guardas, e as duas falham para visível e parado:**
`@supports (animation-timeline: view())` e
`@media (prefers-reduced-motion: no-preference)`.

> **`@media` por fora, `@supports` por dentro — e a ordem não é gosto.**
> Invertida, o ordenador de media queries do minificador iça o `@media` para a
> raiz e **o `@supports` desaparece**, só no build de produção. Medido no CSS
> emitido; ver [`motion.md`](motion.md) §5.

**O reveal mora no CSS Module da própria landing**, e por isso página de
documentação não tem como alcançá-lo. Os `@keyframes` moram na **folha global**,
e referenciá-los de dentro do módulo exige `global(…)`.

**Alcance: as seções 2 e 3** — o cabeçalho de cada uma, os itens da lista de
falhas e os cartões da grade. **Hero e laje não revelam.** A regra é conferível:
*revela o que nasce abaixo da dobra*.

**Um gesto por elemento: revela ao entrar e fica.** A faixa é `entry 0%` a
`entry 100%` — o gesto termina no instante em que o elemento está **inteiro** na
tela. Linha do tempo de rolagem é percorrida nos dois sentidos por construção; o
que a faixa compra é que o caminho de volta só acontece com o elemento **já
saindo pela aresta de baixo**. É por isso que quem revela é a **peça** e não a
seção inteira.

O `Ctrl+F` se resolve sozinho: a linha do tempo é a posição de rolagem, e o
navegador rolar até o trecho **é** o que o revela.

### A lista fechada de seis — o portão 8

**Adjetivo não passa por revisão. Cada linha é contagem.**

| # | O que a landing pode ter de único | Contagem |
| ---: | --- | ---: |
| 1 | a faixa escura sangrada | **1** `data-sd-showcase` no site |
| 2 | dois focos de luz | **2** `radial-gradient`, os dois na regra da ilha |
| 3 | um loop ambiente | **1** `infinite` em todo o CSS |
| 4 | um reveal por rolagem | **1** declaração de `animation-timeline` |
| 5 | um degrau de tipo acima do site | **1** consumidor de `--sd-type-6xl` |
| 6 | uma sombra de conteúdo | **1** consumidor de `--sd-shadow-raised` **na landing** |

Mais a metade negativa, na mesma varredura: **zero `@keyframes` novo** — quatro
no projeto, e a landing consome três sem definir nenhum —, **zero componente
novo**, **zero literal** no CSS Module dela, **zero `z-index`**.

**Um sétimo item é extravagância por definição.**

**A linha 2 não é contagem cega**, e a diferença é o que o portão compra: contar
dois `radial-gradient` em algum lugar deixaria passar um gradiente idêntico
declarado em `:root`, que acenderia o site inteiro. O portão lê o **seletor do
bloco** em que cada gradiente cai.

> **Correção de fato contra a resolução, e ela é sobre a linha 6.** Ela foi
> escrita como *"1 consumidor de `--sd-shadow-raised`"*, site inteiro. **São
> dois** — o botão primário da landing e o painel da Referência da API —, e
> [`tokens.md`](tokens.md) §6 já dizia isso por escrito. A contagem que se
> sustenta é **na landing**, e é a que o portão cobra.

> *Dissenso registrado:* é o oitavo portão num projeto que já tinha sete, e ele
> protege **uma página**. A alternativa — deixar a lista como prosa aqui — foi
> recusada porque uma lista de contagens que ninguém conta é adjetivo com tabela.

> **A lista é conferível sem ser correta, e isso vai escrito.** Um portão de
> `grep` prova que existem seis efeitos e não sete; ele não prova que seis é o
> número certo, nem que estes seis são os que valem a pena. O que ele fecha é o
> caminho pelo qual um sétimo entraria — alguém acrescentando sem perceber que a
> lista era fechada. A escolha dos seis continua sendo julgamento, e continua
> sendo contestável nesta seção.

---

## 8. A procedência mais frágil ganha recibo

A pergunta era o que sustenta uma landing de origem própria com o Devin virando
referência única. **A resposta não é argumento, é `curl`:**

```
docs.devin.ai/  →  308  →  /get-started/devin-intro
devin.ai/       →  200     "Devin | The AI Software Engineer"
```

**A âncora tem porta de entrada. Ela mora no host irmão.**

O `panlabs` **não tem irmão** — o acervo é o site inteiro. A landing daqui **não
diverge da decisão da âncora**; ela cai em outro endereço porque só existe um
host.

O carimbo desce de `origem própria integral` para
**`origem própria (a âncora delega; aqui não há para quem)`**, e é a primeira vez
que essa procedência tem recibo.

**E ela encolhe por outro lado:** com a figura morta, some a peça mais inventada
da página. O que resta de origem própria é **composição de partes que já
existem**, não um desenho.

**Segunda perna, que continua valendo:** sem a landing, `[data-sd-showcase]` e
três dos seis movimentos ficam **sem consumidor nenhum no site inteiro**.

---

## 9. As recusas

| # | Recusado | Motivo |
| ---: | --- | --- |
| 1 | **Hero a 100vh** | Empurra a laje — o melhor argumento da página — para baixo da dobra. A regra da §4 é o que substitui a altura fixa por uma verificação |
| 2 | **Seta de "role para baixo"** | Redundante com a laje espiando acima da dobra, e seria um **segundo** loop infinito, contra o teto de um por página |
| 3 | **Alternância de faixas escuro/claro** | Exige a **ilha clara**, descartada por escrito: emissão precisa de escuridão, o mecanismo tem uma direção só |
| 4 | **Degradê para a primeira página de doc** | Degradê só faz sentido dentro de uma rolagem contínua, e entre a landing e a doc há um carregamento de página. **Consequência dita em voz alta:** no modo claro, sair da landing para a doc é corte seco |
| 5 | **Parallax** | Proibido verbatim pela decisão de motion. O que atravessa da referência é a profundidade por camadas, parada |
| 6 | **Componente novo de seção de landing** | O catálogo já tem o que ela precisa. A landing **compõe**, não inventa |
| 7 | **Figura nova no lugar do trilho** | O `panlabs` não tem referente, e o axioma 5 não dá nada para medir. Ver a §6 |
| 8 | **Um sétimo efeito** | Extravagância por definição. Ver a §7 |

> **A recusa do segundo glow caiu, e vale registrada em vez de apagada.** A
> redação anterior recusava um segundo foco com *"um só é o que faz a assinatura
> ler como intenção; dois é enfeite"*. Ela foi revertida pela resolução do cyan, e
> o argumento que a reverte é o critério de emissão: os dois focos são luz emitida
> pelo mesmo mecanismo, e o que separa assinatura de enfeite é o **teto contável**
> da §7, não o número dois.

---

## 10. O que este slice não gastou

**Zero swizzle, e o orçamento `unsafe` continua em zero.** A landing inteira é
uma rota de `src/pages/` e um CSS Module. O degrau 4 continua vazio por
resultado.

**Zero componente novo.** O catálogo não se mexe.

**Zero JavaScript de interação.** O reveal é CSS nativo, a respiração é CSS
nativo, e a única lógica da rota é montar a forma de cerca que o `<CodeGroup>` lê
— que é dado, não comportamento.

**Um ícone novo no manifesto**, e é o único do mapa inteiro: `wrench`, na porta
`Ferramentas`. Ele consome o último slot livre sob o teto de 64, e a folga passa
a ser **zero** — ver [`icones.md`](icones.md) §4.

### A perda nomeada: a landing é monolíngue

**Em `/en/` a landing renderiza em pt-BR, sem sinal nenhum.** As cadeias de texto
dela são literais no JSX, e não passam por `@docusaurus/Translate`.

**Isso é perda declarada, e não descuido.** As duas rotas de conserto custam mais
do que compram neste slice:

- **`<Translate>` em cada cadeia** é a rota certa em princípio, e ela não cabe na
  forma do arquivo: `write-translations` extrai por AST e exige `id` **literal**.
  As duas listas são `map` sobre um array de dados, então id literal obrigaria a
  desenrolar tudo em JSX explícito — e, sem arquivo de tradução EN, o resultado
  visível continuaria sendo pt-BR;
- **`<Untranslated />`**, o marcador que a documentação usa, **custa a regra da
  §4**. Ele é uma faixa no topo do conteúdo; na landing ela entraria acima do
  hero e empurraria a laje para baixo da dobra **no locale EN**.

**O que reabre:** o dia em que o EN deixar de ser parcial.

---

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| `/` é página própria, não redirect para doc | **origem própria (a âncora delega; aqui não há para quem)** | [#80](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/80) §8 — `docs.devin.ai/` devolve 308 e `devin.ai/` devolve 200; o `panlabs` não tem host irmão |
| `index.js` e não `index.tsx` | **origem própria (correção)** | o projeto não tem TypeScript, e ligá-lo custaria dependência contra o axioma 2 |
| `<main>` na landing | herdado | [#23](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/23), via [`foco.md`](foco.md) §7 |
| **Quatro seções**, e três `<section>` no `<main>` | **origem própria** | [#80](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/80) — cinco viraram quatro; nenhuma das sete tem landing com que comparar |
| A laje funde com o hero, e o `<h2>` sai | **origem própria (implementação)** | as abas do `<CodeGroup>` já nomeiam a laje, e o heading custava 56px do orçamento da dobra |
| Grade de cartões como seção de landing | herdado | FastMCP `/getting-started/welcome` e Trigger.dev `/docs/introduction` |
| Hero com título, pitch e dois botões | **origem própria** | [#26](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/26) §2 — nenhuma das sete tem hero |
| `O que não funcionou` antes das portas | **origem própria** | [#80](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/80) — argumento não mora embaixo da navegação; nada medido |
| Contagem nos cartões de porta | **origem própria** | [#80](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/80) — cartão de navegação com número é conteúdo |
| Landing sem cartão | herdado | consequência de escopo do CSS do cartão, de [#20](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/20) |
| Footer sem variante, fora da ilha | origem própria | [#26](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/26) §3 — derivado da raridade que a ilha exige |
| **Todo bloco é o container; a medida de leitura é teto dentro dele** | **origem própria (medição)** | [#80](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/80) §3 — dois blocos centrados põem as arestas a 216px uma da outra |
| `inline-size: 100%` no bloco | **origem própria (implementação)** | margem `auto` no eixo cruzado de um flex column cancela o `stretch`; medido, as arestas espalham em quatro valores |
| Bloco = medida + dois gutters | **origem própria (implementação)** | resolve o estreito por construção |
| Colapso da grade por `auto-fit` | herdado + **lacuna de medição** | [#28](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/28) §2 — a âncora para em 4 colunas |
| Faixa de espetáculo cobrindo a seção 1 | **origem própria** | [#26](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/26) §3 — glow não existe em nenhuma das sete |
| Faixa sangra, sem raio; navbar fora | herdado | [#13](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/13) §3 |
| Laje escura dentro da ilha no modo claro | herdado | [#13](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/13) §3 — a ilha declara os tokens, o bloco só os lê |
| **Três** camadas de profundidade | mecanismo emprestado | `mkdocs-material`, com o parallax removido por [#17](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/17) e a figura por [#80](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/80) |
| **A figura morre** | **origem própria** | [#80](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/80) §6 — o trilho era literal, e o `panlabs` não tem referente |
| O glow reancora na laje | **origem própria (reinterpretação)** | a frase *"figura e glow são um objeto só"* cai; a substituta não tem medição atrás |
| Zero `z-index` — ordem por árvore | **origem própria (implementação)** | o projeto não tem escala de z-index, e esta rota não abre uma |
| Caixa do glow quadrada, um comprimento para os dois focos | **origem própria (implementação)** | dois lados exigiriam um segundo comprimento sem raiz |
| `--sd-glow` a 30% | **origem própria (correção)** | [#61](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/61) sobre a [#73](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/73) — o publicado era 12%, e o par estava certo sobre o destino |
| `--sd-glow-2` cyan a 24%, no canto oposto | origem própria | [#73](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/73) — o tom cita `--sd-code-parameter` |
| O cyan sem `data-sd-part` | **origem própria (implementação)** | parte se publica quando o CSS não alcança de outro jeito; o cyan não respira |
| Landing monolíngue, como perda declarada | **origem própria (implementação)** | id de `Translate` precisa ser literal, e o marcador custaria a regra da dobra no locale EN |
| Respiração em 5s, só `opacity` e `transform` | herdado (período) + origem própria (uso) | [#17](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/17) §5b — o único loop ambiente medido na amostra |
| Amplitude como par declarado sobre o alfa | origem própria | [#17](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/17) §5b |
| Reveal por `animation-timeline: view()`, guarda dupla | origem própria | [#17](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/17) §5a |
| Reveal nas seções 2 e 3, e a peça como sujeito | origem própria | [#26](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/26) §7 — propriedade de `view()` |
| `@keyframes` na folha global, e `global(…)` para citá-los | herdado + **origem própria (correção)** | [#5](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/5) — CSS Modules manglam o nome |
| `@media` por fora, `@supports` por dentro | **origem própria (implementação)** | o ordenador de media queries do minificador destrói o aninhamento inverso |
| Viewport de referência 375 × 667 | herdado | `23.4375em` medido na amostra |
| Regra da dobra em `svh` | origem própria | [#28](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/28) §3 — a unidade é escolha nossa |
| Fatia mínima = `--sd-radius-md` | **origem própria (correção)** | o raio da laje é o `md`, não o base |
| Teto de 477 e o topo da laje em 360 | **origem própria (medição)** | orçado por token e **conferido no navegador**: 360,0 medido contra 360 orçado |
| O custo do empilhamento é 60, e não 62 | **origem própria (correção)** | o fio do botão secundário já está na linha de base da tabela; o 62 o contava duas vezes |
| A regra cobre **duas quaisquer** das três quebras | **origem própria (medição)** | os três pares conferidos no navegador; as três juntas dão 491,5 contra o teto de 477 |
| Título em `4xl` no estreito, `6xl` de 997 | **origem própria** | [#28](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/28) §3 entregou a restrição; o valor sai dela |
| `--sd-type-6xl` como degrau de display, e o `5xl` sai | herdado (nome) + **origem própria (correção)** | o nome continua a série do alvo; o `5xl` foi dimensionado para um hero de 672 e ficaria sem consumidor |
| Botões lado a lado no estreito | origem própria | [#28](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/28) §3 |
| **O portão 8 e a lista de seis** | **origem própria** | [#80](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/80) §7 — irmão do portão 1; protege uma regra de escrita |
| A contagem 6 é **na landing** | **origem própria (correção)** | medido: `--sd-shadow-raised` tem dois consumidores no site, e o segundo é o painel da Referência da API |
| Ícone e contagem nas três portas | **origem própria** | [#80](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/80) — ver [`icones.md`](icones.md) §5 |
| As oito recusas | origem própria | [#26](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/26) §8, mais as duas novas |
