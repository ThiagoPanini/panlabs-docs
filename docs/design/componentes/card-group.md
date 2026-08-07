# `card-group`

## Papel

Arruma [`card`](card.md) numa grade. **Sem contagem de colunas** — nem prop, nem
media query, nem container query: a contagem de cartões faz o trabalho sozinha.

Uma declaração serve **a landing e o MDX**. Não são duas grades parecidas que
precisam ser mantidas juntas; é a mesma.

## Anatomia

```html
<div data-sd-component="card-group">
  …cartões…
</div>
```

**Zero partes publicadas.** O grupo não tem anatomia interna: ele é uma grade, e
os filhos são o outro componente.

A regra inteira:

```css
display: grid;
gap: var(--sd-space-4);
grid-template-columns: repeat(auto-fit, minmax(min(var(--sd-card-min), 100%), 1fr));
```

`--sd-card-min` é **derivado do limiar da âncora a três colunas** e mora em
[`tokens.md`](../tokens.md), porque a landing também o consome.

**`min(…, 100%)` não é enfeite.** Sem ele, um contêiner menor que o piso estoura
horizontalmente. É uma chamada de função contra um estouro silencioso.

## Variantes

**Não há, e a ausência é o resultado.** A âncora carrega a contagem de colunas
numa prop, usada em 100% dos casos medidos — ninguém confiou no default dela. Com
`auto-fit`, a prop não tem o que fazer: a grade nunca cria mais faixas do que há
itens.

**A fila incompleta fica incompleta.** Nada estica o último cartão para largura
dupla. Essa é a regra decorável que o resto do sistema recusou, e ela ainda
alargaria um cartão pequeno justamente na faixa em que ele já está espremido.

## Autoria em MDX

```mdx
<CardGroup>
<Card title="Pix" icon="zap" href="/docs/meios-de-pagamento/comparativo">
Liquidação em segundos, irreversível.
</Card>
<Card title="Boleto" icon="receipt" href="/docs/meios-de-pagamento/comparativo">
Compensação em dias úteis.
</Card>
</CardGroup>
```

O autor escreve cartões e mais nada. Quantos couberem por fila é consequência da
largura disponível, não decisão dele.

## Tokens consumidos

Camada 1: `--sd-card-min`, `--sd-space-4`, `--sd-space-6`.

Nenhum token de cor: o grupo não pinta nada.

## Light e dark

**Não se aplica.** O grupo não consome cor nenhuma.

## Motion / reduced-motion

**Não se aplica — nada anima.** O que anima na grade é o cartão, e está em
[`card.md`](card.md).

## A11y

Sem foco próprio e sem papel ARIA: uma grade de links é uma lista de links, e o
que o leitor de tela anuncia são os `<a>` dentro dela. O contrato de estado de
entrada mora em [`foco.md`](../foco.md).

**A ordem visual é a ordem do DOM**, em qualquer largura. Não há uma linha de
`order` na grade, e é isso que mantém a leitura de tela igual à leitura de tela
cheia.

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| Colapso direto para uma coluna, sem passo intermediário | herdado | [#28](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/28) §2 — medido na âncora |
| O espaçamento entre cartões e o limiar de três colunas | herdado | [#28](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/28) §2 — medidos |
| `auto-fit` no lugar da container query | **lacuna de medição** | [#28](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/28) — a âncora para em quatro colunas e **nunca julgou este ponto**; reabre se alguém medir uma grade de cinco |
| A fila incompleta fica incompleta | herdado | [#28](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/28) §2 — a âncora não trata a última fila |
| `--sd-card-min` na camada 1 | origem própria | [#28](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/28) — uma declaração serve landing e MDX |
| Zero partes publicadas | origem própria | [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) §5 |
