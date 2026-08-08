---
title: Monitoramento
description: O que observar numa integração com o Trilho, quais alertas valem a pena e por que taxa de aprovação é a única métrica que prevê receita.
---

# Monitoramento

<Untranslated />

Uma integração de pagamentos falha de duas maneiras: ruidosamente, com erro `5xx`
e alerta na cara, e silenciosamente, com a taxa de aprovação caindo três pontos
por semana sem que nada quebre. A segunda custa mais.

Este guia trata do que observar para pegar as duas.

## A regra de leitura

**Posição se lê da API, série se lê do evento.** Contar cobranças pagas varrendo
`GET /cobrancas` devolve um número que muda enquanto você lê; somar eventos
`cobranca.paga` devolve um número que fecha.

Isso não é preciosismo: a listagem é paginada por cursor sobre dados que estão
mudando, e um relatório construído assim conta duas vezes o que se moveu entre
duas páginas.

## As quatro métricas que valem alerta

<Steps>
<Step title="Taxa de aprovação, por meio e por bandeira">

Aprovadas dividido por tentadas, em janela móvel de 1 hora. É a única métrica que
prevê receita, e a única em que uma queda de 3% importa mais que um erro `500`.

Alerte em queda relativa, não em valor absoluto: um piso fixo de 85% dispara todo
domingo de madrugada e é desligado na segunda.

</Step>
<Step title="Latência do webhook do **seu** lado">

```bash
curl "https://api.trilho.dev/v1/webhooks/entregas?status=falhada&desde=2026-08-07" \
  -H "Authorization: Bearer tk_live_..."
```

Se essa lista não está vazia, você está perdendo eventos. A causa quase sempre é
o seu endpoint respondendo além da janela de 10 segundos porque processa antes de
responder.

</Step>
<Step title="Idade do evento mais antigo não processado">

A métrica de fila, e a mais honesta das quatro: ela sobe quando o seu consumidor
para, mesmo que nenhuma requisição falhe. Alerte acima de 5 minutos.

</Step>
<Step title="Consumo de limite de taxa" icon="gauge">

Todo resposta traz `X-Trilho-Limite-Restante`. Registre o valor mínimo por
minuto — chegar perto de zero é o aviso que antecede o `429`, e ele aparece dias
antes.

</Step>
</Steps>

## O que **não** vale alerta

**Recusa individual.** `saldo_insuficiente` é resposta legítima, não falha. Um
alerta por recusa dispara mil vezes por dia e ensina o time a ignorar alertas.

**`429` isolado.** Ele é o sistema funcionando: você bateu no limite e o SDK
esperou. O que merece alerta é a **frequência** dele subindo.

**Latência de uma chamada.** Ruído. O percentil 95 numa janela de 5 minutos é
sinal.

## Correlacionar com o nosso lado

Toda resposta carrega `X-Trilho-Requisicao` com um `req_...`, inclusive as de
sucesso. Registrá-lo em todo log de chamada custa uma linha e é o que torna o
suporte resolutivo:

```js
const inicio = Date.now();
const cobranca = await trilho.cobrancas.criar(dados);

log.info('trilho.cobranca.criada', {
  requisicao: cobranca.__requisicao,
  duracao_ms: Date.now() - inicio,
  meio: cobranca.meio,
  status: cobranca.status,
});
```

Note que `status` está no log. É o que permite calcular a taxa de aprovação sem
uma segunda fonte de dados.

:::warning[Não registre o corpo da requisição]

O corpo de uma criação de cobrança pode conter documento do sacado e, num
interceptador mal posicionado, número de cartão antes da tokenização. Um log
assim vira obrigação de PCI-DSS que ninguém planejou. Registre campos escolhidos,
nunca o objeto inteiro.

:::

## O painel de status

`status.trilho.dev` publica incidente e degradação por componente, e tem feed
para consumo automático. Ele é a primeira coisa a checar quando a taxa de
aprovação cai sem que nada tenha mudado do seu lado.

:::note[Alerta bom é alerta que alguém pode acionar]

Cada um dos quatro alertas acima tem uma ação correspondente — reapresentar,
consertar o endpoint, escalar o consumidor, pedir aumento de limite. Alerta sem
ação é ruído com carimbo de urgência.

:::
