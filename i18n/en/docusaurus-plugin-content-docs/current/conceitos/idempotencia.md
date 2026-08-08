---
title: Idempotency
description: Why every write in Trilho accepts Idempotency-Key, what the 24-hour window guarantees, and where it stops guaranteeing.
---

# Idempotency

In a payments API, the most common failure mode is not the rejected request. It
is the request whose **response was lost** — and which the client repeats without
knowing whether the first one went through. Idempotency is the mechanism that
makes that repetition safe.

## The contract

Every request that creates something accepts the `Idempotency-Key` header. The
rule is short:

> **Same key, same body, within 24 hours → the original response, byte for byte,
> creating nothing new.**

The key is a string of up to 255 characters that **you** choose. Trilho neither
generates nor validates it beyond length: a UUID v4 works, your order `id` works,
and a counter works badly.

```bash
curl https://api.trilho.dev/v1/cobrancas \
  -H "Authorization: Bearer tk_live_..." \
  -H "Idempotency-Key: pedido-4821-tentativa-1" \
  -H "Content-Type: application/json" \
  -d '{"valor": 14990, "meio": "pix", "referencia_externa": "pedido-4821"}'
```

Repeating that call ten times creates **one** charge and returns the same
`cob_...` ten times, with the same `201`.

## What the replayed response carries

| Header | On the first | On the replay |
| --- | --- | --- |
| `Idempotency-Replayed` | absent | `true` |
| `X-Trilho-Requisicao` | a new `req_...` | the first one's `req_` |
| HTTP status | `201` | `201` — the same |

`Idempotency-Replayed` exists for observability, not for logic: if your code
needs to know whether it was a replay in order to decide something, the design is
wrong. The whole point of idempotency is that you do **not** need to know.

:::warning[Same key, different body, is an error]

Reusing a key with a different body returns `409` with
`codigo: "chave_de_idempotencia_reusada"`. This is deliberate: the scenario is
almost always a loop reusing the key across distinct orders, and accepting it
silently would return the charge **for the wrong order**.

:::

## Choosing the key

A good key is **derived from business intent**, not from the moment of the call.

| Key | Behaviour under retry |
| --- | --- |
| `crypto.randomUUID()` per attempt | protects nothing — every retry is a charge |
| a timestamp | protects nothing, and looks like it does |
| `pedido-4821` | protects the order, forever within the window |
| `pedido-4821-tentativa-2` | protects the attempt, and allows deliberate recharging |

The last two are the right ones, and choosing between them is a product call: the
third prevents two charges for the same order; the fourth allows a deliberate
second charge once the first has expired.

```js title="The pattern that works"
async function cobrarPedido(pedido, tentativa = 1) {
  return trilho.cobrancas.criar(
    {
      valor: pedido.total,
      meio: 'pix',
      referencia_externa: pedido.id,
    },
    {idempotencyKey: `${pedido.id}-tentativa-${tentativa}`},
  );
}
```

## The 24-hour window

Deduplication holds for **24 hours from the first request**, and holds the same
in the sandbox and in production. After the window, the key is forgotten: the
same call creates a second charge.

Twenty-four hours is generous for network retries and tight for human retries. If
your operator reprocesses a queue the next day, idempotency will not save them —
what saves them is `referencia_externa` plus a lookup before creating.

:::note[The sandbox has the same window on purpose]

If the behaviour differed, the sandbox would stop being useful for testing
exactly the case where idempotency matters, which is the retry after a timeout.

:::

## Where it does not reach

**Reads do not need it.** `GET` is idempotent by definition, and sending the
header on a `GET` is ignored without error.

**Cancellation and refunds use the `id`, not the key.**
`DELETE /cobrancas/cob_X` and `POST /estornos` with the same `cobranca_id` and
amount are idempotent by identity — repeating creates no second refund.

**Webhook delivery is not idempotent, and your side handles it.** The same event
arrives more than once by design. The event `id` is the deduplication key, and
whoever does not use it processes the same payment twice. See
[Webhooks](webhooks).
