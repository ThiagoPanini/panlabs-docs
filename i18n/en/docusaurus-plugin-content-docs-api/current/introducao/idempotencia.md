---
title: Idempotency
description: The Idempotency-Key header, the four endpoints that accept it, the 24-hour window, and the exact replay contract.
---

# Idempotency

This page documents the **contract** of the `Idempotency-Key` header —
what it guarantees, byte for byte. For the reasoning behind when and how
to choose a key, see [Concepts › Idempotency](/docs/conceitos/idempotencia)
in the main documentation.

<ParamField name="Idempotency-Key" type="string">
A string up to 255 characters, chosen by the caller — Trilho does not
generate it and does not enforce a format beyond the length.
</ParamField>

## Where it applies

The four endpoints that create a resource accept it. No other verb reads
the header — sending it on a `GET`, `PATCH`, or `DELETE` has no effect, and
is not an error.

- [`POST /cobrancas`](/api-reference/cobrancas/criar-cobranca)
- [`POST /clientes`](/api-reference/clientes/criar-cliente)
- [`POST /assinaturas`](/api-reference/assinaturas/criar-assinatura)
- [`POST /reembolsos`](/api-reference/reembolsos/criar-reembolso)

## The exact contract

> Same key, same body, within 24 hours → the original response, byte for
> byte, with the same `id`, without creating anything new.

| Situation | Response |
| --- | --- |
| New key | creates the resource normally |
| Same key, same body, within 24h | returns the original response — same `id`, same HTTP status |
| Same key, **different** body, within 24h | `409`, `codigo: "chave_de_idempotencia_reusada"` — nothing is created |
| Same key, after 24h | the key was forgotten; creates a new resource |
| No header | creates normally, with no replay protection |

"Same body" is compared field by field of the decoded JSON, not byte for
byte of the request text — reordering keys or changing whitespace does not
count as a different body.

## The replay response

The second call with the same key and the same body carries one extra
header, for anyone who needs to distinguish it for observability:

```http
Idempotency-Replayed: true
```

It should not change your code's behavior — if your call logic needs to
know whether it was a replay to decide something, the design is asking for
a second look. The entire point of idempotency is the caller **not**
needing to know.
