---
title: Estornar parcialmente
description: Devolver parte de uma cobrança, respeitando o que já foi devolvido e o meio de pagamento de origem.
---

# Estornar parcialmente

<Untranslated />

**O problema:** devolver dois itens de um pedido de cinco, sem devolver o pedido
inteiro e sem estourar o que ainda pode ser devolvido.

```js title="estornar.js"
import {Trilho, TrilhoError} from '@trilho/node';

const trilho = new Trilho(process.env.TRILHO_SECRET_KEY);

export async function devolverItens(pedidoId, itens) {
  const pedido = await db.pedidos.obter(pedidoId);
  const cobranca = await trilho.cobrancas.obter(pedido.cobranca_id);

  const valor = itens.reduce((soma, item) => soma + item.preco, 0);

  // O teto é o que a própria cobrança declara, não o total original:
  // devoluções anteriores já consumiram parte dele.
  if (valor > cobranca.valor_ainda_devolvivel) {
    throw new Error(
      `pedido ${pedidoId}: ${valor} excede o devolvível ` +
        `de ${cobranca.valor_ainda_devolvivel}`,
    );
  }

  // Pix e cartão são recursos diferentes, com prazos e origens de
  // dinheiro diferentes. A chamada certa depende do meio.
  const recurso = cobranca.meio === 'pix' ? trilho.devolucoes : trilho.estornos;

  try {
    return await recurso.criar(
      {
        cobranca_id: cobranca.id,
        valor,
        motivo: 'solicitacao_do_cliente',
      },
      // Amarrada aos itens: repetir a mesma devolução é seguro,
      // devolver outros itens do mesmo pedido continua possível.
      {idempotencyKey: `${pedidoId}-dev-${itens.map((i) => i.id).sort().join('-')}`},
    );
  } catch (erro) {
    if (erro instanceof TrilhoError && erro.codigo === 'saldo_insuficiente_para_devolucao') {
      // Devolução de Pix sai do seu saldo AGORA. Não há fila de espera.
      return {pendente_de_saldo: true, saldo_disponivel: erro.detalhes?.saldo_disponivel};
    }
    throw erro;
  }
}
```

Ler `valor_ainda_devolvivel` da cobrança em vez de guardar o próprio contador
evita a classe de bug mais chata deste fluxo: dois operadores devolvendo itens
diferentes ao mesmo tempo, cada um conferindo contra o total original, e a segunda
chamada falhando com `valor_excede_o_devolvivel` — ou, pior, passando.

A chave de idempotência derivada dos **itens** é o que permite as duas coisas ao
mesmo tempo: repetir a mesma devolução é inofensivo, e uma segunda devolução de
outros itens do mesmo pedido continua sendo aceita.

## Variações

**Pix e cartão não são a mesma operação.** Devolução de Pix sai do seu saldo
imediatamente e chega ao pagador em segundos, com prazo de 90 dias. Estorno de
cartão sai da próxima liquidação, chega em 5 a 30 dias pelo emissor, e tem prazo
de 180 dias. É por isso que são dois recursos.

**Sem saldo, a devolução de Pix simplesmente não acontece** — ela não fica
pendente e não entra em fila. Refazê-la é com você, e é o único caso em que vale
guardar estado do seu lado.

**A cobrança continua `liquidada`** depois de devolvida, parcial ou totalmente.
Apagar o fato de ter sido paga apagaria a informação que a contabilidade precisa.
