---
title: Índice de sintomas
description: A tabela que leva do que você está vendo à causa provável, com uma seção por sintoma e o comando que confirma cada um.
---

# Índice de sintomas

<Untranslated />

Comece pelo que você está vendo, não pelo que você acha que aconteceu. A tabela
leva do sintoma à seção; cada seção diz como confirmar a causa antes de agir,
porque quase todo sintoma desta lista tem mais de uma causa possível.

## A tabela

| Sintoma | Onde aparece | Causa mais comum | Seção |
| --- | --- | --- | --- |
| `403` em toda chamada | terminal | sessão expirada | [Sessão expirada](#sessao-expirada) |
| `403` só em escrita | terminal | papel de leitura | [Papel errado](#papel-errado) |
| Esteira reprova só no runner | GitHub Actions | variável ausente | [Só no runner](#so-no-runner) |
| Deploy sobe e volta | ECS | falha no health check | [Sobe e volta](#sobe-e-volta) |
| Fila crescendo | CloudWatch | consumidor parado | [Fila crescendo](#fila-crescendo) |
| Latência dobrou sem deploy | painel | vizinho ruidoso | [Latência sem deploy](#latencia-sem-deploy) |
| `422` de validação | terminal | contrato mudou | [Validação recusa](#validacao-recusa) |

## Sessão expirada {#sessao-expirada}

O sintoma engana porque o erro fala de permissão e não de expiração. Confirme
antes de pedir acesso a alguém:

```bash
aws sts get-caller-identity
# An error occurred (ExpiredToken): é isto, e não falta de permissão
```

A correção é `panlabs assumir <papel>`. Se ela reaparece em minutos, o ambiente
é `prod` e a sessão dura uma hora por decisão.

## Papel errado {#papel-errado}

Leitura funcionando e escrita falhando é quase sempre o papel de leitura ativo,
não uma permissão faltando no papel de escrita.

```bash
aws sts get-caller-identity --query Arn --output text
# …assumed-role/papel-<equipe>-leitura-dev/… (o papel é o de leitura)
```

## Só no runner {#so-no-runner}

Reproduza localmente antes de investigar o log. Ver
[Rodar a esteira localmente](/procedimentos/esteiras/rodar-a-esteira-localmente).
Quando `make ambiente` local e o do runner concordam, a diferença é de estado:
cache ou arquivo não versionado.

## Sobe e volta {#sobe-e-volta}

A tarefa inicia, o health check falha, o orquestrador a substitui, e o ciclo
repete. O log da aplicação costuma estar vazio porque ela nem chegou a subir.

```bash
aws ecs describe-services --cluster prd --services catalogo \
  --query 'services[0].events[:3].message' --output text
```

## Fila crescendo {#fila-crescendo}

Duas causas com correções opostas: consumidor parado (reiniciar) ou consumidor
lento (escalar). O número que separa as duas é a idade da mensagem mais antiga.

```bash
aws sqs get-queue-attributes --queue-url "$FILA" \
  --attribute-names ApproximateNumberOfMessages ApproximateAgeOfOldestMessage
```

Idade crescendo com consumidor ativo é lentidão; idade crescendo com zero
recebimentos é consumidor parado.

## Latência sem deploy {#latencia-sem-deploy}

Antes de procurar no seu serviço, confira se a dependência mudou. A ordem certa
é de fora para dentro, e ela está descrita em
[Monitoramento e alertas](monitoramento-e-alertas).

## Validação recusa {#validacao-recusa}

O corpo do `422` nomeia o campo e a versão de contrato que passou a exigi-lo.
Se ele não nomeia, o serviço está numa versão anterior à correção descrita em
[O schema que mudou sem aviso](/jornadas/api-owner/o-schema-que-mudou-sem-aviso).
