---
title: Development
description: The four-command loop, and the local hooks that guard every commit.
---

# Development

This page covers the working loop for contributing to overpower: getting the
environment, and the four commands you run over and over. It also covers the hooks
that run without being asked, and what each one rejects.

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

`pyright` runs `strict`, against the floor Python, `3.12`, never the version your
own interpreter happens to be. `pytest` runs the whole suite, on every platform in
the matrix. There is no marker for *slow* and no tier that runs on one OS only,
because what the suite tests is disk behaviour, and disk behaviour is exactly what
diverges between platforms.

:::note
The hook is the shortcut, not the gate. The gate is the ruleset on `main`, and a
ruleset has no `--no-verify`: the lists of who can bypass it are empty, including
for the repository's owner. What the hook buys is speed, catching the cheap error
cheaply before a push pays for a CI job.
:::

## The two hooks

The **`pre-commit`** hook runs over the staged set, in parallel, and rejects four
things: formatting outside the standard on staged `.py` files, lint on the same
files, anything under `src/overpower/content/` hidden from git, and a secret found
by `gitleaks` over the staged diff.

The **`commit-msg`** hook runs `commitlint`, checking Conventional Commits with a
lower-case subject.

:::warning
A subject-less run, where the directory does not exist or git tracks nothing under
it, is treated as failure, not as a vacuous pass. A gate that passes for having
nothing to check is a gate that disappears the day the path is renamed.
:::

`lefthook`, `gitleaks` and the tooling `commitlint` needs are equipment of the
machine, not of the repository. A clone on a machine without them loses the
shortcut by design, and still meets the same gate on the pull request. When a hook
rejects a commit, it prints the failing command's own output straight to the
terminal, at the moment of the rejection, so there is no separate log to go find.
