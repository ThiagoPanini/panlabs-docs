---
title: Library B
description: Secret reading with cache — installation, the expiry policy, usage, and what happens during a rotation.
---

# Library B

Reads secrets from the manager, with an in-memory cache and explicit expiry.
What it solves is not the call — it is the cost: the manager charges per call,
and a service that reads the secret on every request pays for it twice, in money
and in latency.

## Installation

<CodeGroup>

```bash title="pip"
pip install --index-url "$PANLABS_INDICE" "panlabs-segredos>=1.6"
```

```bash title="uv"
uv add --index "$PANLABS_INDICE" "panlabs-segredos>=1.6"
```

```toml title="pyproject.toml"
[project]
dependencies = ["panlabs-segredos>=1.6,<2"]
```

</CodeGroup>

## Configuration

Expiry is mandatory and has no default. A secret cache with no declared expiry
is a cache that outlives rotation, and that is how a service keeps using a
revoked key.

```python
from datetime import timedelta
from panlabs.segredos import LeitorDeSegredo

leitor = LeitorDeSegredo(
    perfil="prd",
    expiracao=timedelta(minutes=5),
)
```

## Usage

```python
chave = leitor.ler("prod/integracao/chave-externa")

# batch read: one call to the manager, not N
chaves = leitor.ler_varios([
    "prod/integracao/chave-externa",
    "prod/webhook/parceiro",
])
```

## During a rotation

The dual-acceptance window exists because the cache exists. While it is open the
reader knows how to return both versions, and signature verification tries the
new one before the old one.

```python
for versao in leitor.versoes_aceitas("prod/webhook/parceiro"):
    try:
        verificar(corpo, cabecalho, versao)
        break
    except AssinaturaInvalida:
        continue
else:
    raise AssinaturaInvalida("no accepted version matches")
```

The full procedure is in
[Rotate a key](/procedimentos/acessos/rotacionar-uma-chave).

## Error handling

```python
from panlabs.segredos import SegredoAusente, SemPermissao

try:
    chave = leitor.ler("prod/integracao/chave-externa")
except SegredoAusente:
    # the secret does not exist: configuration error, never transient
    raise
except SemPermissao:
    # the role does not reach this secret — see the permission matrix
    raise
```

The library does **not** catch network failures: it lets them through. Retrying
a secret read inside the library would hide an outage of the manager from
whoever needs to decide between degrading and failing.
