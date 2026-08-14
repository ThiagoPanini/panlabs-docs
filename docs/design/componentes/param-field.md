# `param-field`

## Papel

Um **parâmetro de função** — nome, tipo, obrigatoriedade, valor padrão e
descrição. É o vocabulário da referência gerada, e o autor o usa dentro de MDX
comum, não só em página gerada.

**Ele sobreviveu à troca de contrato por nunca ter sido HTTP.** As cinco
informações descrevem um argumento de função tão bem quanto descreviam um
parâmetro de requisição, e a medição confirma a leitura: o `ParamField` da âncora
usa **só `body=`**, nunca `query`, `path` ou `header`. Quem era HTTP era o
`VerbBadge`, e ele saiu do catálogo.

## Anatomia

```html
<div data-sd-component="param-field">
  <p>
    <code>…</code>                          <!-- alcançável por tipo -->
    <span data-sd-part="meta">
      tipo · padrão <code>…</code>
      <strong>obrigatório</strong>          <!-- alcançável por tipo -->
    </span>
  </p>
  <div>…descrição, e o aninhamento…</div>
</div>
```

**Uma parte publicada.** O nome é `<code>` e o chip é `<strong>` dentro da meta —
os dois alcançam por tipo.

**A meta é a única entrada do catálogo que a régua estreita não obrigaria**, e
ela fica assim mesmo: `> span` a alcançaria hoje, mas a rota da referência gerada
a nomeia verbatim no contrato dela, e despublicar depois quebra quem já dependeu
— o que a mesma régua diz. Está registrado aqui para não parecer descuido.

**A condição virou conferência.** Ela é condicional — a parte fica *enquanto* a
rota gerada a nomear —, e condição escrita em prosa é condição que envelhece
calada. O portão 5 casa os dois elos da cadeia: `src/components/Campo.js` escreve
o atributo, e as páginas geradas de tipo e função consomem o campo. Ver
[`referencia.md`](../referencia.md) §5.4, inclusive para por que a cobrança não é
um `grep` no MDX emitido.

O aninhamento é [`expandable`](expandable.md), e a recursão dele é o autor
escrevendo outro campo dentro do primeiro. **Nada disso custa JavaScript.**

`param-field` e [`response-field`](response-field.md) **compartilham a
implementação** com uma prop de espécie — duplicar a anatomia inteira para ganhar
duas props é como se acumula divergência visual entre irmãos. Continuam sendo
dois componentes autoráveis e dois arquivos de spec: o gabarito é por tag, não
por arquivo de código.

## Variantes

Uma, e ela é de estado do contrato, não de aparência:

| Variante | O que muda |
| --- | --- |
| — | o default |
| `deprecated` | o nome fica tachado e apagado |

**Só `required` se marca.** Todo parâmetro é uma de duas coisas; marcar as duas
dobra os chips e divide por dois a saliência do que importa. A ausência é o
sinal de opcional.

**O chip de obrigatório é VERMELHO, com a palavra escrita por extenso.** É o que
a medição diz da âncora, e o carimbo dele subiu de `origem própria
(implementação)` para **`herdado`**. O que segurava a versão neutra era o verbo:
âmbar era `PUT` e vermelho era `DELETE` na mesma página, e um terceiro
significado sobre um matiz gasto é ambiguidade. Sem verbo, os dois matizes
ficaram livres, e o que decide passou a ser a medição em vez do orçamento de cor.

*Por extenso* também é decisão, e é a mesma linha da medição: um asterisco obriga
uma legenda, e legenda é a coisa que ninguém lê antes do campo.

**`deprecated` continua tachado e sem cor** — a conclusão não muda, a
justificativa é substituída. Ela era *não dividir o âmbar com `PUT`*; hoje é que
**o vermelho passou a ser do chip de obrigatório**, e os dois significados
cairiam na mesma linha do mesmo campo. Tachado mais texto apagado é inequívoco e
custa zero token.

## Autoria em MDX

```mdx
<ParamField name="nome" type="str" required>
O nome do workflow. Vira também o nome do arquivo.
</ParamField>

<ParamField name="versao" type="str" default="&quot;3.12&quot;">
A versão do Python instalada no runner.
</ParamField>

<ParamField name="permissoes" type="dict[str, str] | None" default="None">
As permissões do token do workflow.

<Expandable title="dict[str, str] | None" defaultOpen>

<ParamField name="contents" type="str">
Leitura do repositório. `read` basta para quem não escreve commit.
</ParamField>

</Expandable>
</ParamField>
```

## Tokens consumidos

Camada 2: `--sd-border-subtle`, `--sd-text-body`, `--sd-text-muted`,
`--sd-text-strong`, `--sd-state-danger`, `--sd-state-danger-fill`.

Camada 1: `--sd-space-1`, `--sd-space-2`, `--sd-space-4`, `--sd-border-width`,
`--sd-radius-xs`, `--sd-type-xs`, `--sd-type-sm`, `--sd-font-mono`,
`--sd-weight-ui`.

**Os dois `-danger` entraram com o chip vermelho**, e são o único par de estado
que o catálogo consome fora do callout. `--sd-state-danger-edge` continua **sem
consumidor**: o chip é preenchimento e texto, não aresta.

## Light e dark

**Não se aplica.** Consome token semântico e não conhece modo — o chip vermelho
inclusive: `--sd-state-danger` e o `-fill` dele bifurcam por modo na camada 2, e
o campo só os referencia.

## Motion / reduced-motion

**Não se aplica ao campo — nada anima nele.** O que anima é o aninhamento, e está
em [`expandable.md`](expandable.md).

## A11y

Sem foco próprio: o campo é texto. O que é focável é o `<summary>` do
aninhamento, e ele é do outro componente.

**Este componente não tem campo editável, e isso é decisão registrada.** A
edição de valores que a referência gerada oferece mora no painel da rota, não
aqui — pôr estado de React no catálogo furaria a regra de zero JS e acoplaria o
componente ao layout de uma rota.

O contrato de estado de entrada mora em [`foco.md`](../foco.md).

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| Componente do zero | herdado | [#4](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/4) — ausente no Docusaurus |
| Só `required` se marca | herdado | [#18](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/18) §7.2 — `optional` não existe na âncora |
| `deprecated` tachado, sem cor — **justificativa nova** | **origem própria (correção)** | a razão era *não dividir o âmbar com `PUT`*; o verbo morreu, e a razão passou a ser o vermelho do chip de obrigatório |
| **Chip de obrigatório em vermelho, por extenso** | **herdado** | medido na âncora; o carimbo subiu de `origem própria (implementação)` quando o verbo liberou os dois matizes |
| **`ParamField` descreve parâmetro de função** | **herdado (medição)** | o `ParamField` da âncora usa só `body=`, nunca `query`/`path`/`header` — ele nunca foi HTTP |
| **A condição de `meta` é conferida pelo portão 5** | **origem própria (implementação)** | condição escrita só em prosa é condição que envelhece calada |
| Aninhamento por `<details>`, zero JS | herdado | [#18](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/18) e [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) §6 |
| Implementação compartilhada com `response-field` | herdado | [#18](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/18) §8, nota de implementação |
| Sem campo editável | herdado | [#18](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/18) §4 — a interatividade fica no painel da rota |
| Uma parte publicada | herdado | [#18](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/18) §8, sobre a régua da [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) §5 |
