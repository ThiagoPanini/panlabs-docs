---
title: Error handling
description: Why generation fails loudly instead of emitting partial YAML, what the four rejections are, and how to read the pointer each one returns.
---

# Error handling

The library generates an artifact that another machine will execute with nobody
watching. That decides the whole error model: **it never emits partial output.**
Either the YAML describes the complete pipeline, or there is no YAML, because a
workflow that runs with a step missing passes, and passing without checking is
worse than not running.

## The closed list of rejections

| Rejection | What triggers it | What the pointer names |
| --- | --- | --- |
| `PassoSemNome` | a step without `nome` | the job and the step position |
| `ReferenciaNaoFixada` | a third-party action without a pinned version | the action and the job |
| `SegredoInline` | a value that looks like a secret in the YAML | the step and the key |
| `PermissaoAmpla` | `permissions: write-all` | the job |

The list is closed on purpose: a rejection that is not here is a defect in the
library, not an invalid pipeline. An open list invites validation to grow until
it becomes opinion.

## How an error presents itself

```python
from panlabs.esteira import Esteira, ErroDeGeracao

try:
    esteira.gerar()
except ErroDeGeracao as erro:
    print(erro.recusa)      # ReferenciaNaoFixada
    print(erro.ponteiro)    # trabalhos.verificar.passos[2].uses
    print(erro.detalhe)     # "actions/checkout without a pinned version"
```

`ponteiro` is the field that makes the message worth anything. A rejection that
says *"there is an action without a version"* forces you to search; one that says
`trabalhos.verificar.passos[2].uses` points.

## Why pinning is a rejection and not a warning

A third-party action referenced by tag moves under you: the tag is rewritten, the
content changes, and the pipeline starts running code nobody reviewed. It is the
only rejection on the list that exists for security rather than correctness.

```python
# rejected
esteira.passo(usa="actions/checkout@v4")

# accepted: the tag stays readable in the comment
esteira.passo(usa="actions/checkout@b4ffde6…", comentario="v4.2.2")
```

:::warning
The rejection applies to third-party actions and **not** to in-house ones: those
live in the same trust domain and are referenced by tag on purpose, so that a fix
reaches every repository without a pull request in each.
:::

## What the library does not validate

It does not check that the workflow **works**, only that it is complete and
safe. Pipeline logic errors show up at execution time, and the place to reproduce
them is locally: see
[Run the pipeline locally](/procedimentos/esteiras/rodar-a-esteira-localmente).
