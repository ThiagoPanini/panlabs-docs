# `untranslated`

## Papel

Sinaliza, no topo de uma página, que **ela ainda não foi traduzida** e que o
conteúdo abaixo está no idioma de origem.

Ele existe porque a tradução deste site é **parcial por decisão**: o segundo
locale cobre orientar-se e consultar; o primeiro cobre também executar no mercado
local. Sem sinalização, a página sem contraparte é gerada em silêncio, com o
texto no idioma errado, sem aviso e sem relatório — e **uma spec que nunca
exercita esse estado não decidiu nada sobre ele; só não esbarrou nele**.

## Anatomia

```html
<aside data-sd-component="untranslated">
  <svg …>                            <!-- alcançável por tipo -->
  <p>…</p>                           <!-- alcançável por tipo -->
</aside>
```

**Zero partes publicadas.** `<aside>`, o ícone e o parágrafo alcançam todos por
tipo de elemento.

**Deliberadamente a mesma anatomia do [`callout`](callout.md) neutro.** O
marcador é um aviso de sistema, e um aviso que inventa forma própria é mais um
vocabulário para o leitor aprender.

**No locale de origem ele não deixa rastro no DOM** — não é um elemento
escondido, é um elemento que não existe. É por isso que o autor pode escrevê-lo
sem pensar em qual locale está lendo.

## Variantes

**Não há.** Nenhuma prop. Ele lê o locale corrente do contexto e decide sozinho.

## Autoria em MDX

```mdx
# Visão geral

<Untranslated />

O Trilho é uma API de pagamentos brasileira.
```

Uma tag auto-fechada, logo abaixo do título. O texto que ele renderiza **sai da
camada de i18n**, então ele aparece no idioma de quem está lendo — que é o único
idioma em que o aviso serve para alguma coisa.

**A mecânica se resolve sozinha**, porque a tradução substitui o arquivo inteiro:
o marcador aparece exatamente enquanto não houver contraparte, e some no instante
em que houver. **Sem lista para manter, sem flag, sem divergência possível.**

## Tokens consumidos

Camada 2: `--sd-border-default`, `--sd-border-subtle`, `--sd-text-muted`.

Camada 1: `--sd-space-3`, `--sd-space-4`, `--sd-space-6`, `--sd-border-width`,
`--sd-radius-md`, `--sd-type-sm`.

## Light e dark

**Não se aplica.** Consome token semântico e não conhece modo.

## Motion / reduced-motion

**Não se aplica — nada anima.** O marcador aparece com a página e não muda de
estado.

## A11y

Sem foco próprio: não há elemento focável.

`<aside>` é o elemento certo para conteúdo tangencial ao da página, e sem nome
acessível ele **não** vira marco de navegação — o que está certo aqui, porque um
aviso de uma frase não merece competir com o conteúdo na lista de marcos.

O ícone é decorativo e sai da árvore de acessibilidade; a frase carrega o
significado inteiro. O contrato de estado de entrada mora em
[`foco.md`](../foco.md).

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| O componente existe, e sinaliza tradução ausente | origem própria | [#16](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/16), aceito no inventário pela [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) |
| Nome em inglês, texto em pt-BR pela camada de i18n | herdado | [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) §4 — política de idioma |
| Ele não viola o *zero JS de interação* | origem própria | [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) — a regra é sobre modelo de interação; isto é renderização condicional |
| Devolve nada no locale de origem | origem própria | [#16](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/16) — sem lista, sem flag, sem drift |
| Mesma anatomia do callout neutro | origem própria | este slice |
| Zero partes publicadas | origem própria | [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) §5 |
