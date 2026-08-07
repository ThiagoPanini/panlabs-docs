# `response-field`

## Papel

Um **campo de resposta** — o que a API devolve. Mesma informação que
[`param-field`](param-field.md) vista do outro lado da chamada, e por isso mesma
anatomia.

Ele é **recursivo**: um campo de objeto contém outros campos, que contêm outros.
A medição encontrou aninhamento de até quatro níveis, e quatro é o teto do
sistema.

## Anatomia

Idêntica à de [`param-field`](param-field.md), com uma diferença: o valor de
`data-sd-component`.

```html
<div data-sd-component="response-field">
  <p>
    <code>…</code>
    <span data-sd-part="meta">…</span>
  </p>
  <div>…descrição, e a recursão…</div>
</div>
```

**Uma parte publicada**, a mesma e pelo mesmo motivo.

**A recursão não custa JavaScript.** Ela é o autor escrevendo um campo dentro de
um [`expandable`](expandable.md) dentro de outro campo, e o `<details>` nativo é
quem dobra cada nível.

Os dois compartilham a implementação com uma prop de espécie. Duas anatomias
paralelas para a mesma informação é como se acumula divergência visual entre
irmãos.

## Variantes

As mesmas de [`param-field`](param-field.md): o default e `deprecated`.

**Nada de obrigatoriedade tem leitura aqui.** Um campo de resposta não é
obrigatório nem opcional — ou a API o devolve, ou não. O componente aceita a
prop porque a implementação é compartilhada, e o gabarito de página de endpoint
não a usa nesta espécie.

## Autoria em MDX

```mdx
<ResponseField name="id" type="string">
O identificador da cobrança, com prefixo `cob_`.
</ResponseField>

<ResponseField name="eventos" type="array de object">
O histórico imutável do que aconteceu.

<Expandable title="objeto evento">

<ResponseField name="tipo" type="string">
O nome do evento, como `cobranca.paga`.
</ResponseField>

</Expandable>
</ResponseField>
```

## Tokens consumidos

Os mesmos de [`param-field`](param-field.md) — camada 2: `--sd-border-subtle`,
`--sd-text-body`, `--sd-text-muted`, `--sd-text-strong`; camada 1:
`--sd-space-1`, `--sd-space-2`, `--sd-space-4`, `--sd-border-width`,
`--sd-radius-xs`, `--sd-type-xs`, `--sd-type-sm`, `--sd-font-mono`,
`--sd-weight-ui`.

## Light e dark

**Não se aplica.** Consome token semântico e não conhece modo.

## Motion / reduced-motion

**Não se aplica ao campo — nada anima nele.** O que anima é a recursão, e está em
[`expandable.md`](expandable.md).

## A11y

Sem foco próprio: o campo é texto. O contrato de estado de entrada mora em
[`foco.md`](../foco.md).

**Ele nunca alimentou playground, e isso deixou de ser assimetria**: a edição de
valores da Referência da API mora no painel da rota, então nem este nem
[`param-field`](param-field.md) carregam estado.

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| Componente do zero, recursivo | herdado | [#4](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/4) — *"`ResponseField` é recursivo"* |
| Teto de quatro níveis de aninhamento | delta deliberado | [#18](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/18) §5 — três é o limite medido; a fixture do conteúdo precisa de quatro |
| Recursão sem JavaScript | herdado | [#18](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/18) e [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) §6 |
| Implementação compartilhada com `param-field` | herdado | [#18](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/18) §8, nota de implementação |
| Sem campo editável | herdado | [#18](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/18) §4 |
| Uma parte publicada | herdado | [#18](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/18) §8, sobre a régua da [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) §5 |
