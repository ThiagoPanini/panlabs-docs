# `card-group`

## Papel

Arruma [`card`](card.md) numa grade. **Sem contagem de colunas** — nem prop, nem
media query, nem container query: a contagem de cartões faz o trabalho sozinha.

Uma declaração serve **a landing e o MDX**. Não são duas grades parecidas que
precisam ser mantidas juntas; é a mesma.

**O nome fica `CardGroup`, e a âncora hoje chama isto de `Columns`.** Ela
deprecou o nome antigo em favor do novo, e o shinydoc **não segue** — por razão
de contrato, não de gosto: `Columns` é nomeado pela **contagem de colunas**, que
é exatamente a prop que este componente recusa ter. Adotar o nome sem a prop
seria publicar na autoria um contrato que a implementação não honra, e o autor
que escrevesse `<Columns cols={3}>` levaria um erro de prop desconhecida em vez
da resposta que o nome prometeu.

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
grid-template-columns: var(--sd-card-grid);
```

**A lista de faixas mora em [`tokens.md`](../tokens.md), não aqui**, e é isso que
torna literal a frase *uma declaração serve a landing e o MDX*: as duas citam o
mesmo nome em vez de repetir a mesma lista. Ela é
`repeat(auto-fit, minmax(min(var(--sd-card-min), 100%), 1fr))`, e `--sd-card-min`
é **derivado do limiar da âncora a três colunas**.

**`min(…, 100%)` não é enfeite.** Sem ele, um contêiner menor que o piso estoura
horizontalmente. É uma chamada de função contra um estouro silencioso.

### Como `auto-fit` se comporta, inteiro

A meia descrição — *"nunca cria mais faixas do que há itens"* — é o que esconde o
caso. O mecanismo completo: ele calcula quantas faixas cabem e **colapsa as que
ficam vazias**.

| Cartões × faixas que cabem | O que acontece |
| --- | --- |
| menos cartões que faixas | as faixas vazias somem e os cartões **esticam** para preencher a linha |
| mais cartões que faixas | a última fila fica com o que sobrou e **não** estica |

O primeiro caso é o comportamento medido da âncora — três cartões num contêiner
de cinco faixas leem como três cartões largos, não como três cartões apertados à
esquerda. O segundo é a **fila incompleta**, e é dele que a regra abaixo fala.

## Variantes

**Não há, e a ausência é o resultado.** A âncora carrega a contagem de colunas
numa prop, usada em 100% dos casos medidos — ninguém confiou no default dela. Com
`auto-fit`, a prop não tem o que fazer: a grade nunca cria mais faixas do que há
itens.

**A fila incompleta fica incompleta.** Numa grade de várias filas, nada estica o
cartão que sobra na última para largura dupla. Essa é a regra decorável que o
resto do sistema recusou, e ela ainda alargaria um cartão pequeno justamente na
faixa em que ele já está espremido.

## Autoria em MDX

```mdx
<CardGroup>
<Card title="Instalação e configuração" icon="download" href="instalacao-e-configuracao">
As opções, o arquivo de configuração e a adoção em projeto existente.
</Card>
<Card title="Tratamento de erros" icon="circle-alert" href="tratamento-de-erros">
Por que a geração falha alto, e como ler o ponteiro do erro.
</Card>
</CardGroup>
```

O autor escreve cartões e mais nada. Quantos couberem por fila é consequência da
largura disponível, não decisão dele.

## Tokens consumidos

Camada 1: `--sd-card-grid`, `--sd-card-min`, `--sd-space-4`, `--sd-space-6`.

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
| `--sd-card-min` na camada 1 | origem própria | [#28](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/28) — o piso é derivado e compartilhado |
| A lista de faixas também na camada 1, como `--sd-card-grid` | **origem própria (implementação)** | *"uma declaração serve a landing e o MDX"* só é conferível se a declaração morar num lugar que as duas citem; o precedente é a escada de elevação, que é valor composto pelo mesmo motivo |
| Zero partes publicadas | origem própria | [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) §5 |
| O nome `CardGroup` fica, com a âncora já em `Columns` | **origem própria** | [#60](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/60) — `Columns` é nomeado pela contagem de colunas que este componente recusa ter; adotar o nome sem a prop publicaria um contrato que a implementação não honra |
