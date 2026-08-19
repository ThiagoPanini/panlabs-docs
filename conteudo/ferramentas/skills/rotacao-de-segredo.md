---
title: Rotação de segredo
description: Executa a rotação com janela de aceitação dupla, espera a propagação e revoga a versão anterior, sem intervenção manual.
---

# Rotação de segredo

Os quatro passos do procedimento manual, num workflow agendado. A revogação só
acontece depois de a versão anterior ficar uma hora sem uso.

```yaml
# .github/workflows/rotacao.yml
name: rotacao
on:
  schedule:
    # todo dia 1º, 04h, fora da janela de deploy de prod (09h–17h)
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

      - name: Rotacionar a chave externa
        uses: panlabs/rotacao-de-segredo@v2
        with:
          segredo: prod/api/chave-externa
          regiao: us-east-1
          propagar-para: esteira,runtime
          # a janela de aceitação dupla; a revogação espera ela fechar
          janela-horas: 24
          # zero uso da versão anterior por esta janela antes de revogar
          silencio-antes-de-revogar: 1h

      - name: Falhar alto se a propagação ficou parcial
        # `PropagacaoParcial` é estado normal DURANTE a janela e defeito DEPOIS
        # dela: significa que alguém lê o segredo e não foi reimplantado.
        run: panlabs segredos uso prod/api/chave-externa --por-versao --exigir-zero AWSPREVIOUS
```

`silencio-antes-de-revogar` é o parâmetro que separa esta skill de um script:
revogar por relógio derruba quem lê o segredo de hora em hora, e revogar por
ausência de uso não derruba ninguém. O procedimento manual equivalente está em
[Rotacionar uma chave](/procedimentos/acessos/rotacionar-uma-chave).
