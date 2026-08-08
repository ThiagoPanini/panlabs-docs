---
title: Pix
description: Como o Pix funciona no Trilho — QR estático, QR dinâmico, prazo de expiração e o que acontece quando o pagador some.
---

# Pix

<Untranslated />

Pix é o meio mais barato e o mais rápido do Trilho, e o único em que o dinheiro
está disponível segundos depois do pagamento. Ele também é o único **irreversível
pelo pagador**: não existe *chargeback* de Pix, e o dinheiro só volta por decisão
sua.

Esta página cobre o Pix como meio de pagamento. Para o passo a passo de
integração, veja [Guias › Aceitar Pix com QR dinâmico](../guias/aceitar-pix-com-qr-dinamico).

## Os dois tipos de QR

| | Estático | Dinâmico |
| --- | --- | --- |
| Valor | livre, o pagador digita | fixo, embutido no código |
| Vence | não | sim, `expira_em` |
| Identifica o pedido | não | sim, por `referencia_externa` |
| Reusável | sim, para sempre | não, uma cobrança por QR |
| Onde serve | doação, gorjeta, balcão | e-commerce, fatura, assinatura |

O Trilho emite **QR dinâmico por padrão**, e é o que a criação de cobrança
devolve. O estático existe como recurso da conta, não da cobrança, e vive em
**Recebimentos › Chaves** no painel.

A escolha quase nunca é dúvida: se você precisa saber qual pedido foi pago, é
dinâmico. Um QR estático pago por dois clientes com o mesmo valor no mesmo minuto
é indistinguível, e nenhuma conciliação resolve isso depois.

## Criar uma cobrança Pix

<Steps>
<Step title="Poste a cobrança com `meio: pix`">

```bash
curl https://api.trilho.dev/v1/cobrancas \
  -H "Authorization: Bearer tk_live_..." \
  -H "Idempotency-Key: pedido-4821" \
  -H "Content-Type: application/json" \
  -d '{
    "valor": 14990,
    "moeda": "BRL",
    "meio": "pix",
    "referencia_externa": "pedido-4821",
    "expira_em": "2026-08-07T19:10:00Z"
  }'
```

</Step>
<Step title="Entregue o `copia_e_cola` ao pagador">

```json title="201 Created"
{
  "id": "cob_3nK2xQ",
  "status": "pendente",
  "pagamento": {
    "pix": {
      "copia_e_cola": "00020126580014BR.GOV.BCB.PIX0136d3f1...5204000053039865802BR",
      "qr_code_url": "https://cdn.trilho.dev/qr/cob_3nK2xQ.png",
      "chave": "pix@lojaexemplo.com.br"
    }
  }
}
```

O `copia_e_cola` é o payload EMV e é o dado canônico. A imagem é conveniência —
você pode gerar a sua a partir da string, e deve, se o seu app é nativo.

</Step>
<Step title="Espere o evento `cobranca.paga`" icon="bell">

Não faça *polling*. Uma cobrança Pix pode ficar meia hora `pendente`, e consultar
a API a cada segundo durante trinta minutos gasta o seu limite de taxa para
descobrir o que o webhook te contaria de graça.

</Step>
</Steps>

## Expiração, e o pagador que some

O default é **30 minutos**, configurável de 1 minuto a 30 dias. Passado o prazo,
a cobrança vai para `expirada` sozinha e o QR deixa de ser pago.

:::warning[Um Pix pago depois do prazo é devolvido automaticamente]

Existe uma janela de poucos segundos entre a expiração e a propagação dela na
rede. Um pagamento que caia nessa janela é aceito pelo banco e **devolvido pelo
Trilho em até 24 horas**, com um evento `cobranca.pagamento_devolvido`. Se o seu
sistema deu o pedido por pago com base em algo que não o evento, é aqui que a
divergência aparece.

:::

Prazo curto reduz essa janela e aumenta o abandono. Trinta minutos é o ponto em
que a maioria das operações de e-commerce fica; assinatura e fatura costumam usar
dias.

:::note[Expirada não reabre]

Para cobrar de novo, crie outra cobrança com a **mesma** `referencia_externa`.
É ela que amarra as duas tentativas no seu extrato. Ver
[Conceitos › Ciclo de vida](../conceitos/ciclo-de-vida).

:::

## Devolver

Estorno de Pix é **devolução**, e ela tem regras próprias — prazo de 90 dias,
possibilidade de valor parcial e um motivo obrigatório. O detalhe está em
[Pix — devolução](pix-devolucao).

## Limites que não são seus

O valor máximo de um Pix não é definido pelo Trilho: é o limite **do pagador**,
no banco dele, e ele muda entre o dia e a noite. Uma cobrança de valor alto pode
ser recusada com `limite_diario_excedido` sem que nada do seu lado esteja errado
— e a orientação certa ao pagador não é *tente de novo*, é *tente amanhã ou peça
aumento de limite ao seu banco*.
