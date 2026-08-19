---
title: Módulo de papel IAM
description: O módulo que cria papel com limite de permissão aplicado, e por que ele recusa política inline.
---

# Módulo de papel IAM

Cria um papel com o limite de permissão da casa já aplicado. O limite é o que
impede um papel de conceder mais do que quem o criou possui, e ele é aplicado
pelo módulo justamente para não depender de alguém lembrar.

## Antes de começar

O papel precisa de um serviço ou de uma identidade federada que possa assumi-lo.
Papel sem quem o assuma é recurso morto que aparece em toda auditoria.

## Os passos

<Steps>
  <Step title="Declarar quem assume">
    `assumido_por` aceita serviço da AWS ou repositório do GitHub. As duas
    formas produzem políticas de confiança diferentes, e o módulo escolhe.

    ```hcl
    module "papel_publicacao" {
      source  = "panlabs/papel-iam/aws"
      version = "2.1.0"

      nome         = "publicacao"
      assumido_por = { repositorio = "panlabs-tech/catalogo", branch = "main" }
    }
    ```
  </Step>

  <Step title="Anexar políticas gerenciadas">
    Só ARN de política existente. Política inline é recusada: ver abaixo.

    ```hcl
      politicas = [
        aws_iam_policy.publicar_pacote.arn,
        aws_iam_policy.empurrar_imagem.arn,
      ]
    ```
  </Step>

  <Step title="Aplicar e conferir a confiança">
    ```bash
    terraform apply
    aws iam get-role --role-name papel-catalogo-publicacao \
      --query 'Role.AssumeRolePolicyDocument'
    ```
  </Step>
</Steps>

## Verificação

O papel existe, tem o limite anexado, e a política de confiança nomeia o
repositório e a branch, nunca `*`:

```bash
panlabs infra conferir papel publicacao
# limite         panlabs-limite-equipe  ✓
# confiança      repo:panlabs-tech/catalogo:ref:refs/heads/main
# políticas      2 gerenciadas · 0 inline
```

## Por que política inline é recusada

Política inline vive dentro do papel e não tem nome próprio, então ela não
aparece em busca por política, não pode ser reusada e não pode ser revisada
isoladamente. Numa auditoria, ela é o que ninguém encontra.

| Forma | Aparece em busca | Reusável | Revisável isolada |
| --- | --- | --- | --- |
| gerenciada | sim | sim | sim |
| inline | não | não | não |

:::warning
`branch` no `assumido_por` não é opcional para repositório. Sem ele, a política
de confiança aceita qualquer referência do repositório, inclusive um `pull
request` de fora, que é o caminho conhecido para roubar o papel de publicação.
:::

:::tip
Para um papel que precisa ser assumido por várias branches, passe uma lista. O
módulo emite uma condição por entrada em vez de um curinga, e a diferença
aparece na auditoria.
:::
