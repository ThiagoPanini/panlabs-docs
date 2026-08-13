---
title: MCP catalogue server
description: Installation, configuration, the three read tools it exposes, and what it does when the caller's role does not reach.
---

# MCP catalogue server

Exposes the internal catalogue as MCP tools, on top of Library A. It has no
credentials of its own: it passes the caller's role through, and that is what
makes the answer the same one the terminal would give.

## Installation

<CodeGroup>

```bash title="pip"
pip install --index-url "$PANLABS_INDICE" "panlabs-mcp-catalogo>=1.2"
```

```bash title="uv"
uv tool install --index "$PANLABS_INDICE" "panlabs-mcp-catalogo>=1.2"
```

```json title="MCP client"
{
  "servidores": {
    "panlabs-catalogo": {
      "comando": "panlabs-mcp-catalogo",
      "ambiente": { "PANLABS_PERFIL": "dev" }
    }
  }
}
```

</CodeGroup>

## Configuration

Two variables, and neither is a secret. The profile picks the role already on
the machine; the base picks the catalogue environment.

```bash
export PANLABS_PERFIL=dev
export PANLABS_CATALOGO_BASE=https://catalogo.interno/v2
panlabs-mcp-catalogo --conferir
# profile dev · papel-<equipe>-leitura-dev · 3 tools registered
```

## The three tools

All reads. The rule that picked them is in [MCP servers](indice).

```python
# panlabs_mcp_catalogo/ferramentas.py
@servidor.ferramenta()
def buscar_recurso(termo: str, limite: int = 20) -> list[Recurso]:
    """Search the catalogue by name or partial identifier."""

@servidor.ferramenta()
def obter_recurso(identificador: str) -> Recurso:
    """Return a resource by exact identifier."""

@servidor.ferramenta()
def listar_por_dono(equipe: str, limite: int = 50) -> list[Recurso]:
    """Every resource owned by a team."""
```

## Error handling

The server translates Library A's exceptions into messages that make sense to
whoever reads the assistant's answer — and the translation keeps the cause, which
is the defect described in
[The same error in three shapes](/procedimentos/diagnostico/o-mesmo-erro-em-tres-formas).

```python
try:
    return catalogo.obter(identificador)
except ErroDeAcesso as erro:
    # the cause goes in the message, not just the category
    return Erro(f"{perfil} session expired or role without access: {erro}")
except RecursoAusente:
    return Erro(f"{identificador!r} does not exist in the {perfil} catalogue")
```

## What it does not do

It does not write, does not rotate and does not deploy. The decision table is in
the section index, and the line that sums it up is one: **a write tool executed
by an assistant is a change without review.**
