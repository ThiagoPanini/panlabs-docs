---
title: Visão geral
description: Os três SDKs oficiais do Trilho, o que eles cobrem e o que continua sendo HTTP puro.
---

# Visão geral

<Untranslated />

Três SDKs oficiais: [**Node**](node), [**Python**](python) e [**Go**](go). Todos
geram do mesmo contrato OpenAPI que a Referência da API publica, então nenhum
deles conhece um campo que a referência não documente.

## O que o SDK faz por você

| | Sem SDK | Com SDK |
| --- | --- | --- |
| Autenticação | cabeçalho à mão | construtor |
| Idempotência | chave à mão | gerada por padrão em toda escrita |
| Retentativa | sua | espera exponencial em `429` e `5xx` |
| Paginação | cursor à mão | iterador |
| Assinatura de webhook | HMAC à mão | uma chamada de verificação |

As duas últimas linhas são o motivo real de existir SDK. Cursor implementado
errado devolve página repetida; verificação de HMAC implementada errada aceita
requisição forjada.

## Onde os três divergem

| | Node | Python | Go |
| --- | --- | --- | --- |
| Versão mínima | 20 | 3.10 | 1.22 |
| Forma assíncrona | única | segundo construtor | `context.Context` |
| Tipos | inclusos | inclusos | nativos |
| **Snippet na Referência da API** | sim | sim | **não** |

A última linha é uma perda declarada, não uma omissão: os exemplos por endpoint
saem em cURL, Node e Python, e a receita de Go exige tipos nomeados que o
contrato OpenAPI não carrega. A página de [Go](go) é a superfície canônica dele.

## O que continua HTTP

Recurso novo aparece na API antes de aparecer no SDK. Todos os três expõem um
escape para requisição crua contra a mesma base e a mesma chave — e usá-lo não é
sinal de que algo está errado.

## Versionamento

O SDK versiona por conta própria, em SemVer. A **API** versiona por cabeçalho,
`Trilho-Version: 2026-01-15`. Subir a versão do SDK não muda a versão da API que
você fala; são dois relógios, e é o cabeçalho que decide o formato da resposta.
