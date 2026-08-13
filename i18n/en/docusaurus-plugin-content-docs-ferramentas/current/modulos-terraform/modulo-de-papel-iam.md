---
title: IAM role module
description: The module that creates a role with the permission boundary applied, and why it rejects inline policies.
---

# IAM role module

Creates a role with the house permission boundary already applied. The boundary
is what stops a role from granting more than whoever created it holds — and it is
applied by the module precisely so it does not depend on someone remembering.

## Before you start

The role needs a service or a federated identity that can assume it. A role with
nobody to assume it is a dead resource that shows up in every audit.

## The steps

<Steps>
  <Step title="Declare who assumes it">
    `assumido_por` accepts an AWS service or a GitHub repository. The two forms
    produce different trust policies, and the module picks.

    ```hcl
    module "papel_publicacao" {
      source  = "panlabs/papel-iam/aws"
      version = "2.1.0"

      nome         = "publicacao"
      assumido_por = { repositorio = "panlabs-tech/catalogo", branch = "main" }
    }
    ```
  </Step>

  <Step title="Attach managed policies">
    Only ARNs of existing policies. Inline policies are rejected — see below.

    ```hcl
      politicas = [
        aws_iam_policy.publicar_pacote.arn,
        aws_iam_policy.empurrar_imagem.arn,
      ]
    ```
  </Step>

  <Step title="Apply and check the trust">
    ```bash
    terraform apply
    aws iam get-role --role-name papel-catalogo-publicacao \
      --query 'Role.AssumeRolePolicyDocument'
    ```
  </Step>
</Steps>

## Verification

The role exists, has the boundary attached, and the trust policy names the
repository and the branch — never `*`:

```bash
panlabs infra conferir papel publicacao
# boundary   panlabs-limite-equipe  ✓
# trust      repo:panlabs-tech/catalogo:ref:refs/heads/main
# policies   2 managed · 0 inline
```

## Why inline policies are rejected

An inline policy lives inside the role and has no name of its own, so it does not
show up in a policy search, cannot be reused, and cannot be reviewed in
isolation. In an audit, it is the thing nobody finds.

| Form | Appears in search | Reusable | Reviewable alone |
| --- | --- | --- | --- |
| managed | yes | yes | yes |
| inline | no | no | no |

:::warning
`branch` in `assumido_por` is not optional for a repository. Without it, the
trust policy accepts any reference from the repository — including a pull request
from a fork, which is the known path to stealing the publishing role.
:::

:::tip
For a role that must be assumed by several branches, pass a list. The module
emits one condition per entry instead of a wildcard, and the difference shows up
in the audit.
:::
