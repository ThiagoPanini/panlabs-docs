---
title: Bucket module
description: The module that creates a private, versioned and encrypted bucket, with the three variables, the nested output, and what it decides for you.
---

# Bucket module

Creates a bucket with what the house has already decided: private, versioned,
encrypted with KMS, and with expiry of old versions. Three variables, and the
first two are required.

## Before you start

A session assumed in the target environment and the module version chosen. Pin
the version: `source` without `version` resolves to the latest on every `init`.

## The steps

<Steps>
  <Step title="Declare">
    ```hcl
    module "relatorios" {
      source  = "panlabs/bucket/aws"
      version = "3.1.0"

      nome      = "relatorios"
      proposito = "output of the weekly reporting job"
      retencao  = 90
    }
    ```
  </Step>

  <Step title="Plan">
    A new bucket creates between six and eight resources. A number far from that
    means the composition is picking up more than you asked for.

    ```bash
    terraform init -upgrade
    terraform plan -out plano.bin
    ```
  </Step>

  <Step title="Apply">
    In `dev`, directly; in the other two, through the pipeline.

    ```bash
    terraform apply plano.bin
    ```
  </Step>
</Steps>

## Verification

```bash
panlabs infra conferir bucket relatorios
# name            relatorios-dev
# access          private (public access block: 4/4)
# versioning      enabled
```

## What it decides for you

| Decision | Value | Why |
| --- | --- | --- |
| Public access | blocked on all 4 keys | three out of four is the common way a "private" bucket is not |
| Versioning | on | recovery from a bad write has no substitute |
| Encryption | KMS | `sse-s3` does not allow per-key policy |
| Environment suffix | automatic | bucket names are immutable, and the mistake only shows after `apply` |

The output is a nested object, and its anatomy is in
[A module's output](/procedimentos/infraestrutura/o-output-de-um-modulo).

:::warning
`nome` gets the environment suffix on its own. Writing `relatorios-dev` produces
`relatorios-dev-dev`, and since bucket names are immutable the fix is destroy and
recreate.
:::

:::tip
`retencao = 0` turns off expiry of old versions and needs a justification in the
pull request. A versioned bucket with no expiry grows forever, and the cost shows
up three quarters later.
:::
