---
title: Criar um bucket versionado
description: O caso mais comum de provisionamento, do módulo à primeira escrita, com versionamento e ciclo de vida já decididos.
---

# Criar um bucket versionado

<Untranslated />

Quase todo pedido de armazenamento é o mesmo pedido: um bucket privado, com
versionamento, criptografado, com expiração de versão antiga. O módulo já decide
tudo isso: o que a composição precisa dizer é o nome e para que serve.

## Antes de começar

Sessão em `dev` assumida e o repositório de infraestrutura da equipe clonado.
Ver [Preparar a máquina local](/procedimentos/ambiente/preparar-a-maquina-local).

## Os passos

<Steps>
  <Step title="Declarar o módulo">
    Três variáveis, e a versão fixada. Módulo sem versão fixada muda debaixo de
    você no dia em que o módulo publicar.

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

  <Step title="Ver o plano">
    `plan` é livre nos três ambientes. Leia a contagem antes de qualquer coisa:
    um bucket novo cria entre seis e oito recursos, e um número muito diferente
    disso significa que a composição está pegando mais do que você pediu.

    ```bash
    terraform plan -out plano.bin
    ```
  </Step>

  <Step title="Aplicar">
    Em `dev`, direto. Em `staging` e `prod`, pela esteira: o `apply` local é
    recusado pelo papel.

    ```bash
    terraform apply plano.bin
    ```
  </Step>
</Steps>

## Verificação

O bucket existe, está privado, e o versionamento está ligado. Os três em um
comando:

```bash
panlabs infra conferir bucket relatorios
# nome           relatorios-dev
# acesso         privado (bloqueio de acesso público: 4/4)
# versionamento  habilitado
# criptografia   kms · chave gerenciada pelo módulo
# ciclo de vida  versão antiga expira em 90 dias
```

:::tip
`bloqueio de acesso público: 4/4` é a linha que vale conferir. As quatro
configurações são independentes, e três de quatro é a forma mais comum de um
bucket "privado" não ser.
:::

## Variações

**Chave própria.** Passe `chave_arn` e o módulo para de criar a chave; o output
passa a dizer `gerenciada_por = "equipe"`, e apagar o bucket deixa de apagar a
chave.

**Sem expiração.** `retencao = 0` desliga a regra de ciclo de vida. Precisa de
justificativa no `pull request`, porque bucket versionado sem expiração cresce
para sempre e o custo aparece três trimestres depois.

:::warning
`nome` recebe o sufixo do ambiente automaticamente. Escrever `relatorios-dev`
produz `relatorios-dev-dev`, e o erro só aparece depois do `apply`, porque nome
de bucket é imutável.
:::
