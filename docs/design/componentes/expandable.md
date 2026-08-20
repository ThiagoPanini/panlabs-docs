# `expandable`

> **Nenhum valor numérico nasce neste documento.** Os comprimentos que o componente consome moram em [`../tokens.md`](../tokens.md) e são citados por nome de token. Os números do bloco *Alvo medido*, na anatomia, são **evidência de medição da âncora** — dizem o que se quer atingir, não o que temos, e quem os edita está afirmando que a âncora mudou.

## Papel

O aninhamento de um campo de API: um objeto que tem propriedades, dentro de um
[`param-field`](param-field.md) ou de um [`response-field`](response-field.md).

É a mesma primitiva do [`accordion`](accordion.md) **sem a moldura**. A moldura
ali criaria moldura dentro de moldura a cada nível, e o teto de aninhamento é
quatro.

## Anatomia

`<details>` e `<summary>` nativos, com um fio à esquerda no lugar da moldura — a
mesma leitura de "isto pertence ao de cima" que a indentação daria, sem gastar
indentação.

```html
<details data-pd-component="expandable" open>
  <summary>…</summary>              <!-- alcançável por tipo -->
  <div>…</div>                      <!-- único div filho de details -->
</details>
```

**Zero partes publicadas.** `<summary>` e o único `<div>` filho alcançam por
tipo, e o rótulo é o texto do `<summary>` — não há nó intermediário a nomear.

O caret vem **antes** do rótulo, ao contrário do accordion: aqui ele não fecha
uma moldura, abre uma linha.

**Estado não vira atributo.** `[open]` já está no DOM porque o elemento é nativo.


**Alvo medido**, do `docs.devin.ai` a 1512, em `research/paridade-devin` §11.

| Sonda | Alvo | Tolerância |
| --- | --- | --- |
| Raio | `12px` | exato |

A altura de 43,5 fechado não tem sonda: o espécime do catálogo renderiza **aberto**, e medir aberto contra alvo fechado seria comparar dois estados.

## Variantes

**Não há.** Duas props: `title` (obrigatório) e `defaultOpen`.

**Nível 1 nasce aberto; nível 2 em diante, fechado.** A regra existe porque há um
conflito de medição **não adjudicado** sobre busca na página encontrar texto
dentro de `<details>` fechado — uma leitura diz que encontra, outra diz que não, e
nenhuma das duas foi medida nos navegadores alvo. Nível 1 aberto é a escolha que
funciona sob **qualquer** das duas, e é por isso que ela vence.

**Gatilho de reabertura:** se alguém medir e a leitura otimista estiver certa, o
nível 1 pode fechar também, e custa uma prop.

Quem decide o nível é o autor, porque é ele que sabe em que nível está.

## Autoria em MDX

```mdx
<ParamField name="pagamento" type="object">
Os dados do meio escolhido.

<Expandable title="objeto pagamento" defaultOpen>

<ParamField name="cartao.parcelas" type="integer" default="1">
De 1 a 12.
</ParamField>

</Expandable>
</ParamField>
```

## Tokens consumidos

Camada 2: `--pd-accent`, `--pd-border-default`.

Camada 1: `--pd-space-2`, `--pd-space-3`, `--pd-space-4`, `--pd-border-width`,
`--pd-radius-md`, `--pd-type-sm`, `--pd-weight-ui`, `--pd-leading-ui`,
`--pd-move-expand`.

## Light e dark

**Não se aplica.** Consome token semântico e não conhece modo.

## Motion / reduced-motion

`--pd-move-expand`, na altura do conteúdo e na rotação do caret — o mesmo
movimento e o mesmo mecanismo do [`accordion`](accordion.md). Herda o resto.

## A11y

**O navegador é a especificação**, exatamente como no
[`accordion`](accordion.md): tecla, foco, anúncio e `aria-expanded` vêm dele, e
não há um `keydown` escrito aqui.

**Âncora de URL para um campo aninhado vem de graça** — o navegador abre todos os
`<details>` ancestrais quando o alvo do fragmento está dentro deles. Num campo de
quarto nível, isso é a diferença entre um link que funciona e um link que leva a
lugar nenhum.

O anel de foco e o piso de alvo de toque são universais e moram em
[`foco.md`](../foco.md).

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| **O alvo medido da anatomia** | **medido em referência** | medição de primeira mão da âncora, em `research/paridade-devin` §11 — [#93](https://github.com/ThiagoPanini/panlabs-docs/issues/93) |
| Componente do zero, sobre `<details>` | herdado | [#4](https://github.com/ThiagoPanini/panlabs-docs/issues/4); [#15](https://github.com/ThiagoPanini/panlabs-docs/issues/15) §6 |
| Nível 1 aberto, 2+ fechado | herdado | [#6](https://github.com/ThiagoPanini/panlabs-docs/issues/6), ratificado pela [#18](https://github.com/ThiagoPanini/panlabs-docs/issues/18) §7.3 |
| Busca na página em `<details>` fechado | herdado | [#83](https://github.com/ThiagoPanini/panlabs-docs/issues/83) — comportamento de especificação (WHATWG, `beforematch`/find-in-page revelando `<details>` fechado): Chrome desde a versão 97 (jan/2022), Firefox desde a 139 (mai/2025), Safari desde a 26.2 (Interop 2025). As três engines convergem hoje; nenhum `keydown` nosso está envolvido |
| Âncora de URL abre os ancestrais | herdado | comportamento de especificação, registrado pela [#15](https://github.com/ThiagoPanini/panlabs-docs/issues/15) §6 |
| Fio à esquerda em vez de moldura | **origem própria (implementação)** | moldura a cada nível é moldura dentro de moldura, até quatro níveis. *A redação anterior dizia "cartão dentro de cartão"; `cartão` passou a significar só o componente* |
| Zero partes publicadas | origem própria | [#15](https://github.com/ThiagoPanini/panlabs-docs/issues/15) §5 |
| Raio 12 no fio à esquerda | **origem própria (correção)** | [#100](https://github.com/ThiagoPanini/panlabs-docs/issues/100) — a sonda `expandable.raio` mede contra o alvo desde a [#93](https://github.com/ThiagoPanini/panlabs-docs/issues/93), mas a regra nunca declarou `border-radius`; ficava em `0px` computado |
