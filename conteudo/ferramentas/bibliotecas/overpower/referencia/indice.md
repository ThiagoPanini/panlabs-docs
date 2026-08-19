---
title: Referência
description: O catálogo como ele está hoje, com um AI Framework, um bundle, uma skill de pool e quatro servidores MCP.
---

# Referência

Isto é o que vem dentro do pacote agora, neste lançamento. O catálogo é
embutido, não buscado, então esta lista descreve exatamente a versão que você
tem instalada. Um lançamento mais novo pode carregar mais coisas, e esta página
descreve as de hoje.

## O que vem no pacote

| Bloco | Quantos | O que há |
| --- | --- | --- |
| AI Frameworks | 1 | `matt-pocock`, com 25 skills e 74 arquivos |
| Bundles | 1 | `api-python`, com 8 arquivos |
| Skills de pool | 1 | `panlabs-python-standards` |
| Servidores MCP | 4 | `cloudflare`, `coolify`, `github`, `hostinger-vps` |

O **`matt-pocock`** traz as skills de agente do Matt Pocock para engenharia de
verdade: grilling, fluxos de spec e ticket, TDD, code review, modelagem de
domínio e mais. Ele instala inteiro, com `--ai-framework matt-pocock`, e nunca em
fatia.

O **`api-python`** é equipamento para trabalhar numa API em Python. Hoje ele
nomeia um artefato de pool, o `panlabs-python-standards`, e o conteúdo dele
também pode ser pedido individualmente por `--skill`.

O **`panlabs-python-standards`** é um padrão de referência para backend em
Python: contratos e ports, composição e forma do código, topologia de módulo,
modelo de erro, doutrina de testes e disciplina de configuração de máquina.
Escrito para um serviço com forma de use-case, ele resolve as perguntas
recorrentes dessa forma.

## Os quatro servidores MCP

| Servidor | Transporte | O que faz |
| --- | --- | --- |
| `cloudflare` | HTTP | o servidor MCP remoto da Cloudflare. Autoriza no navegador no primeiro uso, e nenhum segredo chega ao arquivo de configuração |
| `coolify` | stdio | o servidor de API do Coolify, rodado como processo local. O endereço do painel é escrito como configuração, o token só é referenciado |
| `github` | HTTP | o servidor MCP remoto do GitHub. Lê e escreve issues, pull requests e workflows nos repositórios que o seu token enxerga |
| `hostinger-vps` | stdio | o servidor de API da Hostinger, rodado como processo local. Gerencia instâncias de VPS, registros de DNS e domínios |

```bash
uvx overpower@latest list --mcp cloudflare
```

## A versão viva desta página

Rode o `list` para a versão viva do que está acima. São os mesmos quatro blocos,
com toda descrição impressa por inteiro e o comando exato que instala cada item.

```bash
uvx overpower@latest list
```

:::note
Esta página e a saída do `list` descrevem a mesma coisa por caminhos diferentes,
e as duas envelhecem juntas por construção: o catálogo é a árvore dentro do
pacote, então uma versão nova do `overpower` traz a lista nova e a prosa nova de
uma vez. O que o `list` tem e esta página não é a contagem de arquivos e o
tamanho de cada item, que só o disco sabe.
:::
