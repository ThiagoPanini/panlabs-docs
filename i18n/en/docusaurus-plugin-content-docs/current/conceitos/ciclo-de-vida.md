---
title: Charge lifecycle
description: A charge's six states, the one-way transitions between them, and why there is no path back.
---

# Charge lifecycle

A charge is a state machine with six positions and no return edge. This is not
an implementation constraint that will loosen one day: it is what makes the
history auditable, and what lets `evento` be an immutable record rather than a
log.

## The six states

| State | What it means | What ends it |
| --- | --- | --- |
| `criada` | the charge exists, the method is not issued yet | Trilho, within seconds |
| `pendente` | the QR, boleto or authorization is up, waiting | the payer, or the clock |
| `paga` | the money is confirmed, not yet in your account | the settlement cycle |
| `liquidada` | the money is available in your balance | you, if you refund |
| `expirada` | the deadline passed without payment | nobody — terminal |
| `cancelada` | you gave up before payment | nobody — terminal |

`estornada` **is not a seventh state**. A refund is its own object, with its own
`id`, pointing at the charge — which stays `liquidada`. A charge that changed
state on refund would erase the fact that it was paid, and that fact is exactly
what accounting needs.

<Frame caption="The possible transitions. No arrow points left.">
<svg viewBox="0 0 640 156" width="640" height="156" role="img" aria-label="State machine: criada leads to pendente, which leads to paga, expirada or cancelada; paga leads to liquidada">
<g fill="none" stroke="currentColor" strokeWidth="1.5">
<rect x="1" y="58" width="112" height="38" rx="8" />
<rect x="161" y="58" width="112" height="38" rx="8" />
<rect x="321" y="58" width="112" height="38" rx="8" />
<rect x="481" y="58" width="112" height="38" rx="8" />
<rect x="321" y="1" width="112" height="38" rx="8" />
<rect x="321" y="115" width="112" height="38" rx="8" />
<path d="M113 77 h34" />
<path d="M137 71 l10 6 l-10 6" strokeLinecap="round" strokeLinejoin="round" />
<path d="M273 77 h34" />
<path d="M297 71 l10 6 l-10 6" strokeLinecap="round" strokeLinejoin="round" />
<path d="M433 77 h34" />
<path d="M457 71 l10 6 l-10 6" strokeLinecap="round" strokeLinejoin="round" />
<path d="M273 68 q22 -48 48 -48" />
<path d="M311 14 l10 6 l-9 7" strokeLinecap="round" strokeLinejoin="round" />
<path d="M273 86 q22 48 48 48" />
<path d="M312 127 l9 7 l-10 6" strokeLinecap="round" strokeLinejoin="round" />
</g>
<g fill="currentColor" stroke="none" fontSize="13" textAnchor="middle">
<text x="57" y="82">criada</text>
<text x="217" y="82">pendente</text>
<text x="377" y="82">paga</text>
<text x="537" y="82">liquidada</text>
<text x="377" y="25">expirada</text>
<text x="377" y="139">cancelada</text>
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
| Card | not applicable — authorization is synchronous | — |

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
