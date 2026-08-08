---
title: Assinar um cliente
description: Ciclo, prorrateio e o desenho de retentativa que sobrevive a cartão vencido — uma assinatura que não perde receita por descuido.
---

# Assinar um cliente

<Untranslated />

Uma assinatura é uma cobrança que se repete sozinha. O trabalho não está em criá-la
— são três campos —, e sim em decidir o que acontece nos meses em que ela falha.
Este guia trata dos dois.

## Pré-requisitos

Um `cliente` com meio de pagamento salvo, um `plano` cadastrado em **Produtos ›
Planos**, e webhooks configurados. A recorrência é assíncrona por natureza: sem
webhook, você descobre uma falha de cobrança no mês seguinte.

## O caminho

<Steps>
<Step title="Salve o meio de pagamento no cliente">

```js
const cliente = await trilho.clientes.criar({
  nome: 'Maria Souza',
  email: 'maria@exemplo.com.br',
  documento: '12345678909',
  meio_padrao: {tipo: 'cartao', token: 'cart_8Nq2vB'},
});
```

Autentique essa **primeira** cobrança com 3-D Secure. O emissor guarda o
consentimento, e as cobranças seguintes da mesma assinatura passam sem desafio —
ver [Cobrar cartão com autenticação](cobrar-cartao-com-autenticacao).

</Step>
<Step title="Crie a assinatura">

```bash
curl https://api.trilho.dev/v1/assinaturas \
  -H "Authorization: Bearer tk_live_..." \
  -H "Idempotency-Key: assinatura-maria-pro" \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_id": "cli_6Bn2wR",
    "plano_id": "pln_pro_mensal",
    "dia_de_cobranca": 5,
    "politica_de_falha": "retentar_e_suspender"
  }'
```

`dia_de_cobranca` fixa a data do ciclo. Sem ele, o ciclo segue o dia da
assinatura — o que espalha a sua receita por trinta dias e torna a conciliação
mensal mais trabalhosa do que precisa ser.

</Step>
<Step title="Escute os quatro eventos que importam">

| Evento | O que fazer |
| --- | --- |
| `assinatura.cobranca_criada` | nada — é informativo |
| `cobranca.paga` | estender o acesso até o próximo ciclo |
| `cobranca.recusada` | avisar o cliente, **sem** cortar o acesso ainda |
| `assinatura.suspensa` | cortar o acesso |

A terceira linha é o desenho inteiro. Cortar acesso na primeira recusa transforma
um cartão que trocou de número num cliente perdido.

</Step>
<Step title="Trate a suspensão como reversível" icon="refresh-cw">

```js
await trilho.assinaturas.reativar('asn_3Hp5dK', {
  meio: {tipo: 'cartao', token: 'cart_novo'},
});
```

Reativar cobra o ciclo em aberto na hora e recoloca a assinatura no calendário
original. O cliente não perde o dia de cobrança dele.

</Step>
</Steps>

:::warning[Prorrateio na troca de plano é opt-in]

Mudar de plano no meio do ciclo **não** cobra nem credita a diferença por padrão:
o novo valor vale a partir do próximo ciclo. Mande `prorratear: true` para cobrar
a diferença na hora. A escolha padrão é a menos surpreendente para o cliente
final, e é a que gera menos contestação.

:::

## Verificação

No sandbox, `POST /assinaturas/{id}/avancar-ciclo` simula a virada do mês sem
esperar por ela. Três coisas valem testar antes de subir:

1. Um ciclo que paga — o acesso se estende.
2. Um ciclo que recusa com `4000 0000 0000 0002` — o aviso sai, o acesso fica.
3. Quatro ciclos recusados seguidos — a assinatura suspende e o acesso cai.

## O desenho de retentativa

`politica_de_falha` decide o que acontece depois de uma recusa. São três valores,
e o do meio é o padrão:

| Valor | Comportamento |
| --- | --- |
| `suspender` | suspende na primeira recusa |
| `retentar_e_suspender` | 4 tentativas em 12 dias, depois suspende |
| `retentar_indefinidamente` | tenta todo ciclo, nunca suspende |

O escalonamento de `retentar_e_suspender` é D+0, D+3, D+7 e D+12. Ele não é
arbitrário: cobre o intervalo típico entre a falha por limite e o depósito de
salário, que é a causa mais comum de recusa recorrente em cartão.

:::note[Cartão vencido é o caso de longe mais frequente]

Um cartão que expira em dezembro derruba toda a base que assinou naquele mês.
Escute `cliente.meio_prestes_a_vencer`, que chega 30 dias antes, e peça a
atualização enquanto o cliente ainda está pagando — não depois que ele parou.

:::

## Variações

**Assinatura em Pix.** Funciona, mas não se cobra sozinha: o Trilho emite a
cobrança e o cliente precisa pagar. Use `politica_de_falha:
retentar_indefinidamente` e um lembrete por e-mail — é o par que perde menos
receita.

**Período de teste.** `dias_de_teste: 14` na criação. A primeira cobrança sai no
dia 15, e uma autorização de R$ 1,00 é feita e cancelada no dia 1 para validar o
cartão.

**Cancelar.** `DELETE /assinaturas/{id}` encerra ao fim do ciclo pago. Para
encerrar na hora e devolver o proporcional, mande `imediato: true`.
