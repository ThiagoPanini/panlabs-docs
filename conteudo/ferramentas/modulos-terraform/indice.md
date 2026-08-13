---
title: Módulos Terraform
description: Os dois módulos publicados da casa, o contrato de versão deles, e a regra que decide o que vira módulo.
---

# Módulos Terraform

Dois módulos publicados, versionados com a mesma política dos pacotes Python.
Eles descrevem um recurso e as decisões já tomadas sobre ele — o que é do
serviço mora na composição de quem usa.

## O que existe

| Módulo | Cria | Versão estável desde |
| --- | --- | --- |
| [Módulo de bucket](modulo-de-bucket) | bucket privado, versionado, criptografado | `3.0.0` |
| [Módulo de papel IAM](modulo-de-papel-iam) | papel com limite de permissão | `2.0.0` |

## A regra que decide o que vira módulo

**Três consumidores.** Antes disso, o custo de generalizar é maior que o de
copiar; depois disso, as cópias já divergiram o bastante para que unificá-las
seja migração. O procedimento está em
[Promover um módulo](/procedimentos/infraestrutura/promover-um-modulo).

## Como consumir

Sempre com versão fixada. Módulo sem versão fixada muda debaixo de quem o usa no
dia em que ele publicar.

```hcl
module "relatorios" {
  source  = "panlabs/bucket/aws"
  version = "3.1.0"

  nome      = "relatorios"
  proposito = "saída do job semanal de relatório"
}
```
