---
title: Erros
description: O envelope de erro do Trilho, as cinco classes de status e a distinção entre erro de integração e recusa do sistema financeiro.
---

# Erros

<Untranslated />

O Trilho tem **um** formato de erro, e ele é o mesmo em toda a API. Isso importa
mais do que parece: um cliente que sabe ler o envelope sabe ler qualquer falha,
inclusive as de endpoints que ainda não existiam quando ele foi escrito.

## O envelope

```json title="422 Unprocessable Entity"
{
  "erro": {
    "codigo": "valor_abaixo_do_minimo",
    "mensagem": "O valor mínimo para uma cobrança em Pix é R$ 0,01.",
    "campo": "valor",
    "documentacao": "https://docs.trilho.dev/docs/conceitos/erros#valor_abaixo_do_minimo",
    "requisicao": "req_5Hb8wY"
  }
}
```

| Campo | Para quem | Estabilidade |
| --- | --- | --- |
| `codigo` | o seu código | **contrato** — só muda em versão nova da API |
| `mensagem` | um humano lendo log | livre, muda sem aviso |
| `campo` | o seu formulário | presente só em erro de validação |
| `documentacao` | quem está depurando | contrato |
| `requisicao` | o nosso suporte | — |

A linha que decide tudo é a primeira: **ramifique por `codigo`, nunca por
`mensagem`**. A mensagem é texto de produto, ela muda de redação e um dia vai
mudar de idioma. Um `if` sobre ela é um bug com data marcada.

## As cinco classes

| Status | Classe | De quem é a culpa | Retentar? |
| --- | --- | --- | --- |
| `400` `422` | requisição malformada ou inválida | sua | não — o mesmo corpo falha de novo |
| `401` `403` | credencial | sua | não |
| `404` | recurso inexistente | sua, quase sempre | não |
| `409` | conflito de estado ou de idempotência | sua | não sem mudar algo |
| `429` | limite de taxa | sua, mas transitória | **sim**, com espera |
| `500` `502` `503` | nosso | nossa | **sim**, com espera exponencial |

Só as duas últimas linhas devem entrar num laço de retentativa. Retentar um
`422` é gastar limite de taxa para receber o mesmo erro, e é o padrão que mais
transforma um bug pequeno num incidente.

:::warning[`429` traz o tempo de espera pronto]

A resposta de limite de taxa carrega `Retry-After` em segundos e
`X-Trilho-Limite-Restante` com o que sobra na janela. Uma retentativa que ignora
o `Retry-After` e usa espera fixa consome a janela seguinte inteira e é
bloqueada de novo.

:::

## Erro de integração não é recusa

Esta é a distinção que mais custa caro, e ela não aparece no status HTTP.

Uma cobrança em cartão **recusada por saldo insuficiente** é uma resposta `201`
bem-sucedida. A requisição estava certa, o sistema financeiro respondeu, e a
resposta foi *não*. O desfecho vem no corpo, em `status` e `motivo_recusa`:

```json title="201 Created — e recusada"
{
  "id": "cob_7Pd1nS",
  "status": "recusada",
  "meio": "cartao",
  "motivo_recusa": {
    "codigo": "saldo_insuficiente",
    "reapresentar": true,
    "reapresentar_apos": "2026-08-08T18:12:04Z"
  }
}
```

Tratar isso como erro de código produz o alerta que dispara mil vezes por dia e
que ninguém lê. `saldo_insuficiente` e `cartao_bloqueado` são respostas legítimas
do sistema financeiro; o catálogo completo com o que fazer em cada uma está em
[Operação › Códigos de recusa](../operacao/codigos-de-recusa).

## Validação devolve todos os problemas de uma vez

Erros de validação vêm com `detalhes`, e a lista é completa — não é o primeiro
campo inválido, são todos:

```json title="422 Unprocessable Entity"
{
  "erro": {
    "codigo": "requisicao_invalida",
    "mensagem": "A requisição tem 2 campos inválidos.",
    "requisicao": "req_5Hb8wY",
    "detalhes": [
      {"campo": "valor", "codigo": "valor_abaixo_do_minimo"},
      {"campo": "meio", "codigo": "valor_nao_permitido"}
    ]
  }
}
```

É de propósito, e o motivo é de produto: uma API que devolve um erro por vez
obriga o formulário do outro lado a fazer uma viagem de rede por campo errado, e
o usuário corrige um campo por vez até desistir.

:::note[`requisicao` é o que o suporte pede]

Todo erro carrega o `req_...` daquela chamada, e ele também vem no cabeçalho
`X-Trilho-Requisicao` de **todas** as respostas, inclusive as de sucesso.
Guardá-lo no seu log ao lado do erro transforma uma conversa de suporte de horas
numa de minutos.

:::

## O que nunca aparece num erro

Nenhuma resposta de erro do Trilho contém número de cartão, CVV, chave Pix
completa ou qualquer parte de uma chave de API. Se você está vendo um desses num
log, ele veio do **seu** lado — quase sempre de um interceptador que registra o
corpo da requisição antes de enviá-la.
