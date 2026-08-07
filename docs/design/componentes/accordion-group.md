# `accordion-group`

## Papel

Empilha [`accordion`](accordion.md) para que uma sequência de perguntas leia como
**um bloco só** em vez de caixas soltas com o espaçamento de bloco da prosa entre
elas.

Ele existe porque a primitiva não tem grupo: o Docusaurus entrega `<details>`, e
a noção de conjunto é nossa.

## Anatomia

```html
<div data-sd-component="accordion-group">
  …sanfonas…
</div>
```

**Zero partes publicadas.** O grupo não tem anatomia interna: ele é uma pilha, e
os filhos são o outro componente.

A pilha é uma coluna com espaçamento próprio, e ela **zera a margem de bloco de
cada sanfona** — sem isso a margem do filho somaria ao espaçamento do pai e a
pilha ficaria mais frouxa do que uma sanfona solta. A regra de contexto usa
`:where()`, que não soma especificidade: o degrau que separa o nosso CSS da skin
corporativa fica de pé mesmo num seletor que fala de dois componentes.

## Variantes

**Não há.** O grupo não tem prop nenhuma, e é assim que a medição o encontrou nas
referências: sempre sem props.

**O grupo não torna a pilha exclusiva.** Abrir um item não fecha os outros — a
decisão é do [`accordion`](accordion.md) e vale igual dentro e fora do grupo.

## Autoria em MDX

```mdx
<AccordionGroup>
<Accordion title="Por que a cobrança expirou sozinha?" icon="clock">
Toda cobrança nasce com `expira_em`.
</Accordion>
<Accordion title="Posso reabrir uma cobrança expirada?">
Não. Crie outra, com a mesma `referencia_externa`.
</Accordion>
</AccordionGroup>
```

## Tokens consumidos

Camada 1: `--sd-space-2`, `--sd-space-6`.

Nenhum token de cor: o grupo não pinta nada.

## Light e dark

**Não se aplica.** O grupo não consome cor nenhuma.

## Motion / reduced-motion

**Não se aplica — nada anima.** O que anima na pilha é a sanfona, e está em
[`accordion.md`](accordion.md).

## A11y

Sem foco próprio e sem papel ARIA: uma pilha de `<details>` é uma sequência de
`<details>`, e não há papel de agrupamento que acrescente informação. O contrato
de estado de entrada mora em [`foco.md`](../foco.md).

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| O grupo existe, e a primitiva não o tem | herdado | [#4](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/4) — *"falta grupo, ícone, descrição"* |
| Sempre sem props | herdado | [#4](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/4) — superfície mínima medida |
| Zero partes publicadas | origem própria | [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) §5 |
| `:where()` na regra de contexto | **origem própria (implementação)** | preserva o degrau de especificidade que a [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) §5 desenhou |
