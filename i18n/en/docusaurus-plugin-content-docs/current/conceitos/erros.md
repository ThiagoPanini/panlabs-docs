---
title: Errors
description: Trilho's error envelope, the six status classes, and the difference between an integration error and a decline from the financial system.
---

# Errors

Trilho has **one** error format, and it is the same across the whole API. That
matters more than it looks: a client that can read the envelope can read any
failure, including failures from endpoints that did not exist when it was
written.

## The envelope

```json title="422 Unprocessable Entity"
{
  "erro": {
    "codigo": "valor_abaixo_do_minimo",
    "mensagem": "O valor mínimo para uma cobrança em Pix é R$ 0,01.",
    "campo": "valor",
    "documentacao": "https://docs.trilho.dev/docs/conceitos/erros#valor_abaixo_do_minimo",
    "requisicao": "req_5Hb8wY"
  }
}
```

| Field | For whom | Stability |
| --- | --- | --- |
| `codigo` | your code | **contract** — changes only in a new API version |
| `mensagem` | a human reading logs | free-form, changes without notice |
| `campo` | your form | present only on validation errors |
| `documentacao` | whoever is debugging | contract |
| `requisicao` | our support team | — |

The first row decides everything: **branch on `codigo`, never on `mensagem`**.
The message is product copy, its wording changes and one day its language will
too. An `if` over it is a bug with a due date.

:::note[`mensagem` is not translated]

It arrives in Portuguese regardless of locale, because it comes from the API and
not from this site. That is another reason not to show it to an end user or
branch on it — `codigo` plus your own copy is the right pairing.

:::

## The six classes

| Status | Class | Whose fault | Retry? |
| --- | --- | --- | --- |
| `400` `422` | malformed or invalid request | yours | no — the same body fails again |
| `401` `403` | credentials | yours | no |
| `404` | nonexistent resource | yours, almost always | no |
| `409` | state or idempotency conflict | yours | not without changing something |
| `429` | rate limit | yours, but transient | **yes**, with backoff |
| `500` `502` `503` | ours | ours | **yes**, exponential backoff |

Only the last two rows belong in a retry loop. Retrying a `422` spends rate limit
to receive the same error, and it is the pattern that most reliably turns a small
bug into an incident.

:::warning[`429` brings the wait time with it]

The rate-limit response carries `Retry-After` in seconds and
`X-Trilho-Limite-Restante` with what is left in the window. A retry that ignores
`Retry-After` and uses fixed backoff consumes the next window whole and gets
blocked again.

:::

## An integration error is not a decline

This is the distinction that costs the most, and it does not show up in the HTTP
status.

A card charge **declined for insufficient funds** is a successful `201`. The
request was correct, the financial system answered, and the answer was *no*. The
outcome arrives in the body, in `status` and `motivo_recusa`:

```json title="201 Created — and declined"
{
  "id": "cob_7Pd1nS",
  "status": "recusada",
  "meio": "cartao",
  "motivo_recusa": {
    "codigo": "saldo_insuficiente",
    "reapresentar": true,
    "reapresentar_apos": "2026-08-08T18:12:04Z"
  }
}
```

Treating this as a code error produces the alert that fires a thousand times a
day and that nobody reads. `saldo_insuficiente` and `cartao_bloqueado` are
legitimate answers from the financial system; the full catalogue, with what to do
about each, is in [Operations › Decline codes](../operacao/codigos-de-recusa).

## Validation returns every problem at once

Validation errors come with `detalhes`, and the list is complete — not the first
invalid field, all of them:

```json title="422 Unprocessable Entity"
{
  "erro": {
    "codigo": "requisicao_invalida",
    "mensagem": "A requisição tem 2 campos inválidos.",
    "requisicao": "req_5Hb8wY",
    "detalhes": [
      {"campo": "valor", "codigo": "valor_abaixo_do_minimo"},
      {"campo": "meio", "codigo": "valor_nao_permitido"}
    ]
  }
}
```

This is deliberate, and the reason is a product one: an API that returns one
error at a time forces the form on the other side into a network round trip per
wrong field, and the user fixes one field at a time until they give up.

:::note[`requisicao` is what support will ask for]

Every error carries the `req_...` of that call, and it also arrives in the
`X-Trilho-Requisicao` header of **all** responses, including successful ones.
Keeping it in your log next to the error turns an hours-long support conversation
into a minutes-long one.

:::

## What never appears in an error

No Trilho error response contains a card number, a CVV, a full Pix key or any
part of an API key. If you are seeing one of those in a log, it came from **your**
side — almost always from an interceptor that records the request body before
sending it.
