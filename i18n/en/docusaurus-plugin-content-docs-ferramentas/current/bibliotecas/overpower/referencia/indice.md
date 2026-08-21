---
title: Reference
description: The catalog as it stands today, with one AI Framework, one bundle, one pool skill and four MCP servers.
---

# Reference

{/* cita-saida-de-ferramenta */}

This is what ships inside the package right now, in this release. The catalog is
embedded, not fetched, so this list describes exactly the version you have
installed. A newer release may carry more, and this page describes today's.

## What ships in the package

| Block | How many | What is there |
| --- | --- | --- |
| AI Frameworks | 1 | `matt-pocock`, with 25 skills and 74 files |
| Bundles | 1 | `api-python`, with 8 files |
| Pool skills | 1 | `panlabs-python-standards` |
| MCP servers | 4 | `cloudflare`, `coolify`, `github`, `hostinger-vps` |

**`matt-pocock`** carries Matt Pocock's agent skills for real engineering:
grilling, spec and ticket flows, TDD, code review, domain modelling and more. It
installs whole, with `--ai-framework matt-pocock`, and never as a slice.

**`api-python`** is equipment for working on a Python API. It currently names one
pool artifact, `panlabs-python-standards`, and its contents can also be requested
individually through `--skill`.

**`panlabs-python-standards`** is a reference standard for Python backend work:
contracts and ports, code composition and shape, module topology, the error model,
testing doctrine and machine-configuration discipline. Written for a use-case
shaped service, it settles the recurring questions of that shape.

## The four MCP servers

| Server | Transport | What it does |
| --- | --- | --- |
| `cloudflare` | HTTP | Cloudflare's remote MCP server. Authorises in the browser on first use, and no secret ever reaches the configuration file |
| `coolify` | stdio | Coolify's API server, run as a local process. The panel address is written as configuration, the access token is only referenced |
| `github` | HTTP | GitHub's remote MCP server. Reads and writes issues, pull requests and workflows in whatever repositories your token can see |
| `hostinger-vps` | stdio | Hostinger's API server, run as a local process. Manages VPS instances, DNS records and domains |

```bash
uvx overpower@latest list --mcp cloudflare
```

## The screen `list` draws

Bare `list` prints the whole catalog, one panel per block, with each item's size
and file count and the line that installs it:

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

Each item's description comes from the artifact itself and arrives whole: it is
not cut at the first sentence, because a catalog of cut descriptions is a catalog
that has to be looked up somewhere else.

## The live version of this page

Run `list` for the live version of what is above. It is the same four blocks, with
every description printed in full and the exact command that installs each item.

```bash
uvx overpower@latest list
```

:::note
This page and the output of `list` describe the same thing by different routes,
and the two age together by construction: the catalog is the tree inside the
package, so a new version of overpower brings the new list and the new prose at
once. What `list` has and this page does not is the file count and size of each
item, which only the disk knows.
:::
