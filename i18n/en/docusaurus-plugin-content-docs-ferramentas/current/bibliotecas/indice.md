---
title: Libraries
description: The three Python packages published to the internal index, what each one solves, and which of them has a generated reference.
---

# Libraries

Three packages, published to the internal index by the same pipeline, under the
same versioning contract. They left this archive for other teams to use, and
that is what puts them under `Tools` instead of `Procedures`.

## What each one solves

| Package | Solves | Generated reference |
| --- | --- | --- |
| [Library A](biblioteca-a) | client for the internal catalogue | no |
| [Library B](biblioteca-b) | secret reading with cache | no |
| [Library C](biblioteca-c/visao-geral) | pipeline as code | yes |

## The dependency rule between them

None of them depends on another. It is a constraint, and it cost a rewrite: when
Library A started importing B to read secrets, every consumer of A inherited B's
cache policy — including the ones that read secrets some other way.

What replaced it is injection: the caller passes the secret reader, and the
library does not choose on their behalf.

## Installing any of them

```bash
pip install --index-url "$PANLABS_INDICE" "panlabs-catalogo>=2.4"
```

The internal index requires the corporate login to be propagated. If `pip` asks
for a username and password, the login has not arrived — see
[Set up the local machine](/procedimentos/ambiente/preparar-a-maquina-local).
