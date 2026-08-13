---
title: O output de um módulo
description: Por que o output de um módulo é um objeto aninhado e não uma lista de valores soltos, e até onde o aninhamento vai.
---

# O output de um módulo

<Untranslated />

Um módulo publica o que criou por meio de `output`, e a forma desse output é a
decisão mais duradoura do módulo inteiro: ela é o contrato com toda composição
que o usa, e mudá-la depois custa um `apply` em cada consumidor. A escolha entre
publicar valores soltos e publicar um objeto parece estética na primeira semana
e deixa de ser na primeira mudança.

## Por que objeto e não valores soltos

Um módulo que publica `bucket_nome`, `bucket_arn`, `bucket_regiao` e
`bucket_kms_arn` obriga cada consumidor a saber os quatro nomes. Acrescentar um
quinto é aditivo, mas renomear qualquer um é quebra — e a chance de renomear
cresce com o número de nomes no escopo raiz.

Um objeto único move o vocabulário para dentro de uma chave, e o consumidor
passa a depender de um nome só.

| Forma | Nomes no escopo raiz | Acrescentar campo | Renomear campo |
| --- | ---: | --- | --- |
| valores soltos | um por campo | aditivo | quebra |
| objeto raso | 1 | aditivo | quebra |
| **objeto aninhado** | **1** | **aditivo** | **quebra, e localizada** |

## A anatomia, quatro níveis

Este é o output do módulo de bucket, e ele é o aninhamento mais profundo que a
casa usa. Quatro níveis é o teto: o quinto não apareceu em nenhum módulo, e um
teto declarado é o que impede o output de virar um mapa do provedor inteiro.

<ResponseField name="bucket" type="object">
  Tudo o que o módulo criou, sob uma chave só.

  <Expandable title="campos">
    <ResponseField name="nome" type="string">
      O nome final, já com o sufixo de ambiente aplicado.
    </ResponseField>

    <ResponseField name="arn" type="string">
      O identificador global, para uso em política.
    </ResponseField>

    <ResponseField name="criptografia" type="object">
      A chave e o modo. Sempre presente — o módulo não cria bucket sem
      criptografia.

      <Expandable title="campos">
        <ResponseField name="modo" type="string" default="kms">
          `kms` ou `sse-s3`. O módulo recusa `nenhuma`.
        </ResponseField>

        <ResponseField name="chave" type="object">
          A chave usada, e de onde ela veio.

          <Expandable title="campos">
            <ResponseField name="arn" type="string">
              O identificador da chave.
            </ResponseField>

            <ResponseField name="gerenciada_por" type="string">
              `modulo` quando o módulo a criou, `equipe` quando ela foi passada
              por variável. É este campo que diz quem apaga a chave no dia em
              que o bucket for destruído.
            </ResponseField>
          </Expandable>
        </ResponseField>
      </Expandable>
    </ResponseField>
  </Expandable>
</ResponseField>

## Como ele é declarado

```hcl
output "bucket" {
  description = "O bucket criado e as decisões aplicadas a ele."
  value = {
    nome = aws_s3_bucket.este.bucket
    arn  = aws_s3_bucket.este.arn
    criptografia = {
      modo = var.modo_de_criptografia
      chave = {
        arn            = local.chave_arn
        gerenciada_por = var.chave_arn == null ? "modulo" : "equipe"
      }
    }
  }
}
```

## Como ele é consumido

```hcl
module "relatorios" {
  source = "panlabs/bucket/aws"
  version = "3.1.0"
  nome   = "relatorios"
}

resource "aws_iam_role_policy" "leitura" {
  role   = aws_iam_role.servico.id
  policy = data.aws_iam_policy_document.leitura.json
}

data "aws_iam_policy_document" "leitura" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${module.relatorios.bucket.arn}/*"]
  }
  statement {
    actions   = ["kms:Decrypt"]
    resources = [module.relatorios.bucket.criptografia.chave.arn]
  }
}
```

:::warning
`module.relatorios.bucket.criptografia.chave.arn` é o caminho mais longo que
existe na casa, e ele é o teto por decisão, não por acaso. Um quinto nível
significaria que o módulo está publicando estrutura do provedor em vez de
publicar as decisões dele.
:::
