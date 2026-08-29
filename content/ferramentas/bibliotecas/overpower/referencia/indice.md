---
title: Referência
description: O catálogo como ele está hoje, com um AI Framework, um bundle, uma skill de pool e quatro servidores MCP.
---

# Referência

{/* cita-saida-de-ferramenta */}

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

## A tela que o `list` desenha

O `list` nu imprime o catálogo inteiro, um painel por bloco, com o tamanho e a
contagem de arquivos de cada item e a linha que o instala:

```text
  _____   _____ _ __ _ __   _____      _____ _ __
 / _ \ \ / / _ \ '__| '_ \ / _ \ \ /\ / / _ \ '__|
| (_) \ V /  __/ |  | |_) | (_) \ V  V /  __/ |
 \___/ \_/ \___|_|  | .__/ \___/ \_/\_/ \___|_|
                    |_|

  installs curated agent equipment   v0.27.3
╭─ AI Frameworks  installs whole ──────────────────────────╮
│                                                          │
│  matt-pocock                       199.4 KiB · 74 files  │
│    Matt Pocock's agent skills for real engineering:      │
│    grilling, spec and ticket flows, TDD, code review,    │
│    domain modelling and more.                            │
│                                                          │
│      overpower install --ai-framework matt-pocock        │
│      overpower list --ai-framework matt-pocock           │
│                                                          │
╰──────────────────────────────────────────────────────────╯

╭─ Pool skills  installs alone ────────────────────────────╮
│                                                          │
│  panlabs-python-standards           229.0 KiB · 8 files  │
│    Padrão de referência para backend Python — contratos  │
│    e ports, composição e forma do código, topologia e    │
│    kernel, modelo de erro, doutrina de testes e a régua  │
│    de máquina. Use ao criar um serviço Python do zero,   │
│    ao revisar um existente, ou ao decidir qualquer uma   │
│    destas perguntas — que forma tem um use-case, onde o  │
│    arquivo mora, o que o erro devolve, o que é fake e o  │
│    que é real, que config trava a regra. Cada posição    │
│    carrega a condição em que vale, a garantia que        │
│    compra, o dissenso vencido e o gatilho que a reabre.  │
│                                                          │
│      overpower install --skill panlabs-python-standards  │
│                                                          │
╰──────────────────────────────────────────────────────────╯

╭─ Bundles  lists pool artifacts only ─────────────────────╮
│                                                          │
│  api-python                         229.0 KiB · 8 files  │
│    Equipment for working on a Python API.                │
│                                                          │
│      overpower install --bundle api-python               │
│      overpower list --bundle api-python                  │
│                                                          │
╰──────────────────────────────────────────────────────────╯

╭─ MCP servers  grafts into the runtime's config ──────────╮
│                                                          │
│  cloudflare                                        http  │
│    Cloudflare's remote MCP server, over streamable       │
│    HTTP. It carries no secret in the file: the           │
│    connection authorises in the browser the first time   │
│    an agent uses it, so nothing here has to be filled    │
│    in before the server works.                           │
│                                                          │
│      overpower install --mcp cloudflare                  │
│      overpower list --mcp cloudflare                     │
│                                                          │
│  coolify                                          stdio  │
│    Coolify's API server, run as a local process. It      │
│    deploys and inspects the applications, databases and  │
│    servers of a Coolify panel — the address of the       │
│    panel is configuration and is written into the file,  │
│    while the access token is a secret and is only ever   │
│    referenced.                                           │
│                                                          │
│      overpower install --mcp coolify                     │
│      overpower list --mcp coolify                        │
│                                                          │
│  github                                            http  │
│    GitHub's remote MCP server, reached over HTTP. It     │
│    reads and writes issues, pull requests and workflows  │
│    in the repositories your token can see, and it is     │
│    authorised with a personal access token sent on       │
│    every request.                                        │
│                                                          │
│      overpower install --mcp github                      │
│      overpower list --mcp github                         │
│                                                          │
│  hostinger-vps                                    stdio  │
│    Hostinger's API server, run as a local process. It    │
│    manages VPS instances, DNS records and domains        │
│    through the Hostinger API, and every call it makes    │
│    is authorised with your API token — so the token has  │
│    to be in the environment the runtime starts in.       │
│                                                          │
│      overpower install --mcp hostinger-vps               │
│      overpower list --mcp hostinger-vps                  │
│                                                          │
╰──────────────────────────────────────────────────────────╯
```

A descrição de cada item vem do próprio artefato e chega inteira: ela não é
cortada na primeira frase, porque um catálogo de descrição cortada é um catálogo
que precisa ser consultado em outro lugar.

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
