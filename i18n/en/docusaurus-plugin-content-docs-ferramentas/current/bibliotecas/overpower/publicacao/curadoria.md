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

A gate blocks what this repository controls. What depends on a third party is
verified here, by hand, because automating a check against someone else's
repository would put a third party's availability and stability inside this
project's CI, which was measured unstable and rejected for exactly that reason.

:::note
That last step is no longer something to remember. `src/overpower/content/` is
inside the wheel, so `release-ready` refuses the pull request until the bump
happens.
:::

## What earns a place in the catalog

Three gates decide whether a candidate becomes an AI Framework, and the first one
that fails ends the evaluation.

The first is **legal, and it is a veto**. The content has to be redistributable
inside the wheel. Anything not MIT requires a composed SPDX expression in the
metadata, otherwise the package would misrepresent itself to exactly the audience
deciding whether it clears a corporate licence allow-list.

The second is **being self-contained**. What lands has to work without tooling
overpower cannot guarantee on the target. Failing here is not *this framework was
rejected*, it is *this is not an AI Framework under this model*, because being
self-contained is identity, not a quality bar to clear.

The third is that **transformation happens at curation**. If what ships is not the
tree exactly as versioned upstream, the transformation happens during curation,
with the transformed output vendored. The product itself never transforms content
at install time.

:::warning
The criterion lives in the curator's judgement, not in a field on the catalog. A
field that recorded *this passed* would just be a constant, since the catalog only
ever contains things that already passed.
:::

A graft reads the tooling clause differently, and without that difference the whole
class would be stillborn: nearly every stdio server launches through `uvx`, `npx`
or `docker`, and refusing anything that needs external tooling would refuse all of
them. The distinction is what actually lands. A copy puts content on disk that only
works with some tool; a graft puts nothing but a declaration on disk, and the recipe
names what it needs as a precondition, which overpower checks itself before writing.
