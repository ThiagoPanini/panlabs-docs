---
title: Mapa dos conceitos
description: Os conceitos do Trilho que não são endpoints — estado, idempotência, conciliação e o contrato de eventos.
---

# Mapa dos conceitos

Esta seção documenta o que a Referência da API não consegue documentar: o que
os campos **significam** quando lidos juntos.

Nada aqui é endpoint. É o vocabulário que faz o endpoint fazer sentido.

## A máquina de estados

Uma cobrança tem seis estados e as transições são de mão única. `criada` vira
`pendente` quando o meio de pagamento é emitido; `pendente` vira `paga`,
`expirada` ou `cancelada`; `paga` vira `estornada`. Não há caminho de volta em
nenhuma delas.

Estado que não volta é o que torna o histórico auditável — e é o que permite
tratar `evento` como registro imutável em vez de log.

## Idempotência

Toda requisição que cria alguma coisa aceita `Idempotency-Key`. A janela de
deduplicação é de 24 horas e vale igual no sandbox e em produção.

Não é conveniência. Numa API de pagamentos, o modo de falhar mais comum não é a
requisição recusada — é a requisição cuja resposta se perdeu, e que o cliente
repete sem saber se a primeira passou.

## Conciliação

O Trilho fecha o dia às 23h59 no fuso de São Paulo e emite um arquivo de
movimento. O saldo do arquivo é a soma das cobranças liquidadas menos taxas e
estornos — e ele é a única fonte de verdade contábil. O saldo lido pela API é
posição, não fechamento.

## Webhooks e o contrato de entrega

Cada evento é entregue no mínimo uma vez, e às vezes mais. A assinatura HMAC vai
no cabeçalho `X-Trilho-Assinatura`, sobre o corpo cru — não sobre o JSON
reserializado.

Quem trata entrega duplicada como erro descobre isso em produção. Quem trata o
`id` do evento como chave de deduplicação não descobre nunca.
