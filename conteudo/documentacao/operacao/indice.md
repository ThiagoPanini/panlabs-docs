---
title: Índice
description: Monitoramento, conciliação, códigos de recusa, diagnóstico e o changelog da API — o que operar o Trilho exige depois que a integração está de pé.
---

# Índice

<Untranslated />

Esta seção é para depois. Ela assume que a integração funciona e trata do que
acontece nos meses seguintes.

## O que existe aqui

<CardGroup>
<Card title="Monitoramento" icon="gauge" href="/docs/operacao/monitoramento">
As quatro métricas que valem alerta, e as três que não valem.
</Card>
<Card title="Diagnóstico" icon="circle-help" href="/docs/operacao/diagnostico">
Sete sintomas, a causa provável de cada um e o que fazer.
</Card>
<Card title="Códigos de recusa" icon="circle-alert" href="/docs/operacao/codigos-de-recusa">
Os quarenta motivos, com prazo e se a reapresentação adianta.
</Card>
<Card title="Arquivo de movimento" icon="database" href="/docs/operacao/arquivo-de-movimento">
Formato, fuso, colunas e o que fazer quando o saldo diverge.
</Card>
<Card title="Changelog" icon="calendar" href="/docs/operacao/changelog">
O único canal onde mudança de contrato se comunica.
</Card>
</CardGroup>

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

O arquivo de movimento diário é a fonte de verdade contábil. A página dele
explica o formato, o fuso e o que fazer quando o saldo do arquivo diverge do
saldo lido pela API — que quase sempre é uma cobrança liquidada depois do corte.

## Acompanhar mudanças

A API versiona por cabeçalho e a documentação não versiona. O
[Changelog](changelog) é o único canal onde mudança de contrato se comunica, e
ele está linkado no rodapé de todas as páginas justamente por isso.
