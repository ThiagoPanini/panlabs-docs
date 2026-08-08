---
title: Split
description: Dividir uma cobrança entre recebedores na própria criação, quem paga a taxa e o que acontece quando a divisão não fecha.
---

# Split

<Untranslated />

Split é a divisão de uma cobrança entre vários recebedores, declarada **na
própria cobrança**. O dinheiro nunca passa inteiro pela sua conta para depois ser
repassado: ele já liquida dividido.

A diferença não é de conveniência. Dinheiro que entra na sua conta e sai para
terceiros é receita sua para efeito fiscal; dinheiro que liquida dividido é
receita de cada um. O split existe para você não precisar dessa conversa com o
contador.

## Como se declara

O campo `split` é uma lista de recebedores, e ela vai na criação — nunca depois.

```json title="Trecho do POST /cobrancas"
{
  "valor": 20000,
  "meio": "pix",
  "split": [
    {"recebedor_id": "rcb_2Kd8pQ", "valor": 17000, "assume_taxa": false},
    {"recebedor_id": "rcb_9Xn1vB", "valor": 3000, "assume_taxa": true}
  ]
}
```

| Campo | O que é |
| --- | --- |
| `recebedor_id` | uma conta Trilho já habilitada a receber |
| `valor` | inteiro em centavos, **ou** `percentual` em centésimos de ponto |
| `assume_taxa` | quem paga a tarifa da transação |

`valor` e `percentual` são mutuamente exclusivos, e misturá-los na mesma lista
devolve `422`. É deliberado: uma lista meio fixa e meio percentual só tem
resultado definido se houver uma ordem de aplicação, e ordem implícita é a classe
de regra que ninguém lembra seis meses depois.

## A soma tem que fechar

A soma dos `valor` precisa ser **exatamente** igual ao valor da cobrança. Não
sobra, não falta, e o Trilho não completa a diferença com a sua conta.

:::warning[A divisão de percentual arredonda para baixo, e a sobra é sua]

Com `percentual`, três recebedores de 33,33% sobre R$ 100,00 somam R$ 99,99. O
centavo restante vai para o **primeiro recebedor da lista**, e a regra está aqui
escrita porque a alternativa — distribuir o resto — produz totais que dependem da
ordem sem que ninguém tenha declarado uma.

:::

## Quem paga a taxa

`assume_taxa` decide de quem é descontada a tarifa da transação. Ele pode ser
`true` em mais de um recebedor, e nesse caso a taxa é rateada proporcionalmente
entre eles.

```json title="A cobrança liquidada, com o rateio explícito"
{
  "id": "cob_4Tz7hM",
  "status": "liquidada",
  "valor": 20000,
  "taxa": 199,
  "split": [
    {"recebedor_id": "rcb_2Kd8pQ", "valor": 17000, "valor_liquido": 17000},
    {"recebedor_id": "rcb_9Xn1vB", "valor": 3000, "valor_liquido": 2801}
  ]
}
```

Quando **nenhum** recebedor assume, a taxa sai da sua conta — e é a única
situação em que o split toca o seu saldo.

## Estorno e devolução num split

Devolver uma cobrança dividida devolve de todos os recebedores,
proporcionalmente ao que cada um recebeu. Se um deles não tiver saldo, a
devolução inteira falha com `saldo_insuficiente_no_recebedor` e o campo
`recebedor_id` diz qual.

:::note[Não existe devolver de um recebedor só]

A tentação aparece quando o problema é de um dos participantes. Não há caminho
pela API, e é de propósito: uma devolução parcial por recebedor deixaria a
cobrança com uma divisão que não fecha, e o arquivo de movimento não teria como
representá-la. O caminho é devolver tudo e cobrar de novo.

:::

## Onde o split não vai

**Não há split em assinatura recorrente.** Cada ciclo é uma cobrança nova, e a
lista de recebedores precisa ser declarada em cada uma — o que na prática
significa criar as cobranças você mesmo em vez de usar o agendamento do Trilho.

**Não há split entre contas de instituições diferentes.** Todos os
`recebedor_id` são contas Trilho. Repasse para fora é transferência, e
transferência não é cobrança.

**Não há mais de 20 recebedores por cobrança.** O teto existe porque a
liquidação é atômica: ou todas as pernas liquidam, ou nenhuma, e a janela em que
isso é garantido cresce com o número de participantes.
