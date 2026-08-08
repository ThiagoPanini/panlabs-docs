---
title: Retentativa com espera exponencial
description: Um laço de retentativa sobre HTTP cru que respeita Retry-After, desiste do que não adianta e não vira tempestade.
---

# Retentativa com espera exponencial

<Untranslated />

**O problema:** retentar `429` e `5xx` **sem SDK**, sem transformar uma
instabilidade de trinta segundos numa rajada que consome a sua janela de limite
inteira.

Os três SDKs já fazem isto por dentro — `maxTentativas: 3` é o default. Esta
receita é para quem chama a API por `fetch`, `curl` ou um cliente gerado.

```js title="retentar.js"
const RETENTAVEIS = new Set([429, 500, 502, 503, 504]);
const BASE_MS = 500;
const TETO_MS = 30_000;

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

export async function postar(caminho, corpo, chaveDeIdempotencia, maxTentativas = 4) {
  let ultimaResposta;

  for (let tentativa = 1; tentativa <= maxTentativas; tentativa++) {
    const resposta = await fetch(`https://api.trilho.dev/v1${caminho}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.TRILHO_SECRET_KEY}`,
        'Content-Type': 'application/json',
        // A MESMA chave em todas as tentativas — é isto que torna o laço seguro.
        'Idempotency-Key': chaveDeIdempotencia,
      },
      body: JSON.stringify(corpo),
    });

    if (resposta.ok) return resposta.json();

    // 4xx que não é 429 nunca melhora com repetição: o mesmo corpo devolve
    // o mesmo erro, e insistir só gasta limite.
    if (!RETENTAVEIS.has(resposta.status)) {
      throw new Error(`trilho ${resposta.status}: ${await resposta.text()}`);
    }

    ultimaResposta = resposta;
    if (tentativa === maxTentativas) break;

    // O servidor sabe melhor que a sua fórmula quando ele volta.
    const respeitar = Number(resposta.headers.get('retry-after')) * 1000;

    const exponencial = Math.min(BASE_MS * 2 ** (tentativa - 1), TETO_MS);
    // Jitter completo: sem ele, mil clientes que falharam juntos
    // retentam juntos e derrubam de novo o que acabou de voltar.
    const comJitter = Math.random() * exponencial;

    await dormir(Number.isFinite(respeitar) && respeitar > 0 ? respeitar : comJitter);
  }

  throw new Error(`trilho ${ultimaResposta.status}: desistiu após ${maxTentativas} tentativas`);
}
```

```js title="Uso"
const cobranca = await postar(
  '/cobrancas',
  {valor: pedido.total, meio: 'pix', referencia_externa: pedido.id},
  `${pedido.id}-1`,
);
```

A chave de idempotência **fora** do laço é o que torna tudo isso seguro. Sem ela,
a terceira tentativa de uma criação cria a terceira cobrança — e o cenário em que
o laço mais roda é exatamente aquele em que a resposta se perdeu, ou seja, aquele
em que a primeira pode ter passado.

`Retry-After` tem precedência sobre a fórmula porque ele é informação e a fórmula
é palpite. Um `429` traz a espera exata até a janela virar; ignorá-la e esperar
menos garante um segundo `429`.

O *jitter* completo — `random() * exponencial`, e não `exponencial + random()` —
é o que evita a tempestade sincronizada. Sem ele, todos os clientes que falharam
no mesmo segundo retentam no mesmo segundo.
