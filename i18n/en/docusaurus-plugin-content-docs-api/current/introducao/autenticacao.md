---
title: Authentication
description: The secret key, the two environments it carries, rotation, and what to do when it leaks.
---

# Authentication

Every request to Trilho carries a secret key in the `Authorization` header,
as a *bearer token*. There is no OAuth, no session, no second factor on the
call — the key **is** the account's identity.

```bash
curl https://api.trilho.dev/v1/cobrancas \
  -H "Authorization: Bearer tk_live_9f2c7a1e4b6d0938"
```

Omitting the header, or sending a key that no longer exists, returns `401`.
The error envelope is the same as any other failure — see
[Overview › Errors](visao-geral#errors).

## The environment lives in the key

There is no environment parameter in the request, and no second base URL
for the sandbox. The key's prefix decides on its own:

| Prefix | Environment | What it never does |
| --- | --- | --- |
| `tk_test_` | Sandbox | move real money. Boleto never registers with the real issuing bank; card only accepts the test numbers documented in [Get started › Environments](/docs/comece-aqui/ambientes) |
| `tk_live_` | Production | becomes reversible again once a charge is paid |

Both keys point to the **same account**, and the two resource catalogs are
fully isolated: a charge created in the sandbox never shows up in a listing
made with the production key, and vice versa. It is this isolation — not
the URL — that makes the sandbox safe to test against the real contract
without any risk of cross-writing.

:::warning[Card in production rejects test numbers]

The real issuer declines any of the card numbers documented for the
sandbox. This is intentional: if it accepted them, the sandbox would stop
proving anything about production behavior.

:::

## Where the key should never be

The secret key is the whole secret — whoever holds it can create charges,
read customer data, and trigger refunds. It should never reach the payer's
browser, a public repository, or an error log.

The only legitimate use of a *publishable* key — the one that tokenizes a
card in the browser, prefixed `tk_pub_` — is described in
[Payment methods › Card](/docs/meios-de-pagamento/cartao). It
tokenizes and does nothing else: a `tk_pub_` key never authenticates a call
in this contract.

In this reference's examples, the key appears as the environment variable
`$TRILHO_API_KEY` — never as a literal value. That is the same practice
that should hold for your own code: the key enters through an environment
variable or a secrets vault, never as a source-code literal.

## Rotation

An account can have more than one live key at a time, in each environment.
That is what makes rotation safe: generate a new key, switch the
integration to it, confirm the traffic migrated, and only then revoke the
old one. Revoking the only key in use breaks the integration until a new
one is generated and deployed — there is no grace window.

Suspected leakage calls for immediate revocation of the suspected key, even
without confirmation — the cost of rotating unnecessarily is minutes; the
cost of not rotating is the whole account.

## Authentication errors

| Status | `codigo` | When |
| --- | --- | --- |
| `401` | `chave_ausente` | no `Authorization` header on the request |
| `401` | `chave_invalida` | the key does not exist, was revoked, or is malformed |
| `403` | `chave_sem_permissao` | the key is valid but lacks scope for this operation |

None of the three distinguishes "wrong key" from "wrong account" in
`mensagem` — doing so would invite enumerating keys by trial and error
against the status code.
