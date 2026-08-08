---
title: Webhooks
description: Trilho's event delivery contract, the HMAC signature over the raw body, and the full verification in Node, Python and Go.
---

# Webhooks

A webhook is Trilho making a `POST` to your server whenever something changes. It
is the only channel where a state change reaches you without your asking — and
that is why it is also the only one that needs a signature.

## The delivery contract

| Property | Guarantee |
| --- | --- |
| Delivery | **at least once** — duplicates are normal, not a bug |
| Ordering | **none** — `cobranca.paga` can arrive after `cobranca.liquidada` |
| Response window | 10 seconds until your `200` |
| Retries | 12 attempts over 72 hours, exponential backoff (sandbox: 3 over 5 minutes) |
| Signature | HMAC-SHA256 over the **raw body**, in the `X-Trilho-Assinatura` header |

The first two rows are the ones that cost the most to whoever ignores them.
Deduplication is the event `id`; ordering is `ocorrido_em`. Neither is optional.

## The anatomy of what arrives

```json title="POST to your endpoint"
{
  "id": "evt_9Lm4tZ",
  "tipo": "cobranca.paga",
  "ocorrido_em": "2026-08-07T18:12:04Z",
  "versao_api": "2026-01-15",
  "dados": {
    "cobranca": {
      "id": "cob_3nK2xQ",
      "status": "paga",
      "valor": 14990,
      "referencia_externa": "pedido-4821"
    }
  }
}
```

And the three headers that matter:

```http
X-Trilho-Assinatura: t=1786745524,v1=8f3a...c02e
X-Trilho-Evento: evt_9Lm4tZ
X-Trilho-Tentativa: 1
```

## The signature, and why it is over the raw body

The signed string is `t + "." + body`, where `body` is **the exact bytes that
arrived**. It is not the JSON re-serialized by your framework: re-serializing
reorders keys, changes escapes and normalizes numbers — and any one of those
produces a different HMAC.

In practice this means one line of configuration before anything else. In
Express, `express.raw()` instead of `express.json()`. In Flask,
`request.get_data()` instead of `request.json`. In Go, read the `Body` before any
decoding.

:::warning[Comparing with `==` leaks the secret]

The HMAC comparison must run in **constant time**. A plain `==` stops at the
first differing byte, and the timing difference between stopping at the first
byte and stopping at the tenth is measurable over the network. All three
implementations below use their language's safe comparison function.

:::

<CodeGroup groupId="code-lang" queryString="lang">

```js title="Node"
import {createHmac, timingSafeEqual} from 'node:crypto';
import express from 'express';

const SECRET = process.env.TRILHO_WEBHOOK_SECRET;
const TOLERANCE_S = 300;

class InvalidSignature extends Error {}

function headerParts(header) {
  // "t=1786745524,v1=8f3a...c02e" -> {t: "1786745524", v1: "8f3a...c02e"}
  const parts = {};
  for (const item of String(header ?? '').split(',')) {
    const [key, value] = item.split('=');
    if (key && value) parts[key.trim()] = value.trim();
  }
  return parts;
}

export function verifyEvent(rawBody, header, secret = SECRET) {
  const {t, v1} = headerParts(header);
  if (!t || !v1) {
    throw new InvalidSignature('malformed X-Trilho-Assinatura header');
  }

  // Replay window: a valid signature captured yesterday is not valid today.
  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(t));
  if (!Number.isFinite(age) || age > TOLERANCE_S) {
    throw new InvalidSignature('timestamp outside the 5-minute window');
  }

  const expected = createHmac('sha256', secret)
    .update(`${t}.`)
    .update(rawBody)
    .digest();
  const received = Buffer.from(v1, 'hex');

  // `timingSafeEqual` throws when lengths differ — hence the guard.
  if (
    received.length !== expected.length ||
    !timingSafeEqual(expected, received)
  ) {
    throw new InvalidSignature('signature does not match');
  }

  return JSON.parse(rawBody.toString('utf8'));
}

const app = express();

// `express.raw`, NOT `express.json`: the HMAC is over the bytes that arrived.
app.post('/webhooks/trilho', express.raw({type: 'application/json'}), (req, res) => {
  let event;
  try {
    event = verifyEvent(req.body, req.get('X-Trilho-Assinatura'));
  } catch (error) {
    if (error instanceof InvalidSignature) return res.sendStatus(400);
    throw error;
  }

  // Answer BEFORE processing. The window is 10 seconds, and Trilho retries
  // anything that is not 2xx — including what you already processed.
  res.sendStatus(200);
  enqueue(event);
});
```

```python title="Python"
import hashlib
import hmac
import json
import os
import time

from flask import Flask, request

SECRET = os.environ["TRILHO_WEBHOOK_SECRET"].encode()
TOLERANCE_S = 300


class InvalidSignature(Exception):
    pass


def header_parts(header: str) -> dict[str, str]:
    # "t=1786745524,v1=8f3a...c02e" -> {"t": "...", "v1": "..."}
    parts: dict[str, str] = {}
    for item in (header or "").split(","):
        key, _, value = item.partition("=")
        if key and value:
            parts[key.strip()] = value.strip()
    return parts


def verify_event(raw_body: bytes, header: str, secret: bytes = SECRET) -> dict:
    parts = header_parts(header)
    t, v1 = parts.get("t"), parts.get("v1")
    if not t or not v1:
        raise InvalidSignature("malformed X-Trilho-Assinatura header")

    # Replay window: a valid signature captured yesterday is not valid today.
    try:
        age = abs(int(time.time()) - int(t))
    except ValueError as error:
        raise InvalidSignature("non-numeric timestamp") from error
    if age > TOLERANCE_S:
        raise InvalidSignature("timestamp outside the 5-minute window")

    expected = hmac.new(secret, f"{t}.".encode() + raw_body, hashlib.sha256)

    # `compare_digest` is the standard library's constant-time comparison.
    if not hmac.compare_digest(expected.hexdigest(), v1):
        raise InvalidSignature("signature does not match")

    return json.loads(raw_body)


app = Flask(__name__)


@app.post("/webhooks/trilho")
def receive():
    # `get_data`, NOT `request.json`: the HMAC is over the bytes that arrived.
    try:
        event = verify_event(
            request.get_data(), request.headers.get("X-Trilho-Assinatura", "")
        )
    except InvalidSignature:
        return "", 400

    # Enqueue and answer. The window is 10 seconds, and Trilho retries
    # anything that is not 2xx — including what you already processed.
    enqueue(event)
    return "", 200
```

```go title="Go"
package webhook

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"io"
	"math"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"
)

const toleranceS = 300

var (
	secret              = []byte(os.Getenv("TRILHO_WEBHOOK_SECRET"))
	ErrInvalidSignature = errors.New("invalid signature")
)

type Event struct {
	ID         string          `json:"id"`
	Tipo       string          `json:"tipo"`
	OcorridoEm time.Time       `json:"ocorrido_em"`
	Dados      json.RawMessage `json:"dados"`
}

func headerParts(header string) map[string]string {
	// "t=1786745524,v1=8f3a...c02e" -> map["t":"...", "v1":"..."]
	parts := map[string]string{}
	for _, item := range strings.Split(header, ",") {
		key, value, found := strings.Cut(item, "=")
		if found {
			parts[strings.TrimSpace(key)] = strings.TrimSpace(value)
		}
	}
	return parts
}

func VerifyEvent(rawBody []byte, header string) (*Event, error) {
	parts := headerParts(header)
	t, v1 := parts["t"], parts["v1"]
	if t == "" || v1 == "" {
		return nil, ErrInvalidSignature
	}

	// Replay window: a valid signature captured yesterday is not valid today.
	issued, err := strconv.ParseInt(t, 10, 64)
	if err != nil || math.Abs(float64(time.Now().Unix()-issued)) > toleranceS {
		return nil, ErrInvalidSignature
	}

	mac := hmac.New(sha256.New, secret)
	mac.Write([]byte(t + "."))
	mac.Write(rawBody)

	received, err := hex.DecodeString(v1)
	// `hmac.Equal` is the standard library's constant-time comparison.
	if err != nil || !hmac.Equal(mac.Sum(nil), received) {
		return nil, ErrInvalidSignature
	}

	var event Event
	if err := json.Unmarshal(rawBody, &event); err != nil {
		return nil, err
	}
	return &event, nil
}

func Receive(w http.ResponseWriter, r *http.Request) {
	// Read the Body BEFORE any decoding: the HMAC is over the bytes that
	// arrived, not over the re-serialized JSON.
	rawBody, err := io.ReadAll(io.LimitReader(r.Body, 1<<20))
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	event, err := VerifyEvent(rawBody, r.Header.Get("X-Trilho-Assinatura"))
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	// Answer and enqueue. The window is 10 seconds, and Trilho retries
	// anything that is not 2xx — including what you already processed.
	w.WriteHeader(http.StatusOK)
	Enqueue(event)
}
```

</CodeGroup>

## Deduplicating, the step nobody writes

Verifying the signature proves the event came from Trilho. It does not prove it
is new. Store the event `id` in a table with a uniqueness constraint and treat
the violation as success:

```sql
INSERT INTO eventos_processados (id, tipo, ocorrido_em)
VALUES ($1, $2, $3)
ON CONFLICT (id) DO NOTHING
RETURNING id;
```

No row returned means *already processed this one*. That is the entire
implementation, and it is short enough to leave no excuse.

:::note[What happens when you return `4xx`]

If you return `4xx`, Trilho **retries anyway** — the retry policy does not
distinguish your error from ours, because distinguishing would mean trusting the
status code of a server that is, by definition, in trouble. After 12 attempts
over 72 hours the **delivery** becomes `falhada` and shows up under
**Developers › Webhooks** for manual resend. The enum belongs to the delivery,
not the event: one event can have a failed delivery and a completed one.

:::
