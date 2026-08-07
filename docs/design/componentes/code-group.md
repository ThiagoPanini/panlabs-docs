# `code-group`

## Papel

O mesmo trecho em várias linguagens, numa caixa de abas. É o que resolve a página
de referência que precisa mostrar cURL, Python e JavaScript sem triplicar o
comprimento da página.

Ele **compõe** o [`tabs`](tabs.md); não swizzla nada.

## Anatomia

O autor escreve cercas de código com título, como escreveria fora do grupo. O
componente lê o título de cada cerca, monta as abas, e **remove o título do
bloco** — mantê-lo desenharia a mesma palavra duas vezes, na aba e na moldura.

```html
<div data-sd-component="code-group">
  <ul role="tablist">…</ul>            <!-- do Docusaurus -->
  <div>
    <div class="theme-code-block">…</div>
  </div>
</div>
```

**Zero partes publicadas.** O grupo é uma moldura em volta de duas coisas que já
têm contrato próprio: o [`tabs`](tabs.md) e o [`code-block`](code-block.md).

O rótulo da aba é o título da cerca; na falta dele, a linguagem; na falta das
duas, a posição. **Nunca vazio** — aba sem nome é aba que não se clica de novo.

## Variantes

**Não há.** Duas props, e as duas existem para o mesmo fim: `groupId` faz a
linguagem escolhida seguir o leitor entre páginas, e `queryString` põe a escolha
na URL.

**Abas e não dropdown**, e a escolha não é de gosto: a medição mostrou que a
forma é função da contagem — dropdown quando há muitas linguagens, abas quando há
poucas. A contagem de linguagens do projeto é pequena por decisão de contrato,
então **o problema de interface virou regra de contrato e o dropdown não precisa
existir**.

## Autoria em MDX

````mdx
<CodeGroup>

```js title="Node"
const cobranca = await trilho.cobrancas.criar({valor: 1000, meio: 'pix'});
```

```python title="Python"
cobranca = trilho.cobrancas.criar(valor=1000, meio="pix")
```

</CodeGroup>
````

As linhas em branco em volta de cada cerca são obrigatórias — é assim que o MDX
separa bloco de bloco dentro de um componente.

## Tokens consumidos

Camada 1: `--sd-space-6`.

Todo o resto é dos dois componentes que ele compõe: [`tabs`](tabs.md) para a
régua de abas, [`code-block`](code-block.md) para a moldura de código.

## Light e dark

**Não se aplica.** O grupo não consome cor nenhuma; quem conhece modo é o
[`code-block`](code-block.md), e o que ele conhece está escrito lá.

## Motion / reduced-motion

**Não se aplica ao grupo — nada anima nele.** O que anima é a régua de abas, e
está em [`tabs.md`](tabs.md).

## A11y

Sem foco próprio e sem ARIA próprio: o `role="tablist"`, o `aria-selected` e o
`tabindex` roving vêm do Docusaurus, e o `<pre>` focável vem do bloco de código. O
contrato de estado de entrada mora em [`foco.md`](../foco.md).

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| Compõe `Tabs` em vez de swizzlar | herdado | [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) §3 |
| Abas e não dropdown | herdado | [#6](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/6) — a forma é função da contagem; [#18](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/18) §8 transforma isso em regra de contrato |
| `groupId` e `queryString` | herdado | [#18](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/18) §8 |
| O título sai da moldura e vira rótulo de aba | herdado | [#4](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/4) — anatomia medida |
| Rótulo nunca vazio, com dois fallbacks | **origem própria (implementação)** | aba sem nome não é reclicável |
| Zero partes publicadas | origem própria | [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) §5 |
