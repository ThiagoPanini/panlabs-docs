---
title: Índice
description: Monitoramento, conciliação, códigos de recusa e o changelog da API — o que operar o Trilho exige depois que a integração está de pé.
---

# Índice

Esta seção é para depois. Ela assume que a integração funciona e trata do que
acontece nos meses seguintes.

## Observar

O Trilho expõe o estado corrente por API e o histórico por evento. A regra
prática: **posição se lê da API, série se lê do evento.** Contar cobranças pagas
varrendo a API devolve um número que muda enquanto você lê; somar eventos
`cobranca.paga` devolve um número que fecha.

## Diagnosticar

O catálogo de códigos de recusa é a página mais consultada desta seção. Cada
código traz a causa provável, se a retentativa faz sentido e em quanto tempo.

Recusa não é erro de integração. `saldo_insuficiente` e `cartao_bloqueado` são
respostas legítimas do sistema financeiro, e tratá-las como falha de código é
como se constrói um alerta que ninguém lê.

## Conciliar

O arquivo de movimento diário é a fonte de verdade contábil. A página de
conciliação explica o formato, o fuso e o que fazer quando o saldo do arquivo
diverge do saldo lido pela API — que quase sempre é uma cobrança liquidada
depois do corte.

## Acompanhar mudanças

A API versiona por cabeçalho e a documentação não versiona. O
[Changelog](changelog) é o único canal onde mudança de contrato se comunica, e
ele está linkado no rodapé de todas as páginas justamente por isso.
