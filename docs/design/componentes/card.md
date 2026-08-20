# `card`

> **Nenhum valor numérico nasce neste documento.** Os comprimentos que o componente consome moram em [`../tokens.md`](../tokens.md) e são citados por nome de token. Os números do bloco *Alvo medido*, dentro de `## Anatomia`, são **evidência de medição da âncora** — dizem o que se quer atingir, não o que temos, e quem os edita está afirmando que a âncora mudou.

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

> **O `<a>` fica, e é contra a âncora.** O `Card` do Mintlify é um
> `<div role="link" tabindex="0">`. O nosso é melhor, e a diferença é
> conferível: foco, Enter, menu de contexto e abrir-em-nova-aba caem de graça,
> sem uma linha escrita. Trocar seria herdar um defeito — e a regra já escrita
> em [`principios.md`](../principios.md) §3 diz que **corrigir acidente da
> âncora é herdar a intenção**, não divergir dela.

**Borda, não superfície.** O que separa o cartão do fundo é o fio de um pixel,
sem sombra e sem preenchimento.

**A justificativa desta linha mudou, e mudou para melhor.** Ela era de sistema —
*"o cartão de documentação já é a única superfície elevada da tela, e um cartão
de conteúdo pintado sobre ele seria o terceiro nível que a regra de dois
preenchimentos fecha"* —, e esse argumento **morreu com o cartão**. A conclusão
sobrevive por medição direta, que é mais forte que a dedução que a sustentava: na
âncora o cartão é um fio de um pixel, em `gray-950` a 10% no claro e branco a 10%
no escuro, sem sombra, e o hover é *"a borda virando cor de marca. Nada se
move."*

O ícone é o **único elemento do catálogo pintado com a cor de marca** — é o
detalhe que mais define a aparência do componente na medição.

**Alvo medido**, do `docs.devin.ai` a 1512, em
`research/paridade-devin` §11.
`npm run paridade` mede o cartão construído contra estas linhas.

| Sonda | Alvo | Tolerância |
| --- | --- | --- |
| Raio | `16px` | exato |
| Borda | `1px` | exato |

O hover da âncora **muda só a cor da borda** — sem anel, sem sombra, sem
elevação, sem trocar o fundo. Isso é estado, e não caixa: não há sonda para ele
aqui, e a verificação fica na avaliação visual.

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
<Card title="Visão geral" icon="rocket" href="/ferramentas/bibliotecas/overpower/visao-geral">
Do primeiro comando ao equipamento instalado, em cinco passos.
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

Camada 2: `--sd-border-default`, `--sd-accent`, `--sd-text-body`,
`--sd-text-muted`, `--sd-text-strong`.

Camada 1: `--sd-space-2`, `--sd-space-5`, `--sd-border-width`, `--sd-radius`,
`--sd-type-sm`, `--sd-weight-ui`, `--sd-leading-ui`, `--sd-move-state`.

`--sd-border-subtle` saiu: ele era a tinta do fundo de hover, e o hover deixou de
pintar fundo.

## Light e dark

**Não se aplica.** Consome token semântico e não conhece modo.

## Motion / reduced-motion

`--sd-move-state`, **em cor de borda e nada mais**. Herda o resto: as durações
encurtam na camada de token, e o componente não escreve
`@media (prefers-reduced-motion)`.

**O hover muda só a borda.** Este arquivo declarava borda *e* fundo, e a medição
diz **borda e só** — o fundo era nosso, não da âncora. É a segunda correção que a
medição direta traz para este componente.

**Estado não anima geometria.** Deslocar no hover diria a mesma coisa que a cor
de marca já diz, e o sistema recusa dizer duas vezes. Na âncora, verbatim:
*"nada se move"*.

Hover inteiro vive sob `(hover: hover)`. O press usa **o mesmo token do
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
| **O alvo medido da `## Anatomia`** | **medido em referência** | medição de primeira mão da âncora em `research/paridade-devin` §11 — [#93](https://github.com/ThiagoPanini/panlabs-docs/issues/93) |
| Cartão do zero | herdado | [#4](https://github.com/ThiagoPanini/panlabs-docs/issues/4) — `DocCard` é dirigido por metadado |
| `title` · `icon` · `href`, e nada mais | herdado | [#4](https://github.com/ThiagoPanini/panlabs-docs/issues/4) — superfície mínima medida |
| Ícone na cor de marca | herdado | [#4](https://github.com/ThiagoPanini/panlabs-docs/issues/4) — *"o detalhe que mais define a aparência do card"* |
| Ícone XOR imagem | herdado | [#21](https://github.com/ThiagoPanini/panlabs-docs/issues/21) §8 |
| Uma parte publicada | origem própria | [#15](https://github.com/ThiagoPanini/panlabs-docs/issues/15) §5 |
| Borda em vez de superfície | **herdado** | [#50](https://github.com/ThiagoPanini/panlabs-docs/issues/50) — medição direta: fio de um pixel, sem sombra. **Sobe de classe:** era `origem própria (implementação)` pela regra de dois preenchimentos da [#20](https://github.com/ThiagoPanini/panlabs-docs/issues/20), e esse argumento morreu com o cartão |
| O hover muda **só a borda** | **herdado** | [#50](https://github.com/ThiagoPanini/panlabs-docs/issues/50) — *"a borda virando cor de marca. Nada se move."* Este arquivo declarava borda **e** fundo; o fundo era nosso |
| O elemento é `<a>`, e a âncora usa `<div role="link">` | **origem própria (correção)** | [#60](https://github.com/ThiagoPanini/panlabs-docs/issues/60) — foco, Enter, menu de contexto e nova aba de graça; adotar o `<div>` seria herdar um defeito. Ver [`principios.md`](../principios.md) §3 |
| Sem seta de chamada para ação | origem própria | o cartão inteiro é o link; duas afordâncias para uma ação |
| Press com o token do hover | mecanismo emprestado | [#28](https://github.com/ThiagoPanini/panlabs-docs/issues/28) §4.1 |
