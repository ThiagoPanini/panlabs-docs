---
title: Python
description: Install, configure, use synchronously or asynchronously, and handle errors with Trilho's official Python SDK.
---

# Python

`trilho` covers the whole API, carries complete type annotations, and works both
ways — synchronous and asynchronous. Requires Python 3.10 or newer.

## Install

<CodeGroup groupId="gerenciador-python" queryString="pm">

```bash title="pip"
pip install trilho
```

```bash title="uv"
uv add trilho
```

```bash title="poetry"
poetry add trilho
```

</CodeGroup>

## Configure

```python
import os
from trilho import Trilho

trilho = Trilho(
    os.environ["TRILHO_SECRET_KEY"],
    # Optional: without this, the SDK uses the version pinned on your account.
    versao_api="2026-01-15",
    # 3 attempts with exponential backoff on 429 and 5xx. Never on 4xx.
    max_tentativas=3,
    timeout_s=20,
)
```

The API base URL comes from the **key prefix** — `tk_test_` points at the
sandbox, `tk_live_` at production. There is no environment parameter, and that is
deliberate: a key and a base URL that disagree is an error that only shows up on
the statement.

## Use

```python
cobranca = trilho.cobrancas.criar(
    valor=14990,
    moeda="BRL",
    meio="pix",
    referencia_externa="pedido-4821",
    idempotency_key="pedido-4821",
)
```

API fields are keyword arguments; SDK options — `idempotency_key`, `timeout_s` —
are prefixed and documented as reserved, so that none collides with an API field
on the day the API gains a new one.

Pagination is iteration, and the cursor is the SDK's problem:

```python
for cobranca in trilho.cobrancas.listar(status="liquidada"):
    print(cobranca.id, cobranca.valor)
```

The async form is the same surface with a different constructor:

```python
from trilho import TrilhoAsync

async with TrilhoAsync(os.environ["TRILHO_SECRET_KEY"]) as trilho:
    cobranca = await trilho.cobrancas.criar(valor=14990, meio="pix")

    async for evento in trilho.eventos.listar(tipo="cobranca.paga"):
        print(evento.id)
```

## Error handling

Every API failure becomes a subclass of `TrilhoError`, and `codigo` is what you
branch on — never the message.

```python
from trilho import TrilhoError, ErroDeValidacao, ErroDeLimite

try:
    trilho.cobrancas.criar(**dados)
except ErroDeValidacao as erro:
    # erro.detalhes -> [{"campo": ..., "codigo": ...}, ...] — all of them at once
    return responder(422, erro.detalhes)
except ErroDeLimite as erro:
    return agendar(erro.retry_after_s)
except TrilhoError as erro:
    log.error("trilho", requisicao=erro.requisicao, codigo=erro.codigo)
    raise
```

`erro.requisicao` is the `req_...` of that call. It is the first thing support
asks for, and keeping it in your log turns an hours-long conversation into a
minutes-long one.

:::warning[A decline does not raise]

A charge declined for `saldo_insuficiente` is a successful response — the
`except` does not run. Read `cobranca.status` and `cobranca.motivo_recusa`. See
[Concepts › Errors](../conceitos/erros).

:::

## Webhooks and the escape hatch to raw HTTP

Signature verification is one call, and it takes **bytes**:

```python
evento = trilho.webhooks.verificar(
    request.get_data(),                              # bytes, not a dict
    request.headers["X-Trilho-Assinatura"],
    os.environ["TRILHO_WEBHOOK_SECRET"],
)
```

And a new resource shows up in the API before it shows up in the SDK. The escape
hatch uses the same base URL, the same key and the same retry policy:

```python
resposta = trilho.requisitar("POST", "/recurso-novo", corpo={"campo": "valor"})
```

:::note[Types ship in the package]

There is no `trilho-stubs`. The annotations are generated from the same OpenAPI
contract the [API reference](/api-reference/introducao/visao-geral) publishes, so
the SDK does not know a field the reference does not document.

:::
