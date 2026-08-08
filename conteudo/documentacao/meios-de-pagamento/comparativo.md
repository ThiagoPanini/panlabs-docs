---
title: Comparativo
description: Pix, boleto e cartão lado a lado em vinte e quatro dimensões — prazo, custo, reversibilidade e tudo o que decide a escolha.
---

# Comparativo

<Untranslated />

Três meios, e a escolha entre eles quase nunca é técnica.

## A tabela

| | Pix | Boleto | Cartão |
| --- | --- | --- | --- |
| Confirmação | segundos | 1 a 3 dias úteis | segundos |
| Liquidação | imediata | D+1 após compensar | D+30, ou D+2 antecipado |
| Custo | fixo por transação | fixo por emissão | percentual sobre o valor |
| Custo típico | R$ 0,99 | R$ 2,90 | 2,99% + R$ 0,39 |
| Reversível pelo pagador | não | não | **sim**, por até 540 dias |
| Reversível por você | devolução, 90 dias | não após compensar | estorno, 180 dias |
| Expira | sim, 1 min a 30 dias | vencimento + 3 dias úteis | autorização, 7 dias |
| Parcelamento | não | não | até 12× |
| Valor mínimo | R$ 0,01 | R$ 5,00 | R$ 1,00 |
| Valor máximo | limite do pagador | R$ 1.000.000,00 | limite do cartão |
| Exige documento do pagador | não | **sim**, CPF ou CNPJ | não |
| Exige dado sensível | não | não | sim, tokenizado no navegador |
| Funciona sem o pagador presente | não | sim | **sim**, com token salvo |
| Serve para assinatura | com lembrete | com lembrete | **sim**, sozinho |
| Aceita split | sim | sim | sim |
| Autorização separada da captura | não | não | **sim** |
| Taxa de conversão típica | alta | baixa | alta |
| Abandono típico | baixo | **alto** | baixo |
| Disponível 24×7 | sim | emissão sim, compensação não | sim |
| Cancelável antes do pagamento | sim | sim | não se aplica |
| Sinal de *pagador viu a cobrança* | não | não | não |
| Prazo até você saber do pagamento | segundos | dias úteis | segundos |
| Risco de fraude para você | baixo | baixo | **alto** |
| Custo de disputa | não há | não há | tarifa + prazo de defesa |

## As três linhas que decidem

**Reversibilidade.** Pix e boleto são finais; cartão volta por decisão do
pagador, dezoito meses depois da venda. Isso muda o desenho do produto, não só o
do checkout.

**Custo fixo contra percentual** inverte a conta conforme o ticket. Abaixo de
cerca de R$ 60, o percentual do cartão sai mais barato que a tarifa fixa do
boleto; acima disso, o inverso.

**Prazo até saber.** Segundos contra dias úteis é a diferença entre despachar na
hora e manter um pedido em aberto por uma semana.

## O que o Trilho não escolhe por você

Não há roteamento automático entre meios. Se a cobrança em Pix expirar e você
quiser oferecer boleto, isso é uma cobrança nova, com `id` novo. É deliberado:
uma cobrança que troca de meio no meio do caminho é uma cobrança cujo histórico
ninguém consegue auditar depois.
