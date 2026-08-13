---
title: MCP servers
description: What the house exposes over MCP, to whom, and the rule that decides what becomes a tool and what stays out.
---

# MCP servers

One published server, exposing the internal catalogue as tools for assistants.
What it solves is the same question Library A solves for code — *what exists and
whose it is* — for a consumer that does not write Python.

## The rule for what becomes a tool

| Operation | Becomes a tool | Why |
| --- | --- | --- |
| Query the catalogue | yes | read, idempotent, clear scope |
| List owners of a resource | yes | read |
| Register a resource | no | a write whose effect nobody reviews |
| Rotate a secret | no | irreversible |

**Reads yes, writes no**, and the line is hard. A write tool executed by an
assistant is a change without a pull request, and it is the one place in the
system where review would disappear without anyone deciding that.

## Authentication

The server has no credentials of its own. It receives the caller's token and
passes it through — so whoever queries through the assistant sees exactly what
they would see from the terminal, with the same role.

```json
{
  "servidores": {
    "panlabs-catalogo": {
      "comando": "panlabs-mcp-catalogo",
      "ambiente": { "PANLABS_PERFIL": "dev" }
    }
  }
}
```

## What exists

- [MCP catalogue server](servidor-de-catalogo-mcp) — installation,
  configuration, the three tools and error handling.
