---
title: Overview
description: What Trilho does, what it deliberately does not do, and the shortest path to your first authorized charge.
---

# Overview

Trilho is a Brazilian payments API. Pix, boleto, card, split and subscriptions,
under a single contract — `api.trilho.dev/v1`.

The promise is deliberately narrow: **Trilho moves money and tells you what
happened.** It is not a checkout gateway, not an ERP and not a fraud engine.
Where one of those is needed, Trilho hands you the hook and gets out of the way.

## The model, in four objects

Almost everything in the API is a combination of four nouns.

| Object | What it is | How long it lives |
| --- | --- | --- |
| `cobranca` | a request for money, bound to one payment method | until paid, expired or cancelled |
| `cliente` | whoever pays, with their saved payment methods | indefinitely |
| `assinatura` | a charge that repeats on its own | until cancelled |
| `evento` | the immutable record of something that happened | forever |

`evento` is what makes the other three observable. Every state change emits one,
and it is the one that lands on your webhook.

## What you do first

1. Pick an [environment](ambientes) and grab the key. It starts with `tk_test_`
   and charges nobody.
2. Confirm the key answers, in [Authentication](autenticacao).
3. Follow the [first charge](primeira-cobranca): create a R$ 1.00 Pix, simulate
   the payment and receive the event.

The three steps fit in ten minutes and exercise the whole API: authentication,
creation, reading and notification. After that, the rest is vocabulary.

## Where to go next

- **Concepts** explains what happens between `criada` and `paga`, and why
  idempotency is not optional in a system that moves money.
- **Payment methods** compares Pix, boleto and card along the three dimensions
  that decide the choice: timing, cost and reversibility.
- **Recipes** solves whole problems with copyable code and no prose.

:::note[Field names stay in Portuguese]

Object names, field names and status values are part of the API contract and are
never translated — `cobranca`, `referencia_externa`, `paga`. Only the prose
around them is in English.

:::
