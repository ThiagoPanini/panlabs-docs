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

Check the version the pull request carries, before opening it:

```bash
uv version
```

The number printed has to sit above what `main` publishes. After the merge and
the deploy, confirm PyPI serves the new version:

```bash
uvx overpower@latest --version
```

The output is the same version `uv version` showed. While PyPI has not propagated
yet, `@latest` keeps answering with the previous one.

:::note
`release-ready` is a required check alongside `gate`, and it refuses a pull
request that changes what lands in the wheel without also moving the version. The
failure message prints the level it calculated and the two commands to run; the
level table lives in [release-ready](release-ready).
:::

:::warning
`uvx overpower@latest` caches what it has already downloaded. If the new version
does not show up, force the fetch instead of concluding the deploy failed.
:::
