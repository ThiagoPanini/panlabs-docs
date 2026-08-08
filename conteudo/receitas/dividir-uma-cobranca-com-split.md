---
title: Dividir uma cobrança com split
description: Repartir uma cobrança entre recebedores na criação, com a soma fechando e a taxa no lugar certo.
---

# Dividir uma cobrança com split

<Untranslated />

**O problema:** uma venda de marketplace em que o lojista recebe uma parte e a
plataforma fica com a comissão, sem o dinheiro passar inteiro por você.

```js title="split.js"
import {Trilho} from '@trilho/node';

const trilho = new Trilho(process.env.TRILHO_SECRET_KEY);

const COMISSAO_BP = 1200; // 12,00% em centésimos de ponto

export async function cobrarComSplit(pedido) {
  // Calcule em inteiros e derive a última perna por subtração: a soma
  // precisa bater exatamente com o total, e arredondar duas vezes não bate.
  const comissao = Math.floor((pedido.total * COMISSAO_BP) / 10_000);
  const doLojista = pedido.total - comissao;

  return trilho.cobrancas.criar(
    {
      valor: pedido.total,
      moeda: 'BRL',
      meio: 'pix',
      referencia_externa: pedido.id,
      split: [
        {
          recebedor_id: pedido.lojista.recebedor_id,
          valor: doLojista,
          // Quem vende paga a tarifa. Com `false` em todos, ela sai da
          // sua conta — e é a única situação em que o split te toca.
          assume_taxa: true,
        },
        {
          recebedor_id: process.env.TRILHO_RECEBEDOR_PLATAFORMA,
          valor: comissao,
          assume_taxa: false,
        },
      ],
    },
    {idempotencyKey: `${pedido.id}-split-1`},
  );
}
```

```json title="A cobrança liquidada, com o rateio explícito"
{
  "id": "cob_4Tz7hM",
  "status": "liquidada",
  "valor": 20000,
  "taxa": 199,
  "split": [
    {"recebedor_id": "rcb_2Kd8pQ", "valor": 17600, "valor_liquido": 17401},
    {"recebedor_id": "rcb_9Xn1vB", "valor": 2400,  "valor_liquido": 2400}
  ]
}
```

Derivar a última perna por subtração, em vez de calcular as duas, é o que faz a
soma fechar. Duas multiplicações arredondadas separadamente erram por um centavo
em boa parte dos valores, e a API rejeita a lista inteira com `422`.

`assume_taxa` decide de quem sai a tarifa, e pode ser `true` em mais de um — nesse
caso ela é rateada proporcionalmente. Com `false` em todos, ela sai do seu saldo.

## Variações

**Por percentual.** Trocar `valor` por `percentual` funciona, e aí a sobra do
arredondamento vai para o **primeiro recebedor da lista** — regra que existe
porque distribuir o resto produziria totais dependentes de uma ordem que ninguém
declarou. Misturar `valor` e `percentual` na mesma lista devolve `422`.

**Devolver.** A devolução é proporcional e atinge todos os recebedores. Se um
deles não tiver saldo, ela falha inteira, e o campo `recebedor_id` da resposta
diz qual. Não há caminho para devolver de um recebedor só.
