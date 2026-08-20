# `steps`

> **Nenhum valor numérico nasce neste documento.** Os comprimentos que o componente consome moram em [`../tokens.md`](../tokens.md) e são citados por nome de token. Os números do bloco *Alvo medido*, na anatomia, são **evidência de medição da âncora** — dizem o que se quer atingir, não o que temos, e quem os edita está afirmando que a âncora mudou.

## Papel

A sequência numerada — o que se faz primeiro, depois, depois. É o terceiro
componente em volume na medição, e ele existe porque o Docusaurus não tem
equivalente: uma lista ordenada de Markdown não segura título, corpo em vários
parágrafos e bloco de código dentro de um passo.

## Anatomia

`<ol>` e `<li>`. **A lista ordenada é a numeração**, e é ela que o leitor de tela
anuncia.

```html
<ol data-sd-component="steps">
  <li>
    <span>…</span>                        <!-- único <span> filho do passo -->
    <div>
      <p data-sd-part="title">…</p>
      …
    </div>
  </li>
</ol>
```

**Uma parte publicada.** O marcador é o único `<span>` filho do passo e o irmão é
um `<div>`, então `li > span` o alcança. O **título**, não: ele é um `<p>` no
meio dos `<p>` que o autor escreve no corpo do passo.

Um fio liga um marcador ao próximo. **No último passo ele desvanece em
gradiente**, em vez de repetir o traço cheio: sequência que termina não
aponta para lugar nenhum, mas corte abrupto não é o que a âncora mede.

**O contador é declarado, não herdado.** O passo é uma grade de duas colunas, e
um `<li>` que deixa de ser item de lista deixa de incrementar o contador
implícito — o número sumiria em silêncio. Um contador nomeado fecha essa falha.


**Alvo medido**, do `docs.devin.ai` a 1512, em `research/paridade-devin` §11.

| Sonda | Alvo | Tolerância |
| --- | --- | --- |
| Margem de topo | `40px` | exato |

O marcador de 28×28 e o conector de 1px da âncora não têm sonda: os dois são pseudo-elemento, e `querySelector` não os alcança. Ficam para a avaliação visual.

**A margem de topo estava em `24px`, não `40`** — `npm run paridade` mediu contra o build deste slice e achou o contêiner com `margin-block` simétrico (`--sd-space-6` nos dois lados) onde o alvo pede `40px` em cima e `24px` embaixo. A correção separa os dois valores.

**Um quarto dado do container fica de fora: `14px` de margem à esquerda.** A anatomia mede `margin: 40px 0 24px 14px`, e o recuo esquerdo não tem justificativa própria conhecida — pode ser alinhamento com algo específico do layout da âncora que este projeto não replica. Sem sonda e sem leitura confiável do porquê, fica registrado e não implementado.

**E agora há medição do nosso lado, o que muda o carimbo — S9-2.** A 1512, o `<ol>` deste componente abre em `388`, **o mesmo pixel** do `<p>` ao lado dele: o bloco alinha com a coluna de prosa, que é o que a caixa invisível de [`chrome.md`](../chrome.md) §2 impõe a todo conteúdo. Copiar os 14 empurraria o bloco para `402` e quebraria esse alinhamento. Não implementar deixa de ser omissão por dúvida e passa a ser **consequência de uma regra que a spec já carrega** — ver a Procedência.

**O conector do último passo desvanece em gradiente, e não termina abrupto.**
O fio continua existindo por um trecho depois do último marcador — só que como
`background: linear-gradient(...)` em vez de `border-inline-start`, porque
borda não aceita gradiente.

## Variantes

**Não há variante de lista.** O que varia é o marcador de cada passo, e são dois
estados:

| Marcador | Quando |
| --- | --- |
| número | o default |
| ícone | quando o passo declara `icon` |

**O ícone SUBSTITUI o número, não o acompanha.** A troca é decidida por passo e
não pela lista, então ela é feita pela presença do desenho e não por uma variante
no elemento pai.

## Autoria em MDX

```mdx
<Steps>
<Step title="Pegue uma chave de sandbox">
Ela começa com `tk_test_` e não cobra ninguém.
</Step>
<Step title="Pronto" icon="check">
Os três passos exercitam a API inteira.
</Step>
</Steps>
```

`Steps` não tem prop nenhuma, e `Step` tem duas — `title` e `icon`. A prop de
tamanho de título que a documentação da âncora destaca tem **zero ocorrências**
nas páginas medidas, e por isso não existe aqui.

## Tokens consumidos

Camada 2: `--sd-border-default`, `--sd-border-subtle`, `--sd-text-strong`.

Camada 1: `--sd-space-4`, `--sd-space-6`, `--sd-border-width`,
`--sd-radius-full`, `--sd-type-xs`, `--sd-weight-ui`, `--sd-leading-ui`.

Camada 3, declarado no escopo do componente: `--sd-step-marker`, o diâmetro do
marcador — que é também a coluna da grade e o ponto onde o fio começa. Um valor,
três consumidores.

## Light e dark

**Não se aplica.** Consome token semântico e não conhece modo.

## Motion / reduced-motion

**Não se aplica — nada anima.** Os passos aparecem com a página e não mudam de
estado.

## A11y

Sem foco próprio: não há elemento focável a menos que o autor escreva um link
dentro de um passo, e aí o contrato universal de [`foco.md`](../foco.md) o
alcança.

A numeração é semântica, não pintada: `<ol>` é anunciado como lista ordenada com
a contagem. O ícone que substitui o número é decorativo e sai da árvore de
acessibilidade — a posição do item já é anunciada pela lista.

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| **O alvo medido da anatomia** | **medido em referência** | medição de primeira mão da âncora, em `research/paridade-devin` §11 — [#93](https://github.com/ThiagoPanini/panlabs-docs/issues/93) |
| Componente do zero | herdado | [#4](https://github.com/ThiagoPanini/panlabs-docs/issues/4) — ausente no Docusaurus |
| `Steps` sem props, `Step` só com `title` | herdado | [#4](https://github.com/ThiagoPanini/panlabs-docs/issues/4) — superfície mínima medida |
| Ícone substitui o número | herdado | [#21](https://github.com/ThiagoPanini/panlabs-docs/issues/21) §8 |
| `<ol>`/`<li>` como substrato | origem própria | [#15](https://github.com/ThiagoPanini/panlabs-docs/issues/15) §6 |
| Contador nomeado em vez do implícito | **origem própria (implementação)** | um `<li>` que não é item de lista não incrementa o contador, e a falha seria muda |
| O fio do último passo desvanece em gradiente, em vez de não existir | herdado | [#100](https://github.com/ThiagoPanini/panlabs-docs/issues/100) — `research/paridade-devin` §11; a versão anterior cortava o fio no penúltimo passo, sem medição atrás |
| Margem de topo 40, separada da de baixo (24) | **origem própria (correção)** | [#100](https://github.com/ThiagoPanini/panlabs-docs/issues/100) — achado rodando `npm run paridade` contra o build deste slice; `margin-block` simétrico não tinha medição atrás |
| Margem esquerda de 14px, não implementada | **origem própria (consequência)** | [#100](https://github.com/ThiagoPanini/panlabs-docs/issues/100) — `research/paridade-devin` §11 **mede** o valor, e é por isso que a linha não é `lacuna de medição`: essa classe é dimensão que a pesquisa declarou **não medida**, e esta foi. **Recarimbada em S9-2.** O nosso zero não sai de medição — ele cai do alinhamento que a caixa invisível de [`chrome.md`](../chrome.md) §2 impõe a todo bloco de conteúdo. Medido a 1512: o `<ol>` abre em `388`, o mesmo pixel do `<p>` ao lado. Copiar os 14 empurraria o bloco para `402` e quebraria o alinhamento para comprar um número cuja função ninguém leu. **Reabre** com uma medição que explique o que os 14 fazem na âncora |
| Uma parte publicada | origem própria | [#15](https://github.com/ThiagoPanini/panlabs-docs/issues/15) §5 |
