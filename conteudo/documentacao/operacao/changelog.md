---
sidebar_position: 1
title: Changelog
description: O único canal onde mudança de contrato da API do Trilho se comunica, em ordem cronológica reversa.
---

# Changelog

A documentação do Trilho **não é versionada**. A API é — por cabeçalho,
`Trilho-Version: 2026-01-15` — e esta página é o único lugar onde uma mudança de
contrato é anunciada.

## Como ler

Cada entrada é uma data de versão de API. Enquanto o seu cabeçalho apontar para
uma data anterior, a mudança não te alcança: o Trilho continua respondendo no
formato daquele dia.

Mudança que **não** aparece aqui é mudança que não muda contrato — campo novo
opcional, código de erro novo dentro de uma classe existente, ou correção de
comportamento que já estava documentado.

## 2026-01-15

Primeira versão pública estável.

<!-- As entradas anteriores e o restante do gabarito de `Changelog` — seis a oito
     entradas em ordem cronológica reversa — chegam no slice 4, junto com as
     outras cinco páginas de `Operação`. Esta página existe desde o slice 2
     porque o footer a linka em todas as rotas do site, e link de footer para
     rota inexistente reprova no `onBrokenLinks: 'throw'`. -->
