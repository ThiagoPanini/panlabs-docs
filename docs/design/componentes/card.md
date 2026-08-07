# `card`

## Papel

Um **destino**, com ícone, título e uma linha de resumo. É o componente de maior
volume da medição, e o ícone aparece em quase todos os usos — na prática ele não
é opcional.

Nasce do zero. O `DocCard` do Docusaurus é dirigido por metadado de sidebar e não
aceita props livres, e ele é um dos componentes reestruturados dentro do próprio
v3 — território `unsafe`.

## Anatomia

```html
<a data-sd-component="card" href="…">
  <svg …>                                <!-- alcançável por tipo -->
  <span data-sd-part="title">…</span>
  <p>…</p>                               <!-- alcançável por tipo -->
</a>
```

**Uma parte publicada.** O ícone é `<svg>` e o resumo é `<p>` — os dois alcançam
por tipo de elemento. O título é um `<span>` sem nada que o distinga, e por isso
ganha nome.

**Com `href` o elemento é `<a>`; sem, é `<div>`.** O link é o cartão inteiro, e
não há seta de chamada para ação dentro dele: a caixa toda já é a afordância, e
uma seta ali seria uma segunda afordância para a mesma ação.

**Borda, não superfície.** O cartão de documentação já é a única superfície
elevada da tela, e um cartão de conteúdo pintado sobre ele seria o terceiro nível
que a regra de dois preenchimentos fecha. O que separa o cartão do fundo é o fio.

O ícone é o **único elemento do catálogo pintado com a cor de marca** — é o
detalhe que mais define a aparência do componente na medição.

## Variantes

**Não há.** O cartão tem três props e nenhuma delas troca desenho: `title`
(obrigatório), `icon` e `href`. Um cartão sem `href` não é uma variante — é o
mesmo desenho sem afordância.

**Ícone XOR imagem.** Não existe prop de imagem, e não vai existir: o produto que
esta documentação documenta não tem tela para fotografar, e diagrama tem
[`frame`](frame.md).

## Autoria em MDX

```mdx
<CardGroup>
<Card title="Comece aqui" icon="rocket" href="/docs/comece-aqui/visao-geral">
Suba a primeira cobrança autorizada em dez minutos.
</Card>
<Card title="Sem link, sem ícone">
Um cartão que não leva a lugar nenhum é uma caixa de destaque, não um botão.
</Card>
</CardGroup>
```

O `icon` é um nome do manifesto. **Nome inexistente quebra o build**, com
sugestão do vizinho mais próximo — nunca placeholder, nunca degradação
silenciosa. Ver [`icones.md`](../icones.md).

## Tokens consumidos

Camada 2: `--sd-border-default`, `--sd-border-subtle`, `--sd-accent`,
`--sd-text-body`, `--sd-text-muted`, `--sd-text-strong`.

Camada 1: `--sd-space-2`, `--sd-space-5`, `--sd-border-width`, `--sd-radius`,
`--sd-type-sm`, `--sd-weight-ui`, `--sd-leading-ui`, `--sd-move-state`.

## Light e dark

**Não se aplica.** Consome token semântico e não conhece modo.

## Motion / reduced-motion

`--sd-move-state`, em cor de borda e cor de fundo. Herda o resto: as durações
encurtam na camada de token, e o componente não escreve
`@media (prefers-reduced-motion)`.

**Estado não anima geometria.** Deslocar no hover diria a mesma coisa que a
elevação já diz, e o sistema recusa dizer duas vezes.

Hover inteiro vive sob `(hover: hover)`. O press usa **os mesmos tokens do
hover** — o hover é a prévia do que o clique faz, o press é a confirmação de que
o dedo chegou —, e é instantâneo na entrada por uma regra universal que mora em
[`foco.md`](../foco.md).

## A11y

O cartão com `href` é um `<a>`, e é isso que lhe dá foco, Enter e menu de
contexto sem uma linha escrita. O contrato de estado de entrada — anel, press e
piso de alvo de toque — é universal e mora em [`foco.md`](../foco.md).

O ícone é decorativo e sai da árvore de acessibilidade: o nome acessível do link
é o título mais o resumo.

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| Cartão do zero | herdado | [#4](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/4) — `DocCard` é dirigido por metadado |
| `title` · `icon` · `href`, e nada mais | herdado | [#4](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/4) — superfície mínima medida |
| Ícone na cor de marca | herdado | [#4](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/4) — *"o detalhe que mais define a aparência do card"* |
| Ícone XOR imagem | herdado | [#21](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/21) §8 |
| Uma parte publicada | origem própria | [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) §5 |
| Borda em vez de superfície | **origem própria (implementação)** | consequência da regra de dois níveis de preenchimento da [#20](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/20) |
| Sem seta de chamada para ação | origem própria | o cartão inteiro é o link; duas afordâncias para uma ação |
| Press com os tokens do hover | mecanismo emprestado | [#28](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/28) §4.1 |
