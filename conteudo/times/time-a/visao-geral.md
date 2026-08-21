---
title: Visão geral
slug: /
description: O time Plataforma de Pagamentos, o que ele sustenta e como encontrar quem está de plantão.
---

# Visão geral

<Untranslated />

O Plataforma de Pagamentos é o time dono do processamento de cobrança do produto, do gateway de cartão até a liquidação com o adquirente. Esta página documenta como o time se organiza, não como o pagamento funciona por dentro: a arquitetura de cada serviço mora no repositório dele, listado em Desenvolvimento.

## O que o time sustenta

O time responde pelos três serviços que compõem o fluxo de cobrança: a API de checkout, o worker de conciliação e o painel interno de disputas. Nenhum outro time do produto tem permissão de deploy nesses três serviços, e é essa fronteira que define o escopo do time.

```bash
panlabs times repositorios --time plataforma-de-pagamentos
# checkout-api · concilia-worker · disputas-painel · pagamentos-terraform
```

## Por que o time existe

O processamento de pagamento carrega regra de negócio própria (antifraude, split entre vendedor e plataforma, retentativa de cobrança recusada) e uma superfície de compliance que os demais times não carregam. Concentrar isso num time só evita que a regra de retentativa, por exemplo, seja reimplementada três vezes com três comportamentos diferentes.

## Como o time aparece no dia a dia

Toda alteração nos três serviços passa por revisão de dois integrantes do time, sem exceção, mesmo em ajuste pequeno. O comando abaixo lista quem está de plantão na semana corrente:

```bash
panlabs times quem-esta-de-plantao --time plataforma-de-pagamentos
# plantao: @ana.ferreira (semana de 18 a 24)
```

| Papel | Responsável | Contato |
| --- | --- | --- |
| Tech lead | Ana Ferreira | canal interno #pagamentos |
| PO | Rui Nakamura | canal interno #pagamentos |
| Plantão | rotação semanal | ver comando acima |

## Armadilhas

:::warning
Pedir revisão fora do time para os três serviços não acelera o merge, atrasa: só integrante do Plataforma de Pagamentos tem contexto suficiente da regra de antifraude para aprovar com segurança, e a política de branch recusa aprovação de fora.
:::
