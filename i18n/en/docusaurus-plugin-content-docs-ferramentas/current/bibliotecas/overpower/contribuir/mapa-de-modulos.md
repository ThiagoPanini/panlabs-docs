---
title: Module map
description: Which overpower module answers for what, and what each internal boundary guarantees.
---

# The module map

Everything lives under `src/overpower/`, flat. There is no package within a
package, because the project is single-context.

## The table

Look here before you open a file. The right column is what the module answers
for, and what it does not answer for belongs to another one.

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
| `yamlio.py` | the sanctioned way to reach the YAML reader, and the catalog's door |
| `errors.py` | the product's exception root, with the two subclasses that separate `2` from `3` |

## Check the map against the disk

The map ages if a module is born without entering it. Count the files and compare
against the rows of the table:

```bash
ls src/overpower/*.py | wc -l
```

```bash
ls src/overpower/*.py | xargs -n1 basename
```

:::note
One more module on disk than in the table is documentation drift, not a defect of
the tool. Add the row, with the responsibility written from the point of view of
someone looking for where to make a change.
:::

## The boundaries the map draws

Three names in the table are boundaries, not just files. `planning.py` is the one
place a destination is decided, so a question about *where this lands* starts
there. `writing.py` is the one write boundary, and it executes the plan without
reading anything else, which is what makes `--dry-run` cheap to trust.
`errors.py` holds the two subclasses that separate exit `2` from exit `3`, which
is why changing the exit code of a refusal means changing its class, never a bare
number in the middle of the flow.
