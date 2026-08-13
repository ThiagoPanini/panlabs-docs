---
title: Installation and setup
description: Installation options, the repository configuration file, and how to adopt the library in a project that already has hand-written workflows.
---

# Installation and setup

Installing is one line; adopting it in a repository that already has workflows
is the procedure worth writing down, because the wrong order deletes the
pipeline that was working.

## Before you start

Python 3.12, access to the internal index, and write permission on the
repository. If the repository uses branch protection, the first pull request has
to pass with the old workflows still active.

## The steps

<Steps>
  <Step title="Install as a development dependency">
    It does not go into the published package: it generates an artifact at
    development time, and none of it runs in production.

    ```bash
    uv add --dev --index "$PANLABS_INDICE" "panlabs-esteira>=4.0"
    ```
  </Step>

  <Step title="Import what already exists">
    The command reads the current workflows and writes the equivalent Python. It
    deletes nothing — the output is a new file, for reading.

    ```bash
    python -m panlabs.esteira importar .github/workflows > esteira.py
    ```
  </Step>

  <Step title="Check that generation reproduces what exists">
    This is the step that decides whether adoption is safe. `--diff` compares the
    generated YAML with the committed one and writes nothing.

    ```bash
    python -m panlabs.esteira gerar esteira.py --diff
    ```
  </Step>
</Steps>

## Verification

An empty diff means the library reproduces the current pipeline, and the switch
is mechanical. A non-empty diff means the import simplified something — read it
before accepting:

```bash
python -m panlabs.esteira gerar esteira.py --diff
# no output = the Python describes exactly what is live
```

:::tip
If the diff only removes comments and reorders keys, accept it. If it removes an
`if:` or a `continue-on-error`, **do not**: the import failed to understand a
condition, and behaviour would change.
:::

## The configuration file

What holds for the whole repository lives in `panlabs.toml`, and is not repeated
in each pipeline.

```toml
[esteira]
runner = "ubuntu-latest"
python = "3.12"
diretorio = ".github/workflows"

[esteira.permissoes]
contents = "read"
id-token = "write"
```

## Variations

**More than one pipeline in the same repository.** One Python file per workflow,
and the command accepts a directory: `python -m panlabs.esteira gerar esteiras/`.

**A repository that cannot generate YAML.** There is a check-only mode that
writes nothing and only fails when the YAML diverges from a reference pipeline.
It is the entry point for repositories with an approval process over `.github/`.

:::warning
Do not delete the old workflows in the same pull request that adds the generated
ones. Do it in two: the first adds them and proves the two agree, the second
removes. In a single one, a generation failure leaves the repository with no
pipeline at all.
:::
