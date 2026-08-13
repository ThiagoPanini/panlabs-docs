---
title: Terraform modules
description: The two published modules, their versioning contract, and the rule that decides what becomes a module.
---

# Terraform modules

Two published modules, versioned under the same policy as the Python packages.
They describe a resource and the decisions already made about it — what belongs
to the service lives in the caller's composition.

## What exists

| Module | Creates | Stable since |
| --- | --- | --- |
| [Bucket module](modulo-de-bucket) | private, versioned, encrypted bucket | `3.0.0` |
| [IAM role module](modulo-de-papel-iam) | role with a permission boundary | `2.0.0` |

## The rule that decides what becomes a module

**Three consumers.** Before that, generalising costs more than copying; after
that, the copies have drifted enough that unifying them is a migration. The
procedure is in
[Promote a module](/procedimentos/infraestrutura/promover-um-modulo).

## How to consume

Always with a pinned version. A module without a pinned version changes under
whoever uses it the day it publishes.

```hcl
module "relatorios" {
  source  = "panlabs/bucket/aws"
  version = "3.1.0"

  nome      = "relatorios"
  proposito = "output of the weekly reporting job"
}
```
