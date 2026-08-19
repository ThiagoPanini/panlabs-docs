---
title: Comparativo dev/staging/prod
description: As vinte e quatro diferenças entre os três ambientes, na ordem em que elas costumam surpreender.
---

# Comparativo dev/staging/prod

<Untranslated />

A tabela é a página. Ela está ordenada por quando a diferença costuma aparecer:
as primeiras linhas mordem no primeiro dia, as últimas só num incidente.

## Como ler

Cada linha é uma dimensão em que os três ambientes divergem. Onde a célula diz
`igual a prod`, a divergência é deliberada e o valor é o mesmo: está escrito
para que ninguém precise conferir.

## A tabela

| Dimensão | dev | staging | prod |
| --- | --- | --- | --- |
| Papel IAM | `papel-<equipe>-dev` | `papel-<equipe>-stg` | `papel-<equipe>-prd` |
| Duração da sessão | 12 h | 4 h | 1 h |
| MFA para assumir | não | sim | sim |
| Região | `us-east-1` | `us-east-1` | `us-east-1` |
| Segunda região | não | não | `sa-east-1` |
| Aprovação de deploy | nenhuma | nenhuma | uma pessoa |
| Janela de deploy | livre | livre | 09h–17h dias úteis |
| Origem da imagem | registro local | registro interno | registro interno |
| Tag de imagem | `dev-<sha>` | `<sha>` | `<sha>` |
| Rollback | recriar | automático | automático |
| Réplicas | 1 | 2 | 6 |
| Autoescala | não | sim | sim |
| Banco | container local | instância compartilhada | instância dedicada |
| Retenção de backup | nenhuma | 3 dias | 35 dias |
| Dados | sintéticos | sintéticos | reais |
| Retenção de log | 1 dia | 7 dias | 90 dias |
| Nível de log | `DEBUG` | `INFO` | `INFO` |
| Rastreamento | desligado | amostrado 10% | amostrado 10% |
| Alerta em página | não | não | sim |
| Limite de taxa | desligado | igual a prod | 600 rpm |
| Segredos | arquivo `.env` | gerenciador | gerenciador |
| Rotação de segredo | não | 90 dias | 30 dias |
| Certificado | autoassinado | interno | interno |
| Custo alocado | não | por equipe | por equipe |

## O que mais surpreende

**A duração da sessão em `prod` é de uma hora**, e ela expira no meio de um
procedimento longo. Não é descuido: um procedimento que não cabe em uma hora
precisa ser automatizado, não precisa de sessão mais longa.

**`staging` tem o mesmo limite de taxa de `prod`.** É a única dimensão em que
`staging` não é mais permissivo, e existe para que um teste de carga encontre o
limite antes de o cliente encontrar.

**`dev` guarda segredo em arquivo.** É o único ambiente onde isso é aceito, e a
razão de ele existir é que o gerenciador cobra por segredo e por chamada.
