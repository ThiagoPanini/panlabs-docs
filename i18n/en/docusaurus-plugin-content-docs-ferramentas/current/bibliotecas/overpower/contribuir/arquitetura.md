---
title: Architecture
description: The flow of one invocation through the modules, and two sibling content roots with opposite invariants.
---

# Architecture

This page maps the codebase for someone about to change it: the path a single
invocation takes through the modules, and the two sibling content roots. Their
invariants are opposites, and most of the surprising rules in this repository
descend from that split. If you are looking for *which module answers for what*,
go straight to the [module map](mapa-de-modulos).

## The flow of one invocation

`cli.py` parses the line and, in a terminal with a line that does not add up to a
full request, hands the gaps to `wizard.py`, in the order artifacts, scope,
runtimes, confirmation, because a later step can depend on an earlier one's
answer. Either way, what comes out is the same `Request`.

For the embedded catalog, `discovery.py` and `packaged.py` answer what exists by
walking `content/`. For `--from`, `remote.py` answers the same question by
obtaining a copy of a foreign repository. `planning.py` turns the `Request` into a
`Plan`, and every write passes through the single boundary in `writing.py`.

```bash
uvx overpower@latest install --skill panlabs-python-standards --runtime claude-code --dry-run
```

`--dry-run` is the cheap way to see that whole path without writing anything: it
stops at the boundary and prints the `Plan`.

## Two sibling roots, opposite invariants

Inside the package sit two content roots, siblings, and their invariants are
opposites.

| Root | What it carries | The invariant |
| --- | --- | --- |
| `src/overpower/content/` | the vendored trees, the pool of curated artifacts and the AI Frameworks | must land **100%**, byte for byte |
| `src/overpower/catalog/` | a single file, `catalog.yaml` | carries **only what the tree cannot know on its own** |

**`content/`** is copied content, never generated, and a partial landing is a
corrupted artifact nobody would notice at the point it happened.

**`catalog/`** holds the bundle definitions, which have no directory of their own
by construction, and one description line per AI Framework, which has no
`SKILL.md` to read a description from.

:::note
Nothing that a directory walk could answer lives there. A field that duplicated a
path the filesystem already knows would be a second source of truth for a fact that
has only one.
:::

## The three gates that guard the first root

| Gate | What it confirms |
| --- | --- |
| P1 | nothing under `content/` is hidden from git, and a gate with no subject never passes as green |
| P2 | the wheel carries the same set the git tree carries |
| P3 | the sdist carries exactly what it declared |

```bash
uv build
```

The second root has no dedicated gate, because losing it fails loudly rather than
quietly: a bundle vanishes from `list`, and `install` answers that it does not know
the name. What fails loudly does not need a gate; what fails silently is what the
three gates exist to catch.
