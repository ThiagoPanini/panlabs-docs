---
title: Cobrar um cartão salvo
description: Cobrar sem o cliente presente, tratando recusa como resposta e não como exceção.
---

# Cobrar um cartão salvo

<Untranslated />

**O problema:** cobrar um cliente com cartão já salvo, sem ele estar na tela, e
reagir corretamente ao desfecho.

```js title="cobrar-salvo.js"
import {Trilho, TrilhoError} from '@trilho/node';

const trilho = new Trilho(process.env.TRILHO_SECRET_KEY);

export async function cobrarSalvo(clienteId, valor, referencia) {
  let cobranca;

  try {
    cobranca = await trilho.cobrancas.criar(
      {
        valor,
        moeda: 'BRL',
        meio: 'cartao',
        cliente_id: clienteId,
        referencia_externa: referencia,
        pagamento: {
          cartao: {
            usar_meio_padrao: true,
            // Sem o cliente na tela não há como apresentar desafio.
            // A primeira cobrança dele já autenticou; o emissor lembra.
            autenticacao: 'dispensada',
            iniciador: 'comerciante',
          },
        },
      },
      {idempotencyKey: `${referencia}-cartao-1`},
    );
  } catch (erro) {
    // Aqui só cai o que é erro de verdade: validação, credencial, limite.
    if (erro instanceof TrilhoError) {
      log.error('trilho', {requisicao: erro.requisicao, codigo: erro.codigo});
    }
    throw erro;
  }

  // Recusa NÃO cai no catch: ela é uma resposta 201 bem-sucedida.
  if (cobranca.status === 'recusada') {
    const {codigo, reapresentar, reapresentar_apos} = cobranca.motivo_recusa;
    return {
      pago: false,
      codigo,
      // A própria resposta diz se insistir adianta, e a partir de quando.
      reagendar_para: reapresentar ? reapresentar_apos : null,
    };
  }

  return {pago: true, cobranca_id: cobranca.id};
}
```

A linha que mais importa é a que **não** está no `catch`. Uma cobrança recusada
por `saldo_insuficiente` devolve `201`: a requisição estava certa e o sistema
financeiro respondeu *não*. Tratar isso como exceção produz o alerta que dispara
mil vezes por dia e que ninguém lê.

`iniciador: 'comerciante'` diz ao emissor que o cliente não está presente. Sem
esse campo, uma cobrança sem interação é lida como transação abandonada e a taxa
de aprovação cai vários pontos.

E `reapresentar` vem pronto na resposta. Ele é a mesma informação da tabela de
[códigos de recusa](/docs/operacao/codigos-de-recusa), só que já resolvida para
aquele caso — insistir num código marcado como não reapresentável piora o seu
escore no emissor e derruba a aprovação das outras cobranças.
