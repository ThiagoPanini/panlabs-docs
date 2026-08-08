---
title: Cartão
description: Tokenização, autorização e captura, o objeto de verificações em quatro níveis e o chargeback que chega dezoito meses depois.
---

# Cartão

<Untranslated />

Cartão é o meio mais caro do Trilho, o mais lento a liquidar e o único
**reversível pelo pagador**. Em troca, é o único que parcela, o único que
funciona sem o pagador estar presente e o único em que uma assinatura se cobra
sozinha por anos.

O número do cartão nunca chega ao seu servidor. O que chega é um token, e é
sobre ele que tudo acontece.

## Tokenizar, autorizar, capturar

São três momentos, e confundi-los é a causa de metade dos problemas de
integração com cartão.

| Momento | Quem faz | O que acontece com o dinheiro |
| --- | --- | --- |
| Tokenização | o navegador do pagador, com `tk_pub_` | nada |
| Autorização | o seu servidor, com `tk_live_` | é **reservado** no limite do pagador |
| Captura | o seu servidor, ou automática | é **cobrado** de fato |

Autorização sem captura reserva o valor e expira em 7 dias, devolvendo o limite.
É o modelo certo para quem só cobra ao despachar.

<Steps>
<Step title="Tokenize no navegador">

```js
const trilho = Trilho('tk_pub_31d7b0a5c9e24f68');

const token = await trilho.tokenizarCartao({
  numero: '4242424242424242',
  validade: '12/2030',
  cvv: '123',
  titular: 'MARIA SOUZA',
});
// token.id -> "cart_8Nq2v..." — é isto que vai para o seu servidor
```

</Step>
<Step title="Autorize no servidor">

```bash
curl https://api.trilho.dev/v1/cobrancas \
  -H "Authorization: Bearer tk_live_..." \
  -H "Idempotency-Key: pedido-4821" \
  -H "Content-Type: application/json" \
  -d '{
    "valor": 14990,
    "meio": "cartao",
    "capturar": false,
    "referencia_externa": "pedido-4821",
    "pagamento": {
      "cartao": {"token": "cart_8Nq2vB", "parcelas": 3}
    }
  }'
```

</Step>
<Step title="Capture quando despachar" icon="check">

```bash
curl https://api.trilho.dev/v1/cobrancas/cob_9Xz4mT/capturar \
  -X POST \
  -H "Authorization: Bearer tk_live_..." \
  -d '{"valor": 14990}'
```

Capturar menos que o autorizado é permitido e libera a diferença. Capturar mais
não é.

</Step>
</Steps>

:::warning[A autorização expira em 7 dias]

Passado o prazo sem captura, a reserva cai e a cobrança vai para `expirada`. Não
há aviso na véspera e não há renovação: quem precisa de janela maior autoriza de
novo, com um novo token — e o pagador pode não estar mais lá.

:::

## O objeto de verificações

O resultado da autorização traz o que o emissor conferiu, e ele é o objeto mais
aninhado da API: `cobranca.pagamento.cartao.verificacoes`. Quatro níveis, e cada
um existe porque o de cima não comporta a informação.

<ResponseField name="pagamento" type="object">
Os dados do meio escolhido. A chave interna é o nome do meio.

<Expandable title="objeto pagamento" defaultOpen>

<ResponseField name="cartao" type="object">
O que sobrou do cartão depois da tokenização, mais o desfecho da autorização.

<Expandable title="objeto cartao">

<ResponseField name="bandeira" type="string">
Uma de `visa`, `mastercard`, `elo`, `amex` ou `hipercard`.
</ResponseField>

<ResponseField name="ultimos_quatro" type="string">
Os quatro últimos dígitos. É tudo o que se pode exibir ao pagador.
</ResponseField>

<ResponseField name="parcelas" type="integer">
De 1 a 12. Parcelamento é do emissor, e o valor de cada parcela é arredondado
por ele — a soma pode diferir do total em centavos.
</ResponseField>

<ResponseField name="verificacoes" type="object">
O que o emissor conferiu, e o que ele respondeu para cada item. **É o quarto
nível, e é o teto do sistema.**

<Expandable title="objeto verificacoes">

<ResponseField name="cvv" type="string">
Um de `conferido`, `nao_conferido` ou `nao_enviado`. `nao_conferido` com
autorização aprovada acontece, e é decisão de risco sua aceitar ou não.
</ResponseField>

<ResponseField name="endereco" type="string">
Um de `conferido`, `parcial`, `divergente` ou `nao_enviado`. `parcial` costuma
ser CEP certo e número errado.
</ResponseField>

<ResponseField name="autenticacao_3ds" type="string">
Um de `autenticado`, `tentado`, `nao_autenticado` ou `nao_aplicavel`. Só
`autenticado` transfere a responsabilidade do *chargeback* para o emissor.
</ResponseField>

</Expandable>
</ResponseField>

</Expandable>
</ResponseField>

</Expandable>
</ResponseField>

:::note[Quatro níveis é o teto, e ele é duro]

Um quinto nível reprova na validação do contrato antes de virar página ilegível.
Quando um objeto precisa de mais profundidade que isso, ele vira recurso próprio
com `id` próprio — que é o que aconteceu com estorno e com devolução.

:::

## Chargeback

O pagador tem **até 540 dias** para contestar uma compra com o emissor dele. O
Trilho não decide a disputa; ele te avisa e te dá prazo para responder.

| Evento | Quando | O que fazer |
| --- | --- | --- |
| `chargeback.aberto` | o emissor contestou | o valor sai do seu saldo **na hora** |
| `chargeback.contestado` | você enviou defesa | esperar |
| `chargeback.resolvido` | o emissor decidiu | ler `resultado` |

O prazo de defesa é de 7 dias corridos a partir do `chargeback.aberto`, e ele não
se estende. Uma integração que não escuta esse evento perde por revelia — o
dinheiro sai, ninguém responde, e o caso fecha contra você.

Autenticação 3-D Secure é o que muda essa conta: com `autenticacao_3ds:
"autenticado"`, um chargeback por *não reconheço a compra* é responsabilidade do
emissor e sequer chega até você. O caminho está em
[Guias › Cobrar cartão com autenticação](../guias/cobrar-cartao-com-autenticacao).

## Recusa não é erro

Uma autorização recusada devolve `201`, não `4xx`. A requisição estava certa e o
sistema financeiro respondeu *não*. O catálogo completo, com o que reapresentar e
quando, está em [Operação › Códigos de recusa](../operacao/codigos-de-recusa).
