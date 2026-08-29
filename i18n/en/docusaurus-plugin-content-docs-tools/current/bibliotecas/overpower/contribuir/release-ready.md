---
title: Release-ready
description: The check that refuses a pull request changing the wheel without moving the version, and the two remedies.
---

# Release-ready

`release-ready` refuses a pull request that changes what lands in the wheel
without also moving the version, and its failure message prints the level it
computed and the two commands to run.

## What each of the two gates means

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

## The level the check computes

The level comes from the changelog fragment type, and depends on whether the
project has passed `1.0`:

| Fragment type | Level while `0.x` | Level at `≥ 1.0` |
| --- | --- | --- |
| `breaking` and `removed` | minor | major |
| `added`, `changed` and `deprecated` | minor | minor |
| `fixed` and `security` | patch | patch |

While the project is `0.x`, a break does not promote the first digit. That is
Semantic Versioning §4 read literally: nothing is stable yet, so nothing can break
stability. Reaching `1.0.0` stays a deliberate act of its own, and a pull request
that sets `uv version 1.0.0` passes, because the check enforces a **floor**, never
equality.

## When the check fires

```bash
uv version --bump minor
```

:::note
`release-ready` only fires when a pull request touches the **wheel** trigger, which
is `src/`, `README.md`, `NOTICE`, `LICENSE`, `licenses/` or the `[project]` table of
`pyproject.toml`. A pull request confined to `docs/`, `tests/`, `.github/` or a
`[tool.*]` table merges without publishing anything.
:::
