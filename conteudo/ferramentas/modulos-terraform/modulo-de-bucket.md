---
title: Módulo de bucket
description: O módulo que cria bucket privado, versionado e criptografado — as três variáveis, o output aninhado e o que ele decide por você.
---

# Módulo de bucket

Cria um bucket com o que a casa já decidiu: privado, versionado, criptografado
com KMS e com expiração de versão antiga. Três variáveis, e as duas primeiras
são obrigatórias.

## Antes de começar

Sessão assumida no ambiente alvo e a versão do módulo escolhida. Fixe a versão —
`source` sem `version` resolve para a mais recente a cada `init`.

## Os passos

<Steps>
  <Step title="Declarar">
    ```hcl
    module "relatorios" {
      source  = "panlabs/bucket/aws"
      version = "3.1.0"

      nome      = "relatorios"
      proposito = "saída do job semanal de relatório"
      retencao  = 90
    }
    ```
  </Step>

  <Step title="Planejar">
    Um bucket novo cria entre seis e oito recursos. Número muito diferente disso
    significa que a composição está pegando mais do que você pediu.

    ```bash
    terraform init -upgrade
    terraform plan -out plano.bin
    ```
  </Step>

  <Step title="Aplicar">
    Em `dev`, direto; nos outros dois, pela esteira.

    ```bash
    terraform apply plano.bin
    ```
  </Step>
</Steps>

## Verificação

```bash
panlabs infra conferir bucket relatorios
# nome           relatorios-dev
# acesso         privado (bloqueio de acesso público: 4/4)
# versionamento  habilitado
```

## O que ele decide por você

| Decisão | Valor | Por quê |
| --- | --- | --- |
| Acesso público | bloqueado nas 4 chaves | três de quatro é a forma comum de um bucket "privado" não ser |
| Versionamento | ligado | recuperação de escrita errada não tem substituto |
| Criptografia | KMS | `sse-s3` não permite política por chave |
| Sufixo de ambiente | automático | nome de bucket é imutável, e o erro só aparece depois do `apply` |

O output é um objeto aninhado, e a anatomia dele está em
[O output de um módulo](/procedimentos/infraestrutura/o-output-de-um-modulo).

:::warning
`nome` recebe o sufixo do ambiente sozinho. Escrever `relatorios-dev` produz
`relatorios-dev-dev`, e como nome de bucket é imutável a correção é destruir e
recriar.
:::

:::tip
`retencao = 0` desliga a expiração de versão antiga e precisa de justificativa no
`pull request`. Bucket versionado sem expiração cresce para sempre, e o custo
aparece três trimestres depois.
:::
