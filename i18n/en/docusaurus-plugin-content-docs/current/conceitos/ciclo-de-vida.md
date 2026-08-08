---
title: Charge lifecycle
description: A charge's seven states, the one-way transitions between them, and why there is no path back.
---

# Charge lifecycle

A charge is a state machine with seven positions and no return edge. This is not
an implementation constraint that will loosen one day: it is what makes the
history auditable, and what lets `evento` be an immutable record rather than a
log.

## The seven states

| State | What it means | What ends it |
| --- | --- | --- |
| `criada` | the charge exists, the method is not issued yet | Trilho, within seconds |
| `pendente` | the QR, boleto or authorization is up, waiting | the payer, or the clock |
| `paga` | the money is confirmed, not yet in your account | the settlement cycle |
| `liquidada` | the money is available in your balance | you, if you refund |
| `recusada` | the financial system answered *no* | nobody — terminal |
| `expirada` | the deadline passed without payment | nobody — terminal |
| `cancelada` | you gave up before payment | nobody — terminal |

**`recusada` is a state, not an error.** The request that produces it returns
`201`: it was correct, and the issuer's answer was negative. The reason arrives
in `motivo_recusa`, and the catalogue is at
[Operations › Decline codes](../operacao/codigos-de-recusa).

`estornada` **is not the eighth**. A refund is its own object, with its own
`id`, pointing at the charge — which stays `liquidada`. A charge that changed
state on refund would erase the fact that it was paid, and that fact is exactly
what accounting needs.

<Frame caption="The possible transitions. No arrow points left, and the three terminals have no exit.">
<svg viewBox="0 0 640 190" width="640" height="190" role="img" aria-label="State machine: criada leads to pendente, which leads to paga, recusada, expirada or cancelada; paga leads to liquidada">
<g fill="none" stroke="currentColor" strokeWidth="1.5">
<rect x="1" y="101" width="112" height="38" rx="8" />
<rect x="161" y="101" width="112" height="38" rx="8" />
<rect x="321" y="101" width="112" height="38" rx="8" />
<rect x="481" y="101" width="112" height="38" rx="8" />
<rect x="321" y="1" width="112" height="38" rx="8" />
<rect x="321" y="51" width="112" height="38" rx="8" />
<rect x="321" y="151" width="112" height="38" rx="8" />
<path d="M113 120 h34" />
<path d="M137 114 l10 6 l-10 6" strokeLinecap="round" strokeLinejoin="round" />
<path d="M273 120 h34" />
<path d="M297 114 l10 6 l-10 6" strokeLinecap="round" strokeLinejoin="round" />
<path d="M433 120 h34" />
<path d="M457 114 l10 6 l-10 6" strokeLinecap="round" strokeLinejoin="round" />
<path d="M273 120 H293 V20 H307" />
<path d="M297 14 l10 6 l-10 6" strokeLinecap="round" strokeLinejoin="round" />
<path d="M273 120 H293 V70 H307" />
<path d="M297 64 l10 6 l-10 6" strokeLinecap="round" strokeLinejoin="round" />
<path d="M273 120 H293 V170 H307" />
<path d="M297 164 l10 6 l-10 6" strokeLinecap="round" strokeLinejoin="round" />
</g>
<g fill="currentColor" stroke="none" fontSize="13" textAnchor="middle">
<text x="57" y="125">criada</text>
<text x="217" y="125">pendente</text>
<text x="377" y="125">paga</text>
<text x="537" y="125">liquidada</text>
<text x="377" y="25">expirada</text>
<text x="377" y="75">recusada</text>
<text x="377" y="175">cancelada</text>
</g>
</svg>
</Frame>

## How it shows up in the API

Every transition emits an event, and the event name is the arrival state:

```json title="The full sequence of a paid Pix charge"
[
  {"tipo": "cobranca.criada",     "ocorrido_em": "2026-08-07T18:10:00Z"},
  {"tipo": "cobranca.pendente",   "ocorrido_em": "2026-08-07T18:10:02Z"},
  {"tipo": "cobranca.paga",       "ocorrido_em": "2026-08-07T18:12:04Z"},
  {"tipo": "cobranca.liquidada",  "ocorrido_em": "2026-08-07T18:12:09Z"}
]
```

The charge's own `eventos` field returns the same list, and it is the canonical
answer to *what happened to this order*. Rebuilding the story from periodic
`status` reads returns holes: two transitions fit between two reads.

## The clock, which is the other actor

Every charge is born with `expira_em`, and the default depends on the method:

| Method | `expira_em` default | Configurable |
| --- | --- | --- |
| Pix | 30 minutes | from 1 minute to 30 days |
| Boleto | due date + 3 business days | yes, at creation |
| Card | 7 days — the **authorization**'s deadline, not the charge's | no |

The card row measures something else. Authorization is synchronous, so there is
no waiting on the payer; what expires is the **hold** placed on their limit, and
it falls away after 7 days if you do not capture. See
[Payment methods › Card](../meios-de-pagamento/cartao).

:::warning[Expiry is not an event you trigger]

Once the deadline passes, the charge moves to `expirada` on its own and accepts
no more payment. A Pix that arrives after the deadline is **automatically
returned** to the payer within 24 hours, with a `cobranca.pagamento_devolvido`
event. If your system marked the order paid based on anything other than the
event, this is where the divergence shows up.

:::

## What does not exist, and why

**There is no reopening.** An `expirada` or `cancelada` charge does not come
back. To charge again, create another with the same `referencia_externa` — it is
what ties the two together in your statement and in reconciliation.

**There is no switching methods.** If the Pix expired and you want to offer
boleto, that is a new charge. A charge that switches method midway is a charge
whose history nobody can audit later.

**There is no changing the amount.** Same reason, same way out.

:::note[The external reference is what stitches all this together]

`referencia_externa` is a free-form indexed field, and it does not need to be
unique. Three charges carrying `pedido-0001` are three attempts at the same
order, and that is how they appear in the movement file. See
[Operations › Movement file](../operacao/arquivo-de-movimento).

:::

## Known traps

The most common failure mode is not handling the wrong state — it is treating
`paga` and `liquidada` as synonyms. Between them sits a settlement cycle, which
lasts seconds for Pix and thirty days for card. Releasing goods on `paga` is a
legitimate risk decision; releasing **cash** on `paga` is counting money that
does not exist yet.

The second most common is assuming event arrival order. Delivery is at least
once and **with no ordering guarantee**: `cobranca.paga` can arrive after
`cobranca.liquidada`. Whoever compares `ocorrido_em` before applying the change
does not have this problem; whoever trusts `POST` order does, and finds out in
production.
