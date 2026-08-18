# ADR 3 — Reduced-motion é propriedade da camada de token

**Status:** aceito · slice 1 · 2026-08-07 · **com duas erratas** · 2026-08-13, 2026-08-14

> ### Errata — *"uma das cinco exceções do adaptador"* passou a ser uma das quatro
>
> **A decisão não muda**, e a consequência que carrega o número continua verdadeira no que ela afirma: `--docusaurus-details-transition` **é** alcançada por seletor estrutural com escopo, e nem a duração nem a curva dela ficam de fora. Ela é a **exceção 2**, e não foi ela que saiu.
>
> A lista do adaptador caiu de cinco para quatro na [#79](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/79) — a de `--docusaurus-tag-list-border` saiu por não ter superfície viva. A lista fechada vive em [`docs/design/tokens.md`](../design/tokens.md) §7, e é lá que ela se confere membro a membro.

> ### Errata — a regra (d) ficou sem exemplo vivo
>
> **A decisão não muda, e a regra continua escrita como está.** O que mudou é que os **dois** movimentos que a demonstravam deixaram de existir: o *reveal* por rolagem e a respiração do glow eram consumidos só pelo CSS Module da landing, e a página saiu na [#94](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/94).
>
> Onde o documento diz que *"as duas somem inteiras — o reveal por não entrar no `@media (prefers-reduced-motion: no-preference)` que o envolve, e a respiração do glow por `animation: none` no bloco `reduce`"*, leia-se **o mecanismo, não o inventário**. Os dois caminhos continuam sendo os caminhos certos, e o bloco `reduce` de `src/css/tokens.css` guarda o comentário que os descreve para quem trouxer o próximo movimento infinito.
>
> **Nada do que este ADR proíbe ficou permitido.** Nenhum componente escreve `@media (prefers-reduced-motion)` próprio, e essa metade da decisão nunca dependeu de haver um movimento a desligar — ela é mais fácil de cumprir hoje, não menos.

## Contexto

O achado que reorganiza o problema veio da dissecção do framework, não do desenho: **o Infima já respeita `prefers-reduced-motion`**, zerando `--ifm-transition-fast` e `--ifm-transition-slow` dentro da media query. A implicação vale escrita em voz alta:

> Motion próprio que use essas variáveis herda o respeito de graça; motion próprio com duração literal, não.

Reduced-motion deixa de ser capítulo de acessibilidade à parte e vira **consequência de onde a duração mora**.

O contra-exemplo é o padrão de mercado, e ele falha por dentro: um martelo `* { animation: none !important; transition: none !important }` alcança tudo, mas quebra o que depende de `transitionend`, não tem gradiente, e obriga `!important` a atravessar o projeto. A rota alternativa — cada componente declarando a própria `@media (prefers-reduced-motion)` — obriga quem implementa a classificar cada transição nova, e **classificação errada é invisível**: ninguém revisa um site com `reduce` ligado.

## Decisão

**Reduced-motion é propriedade da camada de token. Nenhum componente escreve `@media (prefers-reduced-motion)` próprio, para sempre.**

A implementação inteira são três linhas, em `src/css/tokens.css`:

```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --sd-dur-1: 1ms;
    --sd-dur-2: 1ms;
    --sd-dur-3: 1ms;
  }
}
```

Isso funciona por causa de duas propriedades que precisam valer juntas, e que este ADR trava:

### a) Todo movimento compõe da escala, e nenhum crava número

Os seis movimentos nomeados são tokens completos — `<duração> <easing>` — construídos sobre `--sd-dur-*` e `--sd-ease-*`. Um componente escreve `transition: background-color var(--sd-move-state)`, nunca `transition: background-color 200ms ease-out`.

Custom property resolve **no momento do uso**, então redefinir a escala dentro da media query atravessa todos os consumidores sozinha.

### b) O adaptador de mão única leva a redefinição para o framework que não escrevemos

Como o adaptador escreve `--ifm-transition-fast: var(--sd-dur-1)` e `--ifm-transition-timing-default: var(--sd-ease-settle)`, **o Infima e o `theme-classic` param junto** — sem martelo `*`, sem um único `!important`, e sem que precisemos tocar em CSS que não é nosso.

### c) `1ms`, não `0s`

Transição de duração zero é onde código que espera `transitionend` trava — e o Docusaurus tem o dele: o `useCollapsible` do `theme-common` anima altura em JavaScript. `1ms` é imperceptível e continua disparando o evento.

### d) A regra de exceção é uma classificação que cada movimento faz de si mesmo

Não é uma lista de exceções para manter:

> **Movimento que termina sozinho encurta** — a escala vai a `1ms`.
> **Movimento que não termina sozinho é removido** — dirigido por rolagem, ou infinito.

Encurtar uma animação infinita para `1ms` produz estroboscópio, que é o oposto exato do que `reduce` pede; e animação dirigida por rolagem não tem duração para encurtar. As duas somem inteiras: o *reveal* por não entrar no `@media (prefers-reduced-motion: no-preference)` que o envolve, e a respiração do glow por `animation: none` no bloco `reduce`.

### e) O portão

Um `grep` de uma linha, na cadência de commit: `transition:` ou `animation:` cujo valor contenha `ms`, `s` ou `cubic-bezier` reprova. A regra não depende de ninguém lembrar dela — depende de a varredura passar. Implementado em `scripts/portao-2-motion.sh`.

## Consequências

- A seção `## Motion / reduced-motion` de todo arquivo de componente **só nomeia o movimento**. Se um arquivo de componente precisar dizer qualquer coisa sobre reduced-motion além de *"herda"*, o desenho está errado — e isso é um sinal de revisão, não uma licença para escrever a media query lá.
- Um movimento novo precisa entrar no vocabulário antes de ter consumidor. Não há rota para "só desta vez" com número cravado: o portão reprova.
- **Perda nomeada:** o Infima crava `ease-in-out` literal em três lugares do `navbar.pcss`, e ele não tem escala de easing nenhuma. Esses três ficam com a curva do Infima. Some da lista se um dia o navbar for reescrito por CSS próprio, o que não está previsto.
- **Uma variável fora de alcance, registrada:** `--docusaurus-details-transition` é declarada dentro de classe de CSS Module. Ela é alcançada por seletor estrutural com escopo — uma das cinco exceções do adaptador —, então nem a duração nem a curva dela ficam de fora.

## Alternativas descartadas

| Descartado | Motivo |
| --- | --- |
| Martelo `* { animation: none !important }` | Quebra o que depende de `transitionend`, não tem gradiente e espalha `!important` |
| Cada componente com a própria media query | Obriga a classificar cada transição nova, e classificação errada é invisível |
| Reduced-motion particionado (cor sobrevive, deslocamento não) | Mesma falha: é régua de julgamento. A classificação que ficou — *termina sozinho?* — cada movimento faz de si mesmo |
| `0s` em vez de `1ms` | `transitionend` para de disparar, e o `useCollapsible` do theme-common anima altura em JS |
| Duração e curva soltas em cada componente | Não alcançariam o Infima, e não haveria portão de `grep` |
| Encurtar o loop ambiente para `1ms` | Produz estroboscópio — o oposto do que `reduce` pede |

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| Reduced-motion na camada de token, alcançando o Infima | herdado + origem própria (implementação) | [#5](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/5) mediu que o Infima zera `--ifm-transition-*` sob a media query; [#17](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/17) §2 |
| Movimento composto da escala, não com número cravado | origem própria | [#17](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/17) §1 |
| `1ms` em vez de `0s` | origem própria | `useCollapsible` do theme-common anima altura em JS ([#17](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/17)) |
| Remover, não encurtar, o que não termina sozinho | origem própria | [#17](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/17) §2 |
| Portão de `grep` de motion | origem própria | idioma de invariante da [#11](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/11), aplicado por [#17](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/17) |
| Os três `ease-in-out` do `navbar.pcss` como perda | **lacuna por restrição** | [#5](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/5) — literais fora do alcance de qualquer variável |
