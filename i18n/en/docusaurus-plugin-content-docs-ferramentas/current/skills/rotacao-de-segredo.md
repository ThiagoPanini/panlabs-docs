---
title: Secret rotation
description: Runs the rotation with a dual-acceptance window, waits for propagation and revokes the previous version — with no manual intervention.
---

# Secret rotation

The four steps of the manual procedure, as a scheduled workflow. Revocation only
happens after the previous version has gone an hour without use.

```yaml
# .github/workflows/rotacao.yml
name: rotacao
on:
  schedule:
    # first day of the month, 04:00 — outside the prod deploy window (09:00–17:00)
    - cron: "0 4 1 * *"
  workflow_dispatch:

permissions:
  id-token: write
  contents: read

jobs:
  rotacionar:
    runs-on: ubuntu-latest
    steps:
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ vars.PAPEL_ROTACAO }}
          aws-region: us-east-1

      - name: Rotate the external key
        uses: panlabs/rotacao-de-segredo@v2
        with:
          segredo: prod/api/chave-externa
          regiao: us-east-1
          propagar-para: esteira,runtime
          # the dual-acceptance window; revocation waits for it to close
          janela-horas: 24
          # zero use of the previous version for this window before revoking
          silencio-antes-de-revogar: 1h

      - name: Fail loudly if propagation stayed partial
        # `PropagacaoParcial` is a normal state DURING the window and a defect
        # AFTER it: it means something reads the secret and was not redeployed.
        run: panlabs segredos uso prod/api/chave-externa --por-versao --exigir-zero AWSPREVIOUS
```

`silencio-antes-de-revogar` is the parameter that separates this skill from a
script: revoking on a clock knocks over anything that reads the secret hourly,
and revoking on absence of use knocks over nothing. The equivalent manual
procedure is in [Rotate a key](/procedimentos/acessos/rotacionar-uma-chave).
