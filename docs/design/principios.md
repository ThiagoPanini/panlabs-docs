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
| **Rampa de cinzas, forma e matiz** | as onze paradas são hex medidos direto na âncora (Devin). Até a [#95](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/95) só a forma era herdada — média das quatro rampas Mintlify medidas — e o matiz vinha da marca; hoje a rampa inteira é herdada e não lê `--sd-brand` |

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

**Dos tickets que restam, nenhum pode produzir um membro.** Cor de marca e ícone são **skin**, o mesmo argumento que já vale para tipografia — e skin não diverge, se troca.

> **O segundo pilar deste fecho mudou de forma, e ficou mais firme.** Ele dizia que *"a landing não tem âncora com que divergir — a raiz da âncora responde 308 e a porta de entrada dela mora no host irmão"*. A landing saiu na [#94](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/94) e a raiz passou a fazer **o que a âncora faz**: levar à primeira doc. O que era ausência de âncora virou convergência com ela, e o argumento não depende mais de um ticket que deixou de existir. O que resta é diferença de **mecanismo** — a âncora responde 308 do servidor, e o GitHub Pages não emite redirecionamento configurável, então aqui a raiz é uma página com `meta http-equiv="refresh"` mais o roteador do núcleo. Diferença imposta pela plataforma é `lacuna por restrição` (§3.1), nunca delta: ninguém escolheu isto.

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

## 5. As sete classes de procedência

**Definidas aqui, e num lugar só.** Toda tabela `## Procedência` da spec usa esta lista, e nada além dela.

Sem o carimbo, valor medido e valor inventado ficam **graficamente idênticos** na página — e o axioma 5 fica infiscalizável. A classe não é metadado: ela diz a quem implementa **o que pode mexer**.

| Classe | O que significa | O que quem implementa pode fazer |
| --- | --- | --- |
| **herdado** | medido na âncora, e adotado | **não toca** |
| **medido em referência** | medido na âncora e publicado como **alvo**, com o produto ainda a caminho dele | não toca o número; move o **código** até ele |
| **delta deliberado** | divergência da âncora por escolha — **classe vazia**, ver §3 e a nota abaixo | ajusta **só pela regra de derivação** do §4 |
| **mecanismo emprestado** | arquitetura de Vapi, Neon ou Clerk, com o valor reancorado na nossa escala | estrutura fixa; **o valor é skin** |
| **origem própria** | nada na medição sustenta | **a mais frágil, e a primeira a ser contestada** |
| **lacuna por restrição** | dimensão medida e **não alcançável** — a plataforma recusa | reabre com a **plataforma**, não com a régua |
| **lacuna de medição** | dimensão herdada que a pesquisa declarou **não medida** | reabre no dia em que alguém medir |

> **Eram cinco na tabela e sete no uso — S9-3, e a correção é da tabela.** Duas classes viviam fora dela e dentro da spec:
>
> · **`lacuna por restrição`** já era tratada como classe pelo §3.1 (*"eles têm classe própria na tabela de procedência (`lacuna por restrição`, §5)"*) e pelo §5.1 — e a tabela do §5 **não a listava**. Dezessete linhas a carregam, e ela é, desde que o §3 esvaziou, **a única categoria de divergência do projeto**. A frase do §3.1 apontava para uma linha que não existia.
> · **`medido em referência`** carimba as onze tabelas *Alvo medido* do site. Ela **não** é `herdado`: `herdado` diz *"medido na âncora e adotado, não toca"*, e estas dizem *"medido na âncora e ainda não alcançado"*. Confundi-las apagaria a distinção que `npm run paridade` inteiro existe para medir.
>
> **A dedução do §5.1 fica de pé:** as classes não se multiplicam por qualificador. O que aconteceu é que duas estavam em uso e fora da lista fechada — *"o mesmo defeito que a lista existe para fechar"*, na frase que o próprio §5.1 usa para o qualificador `consequência`.

### 5.0 A gramática do carimbo, e a régua que a cobra

O carimbo não é uma string livre. Ele tem forma, e a forma é conferida por máquina — **invariante 6** de `npm run invariantes` ([`README.md`](README.md) §4):

```
carimbo      := parte { " + " parte }
parte        := classe [ qualificador ]
classe       := herdado | medido em referência | delta deliberado
              | mecanismo emprestado | origem própria
              | lacuna por restrição | lacuna de medição
qualificador := " (" motivo ")" | " com âncora normativa"
motivo       := verificação | medição | correção | implementação | consequência
```

**Três coisas que a gramática decide, e que estavam decididas de fato e não por escrito:**

**O qualificador vale para qualquer classe, não só para `origem própria`.** `herdado (medição)` e `herdado (correção)` já estavam em uso, e a leitura é a mesma da tabela do §5.1: o motivo diz **como se chegou ao valor**, não que classe ele é. O que o §5.1 fecha é a lista de motivos, e ela continua fechada em cinco.

**A composição com `+` é legítima, e ela diz que a linha tem duas procedências de verdade** — o mecanismo de um lado, o valor do outro. Sete linhas da spec são assim, e a mais clara é *"Gutter, e o ponto onde ele troca"*: o par é medido na âncora, o limiar é nosso.

**A glosa entre parênteses não é qualificador.** `herdado (a tinta) + origem própria (o recorte)` lia bem e cabia numa célula que a máquina não conseguia conferir; a glosa foi para a coluna **Fonte**, que é onde a explicação mora. **Vinte e cinco linhas** foram recarimbadas para caber na gramática, e nenhuma mudou de leitura — a lista completa está no PR da S9-3.

> **Vinte e quatro delas já existiam; a vigésima quinta nasceu no mesmo trabalho.** A linha *"O alinhamento não fecha abaixo do congelamento"* de [`chrome.md`](chrome.md) foi escrita com o carimbo `consequência declarada` — inventado no ato, sem que ninguém percebesse, no PR que estava consertando exatamente esse tipo de defeito. É a evidência mais direta de que a lista precisava de régua e não de disciplina: quem a escreveu tinha a tabela do §5 aberta.

> **Dissenso.** Fechar a gramática torna o carimbo menos expressivo: `herdado (semeadura autorizada)` dizia numa palavra o que agora exige uma frase na Fonte, e `medição de upstream` era mais direto que `origem própria (verificação)`. A resposta é que expressividade sem lista fechada não é vocabulário, é prosa — e uma coluna de classe que aceita prosa não pode ser varrida, o que devolve o axioma 5 ao estado que o §3 descreve: *"quem duvidar roda o `grep` do carimbo"*. Não havia `grep` do carimbo até esta seção. **Reabre quando** uma linha real não couber em nenhuma composição da gramática — aí a classe que falta se nomeia, entra na tabela e entra na régua, que é o caminho que `lacuna por restrição` e `medido em referência` acabaram de fazer.

> **A classe está vazia por decisão, e a spec ainda carrega o carimbo em quinze linhas.** Isso não é contradição escondida: a varredura do §3 é nominal, e ela diz o destino de cada uma. O recarimbo viaja com a reescrita do documento que hospeda a linha — as cinco que moram em [`tokens.md`](tokens.md) e [`foco.md`](foco.md) já foram feitas, as quinze restantes chegam com [`chrome.md`](chrome.md), [`componentes/`](componentes/), [`icones.md`](icones.md) e os dois ADRs.
>
> **Enquanto durar, é a tabela do §3 que responde por elas**, e é por isso que ela é lista nominal e não contagem: um número não permite conferir. Quem encontrar um `delta deliberado` na spec e não achá-lo lá tem um defeito nas mãos, não uma dívida conhecida.

### 5.1 Os qualificadores estreitam a classe; eles não abrem uma oitava

As classes são sete e continuam sete. O que os documentos acrescentam é **qualificador**, e ele diz de onde o valor saiu — na maior parte das vezes de uma `origem própria`, que é a classe onde a pergunta *"de onde"* tem mais respostas possíveis:

| Qualificador | De onde o valor saiu |
| --- | --- |
| `origem própria (verificação)` | conferir o upstream — ler o fonte do Docusaurus e descobrir o que ele de fato faz |
| `origem própria (medição)` | medir o artefato que nós mesmos produzimos |
| `origem própria (correção)` | corrigir uma afirmação anterior do mapa que a implementação desmentiu |
| `origem própria (implementação)` | descobrir escrevendo o código — coisa que nenhuma resolução previu |
| `origem própria (consequência)` | **deduzir de uma regra que a spec já carregava** — o valor não é medido nem descoberto: ele cai de uma decisão anterior |
| `origem própria com âncora normativa` | não tem medição atrás, mas tem **norma** (uma SC do WCAG, um padrão do APG) |

**O de `consequência` entrou nesta tabela depois de já estar em uso**, e a demora vale registrada: ele nasceu no slice do catálogo, em [`componentes/frame.md`](componentes/frame.md), e ficou fora da lista até a [#79](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/79) precisar dele num segundo documento. Um qualificador em uso e fora da lista fechada é o mesmo defeito que a lista existe para fechar.

**`lacuna por restrição` é a que mais se confunde com a vizinha**, e por isso ela vale um parágrafo. Ela **não** é dimensão não medida: é dimensão **medida e não alcançável** — a plataforma recusa. Ela reabre com a **plataforma**, não com a régua, e é a classe de todas as divergências do §3.1.

*A plataforma não é só o `unsafe` do Docusaurus.* Os três `ease-in-out` cravados no `navbar.pcss` do Infima caem aqui pelo mesmo teste — medidos, e sem variável que os alcance —, e estavam carimbados `lacuna de alcance`, uma classe que não existia (S9-3). O teste é **medido e sem rota**, não *"o CLI diz `unsafe`"*.

### 5.2 A classe mais útil é a mais frágil

`origem própria` é a que um revisor deve atacar primeiro, e a spec a carimba de propósito para facilitar o ataque. Uma spec que escondesse a fragilidade sob prosa confiante seria mais agradável de ler e impossível de auditar.

> **Reavaliada quando a landing saiu, e ela NÃO esvaziou.** A pergunta é obrigatória porque a página removida na [#94](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/94) carregava a procedência mais frágil do sistema, e uma classe que perdesse todos os membros teria de ser declarada vazia em vez de ficar pendurada — é o que o §3 faz com `delta deliberado` e o §5.3 com `lacuna de medição`. **A medição, com a metodologia junto, porque contagem sem método não se reproduz:** conta-se uma linha de tabela dentro de uma seção `## Procedência` de `docs/design/` ou `docs/adr/` cuja **coluna de classe** — o segundo campo, não a de fonte — nomeia a classe. Por essa régua, `landing.md` levou **39** membros consigo, e restam **367**. Ela continua sendo, de longe, a classe mais populosa do projeto — o que é o resultado esperado, e não um alívio: `origem própria` é o carimbo do que ninguém mediu, e um sistema que o usa 367 vezes tem 367 lugares por onde ser contestado.

> **Duas contagens ficam divergentes sob essa mesma régua, e a divergência é conhecida.** Ela devolve **10** membros para `delta deliberado` e **2** para `lacuna de medição`, e o §3 e o §5.3 declaram as duas **vazias**. Não é contradição nova nem defeito desta remoção: são os carimbos que ainda não foram recarimbados, e o §3 já diz que *"as demais viajam com a reescrita do documento que as hospeda"* — hoje elas moram em [`chrome.md`](chrome.md) e [`icones.md`](icones.md). A régua acima é publicada com o número que ela devolve, e não com o número que a spec gostaria: uma metodologia que só reproduz o resultado esperado não é metodologia.

> **A régua cobrou, e cobrou rápido — S9-2.** Quatro linhas entraram nas duas classes depois deste parágrafo ser escrito, todas na [#105](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/105): duas em `delta deliberado` ([`componentes/accordion.md`](componentes/accordion.md), [`componentes/callout.md`](componentes/callout.md)) e duas em `lacuna de medição` ([`componentes/steps.md`](componentes/steps.md), [`tokens.md`](tokens.md)). Rodada contra `d51a37f^` a régua devolvia **10 e 2**; contra `9daa325`, **12 e 4**.
>
> **A distinção que decide é a do §3, e ela já estava escrita:** *"Quem encontrar um `delta deliberado` na spec e não achá-lo lá tem um defeito nas mãos, não uma dívida conhecida."* As dez de `delta deliberado` estão na lista nominal da varredura dos 21; as duas novas **não estavam** — elas nasceram depois dela. Dívida conhecida tem razão escrito; carimbo novo em classe fechada é só carimbo errado.
>
> **As quatro foram recarimbadas, e os números voltaram a 10 e 2 sem que este parágrafo fosse editado.** Duas viraram `origem própria (consequência)` porque o valor cai de uma escala fechada que a spec já carregava; a de `steps.md` também, com medição junto; a da citação idem. **A dívida do §3 fica intacta de propósito** — recarimbá-la aqui derrubaria os dez para nove e obrigaria a reescrever esta contagem, trocando o número da varredura por um número de conveniência.
>
> **O precedente certo existia no mesmo lote de trabalho.** A [#108](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/108) carimbou o raio de 14px da busca como `origem própria (implementação)` e escreveu, na própria linha, *"não é `delta deliberado` — `principios.md` §3 fecha essa classe em zero"*. A #105 é três PRs anterior e não tinha a nota. **Ler o vizinho recente não substitui ler a regra.**

### 5.3 Herdar uma ausência não é herdar

**A regra, e ela é a posição mais frágil deste projeto:**

> Quando a medição mostra que a âncora **não decidiu** — que ela entrega o default da plataforma em vez de uma escolha —, não há decisão para herdar. O slot é o único do sistema onde `origem própria` não é fraqueza.

**O caso que a produziu foi a paleta de sintaxe**, e ele importa porque a regra nasceu de medir, não de argumentar. Aquela paleta era a instância nomeada de `lacuna de medição` — o `"codeblocks"` da âncora estava em *declarado não medido*, e ninguém sabia o que havia atrás. Foi medido: resolve para o par padrão do realçador, `github-light-default` no claro e `dark-plus` no escuro, com um único override de fundo.

E o que a medição revelou não foi o que o ticket esperava. **É a única dimensão do sistema visual em que a âncora não manda** — ela declina de tematizar código. Herdar aquilo não seria herdar uma decisão; seria herdar a ausência de uma. O carimbo da paleta é `origem própria (medição)`, e o qualificador diz exatamente isso: a origem própria saiu de **medir o artefato e achar que não havia decisão atrás**.

Duas coisas mais saíram da mesma medição, e as duas cortam contra adotar o par verbatim: ele **regride os pisos de contraste do próprio projeto**, e no claro ele é **mais berrante**, não menos. Os números estão em [`tokens.md`](tokens.md) §10.

> **Por que ela é a mais frágil.** A regra depende de uma leitura, e a leitura contrária é defensável: se alguém decidir que herdar a ausência **é** herdar, esta posição cai inteira e a paleta de sintaxe cai com ela. É também a primeira vez no projeto em que a âncora foi **medida e não seguida** — exatamente o formato de brecha que o axioma 5 existe para fechar. Fica escrita aqui, e não escondida na tabela de procedência de um documento, para que o ataque seja barato.

**A classe `lacuna de medição` esvaziou depois, na [#83](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/83).** No momento em que esta seção foi escrita, os quatro matizes de estado e a base da escala de espaço continuavam nela — junto de mais seis membros noutros documentos, oito ao todo. A #83 mediu os oito contra a âncora (Chrome headless mais fonte primária): dois viraram `herdado` (matizes de estado; busca em `<details>` fechado, que é comportamento de especificação e não da âncora Mintlify), e seis viraram `origem própria (medição)` — a medição aconteceu, mas ou a âncora não decide o ponto (escala de espaço, `scroll-behavior` — herdar uma ausência não é herdar), ou decide diferente do que sustentaríamos (foco: 1px falha a SC 2.4.13 que já governamos; ícone de sidebar: registro misto na própria âncora), ou simplesmente não faz o que se supunha (`auto-fit`: a âncora usa `repeat(var(--cols))` com teto de produto, não grid reflexivo). **Zero membros hoje**, e o carimbo desta frase é histórico: registra que a classe existiu cheia antes de existir vazia, o que uma reescrita que apagasse o parágrafo esconderia.

---

## 6. A assinatura visual, numa frase

> **Uma documentação `mint` fiel, entregue inteira por uma arquitetura de token que a âncora não tem.**

**A frase tinha três orações, e as três morreram** — a última na [#94](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/94). A redação original dizia *"cartão escuro elevado por anel de sombra sobre página mais escura, tipografia sóbria em coluna de medida constante, e uma única faixa de espetáculo"*. O anel deixou de existir — ele virou borda de verdade, e a profundidade virou herança medida, não divergência. A medida constante deixou de ser divergência porque a âncora foi remedida e o número dela é o nosso. **E a faixa de espetáculo saiu com a landing**, que era a única região do site a hospedá-la.

**A consequência é grande o bastante para ser dita em voz alta: a assinatura visual deste projeto não é mais visual.** O que resta da frase é a arquitetura de token — e ela não aparece numa captura de tela. Um leitor que abra o site publicado ao lado da âncora vê fidelidade, não assinatura; a diferença mora em como o sistema é construído, não em como ele se parece. Isso é coerente com o que o projeto entrega — estrutura e customização visual para transplante —, mas é uma perda real, e chamá-la de simplificação seria maquiagem.

**O que morreu junto com a faixa, e vale nomear porque é o que precisaria voltar:** `[data-sd-showcase]` como marca de região, o critério de **emissão** que autorizava um elemento a entrar nela, os dois focos de luz e a respiração de um deles, e o degrau de display que só o hero consumia. A regra de direção única continua verdadeira e continua sem sujeito: **não existe ilha clara**, porque emissão precisa de escuridão.

> *Dissenso registrado.* A decisão de remover a landing foi de escopo — *"seguir fielmente a doc da âncora"*, com a discussão sobre voltar a ter uma **adiada explicitamente**. Não foi a faixa que se mostrou errada; foi a página que a hospedava que saiu de escopo. Se ela voltar, esta seção volta a ter três orações, e o parágrafo acima é a lista do que precisa ser reconstruído.

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
| **Alternância de faixas escuro/claro** *(medida quando havia landing)* | exige a **ilha clara**, descartada por escrito. E a alternância sumiria inteira no modo escuro, que é o canônico: o ritmo existiria só no modo secundário. Hoje o descarte é duplo — a página que a hospedaria saiu na [#94](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/94) |
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
| As sete classes de procedência | herdado | [#10](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/10) — consolidadas aqui, num lugar só. **Eram cinco na tabela e sete no uso até a S9-3**: `lacuna por restrição` e `medido em referência` viviam fora dela |
| **A paridade trava, e o que ela trava é distância não julgada** | **origem própria** | **S9-8** — o passo era o único `continue-on-error` da CI porque `--verificar` reprovava com qualquer diferença, e a paridade nunca fecha em zero. `scripts/paridade-abertas.txt` congela as divergências julgadas, no formato do `swizzle-list.txt`, e `--verificar` reprova nas duas direções: divergência fora da lista, e linha da lista que já fecha. O juiz do desenho continua humano. Ver [`README.md`](README.md) §5 |
| **As três paradas de texto ficam abertas** | **origem própria (medição)** | **S9-8** — os hex-alvo do §12 de [`tokens.md`](tokens.md) existem na rampa byte a byte; o que diverge é o mapeamento papel → parada. Medido com as três trocadas: `text-strong` cai de 18,95 para 16,98 (claro) e de 17,03 para 14,18 (escuro), `text-body` de 12,05 para 7,21 (escuro), e o pior par de callout de **8,28 para 4,95** — acima do piso de 4,5 (SC 1.4.3) por 0,45, sem a folga AAA que o resto do site pratica. Nenhum piso cai: o impedimento não é técnico, é de juiz |
| **A gramática do carimbo, e a invariante 6 que a cobra** | **origem própria (medição)** | **S9-3** — o censo pela régua do §5.2 devolveu **42 linhas** em **26 formas** distintas de carimbo, contra as cinco classes publicadas; **24** delas não cabiam em composição nenhuma das classes canônicas, e uma vigésima quinta nasceu no próprio PR. A gramática do §5.0 é a lista fechada que sobrou depois de recarimbar as 25, e a invariante 6 de `scripts/invariantes.sh` a confere |
| Os qualificadores estreitam em vez de abrir uma sexta | **origem própria (implementação)** | os cinco nasceram do uso, nos slices 1 a 6; o de `consequência` só foi para a lista na [#79](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/79) |
| A assinatura numa frase | origem própria | síntese; não medida |
| **A assinatura perdeu a metade visível** | **origem própria (consequência)** | [#94](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/94) — a faixa de espetáculo era a única região a hospedá-la, e saiu com a landing |
| **A raiz redireciona para a primeira doc** | herdado | a raiz da âncora não serve página: ela leva à primeira doc, medido em [#92](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/92) |
| **O redirecionamento é por página e roteador, não por servidor** | **lacuna por restrição** | o GitHub Pages não emite redirecionamento configurável; a âncora responde 308. Host medido no [ADR 7](../adr/0007-trailingslash-false.md) |
| **`origem própria` foi reavaliada e não esvaziou** | **origem própria (verificação)** | [#94](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/94) — varredura das tabelas `## Procedência` de `docs/design/` e `docs/adr/`, contando a coluna de classe: **39** membros saíram com `landing.md`, **367** restam. A metodologia está no §5.2, junto do número |
| A tabela do que foi medido e descartado | **origem própria** | descarte anônimo é indistinguível de descuido |
