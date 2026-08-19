---
title: Shipping
description: The architecture, with the modules, the flow between them, and two sibling roots with opposite invariants.
---

# Shipping

This page maps the codebase for someone about to change it: the modules, what each
one is responsible for, and the path a single invocation takes through them. It
also covers the two sibling content roots and why their invariants are opposites,
because most of the surprising rules in this repository descend from that split.

## The module map

Everything lives under `src/overpower/`, flat. There is no package within a
package, because the project is single-context.

```bash
ls src/overpower/*.py | wc -l
```

| Module | Responsibility |
| --- | --- |
| `cli.py` | the command line, parsing, the `isatty()` gate, the exit codes |
| `discovery.py` | the tree **is** the catalog, and `list` discovers artifacts by walking it |
| `packaged.py` | where the two sibling roots live inside the package |
| `scope.py` | whether `cwd` is inside a git repository |
| `wizard.py` | the interactive wizard, and one `Request` out |
| `remote.py` | `--from`, with any GitHub repository as a search root |
| `planning.py` | `Request → Plan`, the one place a destination is decided |
| `writing.py` | the one write boundary, which executes the plan and reads nothing else |
| `written.py` | the only file overpower writes about its own content |
| `inspection.py` | what is on the disk of the target, and what is wrong with it |
| `screens.py` | what the product draws to the terminal |
| `recipes.py` | TOML in, a `Recipe` out |
| `rendering.py` | `(Recipe, document) → the grafts to make`, a pure function over values |
| `grafting.py` | surgical insertion into a document that is not overpower's |
| `runtimes.py` | the runtime path table |
| `jsonio.py` | the sanctioned way to reach the standard library's JSON reader |
| `errors.py` | the one exception the product raises on purpose |

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

## Two sibling roots, opposite invariants

Inside the package sit two content roots, siblings, and their invariants are
opposites.

**`src/overpower/content/`** carries the vendored trees, the pool of individually
curated artifacts and the AI Frameworks. It **must land 100%**: every file tracked
here has to reach the wheel byte-identical, because this is copied content, never
generated, and a partial landing is a corrupted artifact nobody would notice at the
point it happened.

**`src/overpower/catalog/`** is the opposite: a single file, `catalog.yaml`, that
carries **only what the tree cannot know on its own**, the bundle definitions, which
have no directory of their own by construction, and one description line per AI
Framework, which has no `SKILL.md` to read a description from.

:::note
Nothing that a directory walk could answer lives there. A field that duplicated a
path the filesystem already knows would be a second source of truth for a fact that
has only one.
:::

Two gates in CI guard exactly the first: one confirms nothing under `content/` is
hidden from git, the other confirms the wheel carries the same set the git tree
carries. The second root has no dedicated gate, because losing it fails loudly
rather than quietly: a bundle vanishes from `list`, and `install` answers that it
does not know the name. What fails loudly does not need a gate; what fails silently
is what the two gates exist to catch.
