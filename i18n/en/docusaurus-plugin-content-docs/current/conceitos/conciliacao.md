---
title: Reconciliation
description: What reconciling is, why the API balance is not the accounting balance, and where the two readings legitimately diverge.
---

# Reconciliation

Reconciling means answering a question that looks trivial and is not: **how much
came in, from whom, and why**. It is hard because the money arrives by one path,
the information about it arrives by another, and the two paths run on different
clocks. This page is about the concept. The file format, the time zone and the
closing procedure live in Operations.

## The two readings of balance

Trilho exposes your money in two ways, and they almost never coincide — not
because of a defect, but because they measure different things.

The first is **position**: the balance the API returns when you ask right now. It
is the sum of everything already settled minus everything already paid out, at
the instant of the read. It is useful for deciding whether a payout fits, and
useless for closing a month, because it changes while you read it.

The second is **closing**: the balance the movement file declares for a finished
day. It does not change once issued — not even when a charge from that day is
refunded a week later, because the refund belongs to the day it happened, not to
the day of the sale. That immutability is what makes the file the single source
of accounting truth, and it is what position has nothing to offer in its place.

Confusing the two produces the report that is off by a few cents and that nobody
can explain. The rule that avoids it fits on one line: position comes from the
API, series comes from events, and closing comes from the file.

## Why the cut has a time

Every closing needs a boundary, and the boundary is arbitrary by necessity —
somebody has to decide which side of midnight a transaction at 23:59:58 lives on.
Trilho cuts at 23:59 São Paulo time, and uses the time the **settlement event**
occurred, not the time of the sale.

The consequence shows up in the first month: a card charge sold in January and
settled in February belongs, for accounting purposes, to February. Whoever
expects to see it in January will find a divergence the size of the average
ticket times thirty days of sales, and will go looking for a bug that does not
exist.

The same holds in reverse for Pix, where sale and settlement happen seconds
apart and the distinction disappears. That is why integrations that started
Pix-only tend to discover this concept on the day they turn on cards.

## The key that ties the two sides

On Trilho's side, every movement line carries an identifier of ours. On your
side, every line carries one of yours — the order number, the invoice, the
contract. Reconciling is matching the two, and the field that exists for it is
the external reference.

It is a free-form indexed field, and it does not need to be unique. That is
deliberate: three charges with the same reference are three attempts at the same
order, and that is how they should appear. What must not happen is the reverse —
two different business intents sharing one reference — because then
reconciliation starts summing things that are not the same thing, and nobody
notices until the quarter closes.

Whoever does not fill in the external reference is not left without
reconciliation; they are left with reconciliation by amount and date, which works
fine until there are two orders of the same amount on the same day. In any
operation with list prices, that happens in the first week.

## The divergences that are legitimate

Three differences between what you expect and what the file says are not errors,
and recognizing them in advance saves a day of investigation.

The first is **fees**. What comes in is always net, and the gross appears in a
separate column. A report that sums the gross and compares it to the bank
statement will never match, and the difference will be exactly the sum of the
fees.

The second is **advance settlement**. An advanced card sale changes its
settlement date and takes a discount, so it appears on a different day and for a
different amount than the original sale promised. Both facts live in the same
movement, on separate lines.

The third is the **cross-period refund**, described above, and it is the hardest
to accept, because it makes a closed month's total change sign the following
month without anything in the closed month having been altered.

## Where reconciliation touches product design

It is worth recording what this whole conversation implies, because it is easy to
treat it as a finance matter and discover late that it was an architecture
matter.

If your system does not store Trilho's identifier next to the order identifier,
at the moment the charge is created, no later reconstruction is trustworthy — the
matching will depend on amount-and-date heuristics, which is exactly what you
were trying to avoid. Storing that pair at creation time costs one column and
solves the problem forever. Discovering it later costs a migration and a period
that never quite closes again.
