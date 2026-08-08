---
title: Catálogo de componentes
description: Os dezoito componentes que a documentação do Trilho oferece a quem escreve, exercitados com todas as variantes numa página só.
---

# Catálogo de componentes

<Untranslated />

Esta página é a **fixture do catálogo**: ela exercita os dezoito componentes de
conteúdo com todas as variantes, para que a aparência de cada um possa ser
conferida num lugar só em vez de caçada por dezenas de páginas.

Ela também é o guia de autoria. Tudo abaixo foi escrito num arquivo `.md` comum,
**sem um único `import`** — os dezoito são globais.

## Aviso e destaque

O `callout` não é uma tag: é a admonition nativa, e a sintaxe é `:::`. São quatro
variantes, e o título sai de graça entre colchetes.

:::note
`note` é a variante **azul**, e ela carrega o contexto que o leitor não pediu mas
precisa. É a de maior alcance na medição.
:::

:::info
`info` é a variante **neutra**. A inversão contra a convenção é deliberada: é ela
que faz o sistema ler como a âncora.
:::

:::tip
`tip` é a sugestão — e ela absorveu a antiga variante de confirmação, que a
medição mostrou ser pixel a pixel idêntica.
:::

:::warning[Idempotência não é opcional]
Toda requisição que cria dinheiro aceita `Idempotency-Key`. Sem ela, um retry de
rede vira uma segunda cobrança.
:::

O título entre colchetes corrige um bug que duas equipes independentes tentaram
contornar na âncora, onde a prop de título é silenciosamente ignorada.

## Navegação e sequência

O `card` é um link quando tem `href`, e uma caixa quando não tem. O `card-group`
não recebe contagem de colunas: a contagem de cartões faz o trabalho sozinha.

<CardGroup>
<Card title="Comece aqui" icon="rocket" href="/docs/comece-aqui/visao-geral">
Suba a primeira cobrança autorizada em dez minutos.
</Card>
<Card title="Conceitos" icon="shapes" href="/docs/conceitos/mapa-dos-conceitos">
O que acontece entre `criada` e `paga`.
</Card>
<Card title="Referência da API" icon="code-xml" href="/api-reference/introducao/visao-geral">
Todo endpoint, todo parâmetro, toda resposta.
</Card>
</CardGroup>

Cinco cartões numa grade de três deixam **a última fila incompleta**, e ela fica
incompleta: esticar o último é a regra decorável que o resto do sistema recusou.

<CardGroup>
<Card title="Pix" icon="zap" href="/docs/meios-de-pagamento/comparativo">
Liquidação em segundos, irreversível.
</Card>
<Card title="Boleto" icon="receipt" href="/docs/meios-de-pagamento/comparativo">
Compensação em dias úteis.
</Card>
<Card title="Cartão" icon="credit-card" href="/docs/meios-de-pagamento/comparativo">
Autorização agora, captura depois.
</Card>
<Card title="Split" icon="workflow" href="/docs/meios-de-pagamento/comparativo">
Divisão entre recebedores na própria cobrança.
</Card>
<Card title="Assinaturas" icon="repeat" href="/docs/meios-de-pagamento/comparativo">
Cobrança que se repete sozinha.
</Card>
</CardGroup>

Sem `href` e sem ícone, o cartão continua sendo cartão — e deixa de ser
afordância.

<CardGroup>
<Card title="Sem link, sem ícone">
Um cartão que não leva a lugar nenhum é uma caixa de destaque, não um botão.
</Card>
<Card title="Só ícone" icon="key">
O ícone é o único elemento do catálogo pintado com a cor de marca.
</Card>
</CardGroup>

O `steps` numera sozinho, e o ícone **substitui** o número em vez de acompanhá-lo.

<Steps>
<Step title="Pegue uma chave de sandbox">
Ela começa com `tk_test_` e não cobra ninguém.
</Step>
<Step title="Crie uma cobrança de R$ 1,00">
Em Pix, e leia o QR de volta.
</Step>
<Step title="Aponte um webhook para um endpoint seu">
E confira a assinatura HMAC antes de confiar no corpo.
</Step>
<Step title="Pronto" icon="check">
Os três passos exercitam a API inteira: autenticação, criação, leitura e
notificação.
</Step>
</Steps>

## Dobrar e desdobrar

Os quatro colapsáveis do catálogo são `<details>` nativo. Nenhum deles tem uma
linha de JavaScript de interação: quem abre, fecha, move o foco e anuncia para o
leitor de tela é o navegador.

<AccordionGroup>
<Accordion title="Por que a cobrança expirou sozinha?" icon="clock">
Toda cobrança nasce com `expira_em`. Passado o prazo, ela vai para `expirada` e
não aceita mais pagamento.

:::tip
Uma admonition dentro de um componente funciona, desde que haja linha em branco
em volta. Este bloco existe para provar isso.
:::
</Accordion>
<Accordion title="Posso reabrir uma cobrança expirada?" description="Não, e o motivo é de conciliação">
Não. Crie outra, com a mesma `referencia_externa` — é ela que amarra as duas no
seu extrato.
</Accordion>
<Accordion title="O que já vem aberto" icon="lightbulb" defaultOpen>
Um accordion pode nascer aberto. O grupo **não** é exclusivo: em documentação o
leitor compara itens, e fechar o que ele abriu é hostil.
</Accordion>
</AccordionGroup>

O `expandable` é a mesma primitiva sem a moldura, e ele existe para aninhar
dentro de um campo de API.

<Expandable title="objeto pagamento" defaultOpen>
O primeiro nível nasce aberto. Do segundo em diante, fechado — a escolha
sobrevive às duas leituras possíveis sobre busca na página em conteúdo colapsado.

<Expandable title="objeto cartao">
Quatro níveis é o teto do sistema. O quinto reprova antes de virar página
ilegível.
</Expandable>
</Expandable>

## Código

A cerca de Markdown é o `code-block`, e ela não é swizzle: o que a repagina é CSS
sobre a classe estável mais a paleta de sintaxe do arquivo de tokens.

```js title="verificar-assinatura.js"
import {createHmac, timingSafeEqual} from 'node:crypto';

export function assinaturaConfere(corpoCru, cabecalho, segredo) {
  // "t=1786745524,v1=8f3a…" — a string assinada é `t + "." + corpo`.
  const {t, v1} = Object.fromEntries(
    cabecalho.split(',').map((item) => item.split('=')),
  );

  const esperado = createHmac('sha256', segredo)
    .update(`${t}.`)
    .update(corpoCru)
    .digest();
  const recebido = Buffer.from(v1, 'hex');

  // Comparação em tempo constante: `===` vaza o prefixo correto pelo relógio.
  // O guarda de comprimento não é zelo — `timingSafeEqual` lança sem ele.
  return recebido.length === esperado.length && timingSafeEqual(esperado, recebido);
}
```

O `code-group` compõe as abas do Docusaurus e lê o título de cada cerca. Com
`groupId` e `queryString`, a linguagem escolhida segue o leitor entre páginas e a
escolha vira link.

<CodeGroup groupId="code-lang" queryString="lang">

```js title="Node"
const cobranca = await trilho.cobrancas.criar({
  valor: 1000,
  meio: 'pix',
  referencia_externa: 'pedido-4821',
});
```

```python title="Python"
cobranca = trilho.cobrancas.criar(
    valor=1000,
    meio="pix",
    referencia_externa="pedido-4821",
)
```

</CodeGroup>

A sincronização **não é o default**, e o motivo cabe numa frase: as abas de um
grupo nem sempre são linguagens. A resposta abaixo é um bloco solto justamente
por isso — pô-la como terceira aba gravaria `Resposta` na escolha compartilhada,
e o defeito apareceria noutra página, como a aba errada selecionada.

```json title="Resposta"
{
  "id": "cob_3nK2xQ",
  "status": "criada",
  "valor": 1000,
  "meio": "pix",
  "expira_em": "2026-08-07T18:40:00Z"
}
```

O `tabs` é o mesmo componente, consumido direto e sem cerca dentro — ele serve
qualquer conteúdo, não só código.

<Tabs groupId="sdk" queryString>
<TabItem value="node" label="Node">

Instalação por `npm`, tipos inclusos, sem dependência de runtime.

</TabItem>
<TabItem value="python" label="Python">

Instalação por `pip`, compatível com 3.10 em diante.

</TabItem>
<TabItem value="go" label="Go">

Módulo único. Esta é a única linguagem com SDK e **sem** snippet gerado na
Referência da API — a lacuna fica visível em vez de escondida numa nota.

</TabItem>
</Tabs>

## Diagrama, tabela e sinais

O `frame` enquadra **diagrama**, nunca screenshot — um produto que não existe não
tem tela para fotografar. O desenho usa `currentColor`: um arquivo serve os dois
modos de cor.

<Frame caption="O ciclo de vida de uma cobrança em Pix, do POST à liquidação.">
<svg viewBox="0 0 520 88" width="520" height="88" role="img" aria-label="Fluxo em três estados: criada, paga e liquidada">
<g fill="none" stroke="currentColor" strokeWidth="1.5">
<rect x="1" y="24" width="140" height="40" rx="8" />
<rect x="190" y="24" width="140" height="40" rx="8" />
<rect x="379" y="24" width="140" height="40" rx="8" />
<path d="M141 44 h40" />
<path d="M171 38 l10 6 l-10 6" strokeLinecap="round" strokeLinejoin="round" />
<path d="M330 44 h40" />
<path d="M360 38 l10 6 l-10 6" strokeLinecap="round" strokeLinejoin="round" />
</g>
<g fill="currentColor" stroke="none" fontSize="14" textAnchor="middle">
<text x="71" y="49">criada</text>
<text x="260" y="49">paga</text>
<text x="449" y="49">liquidada</text>
</g>
</svg>
</Frame>

A `table` é Markdown puro. O que o componente acrescenta é o invólucro que rola —
e que devolve à tabela a semântica que o framework tirava dela ao torná-la um
bloco.

Estas seis linhas são um recorte verbatim de
[Operação › Códigos de recusa](../operacao/codigos-de-recusa), que é a fixture da
tabela larga. Duas cópias da mesma tabela divergem no primeiro mês, então esta é
recorte e não paráfrase.

| Código | Meio | Significado | Reapresentar? | Prazo |
| --- | --- | --- | --- | --- |
| `saldo_insuficiente` | Pix, cartão | o pagador não tem o valor disponível | sim | 24 h |
| `cartao_expirado` | cartão | a validade passou | **não** | peça outro cartão |
| `emissor_indisponivel` | cartão | o banco emissor não respondeu | sim | 30 s |
| `chave_pix_invalida` | Pix | a chave não existe ou foi removida | **não** | corrija a chave |
| `boleto_vencido` | boleto | a data de vencimento passou | **não** | gere outro |
| `limite_diario_excedido` | Pix, cartão | estourou o teto do dia | sim | no dia seguinte |

O `icon` é o vocabulário do autor dentro da prosa, em três tamanhos com
compensação óptica de traço: <Icon name="database" /> pequeno,
<Icon name="database" size="md" /> médio e <Icon name="database" size="lg" />
grande.

A `verb-badge` pinta o verbo por uma **escada de dano**, e não por convenção
copiada — ler, criar, substituir, alterar, destruir:

<VerbBadge verb="GET" /> <VerbBadge verb="POST" /> <VerbBadge verb="PUT" />
<VerbBadge verb="PATCH" /> <VerbBadge verb="DELETE" />

## Contrato de API

`param-field` e `response-field` têm a mesma anatomia e espécies diferentes. Só
`required` se marca: a ausência é o sinal de opcional.

<ParamField name="valor" type="integer" required>
O valor em centavos. Sempre inteiro — ponto flutuante em dinheiro é um bug
esperando data.
</ParamField>

<ParamField name="meio" type="string" required>
Um de `pix`, `boleto` ou `cartao`.
</ParamField>

<ParamField name="moeda" type="string" default="BRL">
Hoje só `BRL`. O campo existe para o dia em que não for.
</ParamField>

<ParamField name="expira_em" type="string (ISO 8601)">
Quando a cobrança deixa de aceitar pagamento. O default depende do meio.
</ParamField>

<ParamField name="descricao_curta" type="string" deprecated>
Substituído por `descricao`. Tachado e apagado, sem abrir cor nova — âmbar já é
`PUT` nesta mesma página.
</ParamField>

<ParamField name="pagamento" type="object">
Os dados do meio escolhido.

<Expandable title="objeto pagamento" defaultOpen>

<ParamField name="cartao.token" type="string">
O token do cartão salvo. Nunca o número.
</ParamField>

<ParamField name="cartao.parcelas" type="integer" default="1">
De 1 a 12.
</ParamField>

</Expandable>
</ParamField>

A resposta usa a espécie irmã, e ela é recursiva — um campo de objeto contém
outros campos.

<ResponseField name="id" type="string">
O identificador da cobrança, com prefixo `cob_`.
</ResponseField>

<ResponseField name="status" type="string">
Um dos sete de [Conceitos › Ciclo de vida](../conceitos/ciclo-de-vida): `criada`,
`pendente`, `paga`, `liquidada`, `recusada`, `expirada` ou `cancelada`.
</ResponseField>

<ResponseField name="eventos" type="array de object">
O histórico imutável do que aconteceu.

<Expandable title="objeto evento">

<ResponseField name="tipo" type="string">
O nome do evento, como `cobranca.paga`.
</ResponseField>

<ResponseField name="ocorrido_em" type="string (ISO 8601)">
Quando aconteceu, no relógio do Trilho.
</ResponseField>

</Expandable>
</ResponseField>

## Mudanças

O `update` é a entrada de changelog. O conteúdo desta documentação não é
versionado; a API é, por cabeçalho — e este componente é onde a mudança se conta.

São duas props: `label`, que é a data, e `tag`, que é a **etiqueta de versão** e é
opcional. As duas entradas abaixo são fictícias e existem para mostrar as duas
formas — o changelog de verdade está em
[Operação › Changelog](../operacao/changelog).

<Update label="12 de março" tag="v1.4">
Com `tag`: a etiqueta aparece ao lado da data. Serve quando a versão tem nome
próprio, como a de um SDK.
</Update>

<Update label="27 de fevereiro">
Sem `tag`: só a data. **É esta a forma que o changelog do Trilho usa**, porque
aqui a versão da API *é* a data — repeti-la na etiqueta imprimiria o mesmo valor
duas vezes.
</Update>
