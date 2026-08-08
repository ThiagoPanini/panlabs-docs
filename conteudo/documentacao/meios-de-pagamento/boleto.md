---
title: Boleto
description: Emissão, vencimento, compensação em dias úteis e o que fazer com o boleto que o pagador imprimiu e nunca pagou.
---

# Boleto

<Untranslated />

Boleto é o meio mais lento e o mais previsível do Trilho. Ele não pede que o
pagador tenha app, conta digital ou cartão — e é por isso que continua vivo num
país onde o Pix resolveu quase tudo.

Ele também é o único meio em que **o pagador escolhe quando pagar**, dentro de um
prazo que você define. Isso muda o desenho do produto: um pedido com boleto fica
dias em aberto, e o seu estoque precisa saber disso.

## Prazos, que são o assunto inteiro

| Marco | Quando | O que acontece |
| --- | --- | --- |
| Emissão | imediata | a cobrança vai para `pendente` |
| Vencimento | você define, mínimo D+1 | depois disso o boleto ainda pode ser pago com juros, se você permitir |
| Compensação | 1 a 3 dias úteis após o pagamento | a cobrança vai para `paga` |
| Liquidação | D+1 após a compensação | o dinheiro entra no saldo |
| Expiração | vencimento + 3 dias úteis, por padrão | a cobrança vai para `expirada` |

Entre o pagador pagar e você saber há **dias úteis**, não horas. Um boleto pago
na sexta à noite compensa na terça. Nenhum ajuste do seu lado encurta isso: a
janela é da rede bancária.

## Emitir

<Steps>
<Step title="Poste a cobrança com `meio: boleto`">

```bash
curl https://api.trilho.dev/v1/cobrancas \
  -H "Authorization: Bearer tk_live_..." \
  -H "Idempotency-Key: pedido-4821" \
  -H "Content-Type: application/json" \
  -d '{
    "valor": 14990,
    "moeda": "BRL",
    "meio": "boleto",
    "referencia_externa": "pedido-4821",
    "pagamento": {
      "boleto": {
        "vence_em": "2026-08-14",
        "instrucoes": "Não receber após 5 dias do vencimento."
      }
    },
    "cliente": {
      "nome": "Maria Souza",
      "documento": "12345678909"
    }
  }'
```

`cliente.documento` é **obrigatório** em boleto — CPF ou CNPJ, só dígitos. É
exigência do arranjo, não nossa: o documento do sacado é impresso no papel.

</Step>
<Step title="Entregue a linha digitável e o PDF">

```json title="201 Created"
{
  "id": "cob_5Wq7bN",
  "status": "pendente",
  "pagamento": {
    "boleto": {
      "linha_digitavel": "34191.79001 01043.510047 91020.150008 5 98420000149900",
      "codigo_de_barras": "34195984200001499001790001010435100479102015000",
      "vence_em": "2026-08-14",
      "pdf_url": "https://cdn.trilho.dev/boleto/cob_5Wq7bN.pdf",
      "nosso_numero": "00010435100"
    }
  }
}
```

A linha digitável é o dado canônico — é ela que o pagador digita no app do banco.
O PDF é conveniência, e a maioria dos pagadores nunca o abre.

</Step>
<Step title="Espere `cobranca.paga`, dias depois" icon="clock">

Não há sinal intermediário. Entre `pendente` e `paga` não existe *"o pagador
imprimiu"* nem *"o pagador pagou e ainda não compensou"* — a rede não expõe essa
informação, e inventá-la seria mentir.

</Step>
</Steps>

:::warning[Boleto vencido ainda pode ser pago]

Por padrão o Trilho aceita pagamento até 3 dias úteis após o vencimento, sem
juros. É o comportamento que menos gera atrito de suporte. Se a sua operação
precisa de corte duro na data, mande `aceita_apos_vencimento: false` e o boleto
deixa de ser pagável às 23h59 do dia do vencimento.

:::

## Alterar não existe; cancelar existe

Não se muda o valor, o vencimento nem o sacado de um boleto emitido — a linha
digitável codifica os três, e alterá-los produziria um documento diferente com o
mesmo `id`.

Cancelar é `DELETE /cobrancas/cob_5Wq7bN`, e ele funciona enquanto a cobrança
estiver `pendente`. Depois disso, o caminho é devolver.

:::note[O boleto cancelado que o pagador já imprimiu]

Cancelar registra a baixa na rede, mas o papel na mesa do pagador continua
existindo. Bancos costumam recusar o pagamento de um boleto baixado; alguns
aceitam por até 24 horas. Se um pagamento assim chegar, ele vira uma cobrança
`paga` normal, e o evento chega como sempre — trate-o.

:::

## Juros e multa

São opcionais e ficam no objeto de criação:

```json title="Trecho de pagamento.boleto"
{
  "vence_em": "2026-08-14",
  "multa_percentual": 200,
  "juros_mensais_percentual": 100
}
```

Percentuais são **inteiros em centésimos de ponto**, pela mesma razão pela qual
valores são inteiros em centavos: `200` são 2,00% e `100` são 1,00% ao mês. Não
existe campo decimal em lugar nenhum da API, e um ponto flutuante escondido numa
taxa de juros é o tipo de erro que aparece meses depois, arredondado.
