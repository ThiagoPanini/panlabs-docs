---
title: Infraestrutura
description: O que a casa provisiona com Terraform, quem pode aplicar, e onde a fronteira entre módulo e composição fica.
---

# Infraestrutura

<Untranslated />

Tudo o que existe na nuvem foi criado por Terraform, e o estado mora num bucket
por ambiente. Não há recurso criado pelo console — o que é criado à mão some no
próximo `apply`, e some sem aviso.

## A fronteira entre módulo e composição

**Módulo** descreve um recurso e as decisões que já foram tomadas sobre ele.
**Composição** é o arquivo do repositório de cada equipe, que instancia módulos
e não declara `resource` diretamente.

A regra que separa os dois: se a decisão vale para todo mundo, ela mora no
módulo; se ela é do serviço, mora na composição. Um módulo com trinta variáveis
é um módulo que não decidiu nada.

## Quem pode aplicar

| Ambiente | `plan` | `apply` |
| --- | --- | --- |
| `dev` | qualquer pessoa da equipe | qualquer pessoa da equipe |
| `staging` | qualquer pessoa da equipe | esteira, em `main` |
| `prod` | qualquer pessoa da equipe | esteira, com aprovação |

`plan` é livre em todos os três de propósito: ler o que mudaria não muda nada, e
tornar isso difícil é como as pessoas param de olhar antes de aplicar.

## As páginas desta seção

- [O output de um módulo](o-output-de-um-modulo) — como um módulo publica o que
  ele criou, e por que a forma aninhada é a que sobrevive.
- [Criar um bucket versionado](criar-um-bucket-versionado) — o caso mais comum,
  de ponta a ponta.
- [Promover um módulo](promover-um-modulo) — de composição local a módulo
  publicado, sem quebrar quem já copiou.
