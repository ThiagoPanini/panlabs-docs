---
title: Permissões por papel
description: A matriz de quarenta permissões concedidas pelos papéis da casa, com o serviço, a ação, o ambiente e a condição que a limita.
---

# Permissões por papel

<Untranslated />

A matriz é a página. Ela é gerada do repositório de acessos e revisada a cada
trimestre; o que estiver aqui e não estiver no Terraform é erro deste documento,
não do papel.

## Como ler a tabela

**Papel** é o sufixo, sem o prefixo da equipe: `leitura` é
`papel-<equipe>-leitura-<ambiente>`. **Condição** é o que restringe a permissão
além do ambiente — sem condição, ela vale para todo recurso do serviço.

## A matriz

| Papel | Serviço | Ação | Ambiente | Condição |
| --- | --- | --- | --- | --- |
| leitura | s3 | `GetObject` | dev · stg · prd | prefixo da equipe |
| leitura | s3 | `ListBucket` | dev · stg · prd | prefixo da equipe |
| leitura | logs | `FilterLogEvents` | dev · stg · prd | grupo da equipe |
| leitura | logs | `GetLogEvents` | dev · stg · prd | grupo da equipe |
| leitura | cloudwatch | `GetMetricData` | dev · stg · prd | — |
| leitura | ecr | `BatchGetImage` | dev · stg · prd | repositório da equipe |
| leitura | secretsmanager | `ListSecrets` | dev | — |
| leitura | sqs | `GetQueueAttributes` | dev · stg · prd | fila da equipe |
| escrita | s3 | `PutObject` | dev · stg | prefixo da equipe |
| escrita | s3 | `DeleteObject` | dev | prefixo da equipe |
| escrita | sqs | `SendMessage` | dev · stg | fila da equipe |
| escrita | sqs | `ReceiveMessage` | dev · stg | fila da equipe |
| escrita | dynamodb | `PutItem` | dev · stg | tabela da equipe |
| escrita | dynamodb | `UpdateItem` | dev · stg | tabela da equipe |
| escrita | secretsmanager | `GetSecretValue` | dev | segredo da equipe |
| escrita | ecr | `PutImage` | dev | repositório da equipe |
| esteira | ecr | `PutImage` | stg · prd | repositório da equipe |
| esteira | ecr | `InitiateLayerUpload` | stg · prd | repositório da equipe |
| esteira | ecs | `UpdateService` | stg | serviço da equipe |
| esteira | ecs | `UpdateService` | prd | serviço da equipe · aprovação |
| esteira | ecs | `DescribeServices` | stg · prd | serviço da equipe |
| esteira | s3 | `PutObject` | prd | prefixo de artefato |
| esteira | codeartifact | `PublishPackageVersion` | prd | domínio interno |
| esteira | sts | `TagSession` | stg · prd | origem federada |
| infra | s3 | `CreateBucket` | dev · stg | prefixo da equipe |
| infra | s3 | `PutBucketPolicy` | dev · stg | prefixo da equipe |
| infra | kms | `CreateKey` | dev · stg | etiqueta da equipe |
| infra | kms | `ScheduleKeyDeletion` | dev | etiqueta da equipe |
| infra | iam | `CreateRole` | dev · stg | limite de permissão |
| infra | iam | `AttachRolePolicy` | dev · stg | limite de permissão |
| infra | iam | `PassRole` | dev · stg | papéis da equipe |
| infra | dynamodb | `CreateTable` | dev · stg | prefixo da equipe |
| plantao | logs | `StartQuery` | prd | qualquer grupo |
| plantao | ecs | `ExecuteCommand` | prd | 1 h · justificativa |
| plantao | ecs | `StopTask` | prd | serviço da equipe |
| plantao | rds | `DescribeDBInstances` | prd | — |
| plantao | secretsmanager | `GetSecretValue` | prd | 1 h · justificativa |
| auditoria | cloudtrail | `LookupEvents` | prd | somente leitura |
| auditoria | iam | `GetAccountAuthorizationDetails` | prd | somente leitura |
| auditoria | config | `SelectResourceConfig` | prd | somente leitura |

## Notas

**`PassRole` é a linha mais perigosa da tabela.** Quem pode passar um papel a um
serviço pode escalar até esse papel. A condição `papéis da equipe` é o que a
segura, e ela é conferida por política de limite — nunca só pelo nome.

**`plantao` tem prazo, e ele é de uma hora.** Duas linhas exigem justificativa
escrita, que vai para o registro de auditoria junto com a sessão. O papel não é
concedido: ele é assumido sob demanda e expira sozinho.

**`auditoria` é o único papel que atravessa equipes**, e é o único somente
leitura em todas as linhas. Ele não pode ler segredo nem objeto — só metadado de
configuração e de acesso.
