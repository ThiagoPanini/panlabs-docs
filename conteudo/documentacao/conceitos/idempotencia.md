---
title: Idempotência
description: Por que toda escrita no Trilho aceita Idempotency-Key, o que a janela de 24 horas garante e onde ela deixa de garantir.
---

# Idempotência

<Untranslated />

Numa API de pagamentos, o modo de falhar mais comum não é a requisição recusada.
É a requisição cuja **resposta se perdeu** — e que o cliente repete sem saber se
a primeira passou. Idempotência é o mecanismo que faz essa repetição ser segura.

## O contrato

Toda requisição que cria alguma coisa aceita o cabeçalho `Idempotency-Key`. A
regra é curta:

> **Mesma chave, mesmo corpo, dentro de 24 horas → a resposta original,
> byte a byte, sem criar nada de novo.**

A chave é uma string de até 255 caracteres que **você** escolhe. O Trilho não a
gera e não a valida além do comprimento: um UUID v4 serve, o `id` do seu pedido
serve, e um contador serve mal.

```bash
curl https://api.trilho.dev/v1/cobrancas \
  -H "Authorization: Bearer tk_live_..." \
  -H "Idempotency-Key: pedido-4821-tentativa-1" \
  -H "Content-Type: application/json" \
  -d '{"valor": 14990, "meio": "pix", "referencia_externa": "pedido-4821"}'
```

Repetir essa chamada dez vezes cria **uma** cobrança e devolve dez vezes o mesmo
`cob_...`, com o mesmo `201`.

## O que a resposta repetida carrega

| Cabeçalho | Na primeira | Na repetida |
| --- | --- | --- |
| `Idempotency-Replayed` | ausente | `true` |
| `X-Trilho-Requisicao` | `req_...` novo | o `req_` da primeira |
| status HTTP | `201` | `201` — o mesmo |

O `Idempotency-Replayed` existe para observabilidade, não para lógica: se o seu
código precisa saber se foi replay para decidir alguma coisa, o desenho está
errado. O ponto de idempotência é justamente você **não** precisar saber.

:::warning[Mesma chave, corpo diferente, é erro]

Reusar uma chave com um corpo diferente devolve `409` com
`codigo: "chave_de_idempotencia_reusada"`. Isso é deliberado: o cenário quase
sempre é um laço que reaproveita a chave entre pedidos distintos, e aceitar
silenciosamente devolveria a cobrança **do pedido errado**.

:::

## Como escolher a chave

A chave boa é **derivada da intenção de negócio**, não do momento da chamada.

| Chave | Comportamento sob retentativa |
| --- | --- |
| `crypto.randomUUID()` a cada tentativa | não protege nada — cada retry é uma cobrança |
| timestamp | não protege nada, e ainda parece que protege |
| `pedido-4821` | protege o pedido, para sempre dentro da janela |
| `pedido-4821-tentativa-2` | protege a tentativa, e permite recobrar de propósito |

As duas últimas linhas são as certas, e a escolha entre elas é de produto: a
terceira impede duas cobranças para o mesmo pedido; a quarta permite uma segunda
cobrança deliberada quando a primeira expirou.

```js title="O padrão que funciona"
async function cobrarPedido(pedido, tentativa = 1) {
  return trilho.cobrancas.criar(
    {
      valor: pedido.total,
      meio: 'pix',
      referencia_externa: pedido.id,
    },
    {idempotencyKey: `${pedido.id}-tentativa-${tentativa}`},
  );
}
```

## A janela de 24 horas

A deduplicação vale por **24 horas a partir da primeira requisição**, e vale
igual no sandbox e em produção. Passada a janela, a chave é esquecida: a mesma
chamada cria uma segunda cobrança.

Vinte e quatro horas é folgado para retentativa de rede e apertado para
retentativa humana. Se o seu operador reprocessa uma fila no dia seguinte, a
idempotência não vai salvá-lo — o que salva é `referencia_externa` mais uma
consulta antes de criar.

:::note[O sandbox tem a mesma janela de propósito]

Se o comportamento divergisse, o sandbox deixaria de servir para testar
justamente o caso em que idempotência importa, que é a repetição depois de um
timeout.

:::

## Onde ela não alcança

**Leituras não precisam.** `GET` já é idempotente por definição, e mandar a
chave num `GET` é ignorado sem erro.

**Cancelamento e estorno usam o `id`, não a chave.** `DELETE /cobrancas/cob_X` e
`POST /estornos` com o mesmo `cobranca_id` e o mesmo valor são idempotentes por
identidade — repetir não cria um segundo estorno.

**A entrega de webhook não é idempotente, e é o seu lado que resolve.** O mesmo
evento chega mais de uma vez por desenho. O `id` do evento é a chave de
deduplicação, e quem não a usa processa o mesmo pagamento duas vezes. Ver
[Webhooks](webhooks).
