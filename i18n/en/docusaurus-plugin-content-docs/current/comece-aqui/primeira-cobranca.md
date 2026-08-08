---
title: First charge
description: From zero to your first Pix charge, paid and confirmed by webhook, in five steps and about ten minutes.
---

# First charge

Ten minutes, a sandbox key and a public endpoint. By the end you will have
created a Pix charge, read the QR back, simulated the payment and received the
`cobranca.paga` event on your server — which is the whole API in miniature:
authentication, creation, reading and notification.

Nothing here charges anyone. The sandbox is deterministic and does not talk to
the Central Bank.

## The five steps

<Steps>
<Step title="Authenticate">

Grab the `tk_test_` key from the dashboard and confirm it answers:

```bash
curl https://api.sandbox.trilho.dev/v1/conta \
  -H "Authorization: Bearer tk_test_9f2c4a1e8b7d6503"
```

If you get `401`, the problem is in [Authentication](autenticacao) — solve it
there before moving on.

</Step>
<Step title="Create the charge">

A `POST` with amount, method and a reference of your own:

```bash
curl https://api.sandbox.trilho.dev/v1/cobrancas \
  -H "Authorization: Bearer tk_test_9f2c4a1e8b7d6503" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: primeira-cobranca-001" \
  -d '{
    "valor": 100,
    "moeda": "BRL",
    "meio": "pix",
    "descricao": "Integration test",
    "referencia_externa": "pedido-0001"
  }'
```

`valor` is an **integer in the currency's smallest unit**: `100` is R$ 1.00.
There is no decimal field anywhere in the API.

</Step>
<Step title="Read the QR back">

The response already carries everything the payer needs:

```json title="201 Created"
{
  "id": "cob_3nK2xQ",
  "status": "pendente",
  "valor": 100,
  "meio": "pix",
  "referencia_externa": "pedido-0001",
  "expira_em": "2026-08-07T18:40:00Z",
  "pagamento": {
    "pix": {
      "copia_e_cola": "00020126580014BR.GOV.BCB.PIX0136d3f1...5204000053039865802BR",
      "qr_code_url": "https://cdn.trilho.dev/qr/cob_3nK2xQ.png"
    }
  }
}
```

`copia_e_cola` is the EMV payload. It is the canonical value; the image at
`qr_code_url` is a convenience, and you can generate your own from the string.

</Step>
<Step title="Simulate the payment">

Only the sandbox has the endpoint that pretends to be the payer:

```bash
curl https://api.sandbox.trilho.dev/v1/cobrancas/cob_3nK2xQ/simular-pagamento \
  -X POST \
  -H "Authorization: Bearer tk_test_9f2c4a1e8b7d6503"
```

The charge moves to `paga` at once, and the event leaves the queue right after.

</Step>
<Step title="Receive the event" icon="check">

Point a webhook at one of your endpoints under **Developers › Webhooks** and
`cobranca.paga` arrives like this:

```json title="POST to your endpoint"
{
  "id": "evt_9Lm4tZ",
  "tipo": "cobranca.paga",
  "ocorrido_em": "2026-08-07T18:12:04Z",
  "dados": {
    "cobranca": {
      "id": "cob_3nK2xQ",
      "status": "paga",
      "referencia_externa": "pedido-0001"
    }
  }
}
```

Answer `200` within 10 seconds. Anything else becomes a retry.

</Step>
</Steps>

:::warning[Do not trust the body before verifying the signature]

The webhook endpoint is public, and a forged `POST` is trivial to build. Before
treating the order as paid, check the HMAC in the `X-Trilho-Assinatura` header
against the raw body. The recipe is at
[Verify a webhook signature](/receitas/verificar-assinatura-de-webhook).

:::

## What you just exercised

| Step | What it proves |
| --- | --- |
| 1 | the key is live and in the right environment |
| 2 | `Idempotency-Key` protects creation against a network retry |
| 3 | the `cobranca` object carries the payment method inside itself |
| 4 | the sandbox is deterministic — nothing depends on a third party |
| 5 | the event is the channel of truth about state changes |

:::tip[Repeat step 2 with the same `Idempotency-Key`]

The response will be identical, with the same `cob_3nK2xQ`, and no second charge
will exist. It is the most important behaviour in the API and the easiest one to
test.

:::

## Where to go next

<CardGroup>
<Card title="Concepts" icon="shapes" href="/docs/conceitos/mapa-dos-conceitos">
What happens between `criada` and `paga`, and why idempotency is not optional.
</Card>
<Card title="Payment methods" icon="wallet" href="/docs/meios-de-pagamento/comparativo">
Pix, boleto and card on timing, cost and reversibility.
</Card>
<Card title="Recipes" icon="terminal" href="/receitas/intro">
Closed problems, solved with copyable code.
</Card>
<Card title="API reference" icon="code-xml" href="/api-reference/introducao/visao-geral">
Every endpoint, every parameter, every response.
</Card>
</CardGroup>
