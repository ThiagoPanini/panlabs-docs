---
title: Reference
description: The catalog as it stands today, with one AI Framework, one bundle, one pool skill and four MCP servers.
---

# Reference

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
