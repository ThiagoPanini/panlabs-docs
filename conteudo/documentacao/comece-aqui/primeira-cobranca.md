---
title: Primeira cobrança
description: Do zero à primeira cobrança Pix autorizada e confirmada por webhook, em cinco passos e cerca de dez minutos.
---

# Primeira cobrança

<Untranslated />

Dez minutos, uma chave de sandbox e um endpoint público. Ao final você terá
criado uma cobrança em Pix, lido o QR de volta, simulado o pagamento e recebido o
evento `cobranca.paga` no seu servidor — que é a API inteira em miniatura:
autenticação, criação, leitura e notificação.

Nada aqui cobra ninguém. O sandbox é determinístico e não fala com o Banco
Central.

## Os cinco passos

<Steps>
<Step title="Autentique-se">

Pegue a chave `tk_test_` no painel e confirme que ela responde:

```bash
curl https://api.sandbox.trilho.dev/v1/conta \
  -H "Authorization: Bearer tk_test_9f2c4a1e8b7d6503"
```

Se vier `401`, o problema está em [Autenticação](autenticacao) — resolva ali
antes de seguir.

</Step>
<Step title="Crie a cobrança">

Um `POST` com valor, meio e uma referência sua:

```bash
curl https://api.sandbox.trilho.dev/v1/cobrancas \
  -H "Authorization: Bearer tk_test_9f2c4a1e8b7d6503" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: primeira-cobranca-001" \
  -d '{
    "valor": 100,
    "moeda": "BRL",
    "meio": "pix",
    "descricao": "Teste de integração",
    "referencia_externa": "pedido-0001"
  }'
```

`valor` é **inteiro na menor unidade da moeda**: `100` são R$ 1,00. Não existe
campo decimal em lugar nenhum da API.

</Step>
<Step title="Leia o QR de volta">

A resposta já traz tudo o que o pagador precisa:

```json title="201 Created"
{
  "id": "cob_3nK2xQ",
  "status": "pendente",
  "valor": 100,
  "meio": "pix",
  "referencia_externa": "pedido-0001",
  "expira_em": "2026-08-07T18:40:00Z",
  "pagamento": {
    "pix": {
      "copia_e_cola": "00020126580014BR.GOV.BCB.PIX0136d3f1...5204000053039865802BR",
      "qr_code_url": "https://cdn.trilho.dev/qr/cob_3nK2xQ.png"
    }
  }
}
```

O `copia_e_cola` é o payload EMV. Ele é o dado canônico; a imagem em
`qr_code_url` é conveniência, e você pode gerar a sua a partir da string.

</Step>
<Step title="Simule o pagamento">

Só no sandbox existe o endpoint que finge ser o pagador:

```bash
curl https://api.sandbox.trilho.dev/v1/cobrancas/cob_3nK2xQ/simular-pagamento \
  -X POST \
  -H "Authorization: Bearer tk_test_9f2c4a1e8b7d6503"
```

A cobrança vai para `paga` na hora, e o evento sai da fila em seguida.

</Step>
<Step title="Receba o evento" icon="check">

Aponte um webhook para um endpoint seu em **Desenvolvedores › Webhooks** e o
`cobranca.paga` chega assim:

```json title="POST no seu endpoint"
{
  "id": "evt_9Lm4tZ",
  "tipo": "cobranca.paga",
  "ocorrido_em": "2026-08-07T18:12:04Z",
  "dados": {
    "cobranca": {
      "id": "cob_3nK2xQ",
      "status": "paga",
      "referencia_externa": "pedido-0001"
    }
  }
}
```

Responda `200` em até 10 segundos. Qualquer outra coisa vira retentativa.

</Step>
</Steps>

:::warning[Não confie no corpo antes de verificar a assinatura]

O endpoint de webhook é público, e um `POST` forjado é trivial de montar. Antes
de dar o pedido por pago, confira o HMAC do cabeçalho `X-Trilho-Assinatura`
contra o corpo cru. A receita está em
[Verificar assinatura de webhook](/receitas/verificar-assinatura-de-webhook).

:::

## O que você acabou de exercitar

| Passo | O que ele prova |
| --- | --- |
| 1 | a chave está viva e no ambiente certo |
| 2 | `Idempotency-Key` protege a criação contra retentativa de rede |
| 3 | o objeto `cobranca` carrega o meio de pagamento dentro de si |
| 4 | o sandbox é determinístico — nada depende de terceiro |
| 5 | o evento é o canal de verdade sobre mudança de estado |

:::tip[Repita o passo 2 com a mesma `Idempotency-Key`]

A resposta será idêntica, com o mesmo `cob_3nK2xQ`, e nenhuma segunda cobrança
existirá. É o comportamento mais importante da API e o mais fácil de testar.

:::

## Onde continuar

<CardGroup>
<Card title="Conceitos" icon="shapes" href="/docs/conceitos/mapa-dos-conceitos">
O que acontece entre `criada` e `paga`, e por que idempotência não é opcional.
</Card>
<Card title="Meios de pagamento" icon="wallet" href="/docs/meios-de-pagamento/comparativo">
Pix, boleto e cartão em prazo, custo e reversibilidade.
</Card>
<Card title="Receitas" icon="terminal" href="/receitas/intro">
Problemas fechados, resolvidos com código copiável.
</Card>
<Card title="Referência da API" icon="code-xml" href="/api-reference/introducao/visao-geral">
Todo endpoint, todo parâmetro, toda resposta.
</Card>
</CardGroup>
