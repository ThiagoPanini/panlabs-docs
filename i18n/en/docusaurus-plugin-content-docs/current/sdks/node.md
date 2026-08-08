---
title: Node
description: Install, configure, use and handle errors with Trilho's official Node SDK — types bundled, no runtime dependencies.
---

# Node

`@trilho/node` covers the whole API, ships its types, and drags in no runtime
dependencies. Requires Node 20 or newer.

## Install

<CodeGroup groupId="gerenciador-node" queryString="pm">

```bash title="npm"
npm install @trilho/node
```

```bash title="pnpm"
pnpm add @trilho/node
```

```bash title="yarn"
yarn add @trilho/node
```

</CodeGroup>

## Configure

```js
import {Trilho} from '@trilho/node';

export const trilho = new Trilho(process.env.TRILHO_SECRET_KEY, {
  // Optional: without this, the SDK uses the version pinned on your account.
  versaoApi: '2026-01-15',
  // 3 attempts with exponential backoff on 429 and 5xx. Never on 4xx.
  maxTentativas: 3,
  timeoutMs: 20_000,
});
```

The API base URL comes from the **key prefix** — `tk_test_` points at the
sandbox, `tk_live_` at production. There is no environment option, and that is
deliberate: a key and a base URL that disagree is an error that only shows up on
the statement.

## Use

```js
const cobranca = await trilho.cobrancas.criar(
  {
    valor: 14990,
    moeda: 'BRL',
    meio: 'pix',
    referencia_externa: 'pedido-4821',
  },
  {idempotencyKey: 'pedido-4821'},
);
```

The second position is the per-request options object — `idempotencyKey`,
`timeoutMs` and `signal`. It sits apart from the body so that no SDK option can
collide with an API field on the day the API gains a new one.

Pagination is iteration, and the cursor is the SDK's problem:

```js
for await (const cobranca of trilho.cobrancas.listar({status: 'liquidada'})) {
  console.log(cobranca.id, cobranca.valor);
}
```

And webhook signature verification is one call:

```js
const evento = trilho.webhooks.verificar(
  corpoCru,                       // Buffer, not an object — the HMAC is over bytes
  req.get('X-Trilho-Assinatura'),
  process.env.TRILHO_WEBHOOK_SECRET,
);
```

## Error handling

Every API failure becomes a subclass of `TrilhoError`, and `codigo` is what you
branch on — never the message.

```js
import {TrilhoError, ErroDeValidacao, ErroDeLimite} from '@trilho/node';

try {
  await trilho.cobrancas.criar(dados);
} catch (erro) {
  if (erro instanceof ErroDeValidacao) {
    // erro.detalhes -> [{campo, codigo}, ...] — all of them at once
    return responder(422, erro.detalhes);
  }
  if (erro instanceof ErroDeLimite) {
    return agendar(erro.retryAfterMs);
  }
  if (erro instanceof TrilhoError) {
    log.error({requisicao: erro.requisicao, codigo: erro.codigo});
  }
  throw erro;
}
```

`erro.requisicao` is the `req_...` of that call. It is the first thing support
asks for, and keeping it in your log turns an hours-long conversation into a
minutes-long one.

:::warning[A decline does not throw]

A charge declined for `saldo_insuficiente` is a successful response — the `catch`
does not run. Read `cobranca.status` and `cobranca.motivo_recusa`. See
[Concepts › Errors](../conceitos/erros).

:::

## Escape hatch to raw HTTP

A new resource shows up in the API before it shows up in the SDK. The escape
hatch uses the same base URL, the same key and the same retry policy:

```js
const resposta = await trilho.requisitar('POST', '/recurso-novo', {
  corpo: {campo: 'valor'},
});
```

Reaching for it is not a sign that something is wrong.

:::note[Types ship in the package]

There is no `@types/trilho`. The types are generated from the same OpenAPI
contract the [API reference](/api-reference/introducao/visao-geral) publishes, so
the SDK does not know a field the reference does not document.

:::
