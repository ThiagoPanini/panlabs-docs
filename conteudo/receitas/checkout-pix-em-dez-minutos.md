---
title: Checkout Pix em dez minutos
description: Criar a cobrança, exibir o QR e confirmar o pedido pelo webhook — o caminho inteiro num arquivo.
---

# Checkout Pix em dez minutos

<Untranslated />

**O problema:** aceitar Pix num checkout e marcar o pedido como pago sem
*polling*.

```js title="checkout-pix.js"
import express from 'express';
import {Trilho} from '@trilho/node';

const trilho = new Trilho(process.env.TRILHO_SECRET_KEY);
const app = express();

// 1 — o pedido é fechado: cria a cobrança e guarda o par de identificadores.
app.post('/pedidos/:id/pagar', express.json(), async (req, res) => {
  const pedido = await db.pedidos.obter(req.params.id);

  const cobranca = await trilho.cobrancas.criar(
    {
      valor: pedido.total,
      moeda: 'BRL',
      meio: 'pix',
      referencia_externa: pedido.id,
      expira_em: new Date(Date.now() + 30 * 60_000).toISOString(),
    },
    {idempotencyKey: `${pedido.id}-pix-1`},
  );

  await db.pedidos.atualizar(pedido.id, {cobranca_id: cobranca.id});

  res.json({
    copia_e_cola: cobranca.pagamento.pix.copia_e_cola,
    qr_code_url: cobranca.pagamento.pix.qr_code_url,
    expira_em: cobranca.expira_em,
  });
});

// 2 — o evento chega: verifica, responde, e só então processa.
app.post('/webhooks/trilho', express.raw({type: 'application/json'}), (req, res) => {
  let evento;
  try {
    evento = trilho.webhooks.verificar(
      req.body,
      req.get('X-Trilho-Assinatura'),
      process.env.TRILHO_WEBHOOK_SECRET,
    );
  } catch {
    return res.sendStatus(400);
  }

  res.sendStatus(200);

  if (evento.tipo === 'cobranca.paga') {
    confirmarUmaVezSo(evento);
  }
});

// 3 — a deduplicação, que é o passo que ninguém escreve.
async function confirmarUmaVezSo(evento) {
  const novo = await db.query(
    `INSERT INTO eventos_processados (id) VALUES ($1)
     ON CONFLICT (id) DO NOTHING RETURNING id`,
    [evento.id],
  );
  if (novo.rowCount === 0) return;

  await db.pedidos.confirmarPorReferencia(evento.dados.cobranca.referencia_externa);
}

app.listen(3000);
```

Três coisas não são óbvias lendo o código.

`express.raw` no lugar de `express.json` na rota de webhook, porque o HMAC é
calculado sobre os **bytes que chegaram** — reserializar o JSON muda a ordem das
chaves e produz outra assinatura.

O `res.sendStatus(200)` vem **antes** do processamento. A janela é de 10 segundos
para o status, não para o seu trabalho, e o Trilho retenta tudo que não for `2xx`
— inclusive o que você já processou.

E a linha que guarda `cobranca_id` no pedido, no ato da criação, é o que torna a
conciliação possível depois. Reconstruir esse par por valor e data funciona até
existirem dois pedidos do mesmo valor no mesmo dia.
