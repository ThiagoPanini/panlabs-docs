---
title: Verificar assinatura de webhook
description: A verificação HMAC completa, sem SDK, em Node e Python — janela de replay incluída.
---

# Verificar assinatura de webhook

<Untranslated />

**O problema:** provar que um `POST` no seu endpoint veio mesmo do Trilho, sem
depender do SDK.

<CodeGroup groupId="code-lang" queryString="lang">

```js title="Node"
import {createHmac, timingSafeEqual} from 'node:crypto';

const TOLERANCIA_S = 300;

export function verificarEvento(corpoCru, cabecalho, segredo) {
  const partes = Object.fromEntries(
    String(cabecalho ?? '')
      .split(',')
      .map((item) => item.split('=').map((s) => s.trim())),
  );
  const {t, v1} = partes;
  if (!t || !v1) throw new Error('cabeçalho malformado');

  const idade = Math.abs(Math.floor(Date.now() / 1000) - Number(t));
  if (!Number.isFinite(idade) || idade > TOLERANCIA_S) {
    throw new Error('fora da janela de 5 minutos');
  }

  const esperado = createHmac('sha256', segredo)
    .update(`${t}.`)
    .update(corpoCru)
    .digest();
  const recebido = Buffer.from(v1, 'hex');

  if (recebido.length !== esperado.length || !timingSafeEqual(esperado, recebido)) {
    throw new Error('assinatura não confere');
  }

  return JSON.parse(corpoCru.toString('utf8'));
}
```

```python title="Python"
import hashlib
import hmac
import json
import time

TOLERANCIA_S = 300


def verificar_evento(corpo_cru: bytes, cabecalho: str, segredo: bytes) -> dict:
    partes = dict(
        item.split("=", 1) for item in (cabecalho or "").split(",") if "=" in item
    )
    t, v1 = partes.get("t", "").strip(), partes.get("v1", "").strip()
    if not t or not v1:
        raise ValueError("cabeçalho malformado")

    try:
        idade = abs(int(time.time()) - int(t))
    except ValueError as erro:
        raise ValueError("timestamp não numérico") from erro
    if idade > TOLERANCIA_S:
        raise ValueError("fora da janela de 5 minutos")

    esperado = hmac.new(segredo, f"{t}.".encode() + corpo_cru, hashlib.sha256)
    if not hmac.compare_digest(esperado.hexdigest(), v1):
        raise ValueError("assinatura não confere")

    return json.loads(corpo_cru)
```

</CodeGroup>

O `corpoCru` precisa ser `Buffer` ou `bytes` — nunca o objeto já decodificado. É
o erro mais comum desta rotina, e ele se manifesta como *"funciona no teste e
falha em produção"*, porque o teste costuma mandar um JSON que reserializa
igual.

A comparação em tempo constante não é cerimônia. Um `==` normal para na primeira
diferença de byte, e essa diferença de tempo é medível pela rede — é assim que se
descobre um segredo byte a byte.

A janela de 5 minutos é o que impede *replay*: uma requisição legítima capturada
ontem não vale hoje, mesmo com assinatura perfeitamente válida.
