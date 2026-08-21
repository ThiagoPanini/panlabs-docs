---
title: Desenvolvimento
description: O vocabulário, os repositórios e as ofertas do Plataforma de Pagamentos, em três tabelas de consulta.
---

# Desenvolvimento

<Untranslated />

Três tabelas de consulta, para quem chega no time ou integra com ele: o vocabulário próprio, os repositórios que o time mantém e as ofertas que ele expõe a outros times.

## Como ler as tabelas

Cada tabela é independente e não pressupõe leitura das outras duas. A coluna da esquerda é sempre o termo de busca.

## Siglas

| Sigla | Significado |
| --- | --- |
| PSP | Provedor de serviço de pagamento |
| MDR | Taxa de desconto do adquirente (merchant discount rate) |
| 3DS | Autenticação em duas camadas no cartão (3-D Secure) |
| TX | Transação |
| CHB | Estorno contestado (chargeback) |

## Repositórios

| Repositório | Linguagem | O que guarda |
| --- | --- | --- |
| checkout-api | Python | a API de cobrança e checkout |
| concilia-worker | Python | a conciliação assíncrona com o adquirente |
| disputas-painel | TypeScript | o painel interno de disputa de chargeback |
| pagamentos-terraform | HCL | a infraestrutura dos três serviços acima |

## Ofertas

| Oferta | Para quem | Como pedir |
| --- | --- | --- |
| Nova forma de pagamento | vendedores grandes | abrir chamado com o time |
| Relatório de conciliação sob demanda | financeiro | pedir no canal interno #pagamentos |
| Ambiente de sandbox de cobrança | outros times que integram | self-service, ver Repositórios |
