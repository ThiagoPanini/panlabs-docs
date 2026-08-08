---
title: Aceitar Pix com QR dinâmico
description: O caminho inteiro de um checkout em Pix — emissão, exibição, confirmação por webhook e o que fazer quando o pagador some.
---

# Aceitar Pix com QR dinâmico

<Untranslated />

Este guia cobre um checkout completo em Pix, do botão *finalizar pedido* até o
pedido marcado como pago no seu banco de dados. Ele explica as escolhas; se você
só quer o código, a versão sem prosa está em
[Receitas › Checkout Pix em dez minutos](/receitas/checkout-pix-em-dez-minutos).

## Pré-requisitos

Uma chave secreta do ambiente que você vai usar, uma chave Pix cadastrada em
**Recebimentos › Chaves**, e um endpoint público para receber webhooks. Se
qualquer um dos três estiver faltando, comece por
[Comece aqui › Primeira cobrança](../comece-aqui/primeira-cobranca).

## O caminho

<Steps>
<Step title="Crie a cobrança quando o pedido é fechado">

Não crie no carrinho. Uma cobrança tem prazo, e um QR emitido enquanto o cliente
ainda escolhe frete é um QR que vence antes de ele decidir.

```js
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

await db.pedidos.update(pedido.id, {cobranca_id: cobranca.id});
```

A última linha é a que a maioria esquece. Guardar o par
`pedido.id ↔ cobranca.id` no ato da criação é o que torna a conciliação
possível depois; reconstruí-lo por valor e data funciona até existirem dois
pedidos do mesmo valor no mesmo dia.

</Step>
<Step title="Exiba o `copia_e_cola`, não só a imagem">

Mais da metade dos pagamentos em desktop acontece por cópia da string, não por
leitura do QR — o cliente está num computador e paga pelo celular. Um checkout
que só mostra a imagem obriga essa pessoa a digitar 44 caracteres à mão.

Mostre os dois, com o botão de copiar em destaque, e exiba o prazo em contagem
regressiva. O prazo é o dado que mais reduz o abandono: *este código vale por 29
minutos* converte melhor que qualquer texto sobre segurança.

</Step>
<Step title="Espere o evento — nunca faça *polling*">

```js
app.post('/webhooks/trilho', express.raw({type: 'application/json'}), (req, res) => {
  const evento = verificarEvento(req.body, req.get('X-Trilho-Assinatura'));
  res.sendStatus(200);

  if (evento.tipo === 'cobranca.paga') {
    enfileirar('confirmar-pedido', evento);
  }
});
```

Responder `200` **antes** de processar é intencional: a janela é de 10 segundos, e
o Trilho retenta tudo que não for `2xx` — inclusive o que você já processou.

</Step>
<Step title="Confirme o pedido de forma idempotente" icon="check">

```sql
INSERT INTO eventos_processados (id) VALUES ($1) ON CONFLICT DO NOTHING RETURNING id;
```

Nenhuma linha devolvida significa *já processei este*. A entrega é no mínimo uma
vez por desenho, e o mesmo `cobranca.paga` vai chegar duas vezes algum dia.

</Step>
</Steps>

:::warning[Nunca confie no corpo antes de verificar a assinatura]

O endpoint é público e um `POST` forjado é trivial. A verificação completa, em
Node, Python e Go, está em [Conceitos › Webhooks](../conceitos/webhooks).

:::

## Verificação

Com a integração de pé, três chamadas provam que ela funciona — todas no sandbox:

1. Crie a cobrança e confira que o `copia_e_cola` volta preenchido.
2. Chame `POST /cobrancas/{id}/simular-pagamento` e confira que o webhook chega.
3. Reenvie o mesmo evento por **Desenvolvedores › Webhooks › Reenviar** e
   confira que o pedido **não** é confirmado duas vezes.

O terceiro é o que quase ninguém testa, e é o único que reproduz o defeito mais
caro dessa integração.

## Variações

**Prazo maior que 30 minutos.** Fatura e assinatura costumam usar dias. O teto é
30 dias, e quanto maior o prazo, maior a chance de o valor não fazer mais sentido
quando o pagamento chegar.

**O pagador sumiu.** A cobrança expira sozinha e não reabre. Para tentar de novo,
crie outra com a **mesma** `referencia_externa` e uma chave de idempotência nova
— por exemplo `${pedido.id}-pix-2`.

**Pagamento que chega depois do prazo.** Existe uma janela de segundos em que a
rede aceita e o Trilho devolve automaticamente, com um evento
`cobranca.pagamento_devolvido`. Escute-o: se o seu sistema deu o pedido por pago
com base em outra coisa que não o evento, é aqui que a divergência aparece.

:::note[Um QR por cobrança, sempre]

Reaproveitar um QR entre pedidos é possível com QR estático, e é uma armadilha:
dois pagamentos do mesmo valor no mesmo minuto ficam indistinguíveis, e nenhuma
conciliação resolve isso depois. Ver
[Meios de pagamento › Pix](../meios-de-pagamento/pix).

:::
