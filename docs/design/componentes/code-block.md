# `code-block`

> **Nenhum valor numérico nasce neste documento.** Os comprimentos que o componente consome moram em [`../tokens.md`](../tokens.md) e são citados por nome de token. Os números do bloco *Alvo medido*, dentro de `## Anatomia`, são **evidência de medição da âncora** — dizem o que se quer atingir, não o que temos, e quem os edita está afirmando que a âncora mudou.

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

**Um objeto preenchido, um passo acima da página, com fio e sem sombra.** O
contêiner inteiro é `--sd-surface-code`; o título da cerca, quando existe, fica
dentro dele, separado do código pelo fio do sistema.

```html
<div class="theme-code-block">     <!-- o objeto inteiro, preenchido -->
  <div>…título…</div>              <!-- quando a cerca declara title= -->
  <div>
    <pre tabindex="0">…</pre>      <!-- mesma tinta, sem moldura em volta -->
    <button>…</button>             <!-- copiar, quebrar -->
  </div>
</div>
```

**O berço morreu com o cartão, e a regra ficou simétrica.** A anatomia medida era
uma pastilha dentro de uma moldura de outra tinta — e a moldura era o cartão
aparecendo em volta. Sem cartão não há de onde tirar a segunda tinta, e a
superfície do código passa a ser **um passo acima da página nos dois modos**. Ela
era *igual* à página no escuro e *acima* dela no claro; a assimetria só se
sustentava com o cartão no meio.

**Nada afunda.** A escada de elevação era para superfície que se levanta, e o
código era o contra-exemplo declarado — mas afundar era relativo ao cartão, e
sem ele o contra-exemplo perde contra o quê ser exemplo.

**Não emite `data-sd-component`** — o DOM não é nosso. O contrato de skin é a
classe estável `.theme-code-block`. Como a skin corporativa engancha na mesma
classe que o nosso CSS, o seletor nosso soma o **tipo do elemento** para vencer a
classe de CSS Module hasheada do upstream sem depender de ordem de carga.

**O preenchimento sai de graça, e a regra escrita vale mais que a economia:**
`CodeBlock/Container` declara `background: var(--prism-background-color)`, e o
shim de `themeConfig.prism` aponta essa variável para `--sd-surface-code`. O
nosso CSS declara **só o fio e o raio**.

**A separação foi medida, e é o número que o defeito produzia que importa:** o
bloco contra a página dá **1,113:1** no escuro e **1,147:1** no claro. Antes
desta mudança a célula do escuro era **1,000:1** — não "pouco contraste", e sim
a mesma cor, duas vezes. É literalmente o defeito do Infima que este projeto
nomeou.

> **Dissenso registrado, herdado da [#56](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/56).**
> O berço era **anatomia medida** das referências, e morre por argumento de
> arquitetura. A parada 900 é o degrau imediatamente acima na rampa — a única
> derivação honesta disponível, e **não uma medida**. Se ao vivo o bloco ficar
> pesado no escuro, o ajuste é uma linha no arquivo de tokens.

**Alvo medido**, do `docs.devin.ai` a 1512, em `research/paridade-devin` §11.

| Sonda | Alvo | Tolerância |
| --- | --- | --- |
| Raio, sozinho | `16px` | avaliação visual |
| Raio, dentro de [`code-group`](code-group.md) | `14px` | avaliação visual |
| Botões (copiar, quebrar) | absolutos, `top:12px right:16px` | avaliação visual |

**Sozinho, o bloco tem raio 16 e fio próprio — o mesmo par de qualquer objeto
preenchido do catálogo.** Dentro de um `code-group`, os dois mudam de dono: a
casca já tem fio e raio 16, e o bloco por dentro perde a borda própria e
estreita o raio para `16px` menos duas larguras de fio — 2px adiantado em
relação à casca, para revelar a moldura em vez de encostar nela. O seletor que
faz a distinção é `[data-sd-component="code-group"] div.theme-code-block`, em
`componentes.css`.

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

Camada 2: `--sd-surface-code`, `--sd-border-subtle`, `--sd-text-muted`, e os oito
`--sd-code-*` da paleta de sintaxe.

Camada 1: `--sd-border-width`, `--sd-radius`, `--sd-type-sm`,
`--sd-weight-ui`, `--sd-leading-code`.

**Camada 3: nenhum.** Este componente declarava `--sd-code-berco`, a tinta da
moldura, e ela morreu com o cartão de que era mistura. Nenhum token de escopo
sobrou.

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
| ~~Pastilha dentro de berço~~ · **objeto preenchido um passo acima da página** | **origem própria (implementação)** | [#56](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/56) — a moldura era o cartão aparecendo em volta, e com ele morreram a segunda tinta e o `--sd-code-berco` que a produzia |
| A superfície do código sobe para a parada 900 no escuro | **origem própria (implementação)** | [#56](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/56) — ela era o **mesmo valor** de `--sd-surface-page`, e o bloco sumia contra a página no modo canônico |
| ~~O código afunda~~ · **nada afunda** | **origem própria (implementação)** | [#56](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/56) — afundar era relativo ao cartão; `--sd-shadow-sunken` morreu junto |
| Paleta de sintaxe na camada 2 | herdado | [#12](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/12) §9 |
| Shim de config que só referencia token | origem própria | [#11](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/11) §2 |
| `--prism-background-color` só é alcançável pelo shim | **origem própria (correção)** | medido no fonte da versão em uso — estilo inline vence folha de estilo |
| Botão de copiar visível sob ponteiro grosso | herdado | [#28](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/28) §4.2 |
| Raio 16 sozinho, 14 dentro do grupo | herdado | [#100](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/100) — `research/paridade-devin` §11; a versão anterior cravava `--sd-radius-md` (12px) nos dois contextos, sem distinguir |
