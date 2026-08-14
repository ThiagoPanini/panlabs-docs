# Princípios

De onde os valores vêm, o que pode ser contestado, e por qual regra.

Este documento não decide um pixel. Ele decide **como se decide** — e é por isso que ele é o primeiro da ordem de leitura da [espinha](README.md). Sem ele, o resto da spec parece um conjunto de escolhas arbitrárias com muita convicção.

**Nenhum valor numérico de desenho nasce aqui.** O único que aparece é **citação do valor de outro sistema** — o fio de um pixel que separa toda superfície levantada, e que é de [`tokens.md`](tokens.md).

---

## 1. A âncora é o Mintlify

O shinydoc herda o sistema visual do **Mintlify**, e a herança não é o default — é a regra inteira: **o valor da âncora vale sem discussão em tudo o que se vê.** O §3 mostra por que não sobrou exceção.

Isso não é gosto declarado depois do fato. A medição das sete referências em produção — FastMCP, Devin, Perplexity, Vapi, Neon, Clerk, Trigger.dev — produziu um achado que decidiu a âncora sozinho:

> **São sete sites, mas quatro sistemas.** FastMCP, Devin, Perplexity e Trigger.dev servem o mesmo CSS do Mintlify, byte a byte. Vapi é Fern. Neon e Clerk são Next.js próprio, cada um.

Tratar os sete como evidência independente **superestima a base em mais de 2×**. O que sobra depois de colapsar: um sistema com quatro instâncias em produção, e três sistemas com uma cada. A âncora não é o mais bonito — é o único com repetição medida.

**Os outros três não são âncora. Eles doam mecanismo, nunca valor.** Quando a spec toma a arquitetura de um componente do Vapi, do Neon ou do Clerk, ela reancora o valor na própria escala — a estrutura é fixa, o valor é skin. Essa é a classe `mecanismo emprestado` do §5.

### 1.1 O que a âncora **não** decide

**Coerência entre sistemas diferentes.** O axioma 5 diz *medição, não invenção*, e ele tem um limite escrito: medir quatro sistemas dá quatro respostas, e escolher entre elas é decisão explícita — não subproduto da medição. Toda vez que a spec escolhe, ela carimba `origem própria` e diz por quê.

---

## 2. O que se herda calado

Herança calada é herança que **não vira linha de spec**. Ela existe, ela decide pixel, e ela não é discutida — porque discuti-la produziria trinta parágrafos defendendo o consenso.

| Dimensão | Por que é calada |
| --- | --- |
| **Geometria de layout** | container, coluna, gutter e a proporção 75/25 são o grid do Infima sobre a medida do alvo. Não há divergência a registrar |
| **Densidade de UI** | o valor mais unânime da amostra inteira. Quatro sistemas, um número |
| **Tipografia** | não é delta: é **parâmetro que a própria âncora expõe**. Trocar a pilha de fonte é re-marcar, não redesenhar — por isso ela está na superfície de troca |
| **Escala de espaço** | base 4, múltiplos de 8. Consenso de indústria antes de ser consenso da amostra |
| **Forma da rampa de cinzas** | as onze paradas de luminosidade são a média das quatro rampas Mintlify medidas. A **forma** é herdada; o **matiz** é da marca |

**Herdado calado ainda é herdado**, e continua carimbado na tabela de procedência de cada documento. O que "calado" significa é que não há seção de justificativa — a fonte é a medição, e a medição está no ticket.

---

## 3. A âncora manda em tudo o que se vê

**Zero deltas deliberados.** Não há uma dimensão em que o shinydoc divirja do Mintlify **por escolha**. O que existe de divergência é **por restrição** — onde o Docusaurus recusa —, e isso é outra coisa, registrada como tal no §3.1.

Esta seção dizia o contrário até o mapa do `mint`: *"quatro dimensões, e só quatro"* — motion, profundidade, forma, bloco de código. A afirmação nova é mais forte que a antiga por um motivo de forma, e não de conteúdo: **a antiga não tinha recibo, e esta tem.** Quem duvidar roda o `grep` do carimbo e reclassifica linha a linha.

### A varredura — 21 carimbos, zero sobreviventes

`delta deliberado` nunca foi só a frase desta seção: é um carimbo de procedência que aparecia **21 vezes** nos documentos da spec. Se a lista fosse verdadeira, os 21 se sustentariam. Foram um a um.

| Para onde vai | Quantos | Quais |
| --- | ---: | --- |
| **morre com o cartão** | 4 | medida de prosa constante, breakout, *"a separação é o anel da sombra"*, *"cartão sobrevive no estreito"* — [`chrome.md`](chrome.md) |
| **`lacuna por restrição`** | 3 | limiar único e ar de baixo menor que o medido ([`chrome.md`](chrome.md)); degrau do título em 996/997 ([`tokens.md`](tokens.md)) |
| **`herdado`** | 6 | raio e tipografia no contrato de troca ([`tokens.md`](tokens.md)); pilhas auto-hospedadas ([`tokens.md`](tokens.md)); família única de ícone ([`icones.md`](icones.md)); `check` fundida no `tip` e título opcional ([`componentes/callout.md`](componentes/callout.md)) |
| **`origem própria`** | 7 | escada de dano dos verbos e fórmula de alfa (`componentes/verb-badge.md`, **removido** — o componente saiu do catálogo com o contrato HTTP); `circle-check` fora ([`icones.md`](icones.md)); teto de quatro níveis ([`componentes/response-field.md`](componentes/response-field.md), [ADR 5](../adr/0005-referencia-da-api-gerada-de-contrato.md)); *"a linha quebra e não empilha"* ([`chrome.md`](chrome.md)); `undefined` descartado ([ADR 7](../adr/0007-trailingslash-false.md)) |
| **`origem própria com âncora normativa`** | 1 | cor do anel de foco ([`foco.md`](foco.md)) |

**Três regras já escritas fazem quase todo o trabalho, e nenhuma delas é nova:**

- **Corrigir acidente da âncora é herdar a intenção, não divergir.** Esta seção já usava o argumento para a medida de prosa. Ele vale igual para a mistura de famílias de ícone — que o §7 chama de *"acidente dela, não desenho"* — e para os dois bugs de callout.
- **Escolher entre sistemas medidos carimba `origem própria`.** É o §1.1, literal. Os dois carimbos do badge de verbo estavam contra ele.
- **Divergir do Infima não é divergir da âncora.** Delta é distância até o Mintlify. Dois dos 21 mediam distância até o Infima.

**Duas incoerências que já existiam, e a varredura expôs.** A tipografia estava carimbada como delta em [`tokens.md`](tokens.md) enquanto o §2 daqui diz, na tabela, que tipografia **não** é delta — *"é parâmetro que a própria âncora expõe"*. E os dois do badge de verbo contrariavam o §1.1. Nenhuma das duas nasceu da varredura; as duas morreram com ela.

**Uma linha não é recarimbada — ela sai.** *"Geist / Geist Mono auto-hospedadas"* seria `herdado` sob qualquer leitura, mas as três pilhas foram para **Inter + Paper Mono**, que é a tipografia da própria âncora. Não há mais Geist na spec, e a linha que entra no lugar já nasce `herdado` sem aproximação.

> **O recarimbo viaja com o documento.** A tabela acima é o razão: ela diz o destino de cada um dos 21. As cinco linhas que moram em [`tokens.md`](tokens.md) e [`foco.md`](foco.md) foram recarimbadas junto com esta seção; as demais viajam com a reescrita do documento que as hospeda. Enquanto isso, é esta tabela que responde por elas — e é por isso que ela é uma lista nominal e não uma contagem.

### O carimbo fica definido, e vazio

**`delta deliberado` continua no §5, e sem nenhum membro.** Carimbo declarado vazio é **informação**: ele diz *"varremos a spec e nada diverge por escolha"*. Não é variável inerte — variável inerte é peso morto, e isto é um resultado.

**E agora ele está fechado, não só vazio.** Havia um candidato nomeado — o catálogo de componentes, se ele mantivesse `CodeGroup` onde a âncora resolve com `Tabs`. Ele não produziu membro: a âncora **tem** `CodeGroup` e o usa cinco vezes, e o critério de corte deste projeto é uso **zero**. O *"a âncora resolve com `Tabs`"* que sustentava a aposta nunca tinha sido contado — dos 105 `Tab` medidos lá, 52 embrulham imagem e não código.

**Dos tickets que restam, nenhum pode produzir um membro.** A landing não tem âncora com que divergir — a raiz da âncora responde 308 e a porta de entrada dela mora no host irmão —, e cor de marca e ícone são **skin**, o mesmo argumento que já vale para tipografia.

### 3.1 Divergência por restrição não é delta

Existe uma terceira categoria, e confundi-la com delta seria dar crédito de escolha a uma limitação:

> **Divergência por restrição** é onde o shinydoc não faz o que a âncora faz porque o Docusaurus não permite sem `unsafe`.

O breadcrumb reestruturado, o footer dentro da coluna de prosa, a proporção conteúdo/painel da referência gerada — os três são isso. Eles têm classe própria na tabela de procedência (`lacuna por restrição`, §5) e estão inventariados em [`chrome.md`](chrome.md) §8 e [`swizzle.md`](swizzle.md) §4.

**O limiar único de media query entrou nesta categoria, e saiu do §7.** Ele estava registrado ali como valor medido e descartado, com argumento de **custo** — *"dois limiares no mesmo eixo custam mais que a fidelidade compra"*. Não é custo: o Docusaurus decide sidebar e TOC de desktop em 996/997, em CSS hasheado com `!important` e em JS dentro de componente `unsafe`, e não há rota que mova isso sem swizzle proibido. Os 1024px da âncora não foram pesados contra os nossos — eles **não são alcançáveis**. Descarte por preferência e impossibilidade se registram diferente.

**A diferença importa no upgrade.** Delta deliberado é decisão e não se reabre sem argumento; lacuna por restrição **reabre com a plataforma** — o dia em que o Docusaurus expuser o ponto, o item sobe de degrau sozinho.

**Esta seção ganhou peso quando o §3 esvaziou, em vez de perder.** Com zero deltas, `lacuna por restrição` passa a ser a **única categoria de divergência do projeto** — e ela é a categoria que reabre sozinha. É a leitura certa do que o projeto é: o shinydoc não escolhe ser diferente do Mintlify; ele é diferente onde o Docusaurus recusa.

---

## 4. A régua de coerência, e os três portões que a cobram

A régua é **mecânica de propósito**:

> **Nenhum valor entra no sistema como literal, salvo na camada de raiz.** Todo o resto sai de algo que já está lá, por uma operação declarada — derivar de **uma** cor por sintaxe relativa, misturar **duas** por `color-mix`, ou `calc()` sobre a base de raio, espaço ou duração — e se resolve nos dois modos como par declarado.

Uma régua de julgamento só funciona com o dono do projeto presente, que é exatamente o que a spec existe para dispensar. Por isso ela é conferida por três varreduras, todas em cadência de commit:

| Portão | O que ele impede | Por que ESTE e não outro |
| ---: | --- | --- |
| 1 | literal de cor, comprimento, tempo ou curva fora de `src/css/tokens.css` | é a régua inteira, virada em `grep`. A segunda perna dele exige **um limiar de media query só no projeto** |
| 2 | `transition:` ou `animation:` com tempo ou curva cravada | movimento novo precisa entrar no vocabulário **antes** de ter consumidor. Sem ele, reduced-motion vira lista de alvos |
| 3 | `outline` fora de `src/css/foco.css` | este contrato não morre por anel feio. Morre por `outline: none` escrito para "limpar" um botão — a linha de CSS mais comum do mundo, que apaga acessibilidade de teclado sem sintoma visível para quem a escreveu |

**Os três cobram declaração, não prosa:** a varredura remove comentário antes de olhar. Portão que reprova por explicação ensina a escrever comentário pobre.

Os outros quatro portões cobram outras coisas — conteúdo, gerador, host e superfície de swizzle. A lista completa está na [espinha](README.md) §5.

---

## 5. As cinco classes de procedência

**Definidas aqui, e num lugar só.** Toda tabela `## Procedência` da spec usa esta lista, e nada além dela.

Sem o carimbo, valor medido e valor inventado ficam **graficamente idênticos** na página — e o axioma 5 fica infiscalizável. A classe não é metadado: ela diz a quem implementa **o que pode mexer**.

| Classe | O que significa | O que quem implementa pode fazer |
| --- | --- | --- |
| **herdado** | medido na âncora | **não toca** |
| **delta deliberado** | divergência da âncora por escolha — **classe vazia**, ver §3 e a nota abaixo | ajusta **só pela regra de derivação** do §4 |
| **mecanismo emprestado** | arquitetura de Vapi, Neon ou Clerk, com o valor reancorado na nossa escala | estrutura fixa; **o valor é skin** |
| **origem própria** | nada na medição sustenta | **a mais frágil, e a primeira a ser contestada** |
| **lacuna de medição** | dimensão herdada que a pesquisa declarou **não medida** | reabre no dia em que alguém medir |

> **A classe está vazia por decisão, e a spec ainda carrega o carimbo em quinze linhas.** Isso não é contradição escondida: a varredura do §3 é nominal, e ela diz o destino de cada uma. O recarimbo viaja com a reescrita do documento que hospeda a linha — as cinco que moram em [`tokens.md`](tokens.md) e [`foco.md`](foco.md) já foram feitas, as quinze restantes chegam com [`chrome.md`](chrome.md), [`componentes/`](componentes/), [`icones.md`](icones.md) e os dois ADRs.
>
> **Enquanto durar, é a tabela do §3 que responde por elas**, e é por isso que ela é lista nominal e não contagem: um número não permite conferir. Quem encontrar um `delta deliberado` na spec e não achá-lo lá tem um defeito nas mãos, não uma dívida conhecida.

### 5.1 Os qualificadores estreitam a classe; eles não abrem uma sexta

As classes são cinco e continuam cinco. O que os documentos acrescentam é **qualificador**, e ele diz de onde a origem própria saiu:

| Qualificador | De onde o valor saiu |
| --- | --- |
| `origem própria (verificação)` | conferir o upstream — ler o fonte do Docusaurus e descobrir o que ele de fato faz |
| `origem própria (medição)` | medir o artefato que nós mesmos produzimos |
| `origem própria (correção)` | corrigir uma afirmação anterior do mapa que a implementação desmentiu |
| `origem própria (implementação)` | descobrir escrevendo o código — coisa que nenhuma resolução previu |
| `origem própria (consequência)` | **deduzir de uma regra que a spec já carregava** — o valor não é medido nem descoberto: ele cai de uma decisão anterior |
| `origem própria com âncora normativa` | não tem medição atrás, mas tem **norma** (uma SC do WCAG, um padrão do APG) |

**O de `consequência` entrou nesta tabela depois de já estar em uso**, e a demora vale registrada: ele nasceu no slice do catálogo, em [`componentes/frame.md`](componentes/frame.md), e ficou fora da lista até a [#79](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/79) precisar dele num segundo documento. Um qualificador em uso e fora da lista fechada é o mesmo defeito que a lista existe para fechar.

**`lacuna por restrição` é a única que muda de leitura**, e por isso ela vale um parágrafo. Ela **não** é dimensão não medida: é dimensão **medida e não alcançável** — o Docusaurus não permite sem `unsafe`. Ela reabre com a **plataforma**, não com a régua, e é a classe de todas as divergências do §3.1.

### 5.2 A classe mais útil é a mais frágil

`origem própria` é a que um revisor deve atacar primeiro, e a spec a carimba de propósito para facilitar o ataque. Uma spec que escondesse a fragilidade sob prosa confiante seria mais agradável de ler e impossível de auditar.

### 5.3 Herdar uma ausência não é herdar

**A regra, e ela é a posição mais frágil deste projeto:**

> Quando a medição mostra que a âncora **não decidiu** — que ela entrega o default da plataforma em vez de uma escolha —, não há decisão para herdar. O slot é o único do sistema onde `origem própria` não é fraqueza.

**O caso que a produziu foi a paleta de sintaxe**, e ele importa porque a regra nasceu de medir, não de argumentar. Aquela paleta era a instância nomeada de `lacuna de medição` — o `"codeblocks"` da âncora estava em *declarado não medido*, e ninguém sabia o que havia atrás. Foi medido: resolve para o par padrão do realçador, `github-light-default` no claro e `dark-plus` no escuro, com um único override de fundo.

E o que a medição revelou não foi o que o ticket esperava. **É a única dimensão do sistema visual em que a âncora não manda** — ela declina de tematizar código. Herdar aquilo não seria herdar uma decisão; seria herdar a ausência de uma. O carimbo da paleta é `origem própria (medição)`, e o qualificador diz exatamente isso: a origem própria saiu de **medir o artefato e achar que não havia decisão atrás**.

Duas coisas mais saíram da mesma medição, e as duas cortam contra adotar o par verbatim: ele **regride os pisos de contraste do próprio projeto**, e no claro ele é **mais berrante**, não menos. Os números estão em [`tokens.md`](tokens.md) §10.

> **Por que ela é a mais frágil.** A regra depende de uma leitura, e a leitura contrária é defensável: se alguém decidir que herdar a ausência **é** herdar, esta posição cai inteira e a paleta de sintaxe cai com ela. É também a primeira vez no projeto em que a âncora foi **medida e não seguida** — exatamente o formato de brecha que o axioma 5 existe para fechar. Fica escrita aqui, e não escondida na tabela de procedência de um documento, para que o ataque seja barato.

**A classe `lacuna de medição` não esvaziou junto**, e vale dizer para ninguém concluir demais: os quatro matizes de estado e a base da escala de espaço continuam nela, e continuam reabrindo no dia em que alguém medir. O que saiu foi uma instância — a mais visível.

---

## 6. A assinatura visual, numa frase

> **Uma documentação `mint` fiel, entregue inteira por uma arquitetura de token que a âncora não tem, e uma única faixa de espetáculo onde a luz é emitida em vez de ocluída.**

**A frase anterior tinha três orações e duas morreram.** Ela dizia *"cartão escuro elevado por anel de sombra sobre página mais escura, tipografia sóbria em coluna de medida constante, e uma única faixa de espetáculo"*. O anel deixou de existir — ele virou borda de verdade, e a profundidade virou herança medida, não divergência. A medida constante deixa de ser divergência porque a âncora foi remedida e o número dela é o nosso; o valor exato e o recarimbo viajam com a reescrita de [`chrome.md`](chrome.md), como todo o resto da tabela do §3. A terceira oração é a única que continua sendo nossa.

O que mudou de fundo é que a faixa **deixou de ser exceção num sistema de cartões elevados** e passou a ser a única coisa do site que não sai da âncora.

Tudo o mais é consequência. A raridade da faixa é o que a torna assinatura em vez de enfeite: ela é **uma** região do site inteiro — hero mais laje de código, na landing —, marcada por `[data-sd-showcase]`, e o critério que autoriza um elemento a entrar nela é **emissão**. Como tudo mais no sistema é oclusão, o critério admite ela e mais nada.

Não existe ilha clara: emissão precisa de escuridão, então o mecanismo tem uma direção só.

---

## 7. O que foi medido e descartado

Cada linha aqui é uma coisa que a medição entregou e que a spec **não** usou. Elas ficam escritas porque descarte anônimo é indistinguível de descuido — e porque um revisor que só vê o que entrou não consegue julgar o que ficou de fora.

| O que foi medido | Por que não entrou |
| --- | --- |
| **Duas versões de doc, como demonstração de mecânica** | a revisão foi feita contra a base de evidências da própria recomendação: **seis das sete referências não têm seletor de versão nenhum**, e a doc oficial diz que versionamento *"só aumenta o tempo de build e a complexidade"* |
| **A oscilação da largura de texto da âncora** | não é desenho, é efeito colateral de a coluna depender de a página ter subtítulos. Páginas vizinhas leem com larguras diferentes sem motivo visível ao leitor |
| **O painel largo à direita da âncora**, na proporção dela | vive numa classe hasheada de CSS Module; alcançá-la custaria `unsafe` em `DocItem/Layout`. Vira `lacuna por restrição`, não descarte |
| **A mistura de famílias de ícone da âncora** | é acidente dela, não desenho. O manifesto é de família única, contorno e geometria consistentes |
| **O par padrão de realce de código da âncora** | ela declina de tematizar código, então não há decisão para herdar — ver §5.3. E as duas medidas cortam contra: ele **regride** os pisos de contraste deste projeto e fica **mais berrante** no claro |
| **As seis partes por componente que o Mintlify publica** | ele é multi-tenant e o cliente **não pode tocar no React dele**. O transplante corporativo é dono do arquivo — copiar aquela superfície seria herdar uma restrição de arquitetura que não é a nossa |
| **Alternância de faixas escuro/claro na landing** | exige a **ilha clara**, descartada por escrito. E a alternância sumiria inteira no modo escuro, que é o canônico: o ritmo existiria só no modo secundário |
| **`Content-Disposition: inline` como exigência literal do portão 6** | as referências mandam o cabeçalho; o GitHub Pages não manda nenhum. Ausente **não é** `attachment` — pela RFC 6266 a disposição default é inline. Exigir o literal reprovaria um host onde o recurso funciona, e portão que reprova o que funciona é portão que alguém desliga |
| **DocSearch, do próprio ecossistema Docusaurus** | três conversas corporativas — dependência, egresso de rede e conteúdo indexado fora do perímetro. A terceira não tem argumento técnico que a mova. Ver [ADR 6](../adr/0006-busca-local-sem-servico-externo.md) |
| **Ranqueamento estatístico na busca** (TF-IDF, BM25) | a escada de degraus é **explicável em prosa e conferível por teste**; um score estatístico não é nenhum dos dois. Numa base de dois mil documentos essa recusa se inverte |

---

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| A âncora é o Mintlify | herdado | [#2](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/2) — sete sites, quatro sistemas; a repetição decidiu |
| Os quatro sistemas, e o colapso dos sete | **origem própria (medição)** | o CSS servido é byte a byte o mesmo em quatro dos sete |
| O que se herda calado | herdado | [#2](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/2), [#12](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/12) |
| **Zero deltas deliberados** | **origem própria (verificação)** | [#55](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/55) — varredura dos 21 carimbos, contra as regras já escritas nos §1.1, §3 e §7 |
| O carimbo fica definido e vazio, e fechado | **origem própria** | [#55](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/55) e [#60](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/60) — carimbo vazio é resultado; o único candidato nomeado não produziu membro |
| **Herdar uma ausência não é herdar** | **origem própria (medição)** | [#73](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/73) — o `"codeblocks"` da âncora foi medido e revelou não-decisão |
| Divergência por restrição é categoria própria | **origem própria** | dar crédito de escolha a uma limitação seria mentir na tabela |
| A regra de derivação | origem própria | [#11](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/11) §3 — mecânica de propósito |
| Os três portões da régua | origem própria | [#11](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/11) §7, [#17](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/17) §2, [#23](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/23) §11 |
| As cinco classes de procedência | herdado | [#10](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/10) — consolidadas aqui, num lugar só |
| Os qualificadores estreitam em vez de abrir uma sexta | **origem própria (implementação)** | os cinco nasceram do uso, nos slices 1 a 6; o de `consequência` só foi para a lista na [#79](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/79) |
| A assinatura numa frase | origem própria | síntese; não medida |
| A tabela do que foi medido e descartado | **origem própria** | descarte anônimo é indistinguível de descuido |
