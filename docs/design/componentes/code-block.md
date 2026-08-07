# `code-block`

## Papel

O bloco de código — a cerca de Markdown. Ele é onipresente na documentação, e é
onde mora a assinatura visual mais reconhecível de um site de referência técnica.

**Ele não é uma tag e não é swizzle.** O autor escreve uma cerca; o que o
repagina é CSS sobre classe estável (degrau 1) mais a paleta de sintaxe em
`themeConfig.prism` (degrau 2).

Este componente é **muito menos trabalho do que parece**, e isso foi medido:
numeração de linha, realce, foco, diff e ícone somam **zero usos** nas páginas
das referências. O que o autor escreve é linguagem e um título nu — e o
Docusaurus já entrega título, botão de cópia e quebra de linha.

## Anatomia

**Uma pastilha dentro de um berço.** O contêiner é o berço; o `<pre>` é a
pastilha, e alguns pixels de preenchimento revelam o primeiro em volta do
segundo. O título da cerca, quando existe, fica no berço, separado do código pelo
fio do sistema.

```html
<div class="theme-code-block">     <!-- berço -->
  <div>…título…</div>              <!-- quando a cerca declara title= -->
  <div>
    <pre tabindex="0">…</pre>      <!-- pastilha -->
    <button>…</button>             <!-- copiar, quebrar -->
  </div>
</div>
```

**É o único lugar do site que AFUNDA.** Todo o resto sobe: a escada de elevação é
para superfície que se levanta, e o código é o contra-exemplo declarado.

**Não emite `data-sd-component`** — o DOM não é nosso. O contrato de skin é a
classe estável `.theme-code-block`. Como a skin corporativa engancha na mesma
classe que o nosso CSS, o seletor nosso soma o **tipo do elemento** para vencer a
classe de CSS Module hasheada do upstream sem depender de ordem de carga.

## Variantes

**Não há.** A cerca aceita linguagem e título, e mais nada é provisionado —
provisionar realce, numeração e diff seria construir para ninguém.

A paleta de sintaxe tem sete papéis, e eles são um **papel da camada 2**, não do
componente: `keyword`, `string`, `function`, `constant`, `parameter`, `operator`,
`comment`.

## Autoria em MDX

````markdown
```js title="verificar-assinatura.js"
import {createHmac, timingSafeEqual} from 'node:crypto';
```
````

Linguagem e título. **Linguagem fora do pacote padrão do realçador precisa ser
registrada em `themeConfig.prism.additionalLanguages`** — opção pública, degrau
2. Sem o registro, o bloco sai sem realce e ninguém avisa.

## Tokens consumidos

Camada 2: `--sd-surface-code`, `--sd-surface-card`, `--sd-shadow-ring`,
`--sd-shadow-cast`, `--sd-text-muted`, e os oito `--sd-code-*` da paleta de
sintaxe.

Camada 1: `--sd-border-width`, `--sd-radius-md`, `--sd-type-sm`,
`--sd-weight-ui`, `--sd-leading-code`, `--sd-shadow-sunken`.

Camada 3, declarado no escopo do componente: `--sd-code-berco`, a tinta da
moldura. Ele é a mistura das duas superfícies que o modo já resolveu — um passo
acima da pastilha, um passo abaixo do cartão —, então **nenhum valor novo entra e
ele acompanha a troca de skin sozinho**.

## Light e dark

**Aqui se aplica, e é a primeira das duas exceções do catálogo.**

A paleta de sintaxe **bifurca por modo**: são sete cores por modo, e elas não
derivam de nada — não há raiz no sistema de onde tirar um verde de palavra-chave
a partir da marca. Por isso `code` é o oitavo papel da camada 2 em vez de ser
token de componente: **a camada 2 é o único lugar do sistema onde o modo
diverge**, e enfiar a paleta na camada 3 quebraria esse "exatamente um lugar".

O componente continua não sabendo em que modo está. Quem sabe é a camada 2, e ele
só cita nome.

Um detalhe de mecânica que vale registrado: `--prism-background-color` **não vem
de CSS nenhum** — o Docusaurus a injeta no atributo `style` inline, e nenhum
seletor de folha de estilo vence estilo inline. O ponto de escrita é o shim de
`themeConfig.prism`, que só referencia token e não carrega um único valor de cor.

## Motion / reduced-motion

Herda. O único movimento é o dos botões de cópia e de quebra, que o Docusaurus
anima e que o [contrato de estado de entrada](../foco.md) já corrigiu — o
upstream os declara com `transition: all`, e `outline` é animável, o que deixaria
**o anel de foco ausente por metade da duração depois da tecla**.

## A11y

O `<pre>` é focável e rolável por teclado, e isso vem do Docusaurus.

O anel de foco **muda de dono** neste componente, e é o único lugar do site onde
isso acontece: `outline` é cortado por ancestral que corta, e o `<pre>` preenche a
moldura. A regra está em [`foco.md`](../foco.md), como todo o resto do contrato.

Sob ponteiro grosso, o botão de copiar **fica visível sempre**. Ele é o recurso
mais usado de um bloco de código e o upstream o esconde atrás de hover, onde no
toque ele some sem erro, sem aviso e sem sintoma para quem testa no desktop.

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| Não é swizzle: CSS mais opção pública | **origem própria (correção)** | [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15), corrigindo a rota de swizzle da raiz pela escada da [#14](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/14) |
| Sem numeração, realce, foco, diff nem ícone | herdado | [#4](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/4) — zero usos medidos |
| Pastilha dentro de berço | herdado | [#4](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/4) — anatomia medida |
| O berço como mistura das duas superfícies | **origem própria (implementação)** | mantém o componente cego ao modo e sem valor novo |
| O código afunda | herdado | [#20](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/20) — *tudo sobe, só o código afunda* |
| Paleta de sintaxe na camada 2 | herdado (semeadura autorizada) | [#12](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/12) §9 |
| Shim de config que só referencia token | origem própria | [#11](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/11) §2 |
| `--prism-background-color` só é alcançável pelo shim | **origem própria (correção)** | medido no fonte da versão em uso — estilo inline vence folha de estilo |
| Botão de copiar visível sob ponteiro grosso | herdado | [#28](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/28) §4.2 |
