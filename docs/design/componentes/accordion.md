# `accordion`

> **Nenhum valor numérico nasce neste documento.** Os comprimentos que o componente consome moram em [`../tokens.md`](../tokens.md) e são citados por nome de token. Os números do bloco *Alvo medido*, dentro de `## Anatomia`, são **evidência de medição da âncora** — dizem o que se quer atingir, não o que temos, e quem os edita está afirmando que a âncora mudou.

## Papel

Dobra um trecho atrás de um título. É o componente mais usado de uma das
referências medidas, e serve o caso em que a resposta é longa e a pergunta é
curta — pergunta frequente, detalhe opcional, exceção que só interessa a quem
esbarrou nela.

## Anatomia

`<details>` e `<summary>` nativos, dentro de uma moldura com fio e raio.

```html
<details data-sd-component="accordion" open>
  <summary>                                  <!-- alcançável por tipo -->
    <svg …>                                  <!-- alcançável por tipo -->
    <span data-sd-part="title">…</span>
    <span data-sd-part="description">…</span>
  </summary>
  <div>…</div>                               <!-- único div filho de details -->
</details>
```

**Duas partes publicadas.** Título e descrição são dois `<span>` irmãos: nenhum
dos dois se distingue do outro por tipo, e os dois precisam de nome. O `<summary>`
e o corpo alcançam por tipo, e o ícone do autor é o único `<svg>` do cabeçalho.

**O caret é uma máscara, não um segundo `<svg>`.** Com dois SVG irmãos dentro do
mesmo `<summary>`, o seletor por tipo deixaria de alcançar o ícone do autor, e o
contrato de partes teria que crescer para pagar uma escolha de implementação. O
desenho é o mesmo do caret de categoria da sidebar — um desenho, dois estados,
rotacionado quando aberto.

**Estado não vira atributo.** `[open]` já está no DOM porque o elemento é nativo,
e duplicá-lo num `data-sd-state` criaria duas fontes de verdade.

**Alvo medido**, do `docs.devin.ai` a 1512, em `research/paridade-devin` §11.
Sem espécime publicado no catálogo de conteúdo, `npm run paridade` ainda não
mede este componente — a tabela é o alvo para quando um exemplo entrar.

| Sonda | Alvo | Tolerância |
| --- | --- | --- |
| Raio | `16px` | avaliação visual |
| Marcador | glifo trocado, ▶ fechado → ▼ aberto | avaliação visual |
| Fundo, aberto vs. fechado | idêntico | avaliação visual |

**Fundo aberto e fechado são idênticos** — nenhuma regra desta folha muda o
fundo em `[open]`. **Hover no sumário muda só o fundo**, para
`--sd-border-subtle` — o mesmo papel que sidebar e dropdown já usam para hover.

**O marcador continua a girar o mesmo SVG do caret de sidebar, e não ganha um
segundo arquivo.** `chevron-right` é um desenho, dois estados
([`icones.md`](../icones.md) §4). O alvo mede `troca de glifo, não rotação`;
a resposta aqui foi tirar a transição, não o desenho — sem giro visível, o
salto entre os dois estados finais chega ao mesmo pixel que uma troca de
glifo produziria, e bifurcar o ícone custaria um segundo arquivo vendorizado
por uma diferença que some no resultado.

## Variantes

**Não há.** O accordion tem quatro props e nenhuma delas troca desenho: `title`
(obrigatório), `icon`, `description` e `defaultOpen`.

`defaultOpen` não é variante: é o estado inicial de um elemento que o leitor
controla a partir do primeiro clique.

**Não usamos accordion exclusivo.** O atributo `name` do `<details>` daria isso
de graça, e fica registrado que não custa nada — mas em documentação o leitor
compara itens, e fechar o que ele abriu é hostil.

## Autoria em MDX

```mdx
<Accordion title="Por que a cobrança expirou sozinha?" icon="clock">
Toda cobrança nasce com `expira_em`.

:::tip
Uma admonition dentro de um componente funciona, com linha em branco em volta.
:::
</Accordion>

<Accordion title="O que já vem aberto" defaultOpen>
Um accordion pode nascer aberto.
</Accordion>
```

## Tokens consumidos

Camada 2: `--sd-border-default`, `--sd-border-subtle`, `--sd-text-strong`,
`--sd-text-muted`.

Camada 1: `--sd-space-2`, `--sd-space-3`, `--sd-space-4`, `--sd-border-width`,
`--sd-radius`, `--sd-type-sm`, `--sd-weight-ui`, `--sd-weight-body`,
`--sd-leading-ui`, `--sd-move-expand`.

## Light e dark

**Não se aplica.** Consome token semântico e não conhece modo.

## Motion / reduced-motion

`--sd-move-expand`, em duas coisas: a altura do conteúdo e a rotação do caret.

A altura anima por `::details-content` com `interpolate-size: allow-keywords`,
que mora em `:root` junto do vocabulário e **serve todos os componentes de
`<details>` de uma vez**. É esse mecanismo que tornou obsoleto o motivo histórico
de reimplementar disclosure em React.

Onde o navegador ainda não tem `::details-content`, a abertura é instantânea —
degradação para o lado certo, porque o conteúdo sempre aparece.

Herda o resto: as durações encurtam na camada de token, e o componente não
escreve `@media (prefers-reduced-motion)`.

## A11y

**O navegador é a especificação.** Que tecla abre, que tecla fecha, o que recebe
foco na abertura, o que o leitor de tela anuncia e onde vai `aria-expanded` são
responsabilidade dele. Não há um `keydown` escrito aqui — e um `<div onClick>`
seria pixel a pixel idêntico para quem não usa teclado, que é o modo de falhar
invisível que essa escolha fecha.

Três coisas caem de graça: **âncora de URL abre o `<details>` ancestral sozinha**
(comportamento de especificação), busca na página alcança o conteúdo, e o
`<summary>` já é focável e operável por Enter e Espaço.

O anel de foco e o piso de alvo de toque são universais e moram em
[`foco.md`](../foco.md).

O ícone do autor é decorativo; o caret é máscara e não existe na árvore de
acessibilidade.

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| `<details>` nativo, zero JS | origem própria | [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) §6 |
| Grupo, ícone e descrição sobre a primitiva | herdado | [#4](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/4) — o Docusaurus tem a primitiva e não tem o resto |
| Âncora de URL sem código | herdado | comportamento de especificação, registrado pela [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) §6 |
| Sem accordion exclusivo | origem própria | [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) §6 |
| Animação por `::details-content` | origem própria | [#17](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/17), consumida pela [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) §6 |
| Caret por máscara em vez de segundo `<svg>` | **origem própria (implementação)** | dois SVG irmãos quebrariam o alcance por tipo e obrigariam a publicar mais uma parte |
| Duas partes publicadas | origem própria | [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) §5 |
| Raio 16, e fundo idêntico aberto/fechado | herdado | [#100](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/100) — `research/paridade-devin` §11 |
| Hover no sumário, com `--sd-border-subtle` | herdado | [#100](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/100) — `research/paridade-devin` §11 |
| Marcador sem transição de rotação, e não um segundo glifo | **origem própria (consequência)** | [#100](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/100) — o alvo mede troca de glifo; `chevron-right` é um desenho, dois estados, partilhado com a sidebar ([`icones.md`](../icones.md) §4), e bifurcar o ícone não se paga para uma diferença que some no pixel final. **Recarimbada em S9-2:** era `delta deliberado`, e [`principios.md`](../principios.md) §3 declara essa classe **fechada em zero**. O valor não é escolha contra a âncora — ele cai do orçamento de ícones que `icones.md` §5 já fecha, que é a definição de `(consequência)` em §5.1 |
