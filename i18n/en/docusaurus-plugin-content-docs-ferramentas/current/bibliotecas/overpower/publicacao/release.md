---
title: Releasing
description: towncrier, the bump as an act of the author, and why publishing is merging.
---

# Releasing

This page covers how a change becomes a release: the changelog fragment every pull
request carries, towncrier assembling them, and the version bump as a deliberate
act of the author rather than a computed one.

## Before you start

A branch with the change ready and the local gate green. Publishing is merging: a
merge into `main` that moves the version in `pyproject.toml` creates the tag and
dispatches the release, and a merge that does not move it publishes nothing.

## The steps

<Steps>
  <Step title="Drop one fragment per pull request">
    Every pull request that changes behaviour drops one fragment into
    `changelog.d/`, named `<issue>.<type>.md`, where the type is one of
    `breaking`, `added`, `changed`, `deprecated`, `removed`, `fixed` or
    `security`.

    ```bash
    echo "What changed, in one sentence." > changelog.d/142.added.md
    ```
  </Step>

  <Step title="Bump to the level the fragments require">
    The level is not a judgement call. It is read from the types of the fragments
    sitting in `changelog.d/`.

    ```bash
    uv version --bump minor
    ```
  </Step>

  <Step title="Build the changelog">
    Entries in `CHANGELOG.md` are never written by hand. The issue number comes
    along for free in the filename, which is what turns the changelog into a
    navigable index back to the decisions.

    ```bash
    uv run towncrier build --version "$(uv version --short)"
    ```
  </Step>
</Steps>

## Checking it

`release-ready`, a required check alongside `gate`, refuses a pull request that
changes what lands in the wheel without also moving the version, and its failure
message prints the level it calculated and the two commands to run.

| Fragment type | Level while `0.x` | Level at `≥ 1.0` |
| --- | --- | --- |
| `breaking` and `removed` | minor | major |
| `added`, `changed` and `deprecated` | minor | minor |
| `fixed` and `security` | patch | patch |

:::note
`release-ready` only fires when a pull request touches the **wheel** trigger, which
is `src/`, `README.md`, `NOTICE`, `LICENSE`, `licenses/` or the `[project]` table of
`pyproject.toml`. A pull request confined to `docs/`, `tests/`, `.github/` or a
`[tool.*]` table merges without publishing anything.
:::

While the project is `0.x`, a break does not promote the first digit. That is
Semantic Versioning §4 read literally: nothing is stable yet, so nothing can break
stability. Reaching `1.0.0` stays a deliberate act of its own, and a pull request
that sets `uv version 1.0.0` passes, because the check enforces a **floor**, never
equality.

## Two gates, two different remedies

`gate` and `release-ready` are both required checks on `main`, and they are kept
deliberately separate rather than merged into one. `gate` means *the code is
sound*; `release-ready` means *merging this publishes*. The two failures have
different fixes, and one name per remedy is what lets a contributor, human or an
agent working autonomously, act correctly on the first read of a red check.

:::warning
Nothing entering `main` skips this. There is no bypass list, not even for the
repository's owner, because a bot pushing on the author's own credentials would
otherwise make *bypass* and *pushing as the agent* the same door.
:::
