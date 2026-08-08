---
title: Erros
description: O envelope único, os sete status que cobrem toda falha, o formato de detalhes de validação e o que vale a pena repetir.
---

# Erros

Toda falha do Trilho — em qualquer dos seis recursos, em qualquer versão —
devolve o mesmo formato de corpo. Aprender esta página uma vez cobre o
tratamento de erro da API inteira.

## O envelope

```json
{
  "codigo": "chave_de_idempotencia_reusada",
  "mensagem": "A chave de idempotência já foi usada com um corpo diferente.",
  "detalhes": null
}
```

<ResponseField name="codigo" type="string">
O identificador estável do erro. É ele que se trata em código — com um
`switch` ou um mapa —, e ele não muda entre versões da API sem passar pela
mesma disciplina de qualquer outra mudança que quebra contrato.
</ResponseField>

<ResponseField name="mensagem" type="string">
A descrição para humano, em português. Ela pode mudar a qualquer momento,
inclusive dentro da mesma versão — tratar por ela é o erro de integração
mais comum contra esta API.
</ResponseField>

<ResponseField name="detalhes" type="array de object">
Presente só em `422`. Um item por campo que não passou na validação.

<Expandable title="objeto detalhes" defaultOpen>

<ResponseField name="campo" type="string">
O caminho do campo dentro do corpo enviado, como `pagamento.cartao.parcelas`.
</ResponseField>

<ResponseField name="motivo" type="string">
Por que aquele valor específico não passou.
</ResponseField>

</Expandable>
</ResponseField>

## Os sete status

| Status | Quando |
| --- | --- |
| `400` | a requisição não é JSON válido, ou não tem a forma que o contrato exige — campo obrigatório ausente, tipo errado |
| `401` | não há chave, ou a chave não existe, foi revogada, ou é de outro ambiente |
| `403` | a chave é válida, mas não tem permissão para esta operação |
| `404` | o recurso não existe **nesta conta** |
| `409` | conflito de estado, ou `Idempotency-Key` reusada com um corpo diferente |
| `422` | a forma está certa e os valores não passam na validação; `detalhes` traz todos |
| `429` | limite de taxa excedido; `Retry-After` diz quantos segundos esperar |

Duas linhas merecem uma nota que a tabela não cabe:

**`404`, nunca `403`, para recurso de outra conta.** Um `id` de outra
conta — mesmo que válido em algum lugar do sistema — devolve `404`. A
distinção entre "não existe" e "existe mas não é seu" vazaria informação
sobre contas de terceiros, então a API trata as duas situações como a
mesma coisa.

**`409` por chave reusada é sobre o corpo, não sobre a chave.** Repetir a
mesma `Idempotency-Key` com o **mesmo** corpo é o caso feliz — devolve a
resposta original, sem erro algum. É só quando o corpo muda que o `409`
aparece; ver [Idempotência](idempotencia).

## O que vale repetir

<Steps>
<Step title="5xx e 429 — sempre seguros para repetir">

Nenhum dos dois indica que a requisição estava errada. Repita com **a
mesma** `Idempotency-Key`, se a chamada original tinha uma — sem ela, uma
repetição depois de um `5xx` corre o risco de criar o recurso duas vezes,
porque não há garantia de que a primeira tentativa falhou antes ou depois
de escrever.

</Step>
<Step title="4xx que não é 409 e 429 — nunca repita sem mudar algo">

Repetir a chamada exata devolve o mesmo erro exato. `401` pede uma chave
válida; `422` pede um corpo com os valores corrigidos; `404` pede um `id`
que exista.

</Step>
<Step title="409 por chave reusada — decida antes de repetir" icon="check">

Se o corpo mudou de propósito, gere uma chave nova. Se foi acidente — o
mesmo `Idempotency-Key` reaproveitado por um laço de retentativa que não
deveria tê-lo reusado —, o `409` já é o sinal de que a operação original
provavelmente foi concluída; consulte o recurso pelo `id` antes de tentar
de novo.

</Step>
</Steps>

:::warning[Recusa de pagamento não está nesta página]

Uma cobrança recusada pelo emissor ou pelo Pix devolve `201` — sucesso.
O desfecho fica em `status: "recusada"` e `motivo_recusa`, dentro do
recurso [Cobrança](/api-reference/cobrancas/objeto-cobranca), não no
envelope de erro. Ver [Operação › Códigos de recusa](/docs/operacao/codigos-de-recusa)
para o catálogo completo.

:::
