---
title: Ambientes
description: Os dois ambientes do Trilho e a chave que distingue um do outro.
---

# Ambientes

<Untranslated />

O Trilho tem dois ambientes, e eles não se falam. Uma cobrança criada no sandbox
não existe em produção; um cliente cadastrado em produção não aparece no
sandbox. Não há sincronização, importação nem migração entre os dois.

O ambiente não é um parâmetro da requisição. Ele está **na chave**.

| Ambiente | Base da API | Prefixo da chave |
| --- | --- | --- |
| Sandbox | `https://api.sandbox.trilho.dev/v1` | `tk_test_` |
| Produção | `https://api.trilho.dev/v1` | `tk_live_` |

Usar uma chave de um ambiente contra a base do outro devolve `401` com
`codigo: "chave_de_ambiente_incorreto"`.
