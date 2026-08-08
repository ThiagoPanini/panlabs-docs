---
title: Pix — devolução
description: Como devolver um Pix recebido, o prazo de 90 dias, a devolução parcial e o que fazer quando não há saldo.
---

# Pix — devolução

<Untranslated />

Pix não tem *chargeback*. O pagador não consegue reverter um pagamento, e o
banco dele não consegue tampouco. A única forma de o dinheiro voltar é você
mandá-lo de volta — e é isso que a devolução é.

Ela não é um estorno de cartão com outro nome. A mecânica, os prazos e os modos
de falhar são diferentes, e vale conhecê-los antes de precisar.

## O que muda em relação ao estorno de cartão

| | Devolução de Pix | Estorno de cartão |
| --- | --- | --- |
| Prazo | 90 dias da liquidação | 180 dias da captura |
| Origem do dinheiro | o **seu saldo**, agora | a próxima liquidação |
| Falha por saldo | sim, `saldo_insuficiente` | não se aplica |
| Chega ao pagador em | segundos | 5 a 30 dias, pelo emissor |
| Parcial | sim, qualquer valor | sim |
| Quantas por cobrança | várias, até somar o total | várias |

A segunda linha é a que surpreende. A devolução sai do seu saldo disponível no
instante em que é criada. Se o dinheiro já foi sacado, a devolução falha — e não
existe fila de espera por saldo.

## Devolver

<Steps>
<Step title="Poste a devolução com o `id` da cobrança">

```bash
curl https://api.trilho.dev/v1/devolucoes \
  -H "Authorization: Bearer tk_live_..." \
  -H "Idempotency-Key: devolucao-pedido-4821" \
  -H "Content-Type: application/json" \
  -d '{
    "cobranca_id": "cob_3nK2xQ",
    "valor": 14990,
    "motivo": "solicitacao_do_cliente"
  }'
```

Omitir `valor` devolve o total. `motivo` é obrigatório e vale um de
`solicitacao_do_cliente`, `erro_operacional` ou `suspeita_de_fraude`.

</Step>
<Step title="Leia o desfecho">

```json title="201 Created"
{
  "id": "dev_2Rq8xF",
  "cobranca_id": "cob_3nK2xQ",
  "status": "concluida",
  "valor": 14990,
  "motivo": "solicitacao_do_cliente",
  "concluida_em": "2026-08-08T10:03:11Z"
}
```

Ao contrário do cartão, a devolução de Pix costuma nascer `concluida`. Quando
não nasce, ela é `pendente` e um evento `devolucao.concluida` chega depois.

</Step>
<Step title="Trate o caso de saldo" icon="circle-alert">

Sem saldo disponível, a chamada devolve `422` com
`codigo: "saldo_insuficiente_para_devolucao"` e o campo `saldo_disponivel`. A
devolução **não fica pendente** — ela simplesmente não acontece, e refazê-la é
com você.

</Step>
</Steps>

:::warning[O prazo de 90 dias é do arranjo, não nosso]

Passados 90 dias da liquidação, a devolução pelo Pix deixa de ser possível — a
regra é do Banco Central e não há exceção que o Trilho possa abrir. Depois disso
o caminho é uma transferência comum, que não fica amarrada à cobrança original e
não aparece na conciliação como devolução.

:::

## Devolução parcial

Várias devoluções na mesma cobrança são permitidas enquanto a soma não passar do
valor pago. A décima devolução de R$ 1,00 numa cobrança de R$ 9,00 falha com
`valor_excede_o_devolvivel`, e o campo `valor_ainda_devolvivel` diz quanto
sobrou.

```json title="A cobrança depois de duas devoluções parciais"
{
  "id": "cob_3nK2xQ",
  "status": "liquidada",
  "valor": 14990,
  "valor_devolvido": 5000,
  "valor_ainda_devolvivel": 9990,
  "devolucoes": ["dev_2Rq8xF", "dev_6Yt3kP"]
}
```

Note que `status` continua `liquidada`. A cobrança não muda de estado ao ser
devolvida, pelo mesmo motivo pelo qual não muda ao ser estornada: apagar o fato
de ter sido paga apagaria a informação que a contabilidade precisa.

## Na conciliação

A devolução aparece como uma linha negativa **no dia em que aconteceu**, não no
dia da venda. Uma venda de janeiro devolvida em fevereiro é receita de janeiro e
saída de fevereiro, e o total de janeiro não muda. É a divergência de período
descrita em [Conceitos › Conciliação](../conceitos/conciliacao), e é a que mais
custa a aceitar.

:::note[A devolução é irreversível também]

Não existe cancelar uma devolução. Se ela foi feita por engano, o caminho é
cobrar de novo — nova cobrança, `referencia_externa` igual à original.

:::
