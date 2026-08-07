# `frame`

## Papel

Enquadra um **diagrama** e o legenda.

A decisão de conteúdo vem antes da de anatomia, e ela é o que torna este
componente possível: **um produto fictício não tem interface para fotografar**, e
screenshot de produto que não existe seria o artefato mais caro e mais falso do
repositório. O que a moldura enquadra é fluxo de API, ciclo de vida de webhook,
modelo de dados.

Isso **encolhe** o componente. O fundo quadriculado da âncora existe para
enquadrar imagem com transparência; enquadrando diagrama, essa camada perde a
razão de ser e sobra borda mais legenda.

## Anatomia

```html
<figure data-sd-component="frame">
  <div>…o diagrama…</div>            <!-- único div filho de figure -->
  <figcaption>…</figcaption>         <!-- alcançável por tipo -->
</figure>
```

**Zero partes publicadas.** `<figure>`, `<figcaption>` e o único `<div>` filho
alcançam todos por tipo de elemento — é o componente que melhor exemplifica por
que o contrato é estreito.

O palco centra o desenho e **declara a tinta** que ele herda.

## Variantes

**Não há.** Uma prop, `caption`, e ela é opcional — moldura sem legenda continua
sendo moldura.

## Autoria em MDX

```mdx
<Frame caption="O ciclo de vida de uma cobrança em Pix, do POST à liquidação.">
<svg viewBox="0 0 520 88" role="img" aria-label="Fluxo em três estados">
  …traçado com stroke="currentColor"…
</svg>
</Frame>
```

## Tokens consumidos

Camada 2: `--sd-border-default`, `--sd-surface-page`, `--sd-text-body`,
`--sd-text-muted`.

Camada 1: `--sd-space-2`, `--sd-space-6`, `--sd-border-width`,
`--sd-radius-md`, `--sd-type-sm`.

## Light e dark

**Aqui se aplica, e é a segunda das duas exceções do catálogo.**

Ela não é sobre o componente: é sobre **o que ele enquadra**. Um diagrama é um
artefato, e artefato precisa funcionar nos dois modos.

> **A regra: diagrama é SVG usando `currentColor`, nunca cor assada. Um arquivo
> por diagrama, não um por modo.**

O que o componente faz para sustentar a regra é uma linha: o palco declara
`color`, e o desenho herda. É por isso que a exceção aparece aqui e não some — se
o palco não declarasse tinta, um diagrama correto ainda dependeria de o autor
lembrar de herdar de algum lugar.

Fundo do palco é a superfície de página, que já bifurcou na camada 2. O
componente continua não sabendo em que modo está.

## Motion / reduced-motion

**Não se aplica — nada anima.** A moldura aparece com a página e não muda de
estado.

## A11y

Sem foco próprio: não há elemento focável.

`<figure>` e `<figcaption>` são a associação semântica entre desenho e legenda, e
é por isso que o componente usa os dois em vez de dois `<div>`.

**O nome acessível do diagrama é responsabilidade do desenho, não da moldura.** A
legenda descreve; ela não substitui `role="img"` mais rótulo no SVG. O contrato
de estado de entrada mora em [`foco.md`](../foco.md).

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| A moldura entra no catálogo | herdado | [#4](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/4) — o componente mais usado de uma das referências |
| Enquadra diagrama e não screenshot | origem própria | [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) §3 |
| Sem fundo quadriculado | **origem própria (consequência)** | ele existe para imagem com transparência, que não é o caso |
| Diagrama é SVG com `currentColor`, um arquivo para os dois modos | origem própria | [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) §7 — exceção criada pela decisão acima |
| Zero partes publicadas | origem própria | [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) §5 |
| **Como o diagrama chega ao MDX** — asset registrado ou marcação inline | **lacuna** | a linguagem visual de diagrama segue na névoa pela [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15); este slice trava a moldura e a regra de `currentColor`, não o formato de entrega |
