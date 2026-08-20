# `callout`

> **Nenhum valor numérico nasce neste documento.** Os comprimentos que o componente consome moram em [`../tokens.md`](../tokens.md) e são citados por nome de token. Os números do bloco *Alvo medido*, dentro de `## Anatomia`, são **evidência de medição da âncora** — dizem o que se quer atingir, não o que temos, e quem os edita está afirmando que a âncora mudou.

## Papel

Destaca, dentro do fluxo da prosa, o que o leitor **não pediu mas precisa** — a
armadilha, a nota lateral, o aviso que muda o que ele ia fazer. É o componente de
maior alcance da medição.

Ele **não é um componente novo**: é a admonition nativa do Docusaurus com o mapa
de tipos redirecionado. A sintaxe de autoria é `:::`, e é isso que faz o callout
funcionar em qualquer arquivo de conteúdo sem tag nem import.

## Anatomia

Eixo **horizontal**: ícone numa coluna à esquerda, conteúdo à direita. Sem barra
lateral, sem faixa de título e sem MAIÚSCULA — nada disso existe porque nada
disso é escrito.

```html
<div data-pd-component="callout" data-pd-variant="warning">
  <svg …>                                  <!-- alcançável por tipo -->
  <div>                                    <!-- único <div> filho -->
    <p data-pd-part="title">…</p>          <!-- só quando há título -->
    …
  </div>
</div>
```

**Uma parte publicada, e ela é a única que a régua obriga.** O ícone é um `<svg>`
e o CSS o alcança por tipo — como **filho direto**, para que um ícone que o autor
escreva dentro do corpo não seja atingido. O corpo é o único `<div>` filho, e
`> div` o separa. O **título**, não: ele é um `<p>` no meio dos `<p>` que o autor
escreve dentro do corpo, e nenhum seletor de tipo o distingue deles.

O DOM **não é um `.alert` do Infima**. Ele nasce do nosso componente, alcançado
pelo registro `Admonition/Types` — degrau 3, zero linha de upstream copiada. O
`Admonition` raiz, que é `unsafe`, continua intocado e só despacha por tipo.
`Admonition/Layout` **não é ejetado**: seria degrau 5, e o degrau 3 alcança.

**Alvo medido**, do `docs.devin.ai` a 1512, em
`research/paridade-devin` §11.

| Sonda | Alvo | Tolerância |
| --- | --- | --- |
| Raio | `16px` | exato |
| Corpo tamanho | `14px` | exato |
| Ícone, note | `16px` | avaliação visual |
| Ícone, tip / warning / info | `18–20px` | avaliação visual |

Na âncora o corpo é menor que a prosa em volta, e é isso que a segunda linha
cobra: o aviso lê como aparte, não como continuação do texto. O ícone não é
uniforme entre variantes — `note` mede menor que as outras três — e a escala
fechada de três tamanhos de [`icon`](icon.md) não tem um degrau exato em
`18px`; `note` fecha em `sm` (`16px`), e as demais em `md` (`20px`), o degrau
mais perto disponível.

## Variantes

Quatro, e nenhuma prop além de título e corpo.

| Variante | Cor-base | Ícone | Tamanho | Papel |
| --- | --- | --- | --- | --- |
| `note` | `--pd-state-info` | `pencil-line` | `sm` | o contexto que o leitor não pediu |
| `info` | **nenhuma** — neutra | `info` | `md` | a nota lateral sem carga |
| `tip` | `--pd-state-success` | `lightbulb` | `md` | a sugestão, e a confirmação |
| `warning` | `--pd-state-warn` | `triangle-alert` | `md` | o que muda o que ele ia fazer |

**`info` é a variante neutra e `note` é a azul.** A inversão contra a convenção é
deliberada, e é ela que faz o sistema ler como a âncora.

**`check` está morta, fundida no `tip`.** A medição mostrou as duas pixel a pixel
idênticas em dois sistemas diferentes — mesma paleta, só o ícone difere —, e
manter dois nomes para o mesmo desenho é dívida de vocabulário. *Dissenso
registrado:* isso custa uma distinção semântica real entre confirmação e
sugestão. **Gatilho de reabertura:** se o conteúdo pedir a semântica de sucesso,
restaurar é uma linha em `Types.js` mais o ícone `circle-check`, que a
[`icones.md`](../icones.md) deixou fora com essa condição escrita.

**`danger` e `caution` não existem.** A primeira tem uso zero nas páginas
medidas; a segunda está deprecada no próprio código do Docusaurus. Um tipo
ausente cai em `info` com aviso no console — não há tela quebrada.

**O ícone é fixo por variante e o autor não sobrescreve.** Ele é o que carrega a
semântica; deixá-lo escolher desfaz a variante.

> **Livre — skin corporativa (redesenho).** As quatro cores-base, movendo o
> **ângulo de matiz** dentro da família: azul continua azul, verde continua
> verde. **Não** se movem a luminosidade, a cromaticidade nem as fórmulas de alfa
> — são elas que garantem contraste sobre as duas superfícies em qualquer ângulo.
> Repintar o matiz de perigo com o roxo da marca não é re-marcar: é quebrar
> significado. O número de variantes e os nomes **não** são livres.

## Autoria em MDX

```markdown
:::note
`note` é a variante azul, e ela carrega o contexto que o leitor não pediu.
:::

:::warning[Idempotência não é opcional]
Toda requisição que cria dinheiro aceita `Idempotency-Key`.
:::
```

**O título sai de graça na sintaxe**, entre colchetes, e isso corrige um bug real
da âncora: duas equipes independentes tentaram dar título a um callout tipado e
falharam — numa a prop é silenciosamente ignorada, e o autor repetiu a palavra no
corpo para compensar.

**Um callout dentro de outro componente funciona**, desde que haja linha em
branco em volta. Isto era lacuna declarada e foi medido no artefato deste slice.

## Tokens consumidos

Camada 2: `--pd-state-info`, `--pd-state-success`, `--pd-state-warn` e os
`*-fill` e `*-edge` correspondentes; `--pd-border-subtle`, `--pd-border-default`,
`--pd-text-strong` na variante neutra; `--pd-text-body`.

Camada 1: `--pd-space-3`, `--pd-space-4`, `--pd-space-6`, `--pd-border-width`,
`--pd-radius`, `--pd-type-sm`, `--pd-weight-ui`, `--pd-leading-ui`.

Camada 3, declarados no escopo do componente: `--pd-callout-fill`,
`--pd-callout-edge`, `--pd-callout-ink`. **É a variante que os move, e é só isso
que a variante faz.**

`--pd-callout-ink` pinta **o ícone e o título** — é a perna de *texto* da
derivação, e ela existe porque a medição achou ícone e título na mesma cor
sólida. **O corpo fica fora dela**, em `--pd-text-body`: é esse o par que a
tabela de contraste verificou sobre fundo de callout, e o par que sustenta a
leitura longa.

## Light e dark

**Não se aplica.** O componente não sabe em que modo está: fundo e aresta são
alfa sobre a cor-base, e a cor-base é um token de camada 2 que já bifurcou.

Isso é o que faz o corporativo trocar **quatro** cores em vez de vinte. Anotada
como matriz de hexadecimais — variantes × modos × papéis —, a mesma aparência
faria cada componente saber em que modo está, e o *exatamente um lugar onde o
modo diverge* viraria ficção.

## Motion / reduced-motion

**Não se aplica — nada anima.** O callout aparece com a página e não muda de
estado.

## A11y

Sem foco próprio: não há elemento focável. O contrato de estado de entrada é
universal e mora em [`foco.md`](../foco.md).

O ícone é decorativo e sai da árvore de acessibilidade — o significado está no
texto ao lado, e anunciá-lo seria repetição.

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| **O alvo medido da `## Anatomia`** | **medido em referência** | medição de primeira mão da âncora em `research/paridade-devin` §11 — [#93](https://github.com/ThiagoPanini/panlabs-docs/issues/93) |
| Anatomia horizontal, sem barra nem faixa de título | herdado | [#4](https://github.com/ThiagoPanini/panlabs-docs/issues/4) — DOM medido em produção |
| Admonition nativa em vez de componente JSX | herdado | [#5](https://github.com/ThiagoPanini/panlabs-docs/issues/5) — `Admonition/Types` é `safe` |
| `Admonition/Types` e não `Admonition/Layout` | **origem própria (correção)** | [#15](https://github.com/ThiagoPanini/panlabs-docs/issues/15), reconciliando com a escada da [#14](https://github.com/ThiagoPanini/panlabs-docs/issues/14) — degrau 3 alcança |
| Quatro variantes | herdado | [#4](https://github.com/ThiagoPanini/panlabs-docs/issues/4) — `danger` com uso zero |
| `check` fundida no `tip` | delta deliberado | [#4](https://github.com/ThiagoPanini/panlabs-docs/issues/4) — idênticas na medição |
| `info` neutro, `note` azul | herdado | [#4](https://github.com/ThiagoPanini/panlabs-docs/issues/4) |
| Título opcional na sintaxe | delta deliberado | [#4](https://github.com/ThiagoPanini/panlabs-docs/issues/4) — bug da âncora, duas equipes |
| Fórmula de alfa de fundo e aresta | herdado | [#4](https://github.com/ThiagoPanini/panlabs-docs/issues/4) — paleta medida; valores em [`tokens.md`](../tokens.md) |
| Ícone e título na tinta da variante, corpo não | herdado + origem própria | [#4](https://github.com/ThiagoPanini/panlabs-docs/issues/4) mede ícone e texto na mesma cor sólida; deixar o corpo fora preserva o par de contraste que [`tokens.md`](../tokens.md) §10 verificou |
| Ícone fixo por variante | herdado | [#21](https://github.com/ThiagoPanini/panlabs-docs/issues/21) §8 |
| Duas partes publicadas | origem própria | [#15](https://github.com/ThiagoPanini/panlabs-docs/issues/15) §5 — a régua estreita aplicada |
| O DOM não é um `.alert` | **origem própria (implementação)** | consequência de `Types` apontar para componente nosso; ver a correção do adaptador em [`tokens.md`](../tokens.md) |
| `:::` dentro de children de JSX funciona | **origem própria (medição)** | lacuna declarada pela [#15](https://github.com/ThiagoPanini/panlabs-docs/issues/15), medida no artefato deste slice |
| Ícone maior em `tip`/`warning`/`info` que em `note` | **origem própria (consequência)** | [#100](https://github.com/ThiagoPanini/panlabs-docs/issues/100) — `research/paridade-devin` §11 mede `tip` em `18px`; a escala fechada de três tamanhos de [`icon.md`](icon.md) não tem esse degrau, e `md` (`20px`) é o mais perto. Divergência por ajuste à escala existente, não medição exata — a versão anterior renderizava as quatro no mesmo tamanho. **Recarimbada em S9-2:** era `delta deliberado`, classe que [`principios.md`](../principios.md) §3 declara **fechada em zero**. É o mesmo caso que [`busca.md`](../busca.md) §Procedência já resolveu no lote seguinte, para o raio de 14px que a escala não tem — e lá a linha diz, literalmente, *"não é `delta deliberado`"* |
| `danger` também está fora da âncora, não só do uso medido | **origem própria** | [#100](https://github.com/ThiagoPanini/panlabs-docs/issues/100) — `research/paridade-devin` §11 buscou a tag nos `.md` da âncora e não achou; classificação distinta e adicional à linha de uso zero da [#4](https://github.com/ThiagoPanini/panlabs-docs/issues/4) acima. Decidir se `danger` entra fica fora deste ticket — ele permanece removível a uma linha em `Types.js`, sem código morto no meio tempo |
| Raio 16, corpo 14 | **origem própria (correção)** | [#100](https://github.com/ThiagoPanini/panlabs-docs/issues/100) — o alvo medido da `## Anatomia` já dizia isso desde a [#93](https://github.com/ThiagoPanini/panlabs-docs/issues/93); `npm run paridade` mediu `--pd-radius-md` (12px) e corpo herdando 16px da prosa ambiente. Achado ao rodar o comparador contra o build deste slice, não por leitura de CSS |
