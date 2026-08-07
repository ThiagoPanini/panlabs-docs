---
title: Visão geral
description: A superfície de máquina do Trilho — base, autenticação, versão por cabeçalho, formato de erro e idempotência.
---

# Visão geral

A API do Trilho é REST sobre HTTPS, com corpo em JSON nos dois sentidos. Uma
base, uma chave, um cabeçalho de versão.

```
https://api.trilho.dev/v1
```

## Autenticação

Chave secreta no cabeçalho `Authorization`, como *bearer token*. O ambiente está
na chave: `tk_test_` fala com o sandbox, `tk_live_` com produção. Não existe
parâmetro de ambiente na requisição.

## Versão

`Trilho-Version: 2026-01-15`. Omitir o cabeçalho fixa a conta na versão em que
ela foi criada — nunca na mais recente. É deliberado: uma integração que sobe de
versão sozinha é uma integração que quebra num deploy que ninguém fez.

## Erros

Todo erro devolve o mesmo envelope, e o `codigo` é estável — é ele que se trata
no código, nunca a `mensagem`, que é para humano e pode mudar.

| Classe | Significa |
| --- | --- |
| `400` | a requisição não é válida contra o contrato |
| `401` | chave ausente, inválida ou de outro ambiente |
| `402` | o meio de pagamento recusou; ver o catálogo de recusas |
| `404` | o recurso não existe **nesta** conta |
| `409` | conflito de estado — a transição pedida não existe |
| `429` | limite de taxa; o cabeçalho diz quantas sobram |
| `5xx` | nosso; pode repetir com a mesma chave de idempotência |

## Idempotência

`Idempotency-Key` em toda requisição que cria. Janela de 24 horas, igual nos dois
ambientes. Repetir com a mesma chave devolve a **mesma** resposta, inclusive o
mesmo `id` — não um recurso novo.
