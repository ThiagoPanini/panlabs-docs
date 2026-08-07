# `steps`

## Papel

A sequência numerada — o que se faz primeiro, depois, depois. É o terceiro
componente em volume na medição, e ele existe porque o Docusaurus não tem
equivalente: uma lista ordenada de Markdown não segura título, corpo em vários
parágrafos e bloco de código dentro de um passo.

## Anatomia

`<ol>` e `<li>`. **A lista ordenada é a numeração**, e é ela que o leitor de tela
anuncia.

```html
<ol data-sd-component="steps">
  <li>
    <span data-sd-part="marker">…</span>   <!-- número, ou ícone -->
    <div>
      <p data-sd-part="title">…</p>
      …
    </div>
  </li>
</ol>
```

**Duas partes publicadas.** O marcador e o título são `<span>` e `<p>` no meio de
outros `<span>` e `<p>`, e nenhum dos dois alcança por tipo.

Um fio liga um marcador ao próximo e **não existe no último passo**: sequência que
termina não aponta para lugar nenhum.

**O contador é declarado, não herdado.** O passo é uma grade de duas colunas, e
um `<li>` que deixa de ser item de lista deixa de incrementar o contador
implícito — o número sumiria em silêncio. Um contador nomeado fecha essa falha.

## Variantes

**Não há variante de lista.** O que varia é o marcador de cada passo, e são dois
estados:

| Marcador | Quando |
| --- | --- |
| número | o default |
| ícone | quando o passo declara `icon` |

**O ícone SUBSTITUI o número, não o acompanha.** A troca é decidida por passo e
não pela lista, então ela é feita pela presença do desenho e não por uma variante
no elemento pai.

## Autoria em MDX

```mdx
<Steps>
<Step title="Pegue uma chave de sandbox">
Ela começa com `tk_test_` e não cobra ninguém.
</Step>
<Step title="Pronto" icon="check">
Os três passos exercitam a API inteira.
</Step>
</Steps>
```

`Steps` não tem prop nenhuma, e `Step` tem duas — `title` e `icon`. A prop de
tamanho de título que a documentação da âncora destaca tem **zero ocorrências**
nas páginas medidas, e por isso não existe aqui.

## Tokens consumidos

Camada 2: `--sd-border-default`, `--sd-border-subtle`, `--sd-text-strong`.

Camada 1: `--sd-space-4`, `--sd-space-6`, `--sd-border-width`,
`--sd-radius-full`, `--sd-type-xs`, `--sd-weight-ui`, `--sd-leading-ui`.

Camada 3, declarado no escopo do componente: `--sd-step-marker`, o diâmetro do
marcador — que é também a coluna da grade e o ponto onde o fio começa. Um valor,
três consumidores.

## Light e dark

**Não se aplica.** Consome token semântico e não conhece modo.

## Motion / reduced-motion

**Não se aplica — nada anima.** Os passos aparecem com a página e não mudam de
estado.

## A11y

Sem foco próprio: não há elemento focável a menos que o autor escreva um link
dentro de um passo, e aí o contrato universal de [`foco.md`](../foco.md) o
alcança.

A numeração é semântica, não pintada: `<ol>` é anunciado como lista ordenada com
a contagem. O ícone que substitui o número é decorativo e sai da árvore de
acessibilidade — a posição do item já é anunciada pela lista.

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| Componente do zero | herdado | [#4](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/4) — ausente no Docusaurus |
| `Steps` sem props, `Step` só com `title` | herdado | [#4](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/4) — superfície mínima medida |
| Ícone substitui o número | herdado | [#21](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/21) §8 |
| `<ol>`/`<li>` como substrato | origem própria | [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) §6 |
| Contador nomeado em vez do implícito | **origem própria (implementação)** | um `<li>` que não é item de lista não incrementa o contador, e a falha seria muda |
| O fio não existe no último passo | origem própria | este slice |
| Duas partes publicadas | origem própria | [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) §5 |
