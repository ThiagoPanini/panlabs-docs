# `param-field`

## Papel

Um **parâmetro de requisição** — nome, tipo, obrigatoriedade, valor padrão e
descrição. É o vocabulário da Referência da API, e o autor o usa dentro de MDX
comum, não só em página de endpoint.

## Anatomia

```html
<div data-sd-component="param-field">
  <p>
    <code>…</code>                          <!-- alcançável por tipo -->
    <span data-sd-part="meta">
      tipo · padrão <code>…</code>
      <strong>obrigatório</strong>          <!-- alcançável por tipo -->
    </span>
  </p>
  <div>…descrição, e o aninhamento…</div>
</div>
```

**Uma parte publicada.** O nome é `<code>`, o chip é `<strong>` dentro da meta, e
os dois alcançam por tipo. A meta é um `<span>` sem nada que a distinga, e ganha
nome.

O aninhamento é [`expandable`](expandable.md), e a recursão dele é o autor
escrevendo outro campo dentro do primeiro. **Nada disso custa JavaScript.**

`param-field` e [`response-field`](response-field.md) **compartilham a
implementação** com uma prop de espécie — duplicar a anatomia inteira para ganhar
duas props é como se acumula divergência visual entre irmãos. Continuam sendo
dois componentes autoráveis e dois arquivos de spec: o gabarito é por tag, não
por arquivo de código.

## Variantes

Uma, e ela é de estado do contrato, não de aparência:

| Variante | O que muda |
| --- | --- |
| — | o default |
| `deprecated` | o nome fica tachado e apagado |

**Só `required` se marca.** Todo parâmetro é uma de duas coisas; marcar as duas
dobra os chips e divide por dois a saliência do que importa. A ausência é o
sinal de opcional.

**`deprecated` não abre cor nova.** Âmbar já é `PUT` e vermelho já é `DELETE` na
mesma página de referência, e um terceiro significado sobre o mesmo matiz é
ambiguidade. Tachado mais texto apagado é inequívoco e custa zero token.

**O chip de obrigatório também não usa cor de estado**, pelo mesmo motivo. Sendo
o único chip do campo, a saliência vem de ser o único.

## Autoria em MDX

```mdx
<ParamField name="valor" type="integer" required>
O valor em centavos. Sempre inteiro.
</ParamField>

<ParamField name="moeda" type="string" default="BRL">
Hoje só `BRL`. O campo existe para o dia em que não for.
</ParamField>

<ParamField name="pagamento" type="object">
Os dados do meio escolhido.

<Expandable title="objeto pagamento" defaultOpen>

<ParamField name="cartao.parcelas" type="integer" default="1">
De 1 a 12.
</ParamField>

</Expandable>
</ParamField>
```

## Tokens consumidos

Camada 2: `--sd-border-subtle`, `--sd-text-body`, `--sd-text-muted`,
`--sd-text-strong`.

Camada 1: `--sd-space-1`, `--sd-space-2`, `--sd-space-4`, `--sd-border-width`,
`--sd-radius-xs`, `--sd-type-xs`, `--sd-type-sm`, `--sd-font-mono`,
`--sd-weight-ui`.

## Light e dark

**Não se aplica.** Consome token semântico e não conhece modo.

## Motion / reduced-motion

**Não se aplica ao campo — nada anima nele.** O que anima é o aninhamento, e está
em [`expandable.md`](expandable.md).

## A11y

Sem foco próprio: o campo é texto. O que é focável é o `<summary>` do
aninhamento, e ele é do outro componente.

**Este componente não tem campo editável, e isso é decisão registrada.** A
edição de valores que a Referência da API oferece mora no painel da rota, não
aqui — pôr estado de React no catálogo furaria a regra de zero JS e acoplaria o
componente ao layout de uma rota.

O contrato de estado de entrada mora em [`foco.md`](../foco.md).

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| Componente do zero | herdado | [#4](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/4) — ausente no Docusaurus |
| Só `required` se marca | herdado | [#18](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/18) §7.2 — `optional` não existe na âncora |
| `deprecated` tachado, sem cor nova | origem própria | [#18](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/18) §7.2 |
| Chip de obrigatório sem cor de estado | **origem própria (implementação)** | âmbar e vermelho já estão gastos na mesma página pela pílula de verbo |
| Aninhamento por `<details>`, zero JS | herdado | [#18](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/18) e [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) §6 |
| Implementação compartilhada com `response-field` | herdado | [#18](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/18) §8, nota de implementação |
| Sem campo editável | herdado | [#18](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/18) §4 — a interatividade fica no painel da rota |
| Uma parte publicada | herdado | [#18](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/18) §8, sobre a régua da [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) §5 |
