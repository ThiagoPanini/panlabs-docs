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
    **showcase**: the skills under `skills/`, plus the bundles and MCP servers
    the `.overpower.yaml` at its root declares.

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

Run the same line with `--dry-run` before writing anything:

```bash
uvx overpower@latest install --from https://github.com/owner/repo --skill <name> --dry-run
```

The output lists the destination path of every file and the provenance of each.
The provenance should point at the repository you named; if it cites the embedded
catalog, the URL was not read as a search root.

After installing, confirm what landed:

```bash
uvx overpower@latest doctor
```

`doctor` closes at **zero findings** when the installation is sound, and exits `0`.

:::note
A name the remote repository does not have exits `3`, not `2`. That is the
difference `--from` makes to the error model, and it lives in
[exit codes](../referencia/codigos-de-saida).
:::

## What `--from` consults

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

The three selectors do not read the URL the same way. Only `--skill` treats it as
a **search root**, and the repository, a subfolder, or the artifact's own folder
all reach the same result. `--bundle`, `--mcp` and the bare showcase are
**anchored** at the repository root, in the `.overpower.yaml` that lives there, so
the URL's subfolder narrows nothing: what a repository offers, and what it
composes, are properties of the repository rather than of the path you happened to
paste.

**`--mcp` stopped walking**, and the change follows the format: the recipe became
part of the declaration, so it is anchored along with it.
