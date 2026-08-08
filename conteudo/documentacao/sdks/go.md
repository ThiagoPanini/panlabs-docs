---
title: Go
description: Instalação, configuração, uso e tratamento de erro do SDK oficial do Trilho para Go — e a única linguagem sem snippet gerado na Referência da API.
---

# Go

<Untranslated />

`github.com/trilho-dev/trilho-go` é um módulo único, sem dependência fora da
biblioteca padrão. Requer Go 1.22 ou mais novo.

:::warning[Go não tem snippet gerado na Referência da API]

Os exemplos de código de cada endpoint na
[Referência da API](/api-reference/introducao/visao-geral) saem em cURL, Node e
Python. **Go não está lá**, e a lacuna é declarada em vez de escondida: o
gerador produz os snippets a partir do contrato OpenAPI, e a receita de Go exige
tipos nomeados por endpoint que o contrato não carrega.

Esta página é, portanto, a superfície canônica de Go — os padrões abaixo cobrem
o que o snippet cobriria.

:::

## Instalação

<CodeGroup groupId="gerenciador-go" queryString="pm">

```bash title="go get"
go get github.com/trilho-dev/trilho-go@latest
```

```bash title="go.mod"
require github.com/trilho-dev/trilho-go v1.4.0
```

</CodeGroup>

## Configuração

```go
import (
	"os"
	"time"

	"github.com/trilho-dev/trilho-go"
)

cliente := trilho.Novo(os.Getenv("TRILHO_SECRET_KEY"), trilho.Opcoes{
	// Opcional: sem isto, o SDK usa a versão travada na sua conta.
	VersaoAPI: "2026-01-15",
	// 3 tentativas com espera exponencial em 429 e 5xx. Nunca em 4xx.
	MaxTentativas: 3,
	Timeout:       20 * time.Second,
})
```

A base da API sai do **prefixo da chave** — `tk_test_` aponta para o sandbox,
`tk_live_` para produção. Não existe campo de ambiente, e é de propósito: uma
chave e uma base que discordam é um erro que só aparece no extrato.

## Uso

```go
cobranca, err := cliente.Cobrancas.Criar(ctx, trilho.CriarCobranca{
	Valor:             14990,
	Moeda:             "BRL",
	Meio:              trilho.MeioPix,
	ReferenciaExterna: "pedido-4821",
}, trilho.ComIdempotencyKey("pedido-4821"))
```

O `context.Context` é o primeiro argumento em toda chamada, e é ele que carrega
cancelamento e prazo. As opções por requisição são variádicas, e ficam fora do
struct de corpo para que nenhuma colida com um campo da API no dia em que a API
ganhar um campo novo.

Paginação usa iterador, e o cursor é problema do SDK:

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

## Tratamento de erro

Toda falha da API vira um `*trilho.Erro`, e o `Codigo` é o que se ramifica —
nunca a mensagem.

```go
cobranca, err := cliente.Cobrancas.Criar(ctx, dados)

var erroValidacao *trilho.ErroDeValidacao
var erroLimite *trilho.ErroDeLimite

switch {
case errors.As(err, &erroValidacao):
	// erroValidacao.Detalhes -> []Detalhe{{Campo, Codigo}} — todos de uma vez
	return responder(422, erroValidacao.Detalhes)
case errors.As(err, &erroLimite):
	return agendar(erroLimite.RetryAfter)
case err != nil:
	log.Error("trilho", "requisicao", trilho.RequisicaoDe(err), "erro", err)
	return err
}
```

`trilho.RequisicaoDe(err)` devolve o `req_...` daquela chamada. É o primeiro dado
que o suporte pede, e guardá-lo no log transforma uma conversa de horas numa de
minutos.

:::note[Recusa não é `err`]

Uma cobrança recusada por `saldo_insuficiente` devolve `err == nil`. Leia
`cobranca.Status` e `cobranca.MotivoRecusa`. Ver
[Conceitos › Erros](../conceitos/erros).

:::

## Webhooks e escape para HTTP cru

A verificação de assinatura é uma chamada, e ela recebe os **bytes crus**:

```go
corpoCru, _ := io.ReadAll(io.LimitReader(r.Body, 1<<20))

evento, err := trilho.VerificarWebhook(
	corpoCru,
	r.Header.Get("X-Trilho-Assinatura"),
	os.Getenv("TRILHO_WEBHOOK_SECRET"),
)
```

E recurso novo aparece na API antes de aparecer no SDK. O escape usa a mesma
base, a mesma chave e a mesma política de retentativa:

```go
var resposta map[string]any
err := cliente.Requisitar(ctx, "POST", "/recurso-novo",
	map[string]any{"campo": "valor"}, &resposta)
```

Em Go, este escape é usado mais do que nos outros dois SDKs — e ele é a razão
pela qual a ausência de snippet gerado incomoda menos do que parece.
