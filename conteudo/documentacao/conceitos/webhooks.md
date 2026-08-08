---
title: Webhooks
description: O contrato de entrega de eventos do Trilho, a assinatura HMAC sobre o corpo cru e a verificação completa em Node, Python e Go.
---

# Webhooks

<Untranslated />

Um webhook é o Trilho fazendo um `POST` no seu servidor sempre que algo muda.
Ele é o único canal em que a mudança de estado chega até você sem que você
pergunte — e é por isso que ele é também o único que precisa de assinatura.

## O contrato de entrega

| Propriedade | Garantia |
| --- | --- |
| Entrega | **no mínimo uma vez** — duplicata é normal, não é bug |
| Ordem | **nenhuma** — `cobranca.paga` pode chegar depois de `cobranca.liquidada` |
| Janela de resposta | 10 segundos até o seu `200` |
| Retentativa | 12 tentativas em 72 horas, espera exponencial (sandbox: 3 em 5 minutos) |
| Assinatura | HMAC-SHA256 sobre o **corpo cru**, no cabeçalho `X-Trilho-Assinatura` |

As duas primeiras linhas são as que mais custam a quem as ignora. Deduplicação
é o `id` do evento; ordenação é o `ocorrido_em`. Nenhuma das duas é opcional.

## A anatomia do que chega

```json title="POST no seu endpoint"
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

E os três cabeçalhos que importam:

```http
X-Trilho-Assinatura: t=1786745524,v1=8f3a...c02e
X-Trilho-Evento: evt_9Lm4tZ
X-Trilho-Tentativa: 1
```

## A assinatura, e por que ela é sobre o corpo cru

A string assinada é `t + "." + corpo`, onde `corpo` são **os bytes exatos que
chegaram**. Não é o JSON reserializado pelo seu framework: reserializar reordena
chaves, muda escapes e normaliza números — e qualquer uma dessas coisas produz um
HMAC diferente.

Na prática isso significa uma linha de configuração antes de qualquer coisa. No
Express, `express.raw()` no lugar de `express.json()`. No Flask,
`request.get_data()` em vez de `request.json`. Em Go, ler o `Body` antes de
qualquer decodificação.

:::warning[Comparar com `==` vaza o segredo]

A comparação do HMAC precisa ser em **tempo constante**. Um `==` normal para na
primeira diferença de byte, e a diferença de tempo entre parar no primeiro byte e
parar no décimo é medível pela rede. Todas as três implementações abaixo usam a
função de comparação segura da própria linguagem.

:::

<CodeGroup groupId="code-lang" queryString="lang">

```js title="Node"
import {createHmac, timingSafeEqual} from 'node:crypto';
import express from 'express';

const SEGREDO = process.env.TRILHO_WEBHOOK_SECRET;
const TOLERANCIA_S = 300;

class AssinaturaInvalida extends Error {}

function partesDoCabecalho(cabecalho) {
  // "t=1786745524,v1=8f3a...c02e" -> {t: "1786745524", v1: "8f3a...c02e"}
  const partes = {};
  for (const item of String(cabecalho ?? '').split(',')) {
    const [chave, valor] = item.split('=');
    if (chave && valor) partes[chave.trim()] = valor.trim();
  }
  return partes;
}

export function verificarEvento(corpoCru, cabecalho, segredo = SEGREDO) {
  const {t, v1} = partesDoCabecalho(cabecalho);
  if (!t || !v1) {
    throw new AssinaturaInvalida('cabeçalho X-Trilho-Assinatura malformado');
  }

  // Janela de replay: uma assinatura válida capturada ontem não vale hoje.
  const idade = Math.abs(Math.floor(Date.now() / 1000) - Number(t));
  if (!Number.isFinite(idade) || idade > TOLERANCIA_S) {
    throw new AssinaturaInvalida('timestamp fora da janela de 5 minutos');
  }

  const esperado = createHmac('sha256', segredo)
    .update(`${t}.`)
    .update(corpoCru)
    .digest();
  const recebido = Buffer.from(v1, 'hex');

  // `timingSafeEqual` lança se os comprimentos diferem — daí o guarda.
  if (
    recebido.length !== esperado.length ||
    !timingSafeEqual(esperado, recebido)
  ) {
    throw new AssinaturaInvalida('assinatura não confere');
  }

  return JSON.parse(corpoCru.toString('utf8'));
}

const app = express();

// `express.raw`, e NÃO `express.json`: o HMAC é sobre os bytes que chegaram.
app.post('/webhooks/trilho', express.raw({type: 'application/json'}), (req, res) => {
  let evento;
  try {
    evento = verificarEvento(req.body, req.get('X-Trilho-Assinatura'));
  } catch (erro) {
    if (erro instanceof AssinaturaInvalida) return res.sendStatus(400);
    throw erro;
  }

  // Responda ANTES de processar. A janela é de 10 segundos, e o Trilho
  // retenta tudo que não for 2xx — inclusive o que você já processou.
  res.sendStatus(200);
  enfileirar(evento);
});
```

```python title="Python"
import hashlib
import hmac
import json
import os
import time

from flask import Flask, request

SEGREDO = os.environ["TRILHO_WEBHOOK_SECRET"].encode()
TOLERANCIA_S = 300


class AssinaturaInvalida(Exception):
    pass


def partes_do_cabecalho(cabecalho: str) -> dict[str, str]:
    # "t=1786745524,v1=8f3a...c02e" -> {"t": "...", "v1": "..."}
    partes: dict[str, str] = {}
    for item in (cabecalho or "").split(","):
        chave, _, valor = item.partition("=")
        if chave and valor:
            partes[chave.strip()] = valor.strip()
    return partes


def verificar_evento(corpo_cru: bytes, cabecalho: str, segredo: bytes = SEGREDO) -> dict:
    partes = partes_do_cabecalho(cabecalho)
    t, v1 = partes.get("t"), partes.get("v1")
    if not t or not v1:
        raise AssinaturaInvalida("cabeçalho X-Trilho-Assinatura malformado")

    # Janela de replay: uma assinatura válida capturada ontem não vale hoje.
    try:
        idade = abs(int(time.time()) - int(t))
    except ValueError as erro:
        raise AssinaturaInvalida("timestamp não numérico") from erro
    if idade > TOLERANCIA_S:
        raise AssinaturaInvalida("timestamp fora da janela de 5 minutos")

    esperado = hmac.new(segredo, f"{t}.".encode() + corpo_cru, hashlib.sha256)

    # `compare_digest` é a comparação em tempo constante da biblioteca padrão.
    if not hmac.compare_digest(esperado.hexdigest(), v1):
        raise AssinaturaInvalida("assinatura não confere")

    return json.loads(corpo_cru)


app = Flask(__name__)


@app.post("/webhooks/trilho")
def receber():
    # `get_data`, e NÃO `request.json`: o HMAC é sobre os bytes que chegaram.
    try:
        evento = verificar_evento(
            request.get_data(), request.headers.get("X-Trilho-Assinatura", "")
        )
    except AssinaturaInvalida:
        return "", 400

    # Enfileire e responda. A janela é de 10 segundos, e o Trilho retenta
    # tudo que não for 2xx — inclusive o que você já processou.
    enfileirar(evento)
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

const toleranciaS = 300

var (
	segredo             = []byte(os.Getenv("TRILHO_WEBHOOK_SECRET"))
	ErrAssinaturaInvalida = errors.New("assinatura inválida")
)

type Evento struct {
	ID         string          `json:"id"`
	Tipo       string          `json:"tipo"`
	OcorridoEm time.Time       `json:"ocorrido_em"`
	Dados      json.RawMessage `json:"dados"`
}

func partesDoCabecalho(cabecalho string) map[string]string {
	// "t=1786745524,v1=8f3a...c02e" -> map["t":"...", "v1":"..."]
	partes := map[string]string{}
	for _, item := range strings.Split(cabecalho, ",") {
		chave, valor, achou := strings.Cut(item, "=")
		if achou {
			partes[strings.TrimSpace(chave)] = strings.TrimSpace(valor)
		}
	}
	return partes
}

func VerificarEvento(corpoCru []byte, cabecalho string) (*Evento, error) {
	partes := partesDoCabecalho(cabecalho)
	t, v1 := partes["t"], partes["v1"]
	if t == "" || v1 == "" {
		return nil, ErrAssinaturaInvalida
	}

	// Janela de replay: uma assinatura válida capturada ontem não vale hoje.
	emitido, err := strconv.ParseInt(t, 10, 64)
	if err != nil || math.Abs(float64(time.Now().Unix()-emitido)) > toleranciaS {
		return nil, ErrAssinaturaInvalida
	}

	mac := hmac.New(sha256.New, segredo)
	mac.Write([]byte(t + "."))
	mac.Write(corpoCru)

	recebido, err := hex.DecodeString(v1)
	// `hmac.Equal` é a comparação em tempo constante da biblioteca padrão.
	if err != nil || !hmac.Equal(mac.Sum(nil), recebido) {
		return nil, ErrAssinaturaInvalida
	}

	var evento Evento
	if err := json.Unmarshal(corpoCru, &evento); err != nil {
		return nil, err
	}
	return &evento, nil
}

func Receber(w http.ResponseWriter, r *http.Request) {
	// Leia o Body ANTES de qualquer decodificação: o HMAC é sobre os bytes
	// que chegaram, não sobre o JSON reserializado.
	corpoCru, err := io.ReadAll(io.LimitReader(r.Body, 1<<20))
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	evento, err := VerificarEvento(corpoCru, r.Header.Get("X-Trilho-Assinatura"))
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	// Responda e enfileire. A janela é de 10 segundos, e o Trilho retenta
	// tudo que não for 2xx — inclusive o que você já processou.
	w.WriteHeader(http.StatusOK)
	Enfileirar(evento)
}
```

</CodeGroup>

## Deduplicar, que é o passo que ninguém escreve

Verificar a assinatura prova que o evento veio do Trilho. Não prova que ele é
novo. Guarde o `id` do evento numa tabela com restrição de unicidade e trate a
violação como sucesso:

```sql
INSERT INTO eventos_processados (id, tipo, ocorrido_em)
VALUES ($1, $2, $3)
ON CONFLICT (id) DO NOTHING
RETURNING id;
```

Nenhuma linha devolvida significa *já processei este*. É a implementação inteira,
e ela é curta o bastante para não ter desculpa.

:::note[O que fazer com `4xx` do seu lado]

Se você devolver `4xx`, o Trilho **retenta mesmo assim** — a política de
retentativa não distingue erro seu de erro nosso, porque distinguir exigiria
confiar no código de status de um servidor que, por definição, está com
problema. Depois de 12 tentativas em 72 horas, o evento vira `falhado` e aparece
em **Desenvolvedores › Webhooks** para reenvio manual.

:::
