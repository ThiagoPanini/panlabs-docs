---
title: Pix — QR dinâmico
description: A anatomia do QR dinâmico, o payload EMV que o Trilho devolve e os campos que você não deve reconstruir por conta própria.
---

# Pix — QR dinâmico

<Untranslated />

O QR dinâmico é o formato padrão do Trilho: valor fixo, prazo de validade e uma
identificação que amarra o pagamento ao seu pedido. Ele é uma string, e a imagem
é um detalhe de apresentação.

## O payload é a verdade

O que o Trilho devolve em `copia_e_cola` é um payload **EMV® QRCPS-MPM**, o
formato que o Banco Central padronizou. Ele carrega, dentro de si, tudo o que o
app do pagador precisa:

```text title="copia_e_cola, quebrado por campo"
00 02 01                              formato do payload
01 02 12                              uso único (12) — não reutilizável
26 58 0014BR.GOV.BCB.PIX0136d3f1...   a chave e o identificador do documento
52 04 0000                            categoria do estabelecimento
53 03 986                             moeda: 986 = BRL
54 05 149.90                          valor
58 02 BR                              país
59 13 LOJAEXEMPLO                     nome do recebedor
60 08 SAOPAULO                        cidade
62 12 0508cob3nK2                     identificador da transação
63 04 A1B2                            CRC16 do payload inteiro
```

O último campo é um checksum, e é ele que torna a string frágil da forma certa:
**qualquer alteração invalida o QR**. Não há como mudar o valor de um QR emitido,
nem por engano nem de propósito.

:::warning[Não monte o payload você mesmo]

A tentação aparece quando alguém quer trocar o nome do recebedor ou arredondar o
valor na hora de exibir. Remontar a string exige recalcular o CRC16, e uma
implementação quase certa produz QR que alguns apps leem e outros não — um bug
que se manifesta como *"não funciona no banco X"* e leva semanas para ser
diagnosticado.

:::

## O que você recebe, campo a campo

<ResponseField name="copia_e_cola" type="string">
O payload EMV completo. É este o dado que vai para o botão *copiar*, e é a partir
dele que você gera a sua própria imagem se precisar.
</ResponseField>

<ResponseField name="qr_code_url" type="string">
Uma PNG de 512×512 hospedada por nós, com validade igual à da cobrança. Serve
para e-mail e para protótipo; num app nativo, gere a imagem localmente.
</ResponseField>

<ResponseField name="chave" type="string">
A chave Pix da sua conta que aparecerá para o pagador. Definida em
**Recebimentos › Chaves**, não na cobrança.
</ResponseField>

<ResponseField name="txid" type="string">
O identificador da transação no arranjo Pix, de 26 a 35 caracteres. É o que o
extrato do banco do pagador mostra, e é o que o suporte dele vai pedir.
</ResponseField>

## Gerar a imagem do seu lado

Qualquer biblioteca de QR serve, porque o conteúdo é texto puro. Duas
recomendações que evitam retrabalho:

<CodeGroup groupId="code-lang" queryString="lang">

```js title="Node"
import QRCode from 'qrcode';

// Nível de correção M e margem de 4 módulos: é o que a especificação do
// Banco Central assume, e é o que os leitores de app esperam.
const png = await QRCode.toBuffer(cobranca.pagamento.pix.copia_e_cola, {
  errorCorrectionLevel: 'M',
  margin: 4,
  width: 512,
});
```

```python title="Python"
import qrcode

# Nível de correção M e borda de 4 módulos: é o que a especificação do
# Banco Central assume, e é o que os leitores de app esperam.
img = qrcode.make(
    cobranca["pagamento"]["pix"]["copia_e_cola"],
    error_correction=qrcode.constants.ERROR_CORRECT_M,
    border=4,
)
img.save("cobranca.png")
```

</CodeGroup>

Nível de correção mais alto que `M` engorda o código sem ganho — o QR de Pix é
lido de perto, numa tela limpa, e não numa etiqueta rasgada.

## Erros específicos deste formato

| `codigo` | O que aconteceu |
| --- | --- |
| `chave_pix_nao_cadastrada` | a conta não tem chave em **Recebimentos › Chaves** |
| `valor_abaixo_do_minimo` | menos de R$ 0,01 |
| `expira_em_no_passado` | o prazo enviado já passou no relógio do Trilho |
| `expira_em_alem_do_teto` | mais de 30 dias |

:::note[O relógio é o nosso]

`expira_em` é interpretado em UTC e comparado com o relógio do Trilho, não com o
do seu servidor. Uma máquina com relógio adiantado em poucos minutos produz
`expira_em_no_passado` para uma cobrança que parece perfeitamente válida do lado
de quem a enviou.

:::
