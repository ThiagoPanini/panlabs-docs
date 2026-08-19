---
title: Overview
description: Pipeline as code, from the first generated workflow to a running pipeline, in five steps and without editing YAML by hand.
---

# Overview

Library C describes pipelines in Python and emits GitHub Actions workflows. It
exists because pipeline YAML gets copied between repositories and drifts
silently, and a workflow that drifts goes unnoticed until the day it stops
failing what it should.

## Installing and the first workflow

<Steps>
  <Step title="Install">
    ```bash
    pip install --index-url "$PANLABS_INDICE" "panlabs-esteira>=4.0"
    ```
  </Step>

  <Step title="Describe the pipeline">
    A Python file in place of the YAML. Steps are objects, and what the house
    has already decided comes from `panlabs.esteira.padrao`.

    ```python
    # esteira.py
    from panlabs.esteira import Esteira, padrao

    esteira = Esteira(nome="verificar", em=["pull_request"])
    esteira.trabalho("verificar", padrao.python(versao="3.12"))
    ```
  </Step>

  <Step title="Generate">
    The YAML lands in the workflows directory, with a header stating that it is
    generated.

    ```bash
    python -m panlabs.esteira gerar esteira.py
    ```
  </Step>

  <Step title="Check it in the pipeline">
    The step that fails when the committed YAML is not what the Python produces.
    It is what prevents hand editing.

    ```bash
    python -m panlabs.esteira conferir esteira.py
    ```
  </Step>

  <Step title="Push">
    ```bash
    git add .github/workflows esteira.py
    git commit -m "verification pipeline"
    git push
    ```
  </Step>
</Steps>

:::warning
The generated YAML is **not editable**. It opens with a header saying so, and the
check step rejects any edit: the source is the Python, and two sources drift the
day someone fixes only one.
:::

:::tip
`padrao.python()` already brings tests, typing, formatting and scanning in the
order the house uses. Start from it and add what is specific to the repository;
starting from scratch is how you inherit another team's workflow by copy.
:::

## What it does not do

It does not run pipelines and it does not talk to GitHub. Its output is YAML on
disk, and Actions runs it as always; swapping the runner would trade an audited
tool for debt of our own.

It also does not validate that the pipeline **works**: only that it is complete
and safe. The four rejections are in [Error handling](tratamento-de-erros).

## Next steps

<CardGroup>
  <Card title="Installation and setup" icon="download" href="instalacao-e-configuracao">
    Installation options, the configuration file, and what to do in a repository
    that already has workflows.
  </Card>
  <Card title="Error handling" icon="circle-alert" href="tratamento-de-erros">
    Why generation fails loudly, and how to read the error it raises.
  </Card>
  <Card title="Changelog" icon="clock" href="changelog">
    What changed in each version, and what broke the contract.
  </Card>
</CardGroup>
