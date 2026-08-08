---
title: Event catalog
description: The forty-seven events Trilho delivers by webhook, organized by resource, each with what triggers it and what the payload carries.
---

# Event catalog

Every event Trilho delivers has the shape of
[`Evento`](/api-reference/webhooks/objeto-evento): an `id`, a `tipo`, an
`ocorrido_em`, and `dados` — whose format varies by `tipo`. This page is
the complete index of the values `tipo` takes, organized by the resource
that triggers them.

No new event on this list breaks an existing integration: adding a `tipo`
is always compatible, by the same rule from
[Base URL and version](/api-reference/introducao/url-base-e-versao) that
treats new fields and new endpoints as additive. An integration listening
for `cobranca.paga` keeps working on the day `assinatura.plano_alterado`
ships, without touching a line.

## How to read this table

Each row has three columns. **Event** is the exact value of `tipo` — what
your routing logic compares against. **When** is the trigger, in one
sentence. **`dados` carries** says what to expect inside the event's
`dados` field — almost always the whole resource in the state it ended up
in, not just what changed.

An event is not a field-change notification — it is a **state**
notification. `cobranca.paga` does not say "the status field became paga";
it delivers the entire
[`Cobrança`](/api-reference/cobrancas/objeto-cobranca), already with
`status: "paga"`. This means processing an event never requires a second
`GET` call just to learn the rest of the resource — the rest is already
there.

**Delivery order is not guaranteed**, and the full mechanics of signing,
retrying, and deduplicating live in
[Concepts › Webhooks](/docs/conceitos/webhooks). This page is only the
vocabulary: what exists, not how it arrives.

### A minimal router

Most integrations do not handle all forty-seven events — they handle a
handful, and silently ignore the rest. A router keyed by `tipo` covers the
most common shape:

```js title="Router by type"
const MANIPULADORES = {
  'cobranca.paga': marcarPedidoComoPago,
  'cobranca.recusada': notificarFalhaDePagamento,
  'assinatura.inadimplente': suspenderAcesso,
  'chargeback.aberto': abrirTicketDeDisputa,
};

function despachar(evento) {
  const manipulador = MANIPULADORES[evento.tipo];
  if (!manipulador) return; // unknown type — ignore, not an error
  manipulador(evento.dados);
}
```

Notice the comment on the last line — that is the whole point of this
section. A `tipo` the map does not know **is not a failure of your code**.
It is the catalog growing, and the closing note on this page returns to
that same point.

## Charges

The resource with the most events, because it is the only one whose
lifecycle has more than one possible outcome — paid, declined, expired,
canceled, refunded, and the variations of each. It is also the group most
integrations listen to first: `cobranca.paga` alone already covers the
most common use case, releasing an order after payment confirmation.

Not every method passes through the same events in the same order. A
typical Pix charge goes straight from `cobranca.criada` to `cobranca.paga`,
often within seconds — there is no observable `pendente` state from the
outside, because the Pix arrangement's confirmation usually arrives before
your server finishes processing the creation event. A boleto, by contrast,
spends days in `cobranca.pendente` before any outcome, and it is the only
method where `cobranca.expirada` and the due date are the same day.

| Event | When | `dados` carries |
| --- | --- | --- |
| `cobranca.criada` | the charge was registered, before any confirmation | the `Cobrança`, with `status: "pendente"` |
| `cobranca.pendente` | the method awaits confirmation — typical right after creating a Pix or boleto charge | the `Cobrança` |
| `cobranca.paga` | the amount was confirmed by the payment method | the `Cobrança`, with `status: "paga"` |
| `cobranca.recusada` | the card issuer or the Pix arrangement declined the operation | the `Cobrança`, with `motivo_recusa` filled in |
| `cobranca.expirada` | the Pix QR or the card authorization passed the window without confirmation | the `Cobrança`, with `status: "expirada"` |
| `cobranca.cancelada` | the charge was canceled before any confirmation | the `Cobrança` |
| `cobranca.estornada` | the full amount was returned to the payer | the `Cobrança`, with `status: "estornada"` |
| `cobranca.parcialmente_estornada` | part of the amount was returned; the charge stays `paga` | the `Cobrança` plus the `Reembolso` that triggered the event |
| `cobranca.captura_expirada` | a card authorization not captured within seven days released the reserved limit | the `Cobrança`, with `status: "expirada"` |
| `cobranca.risco_sinalizado` | the risk system flagged the charge for manual review before deciding | the `Cobrança`, still `pendente` |

## Boleto

Three method-specific events, in addition to the generic `cobranca.*` ones
that every boleto also triggers.

| Event | When | `dados` carries |
| --- | --- | --- |
| `boleto.registrado` | the digitable line and barcode were issued with the issuing bank | the `Cobrança`, with `pagamento.boleto` filled in |
| `boleto.vencido` | the due date passed without payment | the `Cobrança` |
| `boleto.pago_apos_vencimento` | the boleto was paid after the due date — settlement follows the banking agreement, not the standard `cobranca.paga` rule | the `Cobrança` |

## Customers

The simplest resource on the list: four events, one per write operation the
object admits.

| Event | When | `dados` carries |
| --- | --- | --- |
| `cliente.criado` | a customer was registered | the `Cliente` |
| `cliente.atualizado` | any customer field changed, except the document | the `Cliente`, already with the new value |
| `cliente.documento_atualizado` | the customer's CPF or CNPJ was changed | the `Cliente`; gets its own event because it changes tax identity, not a contact detail |
| `cliente.removido` | the customer was removed from the account | the removed customer's `id`, and nothing else — the object no longer exists to query |

## Subscriptions

The longest lifecycle in the catalog: a subscription is born, may have a
trial period, bills on a cadence, may fail, may be paused, and eventually
ends. Ten events sounds like a lot for one resource, but each answers a
question a recurring-billing integration needs to answer without querying
the API again: *is this customer current? Are they still trialing or
already paying? Did this month's charge go through?*

The distinction between `assinatura.ciclo_falhou` and
`assinatura.inadimplente` is the one that causes the most confusion. The
first fires on every declined attempt within the retry window — it can
fire three or four times for the same cycle, with nothing changing about
the customer's access. The second fires once, when the window's last
retry also fails, and that is the event that should suspend access — never
the first one.

| Event | When | `dados` carries |
| --- | --- | --- |
| `assinatura.criada` | the subscription was registered | the `Assinatura`, with `status: "ativa"` or trialing |
| `assinatura.ativada` | the cycle's first charge was confirmed | the `Assinatura` |
| `assinatura.periodo_de_teste_iniciado` | the subscription entered a no-charge period, when the plan defines one | the `Assinatura` |
| `assinatura.periodo_de_teste_finalizado` | the trial period ended and the first real charge will be attempted | the `Assinatura` |
| `assinatura.ciclo_cobrado` | a recurring charge for the cycle was confirmed | the `Assinatura` plus the cycle's `Cobrança` |
| `assinatura.ciclo_falhou` | the cycle's charge was declined; a retry is scheduled | the `Assinatura` plus the declined `Cobrança` |
| `assinatura.inadimplente` | every retry in the cycle's window failed, with no automatic cancellation | the `Assinatura`, with `status: "inadimplente"` |
| `assinatura.plano_alterado` | the subscription's amount or cadence changed | the `Assinatura`, already with the new plan |
| `assinatura.pausada` | the subscription stopped billing without being canceled | the `Assinatura` |
| `assinatura.cancelada` | the subscription was canceled | the `Assinatura`, with `cancelada_em` filled in |

## Refunds

| Event | When | `dados` carries |
| --- | --- | --- |
| `reembolso.criado` | a refund, full or partial, was requested | the `Reembolso`, with `status: "pendente"` |
| `reembolso.concluido` | the amount was returned to the payer — Pix and boleto within minutes, card within days | the `Reembolso`, with `status: "concluido"` |
| `reembolso.falhou` | the payment method rejected the return — a closed account, for example | the `Reembolso`, with `status: "falhou"` |
| `reembolso.limite_excedido` | a refund attempt asked for more than the charge's refundable balance; no resource is created | the `Cobrança` and the amount that was rejected |

## Split

Events for the charge-splitting-across-recipients resource, documented in
[Payment methods › Split](/docs/meios-de-pagamento/split).

| Event | When | `dados` carries |
| --- | --- | --- |
| `split.recebedor_cadastrado` | a new recipient was enabled to split charges | the recipient's `id` and bank details |
| `split.recebedor_removido` | a recipient was disabled | the removed recipient's `id` |
| `split.recebedor_creditado` | a charge's share was transferred to the recipient | the recipient's `id`, the `Cobrança`, and the credited amount |
| `split.recebedor_falhou` | the share's transfer failed — an invalid bank account, for example | the recipient's `id`, the `Cobrança`, and the failure reason |

## Chargeback

The three events of the card dispute cycle, documented in detail in
[Payment methods › Card](/docs/meios-de-pagamento/cartao#chargeback).

| Event | When | `dados` carries |
| --- | --- | --- |
| `chargeback.aberto` | the card issuer disputed the charge; the amount leaves the balance immediately | the `Cobrança` and the defense deadline |
| `chargeback.contestado` | a defense was submitted within the deadline | the `Cobrança` |
| `chargeback.resolvido` | the issuer decided the dispute | the `Cobrança` plus the `resultado` — won or lost |

## Reconciliation

Events tracking the generation of the reconciliation file, documented in
[Operation › Movement file](/docs/operacao/arquivo-de-movimento).

| Event | When | `dados` carries |
| --- | --- | --- |
| `conciliacao.arquivo_disponibilizado` | the previous day's file is ready for download | the file URL and the reference date |
| `conciliacao.arquivo_processado` | confirmation the file was generated without failure, for accounts that prefer waiting on this signal instead of polling | the reference date and the row count |
| `conciliacao.divergencia_encontrada` | a file row does not match the account's charge history | the row identifier and the nature of the mismatch |

## Saved card

Events for the lifecycle of a card tokenized for future use, outside the
moment of a specific charge.

| Event | When | `dados` carries |
| --- | --- | --- |
| `cartao.tokenizado` | a card was successfully tokenized for reuse | the token, the brand, and the last four digits — never the full number |
| `cartao.removido` | a saved card token was removed from the customer's account | the removed token |

## Identity verification

Events from the asynchronous document-validation process, when the
account uses reinforced customer verification.

| Event | When | `dados` carries |
| --- | --- | --- |
| `verificacao.documento_validado` | the customer's CPF or CNPJ was confirmed against the reference database | the customer's `id` and the verification result |
| `verificacao.documento_rejeitado` | the document failed verification | the customer's `id` and the rejection reason |

## Account

The two events that belong to no charge resource — they warn about the
integration's own configuration.

| Event | When | `dados` carries |
| --- | --- | --- |
| `conta.chave_rotacionada` | a new secret key was generated in one of the two environments | the new key's prefix, and the date the old one will be revoked, if scheduled |
| `conta.webhook_endpoint_atualizado` | the webhook destination URL was changed | the new URL |

## Reading notes

**One event per state change, not per API call.** A single call to
`POST /cobrancas/{id}/capturar` can trigger `cobranca.paga` alone, or no
event at all, if the capture fails — the event reflects what happened to
the resource, not the call that caused it. This also means a state change
that does **not** go through the API — a boleto settlement the bank
confirms directly with Trilho, with no call from you — still triggers the
event normally. A webhook is not a request echo; it is a state
notification, wherever the change came from.

**`dados` never nests another event inside it.** Even when an event
mentions two resources — `assinatura.ciclo_cobrado` carries the
subscription and the cycle's charge — both come as each one's complete
object, never as a reference that would require a second lookup. The price
of that decision is a larger payload; what it buys is zero extra calls to
process the catalog's most common event.

**Not every event has a read counterpart in the API.**
`verificacao.documento_validado` and `conta.chave_rotacionada`, for
example, correspond to no `GET` endpoint in this reference — the webhook
is the only way to know they happened. That is deliberate, not a gap: some
states do not deserve their own queryable resource, and the webhook alone
solves the "let me know when" use case.

**This catalog grows without prior notice within the same version.** A new
event is always additive — the rule from
[Base URL and version](/api-reference/introducao/url-base-e-versao) treats
it as a new field, not a contract change. A robust integration treats an
unknown `tipo` as "ignore," never as an error, for the same reason the
minimal router at the top of this page returns without doing anything when
it finds no handler: the alternative — rejecting or halting in front of a
new `tipo` — would turn every event launch into a contract-breaking change,
which it explicitly is not.
