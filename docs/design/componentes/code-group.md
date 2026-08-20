# `code-group`

> **Nenhum valor numérico nasce neste documento.** Os comprimentos que o componente consome moram em [`../tokens.md`](../tokens.md) e são citados por nome de token. Os números do bloco *Alvo medido*, dentro de `## Anatomia`, são **evidência de medição da âncora** — dizem o que se quer atingir, não o que temos, e quem os edita está afirmando que a âncora mudou.

## Papel

O mesmo trecho em várias linguagens, numa caixa de abas. É o que resolve a página
de referência que precisa mostrar cURL, Python e JavaScript sem triplicar o
comprimento da página.

Ele **compõe** o [`tabs`](tabs.md); não swizzla nada.

### Por que ele fica, e as duas razões são independentes

Este componente foi o **único candidato nomeado** a repovoar o carimbo
`delta deliberado`, sob a aposta de que mantê-lo *"onde a âncora resolve com
`Tabs`"* seria divergir por escolha. A aposta não produziu membro, e nenhuma das
duas razões depende da outra:

1. **O critério de corte deste catálogo é uso ZERO**, e a âncora usa `CodeGroup`
   **cinco vezes**. Os treze componentes cortados morreram por *"uso zero em
   1.740 páginas"* — cinco usos não é o mesmo teste com um resultado diferente,
   é o outro lado dele.
2. **O *"resolve com `Tabs`"* nunca foi contado.** Dos 105 `Tab` medidos na
   âncora, **52 embrulham `Frame`** — metade das abas dela embrulha imagem, não
   código. O pareamento por aba nunca foi medido, e a pesquisa é explícita
   quanto a isso.

**Manter um componente que a âncora tem e usa não é divergir da âncora.** O
emprego que sobra aqui é estreito e real: instalação por gerenciador de pacote em
três folhas, mais a fixture de várias linguagens.

## Anatomia

O autor escreve cercas de código com título, como escreveria fora do grupo. O
componente lê o título de cada cerca, monta as abas, e **remove o título do
bloco** — mantê-lo desenharia a mesma palavra duas vezes, na aba e na moldura.

```html
<div data-pd-component="code-group">
  <ul role="tablist">…</ul>            <!-- do Docusaurus -->
  <div>
    <div class="theme-code-block">…</div>
  </div>
</div>
```

**Zero partes publicadas.** O grupo é uma moldura em volta de duas coisas que já
têm contrato próprio: o [`tabs`](tabs.md) e o [`code-block`](code-block.md).

O rótulo da aba é o título da cerca; na falta dele, a linguagem; na falta das
duas, a posição. **Nunca vazio** — aba sem nome é aba que não se clica de novo.

**Alvo medido**, do `docs.devin.ai` a 1512, em
`research/paridade-devin` §11.

| Sonda | Alvo | Tolerância |
| --- | --- | --- |
| Raio | `16px` | exato |
| Preenchimento da casca | duas larguras de fio | avaliação visual |
| Indicador da aba ativa | pílula sob a aba, não sublinhado | avaliação visual |

A casca da âncora tem raio de fora e a superfície de código tem outro, menor,
por dentro — o de dentro está documentado em
[`code-block.md`](code-block.md). A sonda cobra o de fora, que é o que
encosta na prosa.

**A casca ganha fio, raio e fundo próprios — o grupo deixou de ser só
margem.** `--pd-surface-raised`, o mesmo papel que o dropdown e a busca usam
para uma superfície que não é a página. A régua de abas por dentro troca o
sublinhado da aba de conteúdo por uma pílula sob a aba ativa, para que as
duas famílias de aba não se confundam quando aparecem juntas — o escopo é
`[data-pd-component="code-group"]`, em `componentes.css`.

## Variantes

**Não há.** Duas props, e as duas existem para o mesmo fim: `groupId` faz a
escolha seguir o leitor entre páginas, e `queryString` a põe na URL.

**As duas nascem desligadas, e isso é decisão.** As abas de um grupo de código
**nem sempre são linguagens** — um grupo cujas abas sejam `Node`, `Python` e
`Resposta` gravaria `Resposta` na escolha compartilhada, e o defeito apareceria
noutra página, como a aba errada selecionada. Ligar por default seria escolher o
modo de falhar invisível: quem escreve o grupo não vê o estrago, quem lê outra
página vê. Quem sabe que as abas são comparáveis é o autor, e é ele que liga.

**Rótulo repetido no mesmo grupo lança.** Dois títulos iguais são dois valores de
aba iguais, e a seleção acenderia na aba errada — falha alto, como nome de ícone
inexistente e verbo fora da escada.

**Abas e não dropdown**, e a escolha não é de gosto: a medição mostrou que a
forma é função da contagem — dropdown quando há muitas linguagens, abas quando há
poucas. A contagem de linguagens do projeto é pequena por decisão de contrato,
então **o problema de interface virou regra de contrato e o dropdown não precisa
existir**.

## Autoria em MDX

````mdx
<CodeGroup groupId="code-lang" queryString="lang">

```bash title="pip"
pip install --index-url "$PANLABS_INDICE" "panlabs-catalogo>=2.4"
```

```bash title="uv"
uv add --index "$PANLABS_INDICE" "panlabs-catalogo>=2.4"
```

</CodeGroup>
````

As linhas em branco em volta de cada cerca são obrigatórias — é assim que o MDX
separa bloco de bloco dentro de um componente.

## Tokens consumidos

Camada 2: `--pd-border-default`, `--pd-surface-raised`, `--pd-accent`.

Camada 1: `--pd-space-1`, `--pd-space-6`, `--pd-border-width`, `--pd-radius`,
`--pd-radius-sm`, `--pd-radius-full`.

O resto da régua de abas e da moldura de código é dos dois componentes que ele
compõe: [`tabs`](tabs.md) e [`code-block`](code-block.md).

## Light e dark

**Não se aplica.** A casca e o indicador de aba ativa consomem token
semântico (`--pd-surface-raised`, `--pd-border-default`, `--pd-accent`) e não
conhecem modo.

## Motion / reduced-motion

**Não se aplica ao grupo — nada anima nele.** O que anima é a régua de abas, e
está em [`tabs.md`](tabs.md).

## A11y

Sem foco próprio e sem ARIA próprio: o `role="tablist"`, o `aria-selected` e o
`tabindex` roving vêm do Docusaurus, e o `<pre>` focável vem do bloco de código. O
contrato de estado de entrada mora em [`foco.md`](../foco.md).

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| **O alvo medido da `## Anatomia`** | **medido em referência** | medição de primeira mão da âncora em `research/paridade-devin` §11 — [#93](https://github.com/ThiagoPanini/panlabs-docs/issues/93) |
| Compõe `Tabs` em vez de swizzlar | herdado | [#15](https://github.com/ThiagoPanini/panlabs-docs/issues/15) §3 |
| **Ele fica no catálogo** | **herdado** | [#55](https://github.com/ThiagoPanini/panlabs-docs/issues/55) e [#60](https://github.com/ThiagoPanini/panlabs-docs/issues/60) — a âncora usa `CodeGroup` cinco vezes, e o critério de corte é uso zero; o *"resolve com `Tabs`"* nunca foi contado, e 52 dos 105 `Tab` medidos lá embrulham `Frame` |
| Abas e não dropdown | herdado | [#6](https://github.com/ThiagoPanini/panlabs-docs/issues/6) — a forma é função da contagem; [#18](https://github.com/ThiagoPanini/panlabs-docs/issues/18) §8 transforma isso em regra de contrato |
| `groupId` e `queryString` | herdado | [#18](https://github.com/ThiagoPanini/panlabs-docs/issues/18) §8 |
| Os dois nascem desligados | **origem própria (correção)** | ligar por default polui a escolha compartilhada quando as abas não são linguagens, e o defeito só aparece noutra página |
| Rótulo repetido lança | **origem própria (implementação)** | mesma doutrina do registro de ícones da [#21](https://github.com/ThiagoPanini/panlabs-docs/issues/21) §6 |
| O título sai da moldura e vira rótulo de aba | herdado | [#4](https://github.com/ThiagoPanini/panlabs-docs/issues/4) — anatomia medida |
| Rótulo nunca vazio, com dois fallbacks | **origem própria (implementação)** | aba sem nome não é reclicável |
| Zero partes publicadas | origem própria | [#15](https://github.com/ThiagoPanini/panlabs-docs/issues/15) §5 |
| Casca com fio, raio e fundo próprios | herdado | [#100](https://github.com/ThiagoPanini/panlabs-docs/issues/100) — `research/paridade-devin` §11; a versão anterior só tinha margem, sem medição atrás |
| Indicador de aba ativa em pílula, escopado ao grupo | herdado | [#100](https://github.com/ThiagoPanini/panlabs-docs/issues/100) — `research/paridade-devin` §11 distingue o indicador do grupo do sublinhado da aba de conteúdo |
