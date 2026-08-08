---
title: Visão geral
description: O que o Trilho faz, o que ele deliberadamente não faz, e o caminho mais curto até a primeira cobrança autorizada.
---

# Visão geral

<Untranslated />

O Trilho é uma API de pagamentos brasileira. Pix, boleto, cartão, split e
assinaturas, sob um contrato só — `api.trilho.dev/v1`.

A promessa é estreita de propósito: **o Trilho move dinheiro e conta o que
aconteceu.** Ele não é gateway de checkout, não é ERP e não é antifraude. Onde
uma dessas coisas é necessária, o Trilho entrega o gancho e sai da frente.

## O modelo em quatro objetos

Quase tudo na API é combinação de quatro substantivos.

| Objeto | O que é | Vive quanto |
| --- | --- | --- |
| `cobranca` | um pedido de dinheiro, com um meio de pagamento associado | até ser paga, expirar ou ser cancelada |
| `cliente` | quem paga, com os meios de pagamento salvos | indefinidamente |
| `assinatura` | uma cobrança que se repete sozinha | até ser cancelada |
| `evento` | o registro imutável de algo que aconteceu | para sempre |

O `evento` é o que faz os outros três serem observáveis. Toda mudança de estado
emite um, e é ele que chega no seu webhook.

## O que você faz primeiro

1. Escolha o [ambiente](ambientes) e pegue a chave. Ela começa com `tk_test_` e
   não cobra ninguém.
2. Confira que a chave responde, em [Autenticação](autenticacao).
3. Siga a [primeira cobrança](primeira-cobranca): crie um Pix de R$ 1,00, simule
   o pagamento e receba o evento.

Os três passos cabem em dez minutos e exercitam a API inteira: autenticação,
criação, leitura e notificação. Depois disso, o resto é vocabulário.

## Onde continuar

- **Conceitos** explica o que acontece entre `criada` e `paga`, e por que
  idempotência não é opcional num sistema que move dinheiro.
- **Meios de pagamento** compara Pix, boleto e cartão nas três dimensões que
  decidem a escolha: prazo, custo e reversibilidade.
- **Receitas** resolve problemas inteiros com código copiável, sem prosa.
