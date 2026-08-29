---
title: Catalog criteria
description: What earns a place in the embedded catalog, and what stays out by decision.
---

# What earns a place in the catalog

Three gates decide whether a candidate becomes an AI Framework, and the first one
that fails ends the evaluation. Read them in order, because the order is the
order of evaluation.

## The three gates, in order

| Order | Gate | What it refuses |
| --- | --- | --- |
| 1 | legal | content that is not redistributable inside the wheel |
| 2 | self-contained | content that needs tooling overpower cannot guarantee on the target |
| 3 | transformation at curation | content that would have to be transformed at install time |

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

## Why a graft reads the second gate differently

A graft reads the tooling clause differently, and without that difference the whole
class would be stillborn: nearly every stdio server launches through `uvx`, `npx`
or `docker`, and refusing anything that needs external tooling would refuse all of
them. The distinction is what actually lands. A copy puts content on disk that only
works with some tool; a graft puts nothing but a declaration on disk, and the recipe
names what it needs as a precondition, which overpower checks itself before writing.

## Check a candidate before proposing it

Open the item through the catalog and read the whole description, which is where
the decision to install is actually made:

```bash
uvx overpower@latest list --skill <name>
```

```bash
uvx overpower@latest doctor
```

:::note
`doctor` does not evaluate a candidate; it evaluates what already landed. It
belongs here because a graft that fails its precondition on your own disk will
fail on the disk of whoever installs it, and finding that out before the proposal
is cheaper.
:::
