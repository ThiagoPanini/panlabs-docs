---
title: Concept map
description: The Trilho concepts that are not endpoints — state, idempotency, reconciliation, errors and the event contract.
---

# Concept map

This section documents what the API reference cannot: what the fields **mean**
when read together.

Nothing here is an endpoint. It is the vocabulary that makes the endpoint make
sense.

## What lives here

<CardGroup>
<Card title="Charge lifecycle" icon="workflow" href="/docs/conceitos/ciclo-de-vida">
Six states, one-way transitions, and why there is no path back.
</Card>
<Card title="Idempotency" icon="refresh-cw" href="/docs/conceitos/idempotencia">
What the 24-hour window guarantees, and where it stops guaranteeing.
</Card>
<Card title="Webhooks" icon="webhook" href="/docs/conceitos/webhooks">
The delivery contract and HMAC verification in three languages.
</Card>
<Card title="Reconciliation" icon="layers" href="/docs/conceitos/conciliacao">
Why the API balance is not the accounting balance.
</Card>
<Card title="Errors" icon="circle-alert" href="/docs/conceitos/erros">
The single envelope, the five classes, and the decline that is not an error.
</Card>
</CardGroup>

## The four objects

Almost everything in the API is a combination of four nouns: `cobranca` is a
request for money, `cliente` is whoever pays, `assinatura` is a charge that
repeats on its own, and `evento` is the immutable record of something that
happened.

`evento` is what makes the other three observable. Every state change emits one,
and it is the one that lands on your webhook.

## The three rules that cut across everything

**State never goes back.** No transition has a return edge, and that is what
makes the history auditable.

**Amounts are integers.** Always in the currency's smallest unit, in every
monetary field of the API. Floating point in money is a bug waiting for a date.

**Delivery is at least once.** Duplicate events are normal, not a defect, and
deduplication belongs to the receiving side.

## Where this touches practice

The concepts show up in every guide, and each guide assumes they have been read.
If a guide seems to be skipping a step, the step is almost always here.
