---
title: Curation
description: How vendored content is refreshed, and what a candidate has to be before it earns a place in the catalog.
---

# Curation

This page covers the two questions that decide what overpower carries: how content
vendored from upstream is refreshed without drifting, and what a candidate has to
be before it earns a place in the catalog.

## Before you start

The development environment set up, and the new upstream reference in hand.
Refreshing the catalog is something a person does by hand, on purpose, not a
scheduled job.

## The steps

<Steps>
  <Step title="Read the upstream manifest at the new reference">
    For `mattpocock/skills`, that is the `skills` array of
    `.claude-plugin/plugin.json`, and specifically never the `version` field
    beside it, which was measured standing still while the array itself moved.

    ```bash
    git -C ../skills show <ref>:.claude-plugin/plugin.json
    ```
  </Step>

  <Step title="Replace the tree and update attribution">
    If what lands is not the versioned tree verbatim, the transformation happens
    at curation time and the vendored output is what ships. Update `NOTICE`, with
    the reference and the commit per origin, and `licenses/` if the upstream's
    licence file moved.

    ```bash
    uv run pytest tests/test_content.py
    ```
  </Step>

  <Step title="Run the four commands, plus the network test">
    The test that touches the real GitHub is a curation step, not a gate.

    ```bash
    OVERPOWER_NETWORK_TESTS=1 uv run pytest -m network
    ```
  </Step>

  <Step title="Bump the version">
    The version of overpower is the version of the catalog it embeds, so a
    refresh nobody can install is not a refresh.

    ```bash
    uv version --bump minor
    ```
  </Step>
</Steps>

## Checking it

Confirm the new item shows up in the catalog and opens in full:

```bash
uvx overpower@latest list
```

```bash
uvx overpower@latest list --skill <name>
```

Bare `list` prints the catalog in four blocks, and the new item has to sit in the
block for its class. With the selector, the output carries the size, the file
count and the whole description, never truncated, plus the line that installs the
item.

:::warning
A gate blocks what this repository controls. What depends on a third party is
verified here, by hand, because automating a check against someone else's
repository would put a third party's availability and stability inside this
project's CI, which was measured unstable and rejected for exactly that reason.
:::

:::note
That last step is no longer something to remember. `src/overpower/content/` is
inside the wheel, so `release-ready` refuses the pull request until the bump
happens.
:::
