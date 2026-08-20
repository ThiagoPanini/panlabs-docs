---
title: Contributing
description: The four-command loop for contributing to overpower, and what to run before opening the pull request.
---

# Contributing

This page covers the working loop for contributing to overpower: getting the
environment, and the four commands you run over and over. The hooks that run
without being asked live in [the two hooks](hooks).

## Before you start

`uv` installed, and a clone of the repository. There is no task runner, and the
absence is deliberate: `uv` already does what one would add.

## The steps

<Steps>
  <Step title="Run the four-command loop">
    The same four run in CI, from the same lockfile, so *it passed locally* and
    *it passed in CI* mean the same thing.

    ```bash
    uv run ruff format --check .          # formatting
    uv run ruff check .                   # lint
    uv run --group typecheck pyright      # types, strict
    uv run pytest                         # tests
    ```
  </Step>

  <Step title="Arm the hooks, once per clone">
    A worktree does not need its own `lefthook install`: it shares `.git/hooks`
    with the clone that owns it.

    ```bash
    lefthook install
    ```
  </Step>

  <Step title="Ask what has no test, when the question comes up">
    Coverage is a diagnostic, not a gate. No threshold lives in
    `pyproject.toml`, no badge, nothing in CI.

    ```bash
    uv run --with pytest-cov pytest --cov=src/overpower --cov-report=term-missing
    ```
  </Step>
</Steps>

## Checking it

Run the three checks the pull request will run, in the same order:

```bash
uv run pyright
```

```bash
uv run pytest
```

```bash
lefthook run pre-commit
```

All three have to exit `0`. `pyright` ends on `0 errors`, `pytest` closes with no
failure and no error, and `pre-commit` prints each task as `ok`. Any non-zero exit
is the same verdict the gate would hand down later.

:::warning
`pyright` runs `strict`, against the floor Python, `3.12`, never the version your
own interpreter happens to be. Run it without `uv run` and the local check uses a
different interpreter, which makes the result stop counting.
:::

## What the suite covers

`pytest` runs the whole suite, on every platform in the matrix. There is no marker
for *slow* and no tier that runs on one OS only, because what the suite tests is
disk behaviour, and disk behaviour is exactly what diverges between platforms.

:::note
The hook is the shortcut, not the gate. The gate is the ruleset on `main`, and a
ruleset has no `--no-verify`: the lists of who can bypass it are empty, including
for the repository's owner. What the hook buys is speed, catching the cheap error
cheaply before a push pays for a CI job.
:::
