# `update`

## Papel

Uma entrada de changelog — a data, a versão e o que mudou.

Ele tem consumidor certo neste site: **o conteúdo da documentação não é
versionado, a API é**, por cabeçalho, e o changelog é o **único** lugar onde a
mudança se comunica. Sem este componente, a única via de comunicação de versão do
produto seria prosa solta.

## Anatomia

```html
<section data-sd-component="update">
  <header>
    2026-08-01
    <span data-sd-part="tag">2026-08-01</span>
  </header>
  <div>…o que mudou…</div>
</section>
```

**Uma parte publicada.** O `<header>` e o corpo alcançam por tipo — é o `<header>`
que evita a parte, porque dois `<div>` irmãos precisariam de nome. A etiqueta é
um `<span>` no meio de texto, e ganha nome.

Um fio no topo separa uma entrada da anterior. A data é monoespaçada, como todo
identificador deste sistema.

**Uma coluna, em qualquer largura.** A forma de duas colunas — data à esquerda,
corpo à direita — exigiria uma largura de coluna que a cadeia de proporções não
tem, e inventá-la seria abrir um valor fora do arquivo de tokens para ganhar um
arranjo.

## Variantes

**Não há.** Duas props: `label`, que é a data, e `tag`, que é a etiqueta de
versão e é opcional.

## Autoria em MDX

```mdx
<Update label="2026-08-01" tag="2026-08-01">
`POST /cobrancas` passa a aceitar `referencia_externa`.

Sem quebra: quem não manda o campo continua funcionando.
</Update>
```

O corpo é MDX comum — lista, cerca de código e callout funcionam dentro dele.

## Tokens consumidos

Camada 2: `--sd-border-subtle`, `--sd-surface-wash`, `--sd-text-muted`,
`--sd-text-strong`.

Camada 1: `--sd-space-2`, `--sd-space-3`, `--sd-space-6`, `--sd-border-width`,
`--sd-radius-xs`, `--sd-type-xs`, `--sd-type-sm`, `--sd-font-mono`.

## Light e dark

**Não se aplica.** Consome token semântico e não conhece modo.

## Motion / reduced-motion

**Não se aplica — nada anima.** A entrada aparece com a página e não muda de
estado.

## A11y

Sem foco próprio: a entrada é texto.

`<section>` sem nome acessível **não** vira marco de navegação, e isso é o
comportamento desejado: uma página de changelog com dezenas de marcos seria pior
de navegar, não melhor. O título de seção da página continua sendo o marco.

O contrato de estado de entrada mora em [`foco.md`](../foco.md).

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| Componente do zero | herdado | [#4](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/4) — ausente no Docusaurus, e muito usado numa das referências |
| Ele tem consumidor: o changelog | herdado | [#16](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/16) — versão por cabeçalho, changelog em `Operação` |
| Uma coluna em qualquer largura | **origem própria (implementação)** | duas colunas exigiriam uma largura que a cadeia de proporções da [#20](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/20) não tem |
| Uma parte publicada | origem própria | [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) §5 |
| `<section>` sem nome acessível, de propósito | origem própria | este slice |
