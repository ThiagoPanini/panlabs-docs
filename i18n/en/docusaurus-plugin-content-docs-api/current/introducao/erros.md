---
title: Errors
description: The single envelope, the seven statuses that cover every failure, the validation-detail format, and what is worth retrying.
---

# Errors

Every failure from Trilho — across any of the six resources, in any
version — returns the same body format. Learning this page once covers
error handling for the entire API.

## The envelope

```json
{
  "codigo": "chave_de_idempotencia_reusada",
  "mensagem": "A chave de idempotência já foi usada com um corpo diferente.",
  "detalhes": null
}
```

<ResponseField name="codigo" type="string">
The stable error identifier. It is what you handle in code — with a
`switch` or a lookup map — and it does not change between API versions
without going through the same discipline as any other contract-breaking
change.
</ResponseField>

<ResponseField name="mensagem" type="string">
The human-readable description, in Portuguese. It can change at any time,
even within the same version — handling by it is the most common
integration mistake against this API.
</ResponseField>

<ResponseField name="detalhes" type="array de object">
Present only on `422`. One item per field that failed validation.

<Expandable title="detalhes object" defaultOpen>

<ResponseField name="campo" type="string">
The field's path inside the submitted body, like `pagamento.cartao.parcelas`.
</ResponseField>

<ResponseField name="motivo" type="string">
Why that specific value did not pass.
</ResponseField>

</Expandable>
</ResponseField>

## The seven statuses

| Status | When |
| --- | --- |
| `400` | the request is not valid JSON, or does not have the shape the contract requires — a missing required field, a wrong type |
| `401` | there is no key, or the key does not exist, was revoked, or is from another environment |
| `403` | the key is valid, but lacks permission for this operation |
| `404` | the resource does not exist **on this account** |
| `409` | a state conflict, or an `Idempotency-Key` reused with a different body |
| `422` | the shape is right and the values do not pass validation; `detalhes` carries all of them |
| `429` | rate limit exceeded; `Retry-After` says how many seconds to wait |

Two rows deserve a note the table has no room for:

**`404`, never `403`, for another account's resource.** An `id` from
another account — even if valid somewhere in the system — returns `404`.
The distinction between "does not exist" and "exists but is not yours"
would leak information about third-party accounts, so the API treats the
two situations as the same thing.

**`409` on a reused key is about the body, not the key.** Repeating the
same `Idempotency-Key` with the **same** body is the happy path — it
returns the original response, no error at all. It is only when the body
changes that `409` shows up; see [Idempotency](idempotencia).

## What is worth retrying

<Steps>
<Step title="5xx and 429 — always safe to retry">

Neither indicates the request was wrong. Retry with **the same**
`Idempotency-Key`, if the original call had one — without it, retrying
after a `5xx` risks creating the resource twice, because there is no
guarantee the first attempt failed before or after writing.

</Step>
<Step title="4xx other than 409 and 429 — never retry without changing something">

Retrying the exact call returns the exact same error. `401` needs a valid
key; `422` needs a body with the values corrected; `404` needs an `id`
that exists.

</Step>
<Step title="409 on a reused key — decide before retrying" icon="check">

If the body changed on purpose, generate a new key. If it was an
accident — the same `Idempotency-Key` reused by a retry loop that should
not have reused it — the `409` is already the signal that the original
operation most likely completed; look up the resource by its `id` before
trying again.

</Step>
</Steps>

:::warning[A declined payment is not on this page]

A charge declined by the issuer or by Pix returns `201` — success. The
outcome lives in `status: "recusada"` and `motivo_recusa`, inside the
[Cobrança](/api-reference/cobrancas/objeto-cobranca) resource, not in the
error envelope. See [Operation › Decline codes](/docs/operacao/codigos-de-recusa)
for the full catalog.

:::
