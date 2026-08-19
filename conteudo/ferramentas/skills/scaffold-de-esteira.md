---
title: Scaffold de esteira
description: Cria os três workflows do template num repositório novo, já ligados ao papel de publicação da equipe.
---

# Scaffold de esteira

Rode uma vez, num repositório novo. Ela escreve os três workflows do template,
o `panlabs.toml` e o arquivo de esteira em Python, e abre o `pull request`.

```yaml
# .github/workflows/scaffold.yml
# Rode uma vez, por `workflow_dispatch`, e apague este arquivo depois.
name: scaffold
on:
  workflow_dispatch:
    inputs:
      equipe:
        description: "o slug da equipe, como ele aparece no papel IAM"
        required: true
      linguagem:
        description: "python | terraform"
        required: true
        default: python

permissions:
  contents: write
  pull-requests: write
  id-token: write

jobs:
  scaffold:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Escrever a esteira
        uses: panlabs/scaffold-de-esteira@v3
        with:
          equipe: ${{ inputs.equipe }}
          linguagem: ${{ inputs.linguagem }}
          # o papel é derivado da equipe, e a skill recusa um valor que não
          # case com `papel-<equipe>-esteira-<ambiente>`
          papel-publicacao: papel-${{ inputs.equipe }}-esteira-prd

      - name: Abrir o pull request
        uses: peter-evans/create-pull-request@v6
        with:
          branch: esteira/scaffold
          title: "esteira: os três workflows do template"
          body: |
            Gerado por `panlabs/scaffold-de-esteira@v3`.

            - `verificar.yml` — teste, tipo, formato e varredura em todo PR
            - `publicar.yml` — build, assinatura e publicação em `main`
            - `inventario.yml` — registro semanal de procedência de imagem

            O `esteira.py` é a fonte; o YAML é gerado. Ver
            https://panlabs.interno/ferramentas/bibliotecas/overpower/visao-geral
          delete-branch: true
```

A skill recusa rodar num repositório que já tem workflows: adotar num projeto
existente é o procedimento de
[Instalação](/ferramentas/bibliotecas/overpower/instalacao),
e ele é dois `pull requests` por um motivo que a skill não tem como julgar.
