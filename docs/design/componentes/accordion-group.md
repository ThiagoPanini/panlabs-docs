# `accordion-group`

> **Nenhum valor numérico nasce neste documento.** Os comprimentos que o componente consome moram em [`../tokens.md`](../tokens.md) e são citados por nome de token. Os números do bloco *Alvo medido*, dentro de `## Anatomia`, são **evidência de medição da âncora** — dizem o que se quer atingir, não o que temos, e quem os edita está afirmando que a âncora mudou.

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

O grupo é a moldura — borda 1px, raio 12 — e **achata os filhos**: dentro dele,
cada [`accordion`](accordion.md) perde borda, raio e margem próprios, e vira
uma linha só, separada da vizinha por um fio (`border-bottom`, na última
linha não). A regra de contexto usa `:where()`, que não soma especificidade: o
degrau que separa o nosso CSS da skin corporativa fica de pé mesmo num seletor
que fala de dois componentes.

**Alvo medido**, do `docs.devin.ai` a 1512, em `research/paridade-devin` §11.
Sem espécime publicado no catálogo de conteúdo, `npm run paridade` ainda não
mede este componente.

| Sonda | Alvo | Tolerância |
| --- | --- | --- |
| Raio do grupo | `12px` | avaliação visual |
| Borda do grupo | `1px` | avaliação visual |
| Filhos achatados | sem borda, raio nem margem próprios | avaliação visual |
| Separador entre filhos | `border-bottom` `1px`, ausente no último | avaliação visual |

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

Camada 2: `--sd-border-default`, `--sd-border-subtle`.

Camada 1: `--sd-space-6`, `--sd-border-width`, `--sd-radius-md`.

## Light e dark

**Não se aplica.** A borda do grupo e o separador entre filhos consomem token
semântico (`--sd-border-default`, `--sd-border-subtle`) e não conhecem modo.

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
| Grupo como moldura (raio 12, borda 1px), filhos achatados e separados por fio | herdado | [#100](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/100) — `research/paridade-devin` §11. Substitui o desenho anterior (pilha solta por `gap`, cada sanfona com borda própria), que não tinha medição atrás |
