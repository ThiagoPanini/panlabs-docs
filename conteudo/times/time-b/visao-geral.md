---
title: Visão geral
description: O time Experiência do Vendedor, o que ele sustenta e como encontrar quem está de plantão.
---

# Visão geral

<Untranslated />

O Experiência do Vendedor é o time dono da jornada do vendedor dentro do produto, do cadastro ao painel que ele usa todo dia. Esta página documenta como o time se organiza, não como cada tela funciona por dentro: cada repositório listado em Desenvolvimento traz o próprio detalhe.

## O que o time sustenta

O time responde por quatro superfícies: o fluxo de onboarding, o painel do vendedor, o editor de catálogo e a biblioteca de componentes compartilhada com as três telas anteriores. É essa biblioteca, e não um documento de estilo, que mantém as três telas com a mesma cara.

```bash
panlabs times repositorios --time experiencia-do-vendedor
# onboarding-vendedor · painel-vendedor · editor-catalogo · experiencia-design-system
```

## Por que o time existe

A jornada do vendedor pede foco de produto e de UX que o resto do backend não carrega: taxa de conclusão de onboarding, tempo até o primeiro produto publicado, satisfação do vendedor com o painel. Nenhuma dessas métricas aparece na fila de outro time, e concentrá-las aqui evita que a tela do vendedor vire prioridade número dois em toda parte.

## Como o time aparece no dia a dia

O time faz uma triagem semanal dos chamados de suporte abertos por vendedor, e prioriza o backlog a partir dela. O comando abaixo lista quem está de plantão na semana corrente:

```bash
panlabs times quem-esta-de-plantao --time experiencia-do-vendedor
# plantao: @bruno.tavares (semana de 18 a 24)
```

| Papel | Responsável | Contato |
| --- | --- | --- |
| Tech lead | Bruno Tavares | canal interno #experiencia-vendedor |
| PO | Carla Menezes | canal interno #experiencia-vendedor |
| Plantão | rotação semanal | ver comando acima |

## Armadilhas

:::warning
Chamado sobre cobrança recusada ou estorno não é deste time, é do Plataforma de Pagamentos: o painel do vendedor só exibe o status que o outro serviço publica, e mexer aqui não resolve o sintoma.
:::
