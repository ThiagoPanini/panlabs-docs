---
title: Environments
description: Trilho's two environments and the key that tells them apart.
---

# Environments

Trilho has two environments, and they do not talk to each other. A charge
created in the sandbox does not exist in production; a customer registered in
production does not appear in the sandbox. There is no sync, no import and no
migration between them.

The environment is not a request parameter. It is **in the key**.

| Environment | API base | Key prefix |
| --- | --- | --- |
| Sandbox | `https://api.sandbox.trilho.dev/v1` | `tk_test_` |
| Production | `https://api.trilho.dev/v1` | `tk_live_` |

Using one environment's key against the other's base returns `401` with
`codigo: "chave_de_ambiente_incorreto"`.
