---
title: Installing from a repository
description: Any GitHub repository as a search root, and how a tree path pins a branch, a tag or a commit.
---

# Installing from a repository

The catalog embedded in overpower ages by construction: it is fixed at the
version you have installed, and refreshing it means waiting for a new curation
pass. `--from` is the escape hatch that does not wait. It points at **any GitHub
repository, with no registration step**, and reads from there instead of the
embedded catalog.

## Before you start

A working local `git`, with the credentials you already use. overpower reuses
yours, so a private repository you can already clone works here too. If `git` is
unavailable, it falls back to fetching an anonymous tarball using only the Python
standard library.

## The steps

<Steps>
  <Step title="Ask what the repository offers">
    Bare, with no selector at all, `--from` prints that repository's
    **showcase**: the skills under `skills/`, the recipes under `.overpower/mcp/`,
    and the bundles declared in `.overpower/catalog.yaml`.

    ```bash
    uvx overpower@latest list --from https://github.com/owner/repo
    ```
  </Step>

  <Step title="Read one item whole before installing">
    Each of the three also takes a selector, so a single item can be read whole
    before anything is written. Every command the showcase prints carries the
    `--from` back, because an item read this way is not in the embedded catalog
    and the line without it would be answered by a different catalog.

    ```bash
    uvx overpower@latest list --skill some-skill --from https://github.com/owner/repo
    ```
  </Step>

  <Step title="Pin the reference and install">
    Appending `tree/<ref>/<path>` to the URL pins a branch, a tag **or a full
    commit SHA**. Pinning a SHA is what makes a `--from` install fully
    reproducible.

    ```bash
    uvx overpower@latest install --from https://github.com/owner/repo/tree/main/subfolder --skill some-skill --runtime codex
    ```
  </Step>
</Steps>

## Checking it

`--from` is **exclusive**. Once it is on the line, only the remote repository is
consulted: the embedded catalog is not searched at all, and not merged with the
remote either. That settles the question of precedence between the two by removing
it rather than answering it.

:::warning
The one flag `--from` refuses is `--ai-framework`, and the refusal is a statement
about the model rather than a queue position. A framework is a folder of
overpower's own wheel, so there is nothing in someone else's repository for the
flag to name. That line exits `2` before anything is fetched.
:::

The three selectors do not read the URL the same way. `--skill` and `--mcp` treat
it as a **search root**, and the repository, a subfolder, or the artifact's own
folder all reach the same result. `--bundle` and the bare showcase are **anchored**
at the repository root, so the URL's subfolder narrows nothing: what a repository
offers, and what it composes, are properties of the repository rather than of the
path you happened to paste.

## The federated bundle

A **bundle** is a named composition, and a repository federates one by writing
`.overpower/catalog.yaml` at its root.

```yaml
bundles:
  api-python:
    description: Everything needed to work on the Python API.
    items:
      - fastapi-conventions
      - pytest-fixtures
```

That file is read by the **same reader** that reads the catalog overpower ships,
so a malformed manifest is refused naming the same field on both sides and there
is no second validator anywhere to disagree with the first. `items` are **names**,
never paths, resolved against the skills that same repository offers under
`skills/`. They reach neither the embedded catalog nor a third repository, and a
name that does not resolve exits `3` and says which name.

:::note
There is no cache. Every `--from` run fetches fresh, by decision. Remote content
changes on someone else's schedule, and a locally cached copy would silently
defeat the entire reason `--from` exists.
:::

What changes about the plan is only [provenance](../conceitos). The confirmation,
the `--dry-run` mirror and the write mechanics are the same as for content from
the embedded catalog.
