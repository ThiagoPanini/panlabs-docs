# ADR 1 — Doutrina de CSS

**Status:** aceito · slice 1 · 2026-08-07 · **com errata** · 2026-08-13

> ### Errata — a contagem das «Consequências» é de cinco, e a lista tem quatro
>
> **A decisão não muda.** O adaptador de mão única, a proibição de `@layer`, o escuro no fallback e a regra de linha morta ficam inteiros, e nada aqui é supersedido. O que esta errata corrige é **um número**, e ele envelheceu.
>
> Duas consequências dizem *"cinco pontos do Docusaurus não são alcançáveis de `:root`"*. **São quatro**, desde a [#79](https://github.com/ThiagoPanini/panlabs-docs/issues/79): a exceção de `--docusaurus-tag-list-border` saiu por não ter superfície viva — nenhuma página deste site declara `tags:`, e o front matter da âncora não tem o campo.
>
> **Errata e não supersessão**, e o próprio texto abaixo diz por quê: ele delega a lista — *"a lista é fechada e vive em `docs/design/tokens.md`"*. O número aqui sempre foi um retrato de uma lista que mora noutro lugar, e é lá que ele se confere. O que a doutrina afirma continua verdadeiro palavra por palavra: **existem** pontos inalcançáveis de `:root`, a lista deles é **fechada**, e **nenhum** deles exige swizzle.

## Contexto

Três achados da dissecção do Docusaurus v3 restringem qualquer CSS que este projeto escreva. Nenhum é preferência de estilo; os três são correção.

**1. A forma que a documentação oficial ensina perde em silêncio.** O Infima escreve o bloco de modo escuro como `html[data-theme='dark']` — especificidade (0,1,1). O `[data-theme='dark']` que a documentação do Docusaurus ensina é (0,1,0), e **perde** para as trinta e seis variáveis do bloco escuro do Infima: fundo de página, fundo de superfície, cor de texto, fundo de código, borda do TOC e a escala de ênfase inteira. Não há erro, não há aviso: o modo escuro quebra parcialmente e quem escreveu acha que escreveu.

**2. `@layer` é armadilha, não ferramenta.** Zero uso de cascade layers no Infima e no `theme-classic`. Como CSS sem camada vence CSS em camada, envolver o nosso CSS numa layer o faria perder para tudo — inclusive para o que ele existe para sobrescrever. O reflexo moderno é exatamente o movimento errado aqui.

**3. Construir sobre `--ifm-*` importa acidentes.** Cerca de quarenta e três variáveis do Infima são declaradas e nunca consumidas; `--ifm-font-weight-semibold` é `500`, não 600; e as seis shades por cor semântica foram resolvidas em *build time* por `color-mod()`, de modo que trocar `--ifm-color-primary` não recalcula nenhuma delas. Um sistema cuja camada semântica é `--ifm-*` herda isso como se fosse desenho. E metade do sistema não existe lá: escala de espaço, de raio, de easing, anel de foco, elevação no escuro e paleta de sintaxe nascem do zero.

Contexto de longevidade que vale registrado: o `infima` está pinado em `0.2.0-alpha.45` e parado desde 2024-08-23. A base de CSS sobre a qual tudo isso corre é alpha e não se move.

## Decisão

### a) Nunca escrevemos um seletor de modo escuro

O escuro mora em `:root` e o claro é o override:

```css
:root                     { /* ESCURO — canônico */ }
:root[data-theme='light'] { /* CLARO  — legítimo */ }
```

O modo canônico é o **fallback**; o legítimo é o **override**. Duas consequências, e a segunda é a que faz isto ser ADR:

- **A armadilha do achado 1 fica fora de alcance por construção, não por disciplina.** Não existe seletor de modo escuro para alguém escrever errado.
- **O axioma 4 vira estrutura de arquivo em vez de frase de prosa**, e o bloco claro passa a ser auditável lendo um bloco só: token que aparece no escuro e não no claro é um buraco visível.

`:root[data-theme='light']` é (0,2,0) e vence `:root` (0,1,0) sem depender de ordem.

**A regra vale para todo CSS do projeto, para sempre.** Um componente que precise divergir por modo não escreve seletor de modo: ele consome um token da camada semântica, que é o único lugar do sistema onde o modo diverge.

### b) `@layer` está fora

Nenhum CSS deste projeto entra numa cascade layer. A resposta para *"como o CSS próprio ganha do Infima sem `!important` espalhado"* não é camada — é **especificidade deliberada**.

Corolário de configuração: `future.v4` fica **desligado** em `docusaurus.config.js`. Entre os flags que ele acende está `useCssCascadeLayers`, que envolve o CSS do tema em camadas e muda a premissa medida no achado 2. Ligá-lo é reabrir este ADR, não um ajuste de config.

### c) O adaptador é de mão única

**O sistema nunca lê `--ifm-*`. Só escreve.**

Um bloco adaptador atribui `--ifm-*` a partir de `var(--pd-*)`. Nosso CSS lê `--pd-*`; o CSS do Infima lê `--ifm-*`; nada nosso depende da semântica de um nome do Infima.

O seletor do adaptador é `:root, :root[data-theme]`. Com o atributo presente ele é (0,2,0), que vence o `html[data-theme='dark']` (0,1,1) do Infima. O script inline do Docusaurus escreve `data-theme` antes da primeira pintura, então o seletor com atributo é o que vale sempre; o `:root` solto fecha o buraco de JavaScript desligado, onde o site degrada para o Infima cru — feio, mas legível.

**O adaptador não bifurca por modo.** Ele lê a camada semântica, que já bifurcou.

Duas regras que saem junto:

- **O adaptador não pode conter linha morta que sugira funcionar.** Variável declarada pelo Infima e nunca consumida por ele não entra. A lista de atribuições é conferida contra as `--ifm-*` efetivamente lidas por `var()` no Infima e no `theme-classic`.
- **O projeto nunca usa os utilitários de espaçamento do Infima** (`.margin--lg`, `.padding-vert--sm`…). São gerados de literais, carregam `!important` e são completamente desacoplados de `--ifm-global-spacing`.

## Consequências

- Um agente que copie a documentação oficial do Docusaurus para escrever modo escuro produz código que este projeto não aceita — e o motivo está aqui, não numa nota de rodapé.
- O adaptador é o maior bloco de `src/css/tokens.css`: encanamento inerte, uma atribuição por variável renderizada. É o preço aceito, e é exatamente o bloco que se pula na leitura.
- Cinco pontos do Docusaurus não são alcançáveis de `:root` e precisam de seletor com escopo. A lista é fechada e vive em `docs/design/tokens.md`.
- Nenhum ponto desta doutrina exige swizzle. Os cinco pontos inalcançáveis se resolvem com seletor estrutural.

## Alternativas descartadas

| Descartado | Motivo |
| --- | --- |
| `[data-theme='dark']` como a doc oficial ensina | (0,1,0) perde para as 36 variáveis do bloco escuro do Infima, em silêncio |
| Claro em `:root`, escuro como override | É o que Infima e Mintlify fazem, e contraria o axioma 4 — o canônico tem que ser o fallback |
| `@layer` para organizar as camadas | CSS sem camada vence CSS em camada; envolver o nosso faz perder de tudo |
| Construir a camada semântica sobre `--ifm-*` | Importa 43 variáveis inertes, shades resolvidas em build time e `semibold: 500` |
| Adaptador de mão dupla (ler `--ifm-*` onde for conveniente) | Acopla o desenho à semântica de um projeto alpha e parado desde 2024-08-23 |
| `!important` para vencer o Infima | Especificidade deliberada resolve, e `!important` não tem gradiente para voltar atrás |

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| `:root[data-theme='light']` como forma obrigatória | origem própria | [#5](https://github.com/ThiagoPanini/panlabs-docs/issues/5) mediu a armadilha; [#11](https://github.com/ThiagoPanini/panlabs-docs/issues/11) inverteu o par de blocos |
| `@layer` fora | herdado | [#5](https://github.com/ThiagoPanini/panlabs-docs/issues/5) — zero uso no Infima e no theme-classic |
| Adaptador de mão única | origem própria | [#11](https://github.com/ThiagoPanini/panlabs-docs/issues/11), derivado das armadilhas medidas na [#5](https://github.com/ThiagoPanini/panlabs-docs/issues/5) |
| Seletor `:root, :root[data-theme]` | origem própria | [#11](https://github.com/ThiagoPanini/panlabs-docs/issues/11) §4 |
| `future.v4` desligado por causa de `useCssCascadeLayers` | origem própria | verificado no fonte da 3.10.2 ao implementar o slice 1 — o flag não existia quando a [#5](https://github.com/ThiagoPanini/panlabs-docs/issues/5) mediu |
| Nenhum utilitário de espaçamento do Infima | herdado | [#11](https://github.com/ThiagoPanini/panlabs-docs/issues/11) §2 |
