---
title: Comparativo
description: Pix, boleto e cartão comparados nas três dimensões que decidem a escolha — prazo, custo e reversibilidade.
---

# Comparativo

Três meios, e a escolha entre eles quase nunca é técnica. É prazo, custo e o que
acontece quando alguém quer o dinheiro de volta.

## A tabela

| | Pix | Boleto | Cartão |
| --- | --- | --- | --- |
| Confirmação | segundos | 1 a 3 dias úteis | segundos (autorização) |
| Liquidação | imediata | D+1 após o pagamento | D+30, ou D+2 com antecipação |
| Custo | fixo por transação | fixo por boleto emitido | percentual sobre o valor |
| Reversível pelo pagador | não | não | **sim**, por até 540 dias |
| Expira | sim, prazo configurável | sim, na data de vencimento | não se aplica |
| Parcelamento | não | não | até 12× |
| Valor máximo | limite do pagador | R$ 1.000.000,00 | limite do cartão |

## Como ler a tabela

**Reversibilidade é a linha que decide.** Pix e boleto são finais: uma vez
pagos, o dinheiro só volta por decisão sua, via estorno. Cartão é reversível
pelo pagador, e o *chargeback* pode chegar dezoito meses depois da venda.

Isso muda o desenho do produto, não só o do checkout. Assinatura em cartão
precisa de política de retentativa; assinatura em Pix precisa de lembrete de
cobrança. São problemas diferentes.

**Custo fixo contra percentual** inverte a conta conforme o ticket. Abaixo de
~R$ 60 o percentual do cartão costuma sair mais barato que a tarifa fixa do
boleto; acima disso, o inverso.

## O que o Trilho não escolhe por você

O Trilho não faz roteamento automático entre meios. Se a cobrança em Pix expirar
e você quiser oferecer boleto, isso é uma cobrança nova, com `id` novo — e é
deliberado: uma cobrança que troca de meio no meio do caminho é uma cobrança
cujo histórico ninguém consegue auditar depois.
