# ADR 4 — Contrato de estado de entrada

**Status:** aceito · slice 2 · 2026-08-07

## Contexto

Este ADR trata das **três formas de um leitor tocar o site**: teclado, ponteiro e dedo. Elas parecem três assuntos e são um mecanismo só, visto de ângulos diferentes — e a prova é que o par `@media (hover: hover)` / `@media (pointer: coarse)` responde às duas últimas com a mesma feature em lados opostos. Separá-las poria as duas metades da mesma decisão em documentos diferentes.

O que a medição do upstream entregou, na fonte de `@docusaurus/theme-classic@3.10.2`, `@docusaurus/theme-common@3.10.2` e `infima@0.2.0-alpha.45`:

| fato | valor |
| --- | --- |
| `:focus` no Infima | 2, ambos em `.close`, e ambos sobre opacidade |
| regras de foco no theme-classic | 5 |
| das quais usam `:focus-visible` | 1 |
| **declarações de `outline` na pilha inteira** | **zero** |
| variáveis de anel de foco | não existem |
| `-webkit-tap-highlight-color: transparent` em `html` | **sim** |
| `@media (hover: hover)` no Infima | **zero** ocorrências |

As duas últimas linhas são as que obrigam. O zero de `outline` é boa notícia — nossa regra entra sem disputa de especificidade —, mas o site hoje sai com o anel default do navegador e nada mais. E o Infima **já apagou o retorno nativo do toque**: sem regra nossa, um tap não produz reação nenhuma até a página trocar.

Três defeitos de upstream completam o quadro, e nenhum é hipotético:

1. **`programmaticFocus`.** O `theme-common` põe `tabindex="-1"`, foca e remove o atributo — a cada navegação client-side, sobre o `<div role="region">` que envolve o skip link. Esse div tem altura zero. Um `*:focus-visible { outline }` ingênuo desenharia uma linha de acento atravessando o topo da página **a cada clique de sidebar**.
2. **Três `transition: all`.** `CopyButton`, `BackToTopButton` e `DocCard/Layout` animam `outline` junto. `outline-style` é propriedade discreta e vira aos 50% da transição, então o anel fica **ausente por metade da duração depois da tecla**.
3. **Dois recursos morrem em silêncio no toque.** A âncora de heading é `opacity: 0` e só volta em `*:hover > .hash-link`; o botão de copiar só aparece em foco ou hover. No telefone a âncora é a única forma de copiar link de seção, e o botão de copiar é o recurso mais usado de um bloco de código.

## Decisão

### a) O indicador é `outline`, universal em `:focus-visible`

**A regra é universal e a lista fechada é de EXCEÇÕES, não de alvos.** O critério é o modo de falhar:

| desenho | como falha | quem vê |
| --- | --- | --- |
| lista de alvos | elemento novo não ganha anel | **só quem navega por teclado** |
| regra universal | contêiner ganha anel indevido | qualquer um, na hora |

Prefira a falha que se enxerga.

**`outline`, e não uma camada da sombra multi-camada.** `box-shadow` não se acrescenta — se redeclara inteiro —, então todo elemento elevado teria que repetir as três camadas dele só para pendurar a quarta. `outline` compra quatro coisas de graça: não afeta layout, acompanha `border-radius` nativamente, é ortogonal ao anel de 1px da elevação, e **não participa da transição da sombra** — que é o que torna *anel instantâneo* uma consequência da escolha de propriedade em vez de uma regra a lembrar.

**O afastamento é o que fecha o contrato.** Com ele o anel é pintado inteiramente fora da caixa do elemento, então **ele nunca pousa sobre o preenchimento do próprio elemento** — pousa sempre sobre a superfície que está atrás. Isso reduz a verificação de contraste a um conjunto fechado de superfícies, em vez de a um por componente.

**`:focus-visible` sozinho, zero `:focus`.** Em campo de texto o navegador casa `:focus-visible` mesmo no clique de mouse, que é a única situação em que `:focus` seria necessário. Acrescentá-lo poria anel em todo botão clicado com o mouse — o ruído que leva alguém a escrever `outline: none`.

### b) `:active` com os tokens do hover, e ele não é *gated*

**Hover não tem substituto no toque, porque hover não é estado: é prévia.** No toque não existe ponteiro para prever com, então a pergunta *"o que entra no lugar do hover"* pressupõe uma lacuna que não existe. O que o toque precisa é **confirmação de que o dedo chegou**, e isso é `:active`.

Mesmos tokens do hover — zero valor novo. O hover já é a prévia do que o clique faz; o press é a confirmação. Inventar um terceiro valor seria dizer a mesma coisa com outra tinta.

**Instantâneo na entrada, suave na saída**, por uma declaração: a transição de entrada usa o vocabulário do estado de destino, a de saída usa o da regra base. É o argumento do anel aplicado a outra propriedade — *feedback que esmaece não está lá quando o dedo está em cima*.

Não fica sob `(pointer: coarse)`: press com mouse também merece confirmação, e o highlight nativo foi apagado nos dois.

### c) Sob `(pointer: coarse)`, o que o upstream esconde atrás de hover fica visível

Âncora de heading e botão de copiar, sempre. E um **piso de alvo**, com a mesma forma da regra de foco — lista fechada de exceções, não lista de alvos, pelo mesmo critério: lista de alvos falha em silêncio, e falha só para quem tem o dedo grande ou a mão trêmula.

A exceção é uma só: **link inline dentro da prosa**. A própria SC 2.5.8 o isenta, e alargá-lo quebraria o ritmo vertical da coluna de texto.

### d) O hover que não escrevemos atravessa pelo adaptador

A regra do projeto é que hover inteiro vive sob `@media (hover: hover)`. Ela governa o CSS que **nós** escrevemos; o Infima não tem uma única ocorrência da feature, então o hover dele gruda depois do tap.

A correção usa o mesmo mecanismo do reduced-motion: em vez de brigar seletor a seletor, **o adaptador neutraliza os tokens de hover do framework** sob `@media (hover: none)`. Duas declarações alcançam o que uma varredura de seletores não alcançaria, e nenhum `!important`.

### e) O portão

**`outline` fora do arquivo de foco reprova**, a cada commit, por varredura.

O motivo é específico. Este contrato não morre por alguém desenhar um anel ruim — morre por alguém escrever `outline: none` num botão para "limpar" o visual. É a linha de CSS mais comum do mundo, e ela apaga acessibilidade de teclado **sem sintoma visível para quem a escreveu**.

## Consequências

1. **Nenhum componente do catálogo declara foco, press ou alvo.** A seção de a11y do gabarito cita o documento de foco e para. Um componente que precise dizer qualquer coisa além de *"herda"* está com o desenho errado — mesma forma da regra de reduced-motion do ADR 3.
2. **A verificação de contraste é feita uma vez, não por componente.** O afastamento garante que o anel pousa sobre uma superfície conhecida, e as superfícies do sistema são um conjunto fechado.
3. **Onde um focável encostar na borda de um ancestral que corta, o anel muda de dono** via `:has()`. Hoje isso acontece uma vez, no `<pre>` dentro da moldura do bloco de código.
4. **Perda nomeada: a sidebar de tela estreita não tem armadilha de foco.** O Docusaurus usa `inert` apenas entre os dois painéis internos, mais trava de rolagem do corpo — com a gaveta aberta, o Tab escapa para a página atrás. O comentário no fonte diz `TODO Docusaurus v4: remove temporary inert workaround`, então o ponto pode mudar no upgrade. Corrigir hoje exigiria `unsafe`.
5. **Perda nomeada: a posição do botão de voltar ao topo na ordem de tabulação.** Ele é parada antes da sidebar, o que é cedo para um botão que flutua embaixo à direita. Corrigir exigiria `unsafe` em `DocRoot/Layout`.

## Alternativas descartadas

| Descartado | Motivo |
| --- | --- |
| Anel como camada da sombra multi-camada | `box-shadow` se redeclara inteiro; elementos elevados repetiriam três camadas para pendurar a quarta |
| Lista fechada de seletores focáveis | Falha em silêncio, e só para quem navega por teclado |
| `:focus` junto de `:focus-visible` | Anel em todo clique de mouse; é o ruído que leva alguém a escrever `outline: none` |
| `[tabindex='-1']` como seletor de exceção | O `programmaticFocus` remove o atributo logo depois de focar |
| Espessura derivada da escala de espaço | Derivação falsa: espessura de anel não tem relação com escala de espaço |
| Piso de alvo de 24px (AA) em vez de 44px (AAA) | A 24px nada no site mudaria — seria escrever uma regra que não faz nada |
| Detecção de toque em JavaScript | `(pointer: coarse)` é declarativo e reavalia sozinho quando o leitor pluga um mouse |
| Segundo skip link, para a navegação | A navegação vem antes do conteúdo; custaria uma parada de Tab a todo mundo |
| Neutralizar o hover do Infima seletor a seletor | Seria a lista de alvos que a regra de foco recusou, e ainda por cima contra código de terceiro |

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| `outline` em vez de sombra | origem própria | [#23](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/23) §2 — argumento de composição |
| Regra universal com lista de exceções | origem própria | [#23](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/23) §3.2, herdando o critério de modo de falhar da [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) |
| As três exceções e o `:has()` do bloco de código | origem própria (verificação) | fonte de `theme-common@3.10.2` e `theme-classic@3.10.2` |
| Espessura e afastamento | **origem própria com âncora normativa** | SC 2.4.13; as sete referências não foram medidas neste eixo |
| Anel instantâneo | origem própria | [#17](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/17) §4 |
| `:active` com os tokens do hover | mecanismo emprestado | [#28](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/28) §4.1, sobre o argumento do anel da [#23](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/23) |
| `(pointer: coarse)` como espelho de `(hover: hover)` | herdado | [#28](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/28) §4.3 — o par já é usado pelo theme-classic |
| Piso de alvo de 44px | **origem própria com âncora normativa** | SC 2.5.5; as sete não foram medidas neste eixo |
| Neutralizar o hover do Infima pelo adaptador | **origem própria (correção)** | varredura desta implementação: o Infima tem **zero** `(hover: hover)`, contra o que a decisão de motion supunha |
| Ordem de tabulação | herdado | correta como o Docusaurus entrega; nada se toca |
| Portão de varredura de `outline` | origem própria | [#23](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/23) §11 |
| Espessura e afastamento das referências | **lacuna de medição** | as sete não foram medidas em foco; reabre se alguém medir |
