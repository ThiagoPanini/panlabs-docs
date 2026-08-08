---
title: Cobrar cartão com autenticação
description: O fluxo com 3-D Secure, a transferência de responsabilidade que ele compra e o que fazer quando o emissor não responde.
---

# Cobrar cartão com autenticação

<Untranslated />

Autenticação 3-D Secure é o desafio que o banco emissor apresenta ao pagador
antes de autorizar — o código no app, a biometria, o SMS. Ela custa conversão e
compra uma coisa só, que é grande: **a responsabilidade do *chargeback* por
compra não reconhecida passa a ser do emissor**.

Este guia mostra o fluxo inteiro e o critério para decidir quando usá-lo.

## Pré-requisitos

Tokenização já funcionando no navegador (ver
[Meios de pagamento › Cartão](../meios-de-pagamento/cartao)), uma URL de retorno
no seu domínio e a chave secreta do ambiente.

## O caminho

<Steps>
<Step title="Peça autenticação na criação da cobrança">

```bash
curl https://api.trilho.dev/v1/cobrancas \
  -H "Authorization: Bearer tk_live_..." \
  -H "Idempotency-Key: pedido-4821" \
  -H "Content-Type: application/json" \
  -d '{
    "valor": 149900,
    "meio": "cartao",
    "referencia_externa": "pedido-4821",
    "pagamento": {
      "cartao": {
        "token": "cart_8Nq2vB",
        "autenticacao": "obrigatoria",
        "retorno_url": "https://loja.exemplo.com.br/checkout/retorno"
      }
    }
  }'
```

`autenticacao` aceita `obrigatoria`, `preferencial` e `dispensada`. A do meio é a
que a maioria quer: tenta autenticar e segue sem, quando o emissor não suporta.

</Step>
<Step title="Redirecione o pagador">

```json title="201 Created — status pendente"
{
  "id": "cob_9Xz4mT",
  "status": "pendente",
  "acao_requerida": {
    "tipo": "autenticacao_3ds",
    "url": "https://3ds.trilho.dev/desafio/cob_9Xz4mT",
    "expira_em": "2026-08-07T18:25:00Z"
  }
}
```

Redirecione a janela inteira, não um `iframe`. Vários emissores recusam ser
enquadrados, e o desafio simplesmente não aparece — sem erro e sem log.

</Step>
<Step title="Receba o retorno e leia o desfecho">

O pagador volta para a sua `retorno_url` com `?cobranca=cob_9Xz4mT`. **Não
confie nesse parâmetro**: consulte a cobrança, ou espere o evento.

```js
const cobranca = await trilho.cobrancas.obter(req.query.cobranca);
const {autenticacao_3ds} = cobranca.pagamento.cartao.verificacoes;
```

</Step>
<Step title="Decida com base em `verificacoes`" icon="check">

```json title="Trecho de pagamento.cartao.verificacoes"
{
  "cvv": "conferido",
  "endereco": "nao_enviado",
  "autenticacao_3ds": "autenticado"
}
```

Só `autenticado` transfere a responsabilidade. `tentado` significa que você
ofereceu e o emissor não respondeu — a autorização segue, a proteção não vem.

</Step>
</Steps>

:::warning[O desafio expira em 15 minutos]

Passado o prazo sem o pagador concluir, a cobrança vai para `expirada` e o token
precisa ser usado numa cobrança nova. Não há como reabrir o desafio, e o pagador
que voltou do banco cinco minutos tarde vê uma tela de erro se você não tratar
esse caso.

:::

## Verificação

No sandbox, o desfecho é determinístico pelo número do cartão:

| Cartão | `autenticacao_3ds` | Autorização |
| --- | --- | --- |
| `4242 4242 4242 4242` | `autenticado` | aprovada |
| `4000 0000 0000 3220` | `tentado` | aprovada |
| `4000 0000 0000 3063` | `nao_autenticado` | recusada |
| `4000 0000 0000 0002` | `autenticado` | recusada por `saldo_insuficiente` |

A última linha é a que mais gente esquece de testar: autenticar não é autorizar.
O pagador pode passar pelo desafio e ainda assim não ter limite.

## Variações

**Quando usar `obrigatoria`.** Ticket alto, produto de fácil revenda, cliente
novo, ou histórico de disputa naquele cartão. A perda de conversão é real e
costuma ficar entre 3% e 8%.

**Quando usar `dispensada`.** Recorrência já autenticada na primeira cobrança, e
valores baixos. O emissor não desafia uma cobrança de assinatura que ele mesmo já
aprovou antes.

**Quando o emissor não responde.** Com `preferencial`, a cobrança segue sem
autenticação e `autenticacao_3ds` volta `tentado`. Com `obrigatoria`, ela é
recusada com `autenticacao_indisponivel` — e a decisão de reapresentar sem
autenticação é sua, deliberada, não automática.

:::note[Autenticação não protege contra tudo]

A transferência de responsabilidade vale para *não reconheço a compra*. Disputa
por produto não entregue ou diferente do anunciado continua sendo sua, autenticada
ou não — e é a mais comum em varejo.

:::
