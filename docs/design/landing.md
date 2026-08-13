# Landing

A primeira das duas rupturas de layout do site — a segunda é a
[Referência da API](api-reference.md). Cinco seções, **uma** faixa de
espetáculo, quatro camadas de profundidade paradas, e a única licença de "wow"
do projeto.

**Nenhum valor numérico nasce aqui sem citar [`tokens.md`](tokens.md).** Os
comprimentos moram lá; este documento faz contas com eles, e a conta da §5 é o
único lugar do projeto onde uma restrição de layout decide o valor de um token
em vez do contrário.

Tudo aqui é obrigatório. Não há bloco `Livre`: a figura da §6 é ativo trocável,
mas o **contrato** dela não tem latitude interna.

> **Leia antes:** [`motion.md`](motion.md) §5 — a licença de movimento e as duas
> guardas —, e [`tokens.md`](tokens.md) §6, que é onde a ilha de espetáculo
> ganha mecanismo.

> **Aviso de fiscalização, para o axioma 5.** As **seções 1 e 2** e a **figura**
> são **origem própria integral**. Nenhuma das sete referências dissecadas tem
> landing no sentido deste documento: o que a pesquisa mediu como landing são
> grades de cartão dentro da própria documentação. Esta é a procedência mais
> frágil do sistema inteiro, foi escolhida **contra** a medição de propósito — o
> risco registrado é a documentação sair indistinguível de qualquer outra feita
> na âncora —, e é a primeira coisa que quem revisar deve contestar. A
> convergência do `mkdocs-material` citada na §6 **não** conta como medição: ele
> não é uma das sete e não foi dissecado por este projeto.

---

## 1. O que mora na raiz

**`/` é `src/pages/index.js`, e não redireciona para a primeira página de doc.**

Correção de forma contra a resolução do mapa, que escreveu `index.tsx`: **o
projeto não tem TypeScript**, e ligá-lo custaria a dependência que o axioma 2
fecha. O arquivo é `.js`, como os dezoito componentes do catálogo e como todo o
resto de `src/`. Nada mais da decisão muda.

**A landing renderiza `<main>`.** Página de doc ganha um pelo layout; página em
`src/pages/` só tem se alguém escrever. Sem ele o skip link cai na reserva — o
invólucro inteiro do layout —, e o marco de página fica errado. Ver
[`foco.md`](foco.md) §7.

**A alternativa era o modelo medido**, e foi recusada: nas quatro instâncias da
âncora a raiz *é* uma página de doc, e a distinção entre landing e página
interna nem vem de configuração — vem de o conteúdo ser grade de cartão e de não
haver headings suficientes para gerar TOC, o que alarga a prosa por efeito
cascata. Nesse modelo, `[data-sd-showcase]` e três dos seis movimentos nomeados
ficariam **sem nenhum consumidor no site inteiro**.

Um efeito colateral cai a favor: os três `routeBasePath` são `/docs`,
`/api-reference` e `/receitas`. Nenhuma tab reivindica `/`.

---

## 2. As cinco seções

| # | Seção | Conteúdo | É espetáculo? |
| ---: | --- | --- | --- |
| 1 | **Hero** | headline, pitch, dois botões (`Começar`, `Referência da API`) | **sim** |
| 2 | **A primeira cobrança** | `<CodeGroup>` criando uma cobrança Pix — cURL, Node, Python | **sim** |
| 3 | **As três portas** | `<CardGroup>` de 3, um cartão por tab do navbar | não |
| 4 | **O que o Trilho cobre** | `<CardGroup>` de 5 com ícone: Pix, boleto, cartão, split, assinaturas | não |
| 5 | **Footer** | o footer do site, sem variante | não |

**A landing não inventa componente nenhum.** Ela compõe, no JSX dela, o que o
catálogo já tem — `card`, `card-group`, `code-group`, `code-block`, `icon`. **O
catálogo fica em dezoito**, e o hero e as faixas são layout de rota, não
componente de conteúdo.

**A regra de `className` solto não alcança aqui, e é preciso dizer por quê.** O
catálogo proibiu `className` no MDX e declarou que não há válvula de escape.
Aquilo governa o **MDX** — o que o autor de documentação escreve. A landing é
JSX de rota com CSS Module, o mesmo território onde o reveal por rolagem já
morava. Ela não é exceção à regra; está fora do escopo dela.

**Por que cinco e não duas.** As seções 3 e 4 são o que as referências fazem, e
sozinhas dariam a landing medida. As seções 1 e 2 são o pedido de "wow". A
seção 4 ganha dois papéis além do conteúdo: dá uma segunda grade com ritmo
diferente da primeira — cinco cartões pequenos contra três grandes —, e é onde
os ícones de autoria do manifesto aparecem pela primeira vez no site.

**Dissenso registrado:** cinco seções é mais do que qualquer uma das sete faz. É
divergência da âncora sem medição atrás.

### O que a landing larga, e o que ela mantém

**A landing não tem cartão**, e isso **não é exceção a regra nenhuma**. O CSS do
cartão é `html.docs-doc-page .theme-doc-markdown`, e a landing não recebe essa
classe: o escopo sempre foi físico, e este documento só o declara. É também o
que mantém coerente a proibição de raio na faixa — *faixa escura arredondada
flutuando é um cartão, e cartão é a linguagem da página de doc*. Com cartão na
landing, a faixa teria que conviver com ele.

**O footer é o mesmo da doc, sem variante.** Ele vem do `<Layout>`, fora do
`<main>`. Uma variante de footer para a landing custaria a **primeira entrada do
degrau 4** do ledger de swizzle, que está vazio por resultado e não por
coincidência — ver [`swizzle.md`](swizzle.md) §3.

---

## 3. As duas larguras — nenhuma nova

**Sangrar é o fundo, não o conteúdo.** Dentro da faixa, o conteúdo respeita as
medidas que o sistema já tem:

| Faixa | Token | Medida | Origem |
| --- | --- | ---: | --- |
| prosa — headline, pitch, lede de seção | `--sd-prose-width` | 672 | a medida de leitura do site |
| laje de código | `--sd-prose-width` | 672 | a mesma medida: o Devin tem uma largura só |
| grade de cartões | `--sd-container-width` | 1152 | o container do shell |
| faixa de espetáculo (fundo) | — | **sangra** | ilha de espetáculo |

**São duas medidas, e eram três.** A laje tinha token próprio, derivado do
interior do cartão de doc — 864 − 2 × 48 = 768 —, e ele morreu com a skin nova:
sem cartão não há interior, e sobraria um 768 sem raiz, que é a derivação falsa
que a régua recusa. A laje passa a citar a medida de prosa, e isso fecha o
critério do dono: **o Devin tem uma largura só**, landing e modal inclusive.

*Dissenso registrado:* a landing perde um degrau de ritmo — de três larguras
para duas — e o Devin não tem landing para arbitrar. Se a laje larga fizer falta
ao vivo, ela volta **com raiz própria declarada**, não herdando número órfão.

**Cada bloco é a medida mais dois gutters**, e é isso que dispensa media query:
com espaço sobrando a medida sai exata; sem espaço, o gutter sobrevive. A laje
encolhe sozinha no estreito, pelo mesmo mecanismo de `max-width` que faz o
breakout do cartão resolver para zero — e ela **mantém o gutter**, porque quem
sangra é a faixa atrás dela.

**A prosa fica em 672 inclusive no hero.** É o que faz a landing ler como o
mesmo site, e não como uma página colada na frente.

> **Custo declarado.** Uma headline grande a 672 quebra em duas ou três linhas, e
> a maioria das landings de documentação deixa o hero respirar mais. Aceito: a
> medida constante foi comprada pagando explicitamente por oscilação zero, e o
> hero não é motivo bom o bastante para reabrir a compra.

**A grade vai a 1152 e não à medida de prosa.** A conta é a que decide: numa fila
de três, 672 dá cartões de ~213px e 1152 dá ~373px. O argumento antigo comparava
com os 768 do interior do cartão; o número de comparação mudou e a conclusão
ficou mais forte, porque a medida de prosa é ainda mais estreita.

**O colapso das duas grades não custa uma linha.** Elas usam `--sd-card-grid`,
que é a mesma declaração do `card-group` dentro do MDX: `auto-fit` com piso em
`--sd-card-min`, zero media query, zero container query, zero prop de colunas. A
contagem de cartões faz o trabalho sozinha, e a fila ragged fica ragged.

---

## 4. A regra da dobra — a restrição que dimensiona o hero

**Viewport de referência: 375 × 667.** É o menor aparelho para o qual se
desenha, e o número foi medido na amostra como breakpoint ad hoc.

**Mede-se contra `svh`, não `vh` nem `dvh`.** No carregamento o navegador móvel
mostra a barra de ferramentas inteira, então o *small viewport* é o pior caso e
é o que o leitor vê no primeiro instante. `vh` superestima o espaço em ~100px: a
regra passaria no devtools e falharia no telefone, que é a falha silenciosa que
este mapa já recusou três vezes.

**A borda de cima da laje de código aparece acima da dobra, com fatia visível de
no mínimo `--sd-radius-md`.** A fatia é derivada, não escolhida: abaixo do raio
da própria laje o canto ainda não completou a curva, e a aresta lê como linha
reta em vez de superfície começando.

### O teto

| | token | px |
| --- | --- | ---: |
| `100svh` a 375 × 667, com a barra visível | — | ~553 |
| − navbar sticky | `--sd-navbar-height` | 56 |
| − fatia visível da laje | `--sd-radius-md` | 12 |
| **= teto da faixa do hero** | | **~485** |

> **Correção registrada contra a resolução do mapa, que escreveu ~481.** Ela
> descontou 16px de fatia, que é `--sd-radius`. O raio da laje **não** é o raio
> base: o bloco de código usa `--sd-radius-md`, que é `--sd-radius × 0,75` = 12.
> Quatro pixels a mais de orçamento, e a diferença importa menos que o hábito de
> escrever a fatia **por nome de token** em vez de por número — que é o que faz a
> correção ser possível de ver.

### O que cabe dentro dele

A 375 de viewport, com o gutter de cada lado, sobram 311 de conteúdo. O hero
inteiro, somado por token:

| | token | px |
| --- | --- | ---: |
| ar de cima | `--sd-space-8` | 32 |
| headline, 3 linhas | `--sd-type-4xl` × `--sd-leading-h1` | 120 |
| headline → pitch | `--sd-space-4` | 16 |
| pitch, 3 linhas | `--sd-type-lg` × `--sd-leading-prose` | 94,5 |
| pitch → botões | `--sd-space-6` | 24 |
| botões, uma linha | 2 × `--sd-space-3` + `--sd-type-base` × `--sd-leading-ui` | 48 |
| ar de baixo | `--sd-space-8` | 32 |
| `<h2>` da seção 2 | `--sd-type-2xl` × `--sd-leading-h2` | 32 |
| `<h2>` → laje | `--sd-space-6` | 24 |
| **= topo da laje** | | **422,5** |

**Folga: 62,5px.** A fatia visível da laje fica em 74,5 — bem acima do piso de
`--sd-radius-md`.

> **A folga é dimensionada pelo pior caso, e não pelo nominal — e é por isso que
> o ar é `--sd-space-8`.** Duas linhas da tabela **não saem de token**: quantas
> linhas a headline e o pitch ocupam depende de medida de fonte, e medida de
> fonte não é valor deste sistema. Então a folga é orçada contra as duas quebras
> que de fato podem acontecer:
>
> | Quebra | Custo |
> | --- | ---: |
> | uma linha a mais de headline | 40 |
> | uma linha a mais de pitch | 31,5 |
> | os dois botões empilhando | 60 (48 do botão + 12 do `gap`) |
>
> **Qualquer uma das três cabe nos 62,5. Duas ao mesmo tempo, não** — e isso vai
> escrito em vez de ficar implícito. Com o ar num degrau acima, a folga era 46,5
> e a quebra dos botões **sozinha** já derrubava a laje: a regra passaria a
> depender de os rótulos caberem, que é exatamente a falha silenciosa que ela
> existe para pegar.

**De 997px o ar sobe junto com o título**, para `--sd-space-16`. O orçamento da
dobra é restrição do estreito, e acima do limiar ela deixa de mandar nos dois
valores — não só no título. O limiar é o único do projeto.

### O tamanho do título, e quem manda nele

**No estreito o título do hero é o maior degrau da escala que satisfaz o
orçamento acima, e ele é `--sd-type-4xl`.**

A conta que fecha a escolha: o degrau seguinte, `--sd-type-5xl`, mede 48 e
quebra a mesma headline em quatro linhas de 53,3 — **213px onde três linhas de
36 custam 120**. Os 93 de diferença não cabem nos 62,5 de folga. **A restrição
manda no valor**, e não o contrário.

De 997px ela para de mandar, e o título sobe para `--sd-type-5xl` junto com o ar.

`--sd-type-5xl` nasce com a landing e **não é escala nova**: é o próximo nome da
mesma escala do alvo, e tem exatamente um consumidor no site inteiro.

**Os dois botões ficam lado a lado no estreito.** `Começar` e `Referência da
API` somam menos que os 311 disponíveis, e empilhar custaria uma linha inteira
do orçamento por nada.

**Mas a regra não depende de eles caberem, e essa é a diferença que importa.**
Largura de rótulo é medida de fonte, e medida de fonte não é valor deste sistema
— tratar o empilhamento como *"conserto de conteúdo, não de layout"* devolveria
a regra da dobra ao terreno da falha silenciosa. Por isso o custo do
empilhamento (60) está **dentro** da folga orçada acima: se um dia os rótulos
crescerem, os botões quebram e a laje **continua** acima da dobra.

---

## 5. A superfície de espetáculo — uma faixa só

**Uma faixa contínua, cobrindo as seções 1 e 2, do topo da página até o fim da
laje de código.**

O custo de cada faixa é sempre o mesmo: no modo claro, uma barra escura numa
página clara, e cada fronteira é uma costura visível.

- **Uma faixa é uma costura nova.** A de cima, com o navbar, existe em qualquer
  opção que encoste no topo, e já foi nomeada como a aresta mais visível do modo
  claro. Duas faixas separadas custariam quatro costuras e uma tira clara no
  meio.
- **O critério que autoriza a ilha é emissão, e ele fecha aqui.** A luz emitida
  faz trabalho no hero e atrás do código. **Grade de cartão é oclusão pura, e
  oclusão atravessa os modos sozinha** — escurecer a grade seria escurecer por
  gosto, que é exatamente a licença que o critério existe para fechar.
- **O footer fica fora, e o motivo é mecânico:** ele aparece em **todas** as
  páginas do site. Se fosse ilha, toda página de doc no modo claro terminaria
  com barra escura, e a ilha deixaria de ser rara. Raridade é o que ela compra.

**A faixa sangra, e não tem raio.** Faixa escura arredondada flutuando é um
cartão; sangrando e sem raio ela lê como região, que é o que ela é.

**No modo escuro a landing é lisa.** A faixa é escura sobre página escura e não
se vê onde começa — a geometria é a mesma nos dois modos, e o claro apenas
**revela** uma borda que sempre esteve lá. Quem carrega o hero no modo canônico
é o glow.

**Dentro da ilha a laje de código renderiza escura mesmo no modo claro**, e
**sem uma linha de CSS a mais**. Isso não contradiz a decisão de que bloco de
código não é *dark-only*: ele continua **não** carregando substrato próprio —
lê `--sd-surface-code` do lugar onde está, e o lugar declara os tokens do
escuro. O mesmo vale para o berço, para as abas e para o anel de foco.

---

## 6. As quatro camadas de profundidade

O hero da referência que inspirou isto é um parallax de camadas de paisagem. **O
movimento está proibido verbatim.** Mas o parallax é o movimento; a beleza é a
profundidade por camadas, e ela atravessa inteira, **parada**.

| Camada | O que é | Como se comporta |
| ---: | --- | --- |
| 1 | **figura** — `<svg>` inline do trilho, sangrando | `aria-hidden="true"`, `pointer-events: none` |
| 2 | **glow** — o radial da ilha, um só na página | respira; `pointer-events: none` |
| 3 | **conteúdo do hero** — headline, pitch, dois botões | 672, estático |
| 4 | **laje de código** — o `<CodeGroup>` | 768, sobre tudo, estático |

**Zero `z-index`.** As camadas 1 e 2 são absolutas e vêm **antes** no DOM; as 3
e 4 são `position: relative` e vêm depois. Conteúdo posicionado pinta em ordem
de árvore, então a ordem sai da estrutura em vez de uma escala de números que
alguém teria que manter. O projeto continua sem escala de z-index.

**As camadas 1 e 2 dividem um contêiner**, porque **figura e glow são um objeto
só**: a luz na linha. Um glow flutuando num fundo qualquer seria enfeite; um
glow sobre o trilho é o trilho aceso. É esse contêiner que resolve a ancoragem
sem inventar um segundo elemento decorativo — **o centro do glow fica na aresta
de baixo do hero, que é onde a figura termina.**

> **Precisão que a primeira redação errou por 56px.** A aresta de baixo do hero
> não é a aresta de cima da **laje**: entre as duas estão o `<h2>` da seção 2
> (32) e o `gap` dela (24) — os dois já contados na tabela da §4. O que a aresta
> de baixo do hero é, exatamente, é **o fim da figura e o começo da seção do
> código**. A luz cobre os dois de qualquer jeito, porque a caixa dela é
> quadrada e larga como o site; o que estava errado era a frase, não o pixel.

### A figura é o trilho

O produto se chama **Trilho**, e a figura é isso, literalmente: dois trilhos em
perspectiva de um ponto, com dormentes espaçados por profundidade constante,
sangrando pelas laterais e apagados até virar desenho de fundo.

**Por que não uma cena pintada:** não há ilustrador nem pipeline de imagem no
projeto, e o axioma 5 não dá nada para medir. Uma cena pintada seria o item mais
frágil da spec inteira. O trilho sai de uma `<svg>` inline — **zero arquivo
binário, zero dependência** — e a cor sai por derivação dos tokens da ilha, sem
hex novo.

**A figura fica fora do manifesto de ícones e não consome nenhum dos 64.** O
manifesto governa *ícone*: glifo de contorno, família única, tamanho de UI.
Figura sangrada não é isso. Ver [`icones.md`](icones.md) §5.

**Uma versão, e acabou.** Dentro da ilha não existe modo claro, então a figura
só encontra fundo escuro. O problema que fez a documentação recusar imagem — um
desenho que precisa nascer certo nos dois modos — aqui não existe.

### O contrato do slot da figura

Ele existe para que quem transplantar o projeto troque a `<svg>` e tenha outra
landing **sem tocar em uma linha de CSS**. A figura é ativo trocável; ela **não**
entra nas dez linhas do bloco de troca de `tokens.css`, porque aquilo é variável
e isto é arquivo.

| # | O contrato |
| ---: | --- |
| 1 | devolve **um** `<svg>`, e nada em volta dele |
| 2 | `viewBox` obrigatório; **sem** `width` e **sem** `height` — quem dimensiona é o CSS, que a estica sobre a caixa inteira do hero |
| 3 | `preserveAspectRatio="none"`, porque a caixa do hero muda de proporção com a viewport e o ponto de fuga precisa ficar no mesmo lugar relativo |
| 4 | todo traço com `vector-effect="non-scaling-stroke"` — é ele que sobrevive ao esticão do (3) |
| 5 | pinta com `currentColor`, **nunca** com valor próprio; a tinta desce do CSS, derivada dos tokens da ilha |
| 6 | `aria-hidden="true"` e `focusable="false"` |

**Armadilha fechada por escrito:** `vector-effect` **não é herdado**. Declará-lo
no `<g>` em vez de em cada traço não avisa nada e devolve o traço distorcido.

**Consequência do (5), e ela é o que faz o slot valer:** o degradê que apaga a
figura no ponto de fuga mora **dentro** da `<svg>`, em stops de `currentColor`
com alfa variável. Se ele morasse no CSS, trocar a figura passaria a exigir
trocar o CSS junto — e o contrato deixaria de ser contrato.

---

## 7. O motion licenciado, e as regras conferíveis

*"Com parcimônia"* não sobrevive como advérbio. Vira regra conferível lendo o
CSS. **A imobilidade do resto do site é o pré-requisito disto, não um argumento
contra:** um elemento vivo num sistema imóvel lê como assinatura; dois é enfeite.

### Os três movimentos, e onde cada um mora

| Movimento | Onde | Termina sozinho? | Sob `reduce` |
| --- | --- | --- | --- |
| `--sd-move-showcase` | a entrada da ilha — a luz sobe uma vez, no carregamento | sim | encurta com a escala |
| `--sd-move-ambient` | a respiração do glow | **não** — infinito | **removido** |
| `--sd-move-reveal` | o reveal das seções 3 e 4 | **não** — dirigido por rolagem | **removido** |

> **São três e não dois, e a terceira precisa de justificativa porque a issue
> deste slice lista duas.** `--sd-move-showcase` não é movimento novo: ele é um
> dos **seis** do vocabulário, o papel dele já estava escrito como *entrada da
> ilha de espetáculo*, e [`motion.md`](motion.md) §6 já contava quatro
> `@keyframes` no projeto inteiro — busca, **entrada da ilha**, reveal e
> respiração. Este é o slice em que a ilha nasce, logo é o único slice em que
> essa entrada pode ganhar consumidor.
>
> A alternativa era deixá-lo declarado e sem ninguém que o leia, que é
> **variável inerte** — o defeito do Infima que este projeto nomeou para não
> copiar. Ele também não disputa nada com o teto de um loop por página: a
> entrada **termina sozinha**, e por isso encurta com a escala sob `reduce` em
> vez de precisar ser removida.

**Um loop por página, e só dentro de `[data-sd-showcase]`.** Fora da ilha
`--sd-glow` não resolve para nada, e nem o par de amplitude nem a respiração
resolvem — **fato de escopo, não regra a lembrar**.

**O que respira é a luz, nunca a matéria.** A camada animada é decorativa, atrás
do conteúdo, com `pointer-events: none`. Nenhum texto, nenhuma borda e nenhuma
caixa se mexe.

**Só `opacity` e `transform`.** Nada de animar `filter` ou `blur`, que repintam
em vez de compor.

**A amplitude é par declarado sobre o alfa do glow, não número novo.**
`--sd-glow-vale` e `--sd-glow-crista` são **fatores** que multiplicam por
`opacity` o alfa que o gradiente já entrega; a crista é 1, ou seja o glow como o
token o define. Uma crista acima de 1 seria um alfa que o gradiente não declara —
o segundo valor que o par existe para não ter.

> **A respiração anima `opacity` e mais nada, e isso é decisão.** `transform`
> está na lista de propriedades permitidas — a lista é de propriedades que
> compõem em vez de repintar — e fica **sem uso**. Um segundo eixo de amplitude
> exigiria um segundo par de números, e o par existe justamente para não haver
> um. A amplitude é uma, e ela é sobre o alfa.

**A respiração é desligada por uma regra no bloco `reduce` de `tokens.css`, e o
glow é alcançado por `data-sd-part`.** Movimento infinito é **removido** sob
`prefers-reduced-motion: reduce`, não encurtado — encurtar produz
estroboscópio, o oposto do que `reduce` pede. `animation: none` precisa alcançar
um elemento que mora numa classe de CSS Module **hasheada**, e a camada de token
não a conhece; o contrato de partes é o gancho que sobra, e o par de seletores
vence a classe do módulo sem `!important`.

> **A rota óbvia foi tentada e não sobrevive ao build, e isso vale escrito.** O
> primeiro desenho punha o loop inteiro num token — `--sd-glow-respiracao` —
> para o bloco `reduce` o zerar sem conhecer o consumidor. **Nome de
> `@keyframes` não viaja dentro de custom property:** o minificador não varre
> valor de custom property, apaga o keyframe como órfão, e o renomeador de
> identificadores renomearia o `@keyframes` sem renomear o token. O mecanismo
> inteiro, com os dois plugins e a sintaxe `global(…)` que o resolve, está em
> [`motion.md`](motion.md) §6. **É por isso que a única regra de elemento do
> arquivo de tokens fora do adaptador é esta.**

**Nenhum componente escreve a media query própria** — quem a escreve é a camada
de token, que é o ADR 3 intacto.

### O reveal

**Por `animation-timeline: view()`, zero JavaScript.** Não
`IntersectionObserver`: a rota com observador é a única em que existe de verdade
o modo de falhar *conteúdo permanentemente invisível*.

**Duas guardas, e as duas falham para visível e parado:**
`@supports (animation-timeline: view())` e
`@media (prefers-reduced-motion: no-preference)`. Fora de qualquer uma delas não
existe declaração nenhuma sobre os elementos revelados.

> **`@media` por fora, `@supports` por dentro — e a ordem não é gosto.**
> Invertida, o ordenador de media queries do minificador iça o `@media` para a
> raiz e **o `@supports` desaparece**, só no build de produção. Sem a guarda de
> suporte, um navegador sem `animation-timeline` roda o reveal na linha do tempo
> do documento e a página inteira faz um fade de carregamento — visível, mas não
> parado. Medido no CSS emitido; ver [`motion.md`](motion.md) §5.

**O reveal mora no CSS Module da própria landing**, e por isso página de
documentação não tem como alcançá-lo. Os `@keyframes` que ele consome moram na
**folha global**, nunca no módulo: CSS Modules manglam o nome do keyframe que o
módulo define, e a falha é silenciosa.

**Referenciá-los de dentro do módulo exige `global(…)`**, e não a forma óbvia —
sem isso o nome é manglado no consumidor, o minificador apaga o `@keyframes`
órfão, e **o dev server anima enquanto o site publicado não**. Os dois
mecanismos estão em [`motion.md`](motion.md) §6; foi este slice que os mediu.

**Alcance: as seções 3 e 4** — o cabeçalho de cada uma e os cartões dentro
delas. **Hero e laje não revelam.** A regra é conferível: *revela o que nasce
abaixo da dobra*. Uma peça já visível no carregamento tem a linha do tempo
parcialmente percorrida antes do primeiro gesto do leitor.

**Um gesto por elemento: revela ao entrar e fica.** A faixa é `entry 0%` a
`entry 100%`, e ela é a decisão inteira do gesto: ele termina no instante em que
o elemento está **inteiro** na tela.

> **Uma propriedade do mecanismo, escrita em voz alta.** Linha do tempo de
> rolagem é percorrida nos dois sentidos por construção — não existe "revela e
> trava" sem guardar estado, e guardar estado é o JavaScript que esta rota
> recusou. O que a faixa compra é que o caminho de volta só acontece com o
> elemento **já saindo pela aresta de baixo**, nunca enquanto ele está sendo
> lido. É por isso que quem revela é o **cartão** e não a grade inteira: peça
> pequena entra inteira depressa, e a grade de cinco no estreito é mais alta que
> a viewport.

O `Ctrl+F` se resolve sozinho: a linha do tempo é a posição de rolagem, e o
navegador rolar até o trecho **é** o que o revela.

---

## 8. As sete recusas

Cada uma escrita como **perda com motivo**, e não como silêncio.

| # | Recusado | Motivo |
| ---: | --- | --- |
| 1 | **Hero a 100vh** | Empurra a laje de código — o melhor argumento da página — para baixo da dobra. A regra da §4 é o que substitui a altura fixa por uma verificação |
| 2 | **Seta de "role para baixo"** | Redundante com a laje espiando acima da dobra, e seria um **segundo** loop infinito, contra o teto de um por página |
| 3 | **Alternância de faixas escuro/claro** | Exige a **ilha clara**, descartada por escrito: emissão precisa de escuridão, o mecanismo tem uma direção só. E a alternância sumiria inteira no modo escuro, que é o canônico — o ritmo existiria só no modo secundário |
| 4 | **Degradê para a primeira página de doc** | Degradê só faz sentido dentro de uma rolagem contínua, e entre a landing e a doc há um carregamento de página. **Consequência dita em voz alta:** no modo claro, sair da landing para a doc é corte seco de escuro para claro. Já estava aceito |
| 5 | **Segundo glow** | Um só é o que faz a assinatura ler como intenção. Dois é enfeite |
| 6 | **Parallax** | Proibido verbatim pela decisão de motion. O que atravessa da referência é a profundidade por camadas, parada |
| 7 | **Componente novo de seção de landing** | O catálogo já tem `card`, `card-group`, `code-group`, `code-block` e `icon`. A landing **compõe**, não inventa. O catálogo fica em dezoito |

**E uma oitava, que é de forma:** cena ilustrada pintada, recusada na §6 — sem
ilustrador e sem pipeline, seria o item mais frágil da spec, e o axioma 5 não dá
o que medir.

### A perda nomeada: a landing é monolíngue

**Em `/en/` a landing renderiza em pt-BR, sem sinal nenhum.** As cerca de vinte e
cinco cadeias de texto dela são literais no JSX, e não passam por
`@docusaurus/Translate` como as dos três componentes do catálogo que têm texto
de chrome.

**Isso é perda declarada, e não descuido.** As duas rotas de conserto foram
pesadas e as duas custam mais do que compram neste slice:

- **`<Translate>` em cada cadeia** é a rota certa em princípio, e ela **não cabe
  na forma do arquivo**: `write-translations` extrai por AST e exige `id`
  **literal**. As duas grades são `map` sobre um array de dados, então id literal
  obrigaria a desenrolar os oito cartões em JSX explícito — e, sem arquivo de
  tradução EN (que é buraco de propósito neste projeto), o resultado visível
  continuaria sendo pt-BR. Ela paga a estrutura toda para não mudar um pixel;
- **`<Untranslated />`**, o marcador que a documentação usa, **custa a regra da
  §4**. Ele é uma faixa no topo do conteúdo; na landing ela entraria acima do
  hero e empurraria a laje para baixo da dobra **no locale EN**. Uma regra
  conferível que vale num locale e falha no outro é pior que a perda.

**O que reabre:** o dia em que o EN deixar de ser parcial. Aí a rota é
`<Translate>` com as grades desenroladas, e ela passa a comprar alguma coisa.

---

## 9. O que este slice não gastou

**Zero swizzle, e o orçamento `unsafe` continua em zero.** A landing inteira é
uma rota de `src/pages/`, um CSS Module e três `@keyframes` na folha global —
nada disso é customização de componente do tema, e **nenhuma linha nova entra no
ledger**. O degrau 4 continua vazio por resultado.

**Zero componente do catálogo.** Dezoito antes, dezoito depois.

**Zero ícone do manifesto gasto pela figura.** Os cinco cartões da seção 4
consomem ícones que já existem no orçamento de autoria; a figura fica fora dele.

**Zero JavaScript de interação.** O reveal é CSS nativo, a respiração é CSS
nativo, e a única lógica da rota é montar a forma de cerca que o `<CodeGroup>` lê
— que é dado, não comportamento.

### Dissenso registrado e não reaberto

No `mkdocs-material` a faixa de tabs fica **dentro** do hero, e não há costura
entre navbar e faixa. Fica melhor. A decisão de ilha recusou navbar transparente
sobre o hero com dois argumentos, e **o segundo — candidatura a swizzle — parece
superestimado**: dá para marcar a rota no `<html>` por `clientModules`, que é
opção pública. O primeiro argumento (condicional espalhada pelo chrome) continua
de pé, e este documento **não reabre a decisão**. Fica registrado para quem
revisar: se a costura navbar/faixa incomodar, existe uma rota barata que não foi
considerada.

---

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| `/` é página própria, não redirect para doc | **origem própria** | [#26](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/26) §1 — as quatro instâncias da âncora fazem o oposto |
| `index.js` e não `index.tsx` | **origem própria (correção)** | o projeto não tem TypeScript, e ligá-lo custaria dependência contra o axioma 2 |
| `<main>` na landing | herdado | [#23](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/23), via [`foco.md`](foco.md) §7 |
| Cinco seções, e a coluna *é espetáculo?* | **origem própria** | [#26](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/26) §2 e §3 |
| Grade de cartões como seção de landing | herdado | FastMCP `/getting-started/welcome` e Trigger.dev `/docs/introduction` |
| Hero com headline, pitch e dois botões | **origem própria** | [#26](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/26) §2 — nenhuma das sete tem hero |
| Landing sem cartão | herdado | consequência de escopo do CSS do cartão, de [#20](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/20) |
| Footer sem variante, fora da ilha | origem própria | [#26](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/26) §3 — derivado da raridade que a ilha exige |
| Prosa da landing em 672 | herdado | a medida de leitura de [#20](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/20) |
| Grade em 1152 | herdado | container de [#14](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/14) |
| A laje de código na medida de prosa | **origem própria (implementação)** | a medida própria dela derivava do interior do cartão, e morreu com ele ([#56](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/56)) |
| Bloco = medida + dois gutters | **origem própria (implementação)** | resolve o estreito por construção, como o `max-width` do cartão |
| Colapso das grades por `auto-fit` | herdado + **lacuna de medição** | [#28](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/28) §2 — a âncora para em 4 colunas |
| Faixa de espetáculo cobrindo hero + código | **origem própria** | [#26](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/26) §3 — glow não existe em nenhuma das sete |
| Faixa sangra, sem raio; navbar fora | herdado | [#13](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/13) §3 |
| Laje escura dentro da ilha no modo claro | herdado | [#13](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/13) §3 — a ilha declara os tokens, o bloco só os lê |
| Quatro camadas de profundidade | mecanismo emprestado | `mkdocs-material`, com o parallax removido por [#17](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/17) |
| Zero `z-index` — ordem por árvore | **origem própria (implementação)** | o projeto não tem escala de z-index, e esta rota não abre uma |
| Caixa do glow quadrada, com um comprimento só | **origem própria (implementação)** | dois lados exigiriam um segundo comprimento sem raiz — a derivação falsa que o arquivo de tokens recusa |
| Tinta da figura na camada 3 da ilha, por `rgb(from …)` | herdado | a operação 1 das três legais de [`tokens.md`](tokens.md) §1; derivação de alfa é cor, e cor nasce no arquivo de tokens |
| Landing monolíngue, como perda declarada | **origem própria (implementação)** | id de `Translate` precisa ser literal, e o marcador de tradução custaria a regra da dobra no locale EN |
| Figura como `<svg>` inline do trilho | **origem própria** | [#26](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/26) §5 — nome do produto; nada medido |
| Figura fora do manifesto de ícones | origem própria | [#21](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/21) — manifesto governa glifo em tamanho de UI |
| Contrato do slot da figura, seis linhas | **origem própria (implementação)** | [#26](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/26) §5 pediu o contrato; as seis linhas saem de implementar |
| `vector-effect` não é herdado | **origem própria (implementação)** | medido ao escrever a figura; falha muda |
| Glow ancorado no trilho, um por página | origem própria | [#26](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/26) §6 |
| Respiração em 5s, só `opacity` e `transform` | herdado (período) + origem própria (uso) | [#17](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/17) §5b — o único loop ambiente medido na amostra |
| Amplitude como par declarado sobre o alfa | origem própria | [#17](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/17) §5b |
| `transform` licenciado e não usado | **origem própria (implementação)** | um segundo eixo de amplitude exigiria um segundo par |
| Respiração como token, para o `reduce` alcançar | **origem própria (implementação)** | ADR 3 — de `tokens.css` não há seletor que chegue à classe hasheada |
| Entrada da ilha em `--sd-move-showcase` | **origem própria (implementação)** | o movimento estava licenciado e sem consumidor; variável inerte é o defeito do Infima que não se copia |
| Reveal por `animation-timeline: view()`, guarda dupla | origem própria | [#17](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/17) §5a |
| Reveal só nas seções 3 e 4 | origem própria | [#26](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/26) §7 — propriedade de `view()` |
| Faixa `entry 0%`–`entry 100%`, e o cartão como sujeito | **origem própria (implementação)** | linha do tempo de rolagem é reversível por construção |
| `@keyframes` na folha global | herdado | [#5](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/5) — CSS Modules manglam o nome |
| `global(…)` para referenciar keyframe global de dentro do módulo | **origem própria (correção)** | medido no CSS emitido deste slice; a regra escrita dava a referência como livre |
| `@media` por fora, `@supports` por dentro | **origem própria (implementação)** | o ordenador de media queries do minificador destrói o aninhamento inverso |
| Respiração desligada por regra no bloco `reduce`, com gancho `data-sd-part` | **origem própria (implementação)** | nome de keyframe não sobrevive dentro de custom property |
| Viewport de referência 375 × 667 | herdado | `23.4375em` medido na amostra |
| Regra da dobra em `svh` | origem própria | [#28](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/28) §3 — a unidade é escolha nossa |
| Fatia mínima = `--sd-radius-md` | **origem própria (correção)** | [#28](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/28) §3 escreveu o raio base; o raio da laje é o `md` |
| Teto de ~485 e o orçamento somado por token | **origem própria (implementação)** | a conta de [#28](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/28) §3, refeita com a fatia corrigida |
| Título do hero em `4xl` no estreito, `5xl` de 997 | **origem própria** | [#28](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/28) §3 entregou a restrição; o valor sai dela |
| `--sd-type-5xl` como degrau novo da mesma escala | herdado | o nome do alvo continua a série `text-xs … text-4xl` |
| Botões lado a lado no estreito | origem própria | [#28](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/28) §3 |
| As sete recusas | origem própria | [#26](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/26) §8 |
| Dissenso do navbar dentro da faixa | origem própria | [#26](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/26) §9 — registrado, não reaberto |
