---
title: Go
description: Install, configure, use and handle errors with Trilho's official Go SDK — and the one language with no generated snippet in the API reference.
---

# Go

`github.com/trilho-dev/trilho-go` is a single module with no dependencies outside
the standard library. Requires Go 1.22 or newer.

:::warning[Go has no generated snippet in the API reference]

The per-endpoint code examples in the
[API reference](/api-reference/introducao/visao-geral) ship in cURL, Node and
Python. **Go is not there**, and the gap is declared rather than hidden: the
generator builds those snippets from the OpenAPI contract, and the Go recipe
needs named per-endpoint types the contract does not carry.

This page is therefore Go's canonical surface — the patterns below cover what the
snippet would have covered.

:::

## Install

<CodeGroup groupId="gerenciador-go" queryString="pm">

```bash title="go get"
go get github.com/trilho-dev/trilho-go@latest
```

```bash title="go.mod"
require github.com/trilho-dev/trilho-go v1.4.0
```

</CodeGroup>

## Configure

```go
import (
	"os"
	"time"

	"github.com/trilho-dev/trilho-go"
)

cliente := trilho.Novo(os.Getenv("TRILHO_SECRET_KEY"), trilho.Opcoes{
	// Optional: without this, the SDK uses the version pinned on your account.
	VersaoAPI: "2026-01-15",
	// 3 attempts with exponential backoff on 429 and 5xx. Never on 4xx.
	MaxTentativas: 3,
	Timeout:       20 * time.Second,
})
```

The API base URL comes from the **key prefix** — `tk_test_` points at the
sandbox, `tk_live_` at production. There is no environment field, and that is
deliberate: a key and a base URL that disagree is an error that only shows up on
the statement.

## Use

```go
cobranca, err := cliente.Cobrancas.Criar(ctx, trilho.CriarCobranca{
	Valor:             14990,
	Moeda:             "BRL",
	Meio:              trilho.MeioPix,
	ReferenciaExterna: "pedido-4821",
}, trilho.ComIdempotencyKey("pedido-4821"))
```

`context.Context` is the first argument on every call, and it carries
cancellation and deadlines. Per-request options are variadic and sit outside the
body struct so that none collides with an API field on the day the API gains a
new one.

Pagination uses an iterator, and the cursor is the SDK's problem:

```go
for cobranca, err := range cliente.Cobrancas.Listar(ctx, trilho.FiltroCobranca{
	Status: trilho.StatusLiquidada,
}) {
	if err != nil {
		return err
	}
	fmt.Println(cobranca.ID, cobranca.Valor)
}
```

## Error handling

Every API failure becomes a `*trilho.Erro`, and `Codigo` is what you branch on —
never the message.

```go
cobranca, err := cliente.Cobrancas.Criar(ctx, dados)

var erroValidacao *trilho.ErroDeValidacao
var erroLimite *trilho.ErroDeLimite

switch {
case errors.As(err, &erroValidacao):
	// erroValidacao.Detalhes -> []Detalhe{{Campo, Codigo}} — all at once
	return responder(422, erroValidacao.Detalhes)
case errors.As(err, &erroLimite):
	return agendar(erroLimite.RetryAfter)
case err != nil:
	log.Error("trilho", "requisicao", trilho.RequisicaoDe(err), "erro", err)
	return err
}
```

`trilho.RequisicaoDe(err)` returns the `req_...` of that call. It is the first
thing support asks for, and keeping it in your log turns an hours-long
conversation into a minutes-long one.

:::note[A decline is not an `err`]

A charge declined for `saldo_insuficiente` returns `err == nil`. Read
`cobranca.Status` and `cobranca.MotivoRecusa`. See
[Concepts › Errors](../conceitos/erros).

:::

## Webhooks and the escape hatch to raw HTTP

Signature verification is one call, and it takes the **raw bytes**:

```go
corpoCru, _ := io.ReadAll(io.LimitReader(r.Body, 1<<20))

evento, err := trilho.VerificarWebhook(
	corpoCru,
	r.Header.Get("X-Trilho-Assinatura"),
	os.Getenv("TRILHO_WEBHOOK_SECRET"),
)
```

And a new resource shows up in the API before it shows up in the SDK. The escape
hatch uses the same base URL, the same key and the same retry policy:

```go
var resposta map[string]any
err := cliente.Requisitar(ctx, "POST", "/recurso-novo",
	map[string]any{"campo": "valor"}, &resposta)
```

In Go this escape hatch gets used more than in the other two SDKs — and it is why
the missing generated snippet stings less than it looks.
