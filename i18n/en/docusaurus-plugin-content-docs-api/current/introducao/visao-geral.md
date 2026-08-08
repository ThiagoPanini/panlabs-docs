---
title: Overview
description: Trilho's machine surface — base, authentication, header versioning, error format, and idempotency.
---

# Overview

Trilho's API is REST over HTTPS, with JSON bodies both ways. One base, one
key, one version header.

```
https://api.trilho.dev/v1
```

## Authentication

Secret key in the `Authorization` header, as a *bearer token*. The
environment lives in the key: `tk_test_` talks to the sandbox, `tk_live_` to
production. There is no environment parameter in the request.

## Version

`Trilho-Version: 2026-01-15`. Omitting the header pins the account to the
version it was created under — never to the latest. This is deliberate: an
integration that upgrades versions on its own is an integration that breaks
on a deploy nobody made.

## Errors

Every error returns the same envelope, and `codigo` is stable — it is what
you handle in code, never `mensagem`, which is for humans and can change.

| Class | Means |
| --- | --- |
| `400` | the request is not valid against the contract |
| `401` `403` | key missing, invalid, from another environment, or without permission |
| `404` | the resource does not exist **on this account** |
| `409` | state conflict, or a reused idempotency key |
| `422` | the request is valid and the values are not; `detalhes` carries all of them |
| `429` | rate limit; the header says how many calls remain |
| `5xx` | ours; safe to retry with the same idempotency key |

**A declined payment method is not in this table**, and that is deliberate:
it is a successful `201` response, with the outcome in `status` and
`motivo_recusa`. The request was correct and the financial system said *no*.

## Idempotency

`Idempotency-Key` on every request that creates something. A 24-hour window,
the same in both environments. Repeating the call with the same key returns
the **same** response, including the same `id` — not a new resource.
