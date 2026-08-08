---
title: Authentication
description: Trilho's three keys, where each one may live, and how rotation happens without taking the integration down.
---

# Authentication

Every request to Trilho carries a key in the `Authorization` header, as a bearer
token. There is no OAuth, no session and no login — an API that moves money
between servers has no user to authenticate, it has a credential to present.

Before you start: you need a dashboard account and a chosen environment. If you
have not read [Environments](ambientes) yet, read it — it decides which key
prefix you will use.

## The three keys

| Key | Prefix | Where it may live | What it does |
| --- | --- | --- | --- |
| Secret | `tk_test_` · `tk_live_` | your server only | everything |
| Publishable | `tk_pub_` | browser, app, client code | tokenizes cards |
| Webhook | `whsec_` | your server only | verifies event signatures |

The publishable key is the only Trilho credential that may ship to client code,
and it reads nothing: with it in hand, a third party can create card tokens and
nothing else.

The webhook key authenticates no request at all. It is the HMAC secret Trilho
uses to sign what it sends — see [Concepts › Webhooks](../conceitos/webhooks).

:::warning[The production secret key does not come back]

The `tk_live_` key is shown **exactly once**, when it is created. Trilho keeps
only the hash. If you lose it, the path is to revoke and create another — no
screen will show it again.

:::

## Authenticating a request

<Steps>
<Step title="Grab the environment's secret key">
In the dashboard, under **Developers › Keys**. Copy the sandbox one to start.
</Step>
<Step title="Send it in the `Authorization` header">

```bash
curl https://api.sandbox.trilho.dev/v1/cobrancas \
  -H "Authorization: Bearer tk_test_9f2c4a1e8b7d6503" \
  -H "Content-Type: application/json" \
  -d '{
    "valor": 14990,
    "moeda": "BRL",
    "descricao": "Trilho Pro plan — monthly"
  }'
```

</Step>
<Step title="Check the identity echo">

Every response carries `X-Trilho-Conta` with the `id` of the account the key
opened. It is the cheapest way to find out you sent the wrong key before finding
out from the statement.

</Step>
<Step title="Keep the key out of your code" icon="lock">

Environment variable, secrets vault, whatever your shop uses. Trilho scans public
GitHub for `tk_live_` keys and revokes what it finds — with no advance notice,
because notifying would take longer than a bot takes to use it.

</Step>
</Steps>

## Verifying it works

One read call is enough, and it creates nothing:

```bash
curl https://api.sandbox.trilho.dev/v1/conta \
  -H "Authorization: Bearer tk_test_9f2c4a1e8b7d6503"
```

```json title="Response"
{
  "id": "acc_7Kd0mR",
  "nome": "Loja Exemplo Ltda",
  "ambiente": "sandbox",
  "versao_api": "2026-01-15"
}
```

The `ambiente` field settles the question. If it says `sandbox` and you expected
`producao`, the problem is the key, not the base URL.

## Rotation with no downtime

Each environment accepts **two live secret keys at once**, and that is what makes
rotation a procedure instead of a scare:

1. Create the second key. Both are now valid.
2. Deploy the new one to your servers.
3. Confirm in **Developers › Keys** that the old one stopped receiving requests —
   the *last used* column updates within a minute.
4. Revoke the old one.

:::note[Revoking is immediate and irreversible]

Revocation takes effect the moment you confirm it, including for in-flight
requests. There is no grace period and no undo — which is why step 3 exists.

:::

## When authentication fails

| Response | `codigo` | What happened |
| --- | --- | --- |
| `401` | `chave_ausente` | no `Authorization` header was sent |
| `401` | `chave_invalida` | the key does not exist, or was revoked |
| `401` | `chave_de_ambiente_incorreto` | sandbox key against production base, or the reverse |
| `403` | `chave_sem_permissao` | a publishable key hitting a server-side endpoint |

`401` and `403` say different things on purpose. `401` is *I don't know who you
are*; `403` is *I know who you are and this isn't yours*. Treating both as the
same error is what produces the retry loop that keeps insisting with a revoked
key.
