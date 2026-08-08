---
title: Mapa dos conceitos
description: Os conceitos do Trilho que não são endpoints — estado, idempotência, conciliação, erros e o contrato de eventos.
---

# Mapa dos conceitos

<Untranslated />

Esta seção documenta o que a Referência da API não consegue documentar: o que
os campos **significam** quando lidos juntos.

Nada aqui é endpoint. É o vocabulário que faz o endpoint fazer sentido.

## O que existe aqui

<CardGroup>
<Card title="Ciclo de vida da cobrança" icon="workflow" href="/docs/conceitos/ciclo-de-vida">
Seis estados, transições de mão única, e por que não existe caminho de volta.
</Card>
<Card title="Idempotência" icon="refresh-cw" href="/docs/conceitos/idempotencia">
O que a janela de 24 horas garante, e onde ela deixa de garantir.
</Card>
<Card title="Webhooks" icon="webhook" href="/docs/conceitos/webhooks">
O contrato de entrega e a verificação HMAC em três linguagens.
</Card>
<Card title="Conciliação" icon="layers" href="/docs/conceitos/conciliacao">
Por que o saldo da API não é o saldo contábil.
</Card>
<Card title="Erros" icon="circle-alert" href="/docs/conceitos/erros">
O envelope único, as cinco classes e a recusa que não é erro.
</Card>
</CardGroup>

## Os quatro objetos

Quase tudo na API é combinação de quatro substantivos: `cobranca` é um pedido de
dinheiro, `cliente` é quem paga, `assinatura` é uma cobrança que se repete
sozinha, e `evento` é o registro imutável de algo que aconteceu.

O `evento` é o que faz os outros três serem observáveis. Toda mudança de estado
emite um, e é ele que chega no seu webhook.

## As três regras que atravessam tudo

**Estado não volta.** Nenhuma transição tem aresta de retorno, e é isso que torna
o histórico auditável.

**Valor é inteiro.** Sempre na menor unidade da moeda, em todo campo monetário da
API. Ponto flutuante em dinheiro é um bug esperando data.

**Entrega é no mínimo uma vez.** Duplicata de evento é normal, não é defeito, e a
deduplicação é do lado de quem recebe.

## Onde isto encosta na prática

Os conceitos aparecem em toda página de guia, e cada guia assume que eles já
foram lidos. Se um guia parecer estar pulando um passo, quase sempre o passo está
aqui.
