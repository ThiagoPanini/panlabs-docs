---
title: Arquivo de movimento
description: O fechamento diário do Trilho — formato, fuso, colunas e o procedimento para quando o saldo do arquivo diverge do saldo da API.
---

# Arquivo de movimento

<Untranslated />

O arquivo de movimento é o fechamento de um dia encerrado. Ele é a **única fonte
de verdade contábil** do Trilho, e não muda depois de emitido — nem quando uma
cobrança daquele dia é estornada uma semana depois.

O conceito e as divergências legítimas estão em
[Conceitos › Conciliação](../conceitos/conciliacao). Esta página é o formato e o
procedimento.

## Quando ele existe

O corte é às **23h59 no fuso de São Paulo**, e o arquivo fica disponível até as
06h00 do dia seguinte. Ele cobre o dia inteiro, incluindo o que aconteceu depois
do corte do dia anterior.

O critério de inclusão é a data do **evento de liquidação**, nunca a da venda.
Uma cobrança em cartão vendida em janeiro e liquidada em fevereiro pertence ao
arquivo de fevereiro.

## Baixar

<Steps>
<Step title="Liste o que existe">

```bash
curl "https://api.trilho.dev/v1/movimentos?de=2026-08-01&ate=2026-08-07" \
  -H "Authorization: Bearer tk_live_..."
```

</Step>
<Step title="Baixe um dia">

```bash
curl https://api.trilho.dev/v1/movimentos/2026-08-07/arquivo \
  -H "Authorization: Bearer tk_live_..." \
  -o movimento-2026-08-07.csv
```

O formato é CSV com cabeçalho, `UTF-8` sem BOM, separador `;` e fim de linha
`\n`. Valores são **inteiros em centavos**, como no resto da API.

</Step>
<Step title="Automatize pelo evento, não pelo relógio" icon="bell">

O evento `movimento.disponivel` chega quando o arquivo está pronto. Um `cron` às
06h00 funciona na maioria dos dias e falha exatamente nos dias de volume alto,
que são os que você mais precisa conferir.

</Step>
</Steps>

## As colunas

| Coluna | O que é |
| --- | --- |
| `data_liquidacao` | o dia do arquivo, sempre igual em todas as linhas |
| `tipo` | `credito`, `debito`, `taxa`, `devolucao`, `estorno`, `antecipacao` |
| `cobranca_id` | o `cob_...` de origem, quando houver |
| `referencia_externa` | o seu identificador, copiado da cobrança |
| `valor_bruto` | o valor da venda, em centavos |
| `taxa` | a tarifa, em centavos, sempre positiva |
| `valor_liquido` | `valor_bruto - taxa`, e é o que entra no saldo |
| `meio` | `pix`, `boleto` ou `cartao` |
| `recebedor_id` | preenchido só em linha de split |

`referencia_externa` é a coluna que amarra o arquivo ao seu sistema. Sem ela, a
conciliação vira casamento por valor e data, que funciona até existirem dois
pedidos do mesmo valor no mesmo dia.

Um dia com uma venda em Pix, uma em cartão antecipada e uma devolução de janeiro
sai assim:

```csv title="movimento-2026-08-07.csv"
data_liquidacao;tipo;cobranca_id;referencia_externa;valor_bruto;taxa;valor_liquido;meio;recebedor_id
2026-08-07;credito;cob_3nK2xQ;pedido-4821;14990;99;14891;pix;
2026-08-07;credito;cob_9Xz4mT;pedido-4822;149900;4886;145014;cartao;
2026-08-07;antecipacao;cob_9Xz4mT;pedido-4822;-2103;0;-2103;cartao;
2026-08-07;devolucao;cob_1Aa2bC;pedido-3190;-5000;0;-5000;pix;
```

Repare que a antecipação é uma **linha própria**, negativa, com o mesmo
`cobranca_id` da venda. Somar `valor_liquido` da coluna inteira dá o número certo;
somar só as linhas de `credito` dá o número que ninguém consegue explicar.

## Quando o saldo diverge

A ordem de investigação abaixo resolve a esmagadora maioria dos casos, e vale
seguir na ordem — cada passo é mais barato que o seguinte.

1. **Some `valor_liquido`, não `valor_bruto`.** A diferença exata igual à soma da
   coluna `taxa` é o erro mais comum, e não é divergência.
2. **Confira o dia.** O saldo da API é posição no instante da leitura; o do
   arquivo é fechamento de um dia encerrado. Uma cobrança liquidada às 00h05 está
   no arquivo de hoje e já aparece na posição de agora.
3. **Procure `tipo = antecipacao`.** Uma venda antecipada muda de data e de
   valor, e aparece em duas linhas.
4. **Procure devolução de período anterior.** Uma venda de janeiro devolvida em
   fevereiro é saída de fevereiro, e o total de janeiro não muda.
5. **Só então abra chamado**, com o `movimento` e a linha divergente.

:::warning[O arquivo não é reemitido]

Um arquivo emitido não muda. Se um ajuste for necessário — o que é raro e sempre
resultado de incidente —, ele aparece como **linha nova no arquivo do dia em que
o ajuste foi feito**, com `tipo: ajuste` e o `cobranca_id` original. Reescrever o
passado tornaria inútil qualquer fechamento já assinado.

:::

## Retenção

Os arquivos ficam disponíveis por **cinco anos** pela API. É o prazo de guarda
usual de comprovante de transação no Brasil, e é deliberado que a nossa retenção
não seja menor que a sua obrigação.

:::note[Baixe antes de encerrar a conta]

O acesso à API cai junto com a conta. Uma migração que encerra o contrato antes
de exportar o histórico transforma uma obrigação de cinco anos num problema sem
solução técnica — ver
[Guias › Migrar de outro provedor](../guias/migrar-de-outro-provedor).

:::
