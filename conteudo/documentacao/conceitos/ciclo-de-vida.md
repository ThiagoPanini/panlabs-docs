---
title: Ciclo de vida da cobrança
description: Os seis estados de uma cobrança, as transições de mão única entre eles e por que não existe caminho de volta.
---

# Ciclo de vida da cobrança

<Untranslated />

Uma cobrança é uma máquina de estados com seis posições e nenhuma aresta de
volta. Isso não é uma restrição de implementação que um dia se afrouxa: é o que
torna o histórico auditável, e é o que permite tratar `evento` como registro
imutável em vez de log.

## Os seis estados

| Estado | O que significa | Quem provoca a saída |
| --- | --- | --- |
| `criada` | a cobrança existe, o meio ainda não foi emitido | o Trilho, em segundos |
| `pendente` | o QR, o boleto ou a autorização estão de pé, esperando | o pagador, ou o relógio |
| `paga` | o dinheiro foi confirmado, ainda não caiu na sua conta | o ciclo de liquidação |
| `liquidada` | o dinheiro está disponível no seu saldo | você, se estornar |
| `expirada` | o prazo passou sem pagamento | ninguém — é terminal |
| `cancelada` | você desistiu antes do pagamento | ninguém — é terminal |

`estornada` **não é um sétimo estado**. Um estorno é um objeto próprio, com `id`
próprio, que aponta para a cobrança — que continua `liquidada`. Uma cobrança que
mudasse de estado ao ser estornada apagaria o fato de ter sido paga, e é
exatamente esse fato que a contabilidade precisa.

<Frame caption="As transições possíveis. Nenhuma seta aponta para a esquerda.">
<svg viewBox="0 0 640 156" width="640" height="156" role="img" aria-label="Máquina de estados: criada leva a pendente, que leva a paga, expirada ou cancelada; paga leva a liquidada">
<g fill="none" stroke="currentColor" strokeWidth="1.5">
<rect x="1" y="58" width="112" height="38" rx="8" />
<rect x="161" y="58" width="112" height="38" rx="8" />
<rect x="321" y="58" width="112" height="38" rx="8" />
<rect x="481" y="58" width="112" height="38" rx="8" />
<rect x="321" y="1" width="112" height="38" rx="8" />
<rect x="321" y="115" width="112" height="38" rx="8" />
<path d="M113 77 h34" />
<path d="M137 71 l10 6 l-10 6" strokeLinecap="round" strokeLinejoin="round" />
<path d="M273 77 h34" />
<path d="M297 71 l10 6 l-10 6" strokeLinecap="round" strokeLinejoin="round" />
<path d="M433 77 h34" />
<path d="M457 71 l10 6 l-10 6" strokeLinecap="round" strokeLinejoin="round" />
<path d="M273 68 q22 -48 48 -48" />
<path d="M311 14 l10 6 l-9 7" strokeLinecap="round" strokeLinejoin="round" />
<path d="M273 86 q22 48 48 48" />
<path d="M312 127 l9 7 l-10 6" strokeLinecap="round" strokeLinejoin="round" />
</g>
<g fill="currentColor" stroke="none" fontSize="13" textAnchor="middle">
<text x="57" y="82">criada</text>
<text x="217" y="82">pendente</text>
<text x="377" y="82">paga</text>
<text x="537" y="82">liquidada</text>
<text x="377" y="25">expirada</text>
<text x="377" y="139">cancelada</text>
</g>
</svg>
</Frame>

## Como aparece na API

Cada transição emite um evento, e o nome do evento é o estado de chegada:

```json title="A sequência completa de uma cobrança Pix paga"
[
  {"tipo": "cobranca.criada",     "ocorrido_em": "2026-08-07T18:10:00Z"},
  {"tipo": "cobranca.pendente",   "ocorrido_em": "2026-08-07T18:10:02Z"},
  {"tipo": "cobranca.paga",       "ocorrido_em": "2026-08-07T18:12:04Z"},
  {"tipo": "cobranca.liquidada",  "ocorrido_em": "2026-08-07T18:12:09Z"}
]
```

O campo `eventos` da própria cobrança devolve a mesma lista, e ela é a resposta
canônica para *o que aconteceu com este pedido*. Reconstruir a história a partir
de leituras periódicas de `status` devolve buracos: entre duas leituras cabem
duas transições.

## O relógio, que é o outro ator

Toda cobrança nasce com `expira_em`, e o default depende do meio:

| Meio | Default de `expira_em` | Configurável |
| --- | --- | --- |
| Pix | 30 minutos | de 1 minuto a 30 dias |
| Boleto | data de vencimento + 3 dias úteis | sim, na criação |
| Cartão | não se aplica — a autorização é síncrona | — |

:::warning[Expiração não é um evento que você provoca]

Passado o prazo, a cobrança vai para `expirada` sozinha, e não aceita mais
pagamento. Um Pix que chegue depois do prazo é **devolvido automaticamente** ao
pagador em até 24 horas, com um evento `cobranca.pagamento_devolvido`. Se o seu
sistema deu o pedido por pago com base em outra coisa que não o evento, é aqui
que a divergência aparece.

:::

## O que não existe, e por quê

**Não existe reabrir.** Uma cobrança `expirada` ou `cancelada` não volta. Para
cobrar de novo, crie outra com a mesma `referencia_externa` — é ela que amarra as
duas no seu extrato e na conciliação.

**Não existe trocar o meio.** Se o Pix expirou e você quer oferecer boleto, isso
é uma cobrança nova. Uma cobrança que troca de meio no meio do caminho é uma
cobrança cujo histórico ninguém consegue auditar depois.

**Não existe alterar o valor.** Pelo mesmo motivo, e com a mesma saída.

:::note[A referência externa é o que costura tudo isso]

`referencia_externa` é um campo livre, indexado, e não precisa ser único. Três
cobranças com `pedido-0001` são três tentativas do mesmo pedido, e é assim que
elas aparecem no arquivo de movimento. Ver
[Operação › Arquivo de movimento](../operacao/arquivo-de-movimento).

:::

## Armadilhas conhecidas

O modo de falhar mais comum não é tratar um estado errado — é tratar `paga` e
`liquidada` como sinônimos. Entre os dois há um ciclo de liquidação, que em Pix
dura segundos e em cartão dura trinta dias. Liberar mercadoria em `paga` é uma
decisão de risco legítima; liberar **saque** em `paga` é contar um dinheiro que
ainda não existe.

O segundo mais comum é assumir ordem de chegada dos eventos. A entrega é no
mínimo uma vez e **sem ordem garantida**: `cobranca.paga` pode chegar depois de
`cobranca.liquidada`. Quem compara `ocorrido_em` antes de aplicar a mudança não
tem esse problema; quem confia na ordem do `POST` tem, e descobre em produção.
