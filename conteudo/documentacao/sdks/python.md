---
title: Python
description: Instalação, configuração, uso síncrono e assíncrono e tratamento de erro do SDK oficial do Trilho para Python.
---

# Python

<Untranslated />

`trilho` cobre a API inteira, tem anotações de tipo completas e funciona nas duas
formas — síncrona e assíncrona. Requer Python 3.10 ou mais novo.

## Instalação

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

## Configuração

```python
import os
from trilho import Trilho

trilho = Trilho(
    os.environ["TRILHO_SECRET_KEY"],
    # Opcional: sem isto, o SDK usa a versão travada na sua conta.
    versao_api="2026-01-15",
    # 3 tentativas com espera exponencial em 429 e 5xx. Nunca em 4xx.
    max_tentativas=3,
    timeout_s=20,
)
```

A base da API sai do **prefixo da chave** — `tk_test_` aponta para o sandbox,
`tk_live_` para produção. Não existe parâmetro de ambiente, e é de propósito: uma
chave e uma base que discordam é um erro que só aparece no extrato.

## Uso

```python
cobranca = trilho.cobrancas.criar(
    valor=14990,
    moeda="BRL",
    meio="pix",
    referencia_externa="pedido-4821",
    idempotency_key="pedido-4821",
)
```

Os campos da API são argumentos nomeados; as opções do SDK — `idempotency_key`,
`timeout_s` — são prefixadas e documentadas como reservadas, para que nenhuma
colida com um campo da API no dia em que a API ganhar um campo novo.

Paginação é iteração, e o cursor é problema do SDK:

```python
for cobranca in trilho.cobrancas.listar(status="liquidada"):
    print(cobranca.id, cobranca.valor)
```

A forma assíncrona é a mesma superfície, com outro construtor:

```python
from trilho import TrilhoAsync

async with TrilhoAsync(os.environ["TRILHO_SECRET_KEY"]) as trilho:
    cobranca = await trilho.cobrancas.criar(valor=14990, meio="pix")

    async for evento in trilho.eventos.listar(tipo="cobranca.paga"):
        print(evento.id)
```

## Tratamento de erro

Toda falha da API vira uma subclasse de `TrilhoError`, e o `codigo` é o que se
ramifica — nunca a mensagem.

```python
from trilho import TrilhoError, ErroDeValidacao, ErroDeLimite

try:
    trilho.cobrancas.criar(**dados)
except ErroDeValidacao as erro:
    # erro.detalhes -> [{"campo": ..., "codigo": ...}, ...] — todos de uma vez
    return responder(422, erro.detalhes)
except ErroDeLimite as erro:
    return agendar(erro.retry_after_s)
except TrilhoError as erro:
    log.error("trilho", requisicao=erro.requisicao, codigo=erro.codigo)
    raise
```

`erro.requisicao` é o `req_...` daquela chamada. É o primeiro dado que o suporte
pede, e guardá-lo no log transforma uma conversa de horas numa de minutos.

:::warning[Recusa não levanta exceção]

Uma cobrança recusada por `saldo_insuficiente` é uma resposta de sucesso — o
`except` não roda. Leia `cobranca.status` e `cobranca.motivo_recusa`. Ver
[Conceitos › Erros](../conceitos/erros).

:::

## Webhooks e escape para HTTP cru

A verificação de assinatura é uma chamada, e ela recebe **bytes**:

```python
evento = trilho.webhooks.verificar(
    request.get_data(),                              # bytes, não dict
    request.headers["X-Trilho-Assinatura"],
    os.environ["TRILHO_WEBHOOK_SECRET"],
)
```

E recurso novo aparece na API antes de aparecer no SDK. O escape usa a mesma
base, a mesma chave e a mesma política de retentativa:

```python
resposta = trilho.requisitar("POST", "/recurso-novo", corpo={"campo": "valor"})
```

:::note[Os tipos vêm no pacote]

Não existe `trilho-stubs`. As anotações são geradas do mesmo contrato OpenAPI que
a [Referência da API](/api-reference/introducao/visao-geral) publica, então o SDK
não conhece um campo que a referência não documente.

:::
