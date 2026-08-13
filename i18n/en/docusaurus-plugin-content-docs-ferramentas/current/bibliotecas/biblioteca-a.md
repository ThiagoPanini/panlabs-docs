---
title: Library A
description: The Python client for the internal catalogue — installation, configuration, usage, and the error handling it expects from callers.
---

# Library A

The client for the internal catalogue. It wraps the calls, applies retries with
exponential backoff and jitter, and returns the published contract types — never
raw dictionaries.

## Installation

<CodeGroup>

```bash title="pip"
pip install --index-url "$PANLABS_INDICE" "panlabs-catalogo>=2.4"
```

```bash title="uv"
uv add --index "$PANLABS_INDICE" "panlabs-catalogo>=2.4"
```

```toml title="pyproject.toml"
[project]
dependencies = ["panlabs-catalogo>=2.4,<3"]

[[tool.uv.index]]
name = "panlabs"
url = "$PANLABS_INDICE"
```

</CodeGroup>

## Configuration

The library does not discover credentials on its own and does not read
environment variables by itself. Whoever builds the client passes what it needs —
which is what makes it usable in tests without touching the network.

```python
from panlabs.catalogo import Catalogo
from panlabs.segredos import LeitorDeSegredo

catalogo = Catalogo(
    base="https://catalogo.interno/v2",
    leitor_de_segredo=LeitorDeSegredo(perfil="dev"),
    tempo_limite_s=5,
)
```

`leitor_de_segredo` is injected on purpose: the library does not pick a cache
policy for its callers. See the dependency rule in [Libraries](indice).

## Usage

Listing is paginated by opaque cursor, and the iterator handles the loop.

```python
for recurso in catalogo.iterar(limite=100):
    print(recurso.identificador, recurso.dono)

# or one page at a time, when the loop is yours
pagina = catalogo.listar(limite=50)
while pagina.proximo:
    pagina = catalogo.listar(limite=50, cursor=pagina.proximo)
```

## Error handling

Three exceptions, and telling them apart decides whether retrying is worthwhile.

```python
from panlabs.catalogo import ErroDeAcesso, ErroDeValidacao, ErroTemporario

try:
    catalogo.registrar(recurso)
except ErroDeValidacao as erro:
    # never worth retrying: the body names the field and the contract version
    log.error("field %s rejected (contract %s)", erro.campo, erro.contrato)
except ErroDeAcesso:
    # expired session or wrong role — see the symptom index
    raise
except ErroTemporario:
    # the library already retried; reaching here means the ceiling was hit
    raise
```

`ErroTemporario` only reaches the caller after the internal retries are
exhausted, which is why catching it to try again is almost always wrong.

## The full reference

This library has no generated reference. The public signatures live in the
package types, and Python's `help()` is the source:

```bash
python -c "from panlabs.catalogo import Catalogo; help(Catalogo)"
```

The one with a generated reference is [Library C](biblioteca-c/visao-geral).
