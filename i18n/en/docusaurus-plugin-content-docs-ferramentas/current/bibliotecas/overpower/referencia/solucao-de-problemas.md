---
title: Troubleshooting
description: The common refusals organized by the message you actually saw, what each one means, and what to do about it.
---

# Troubleshooting

This page is organized by the message you actually saw, quoted as overpower
prints it, so you can find your line by matching text rather than by guessing the
internal cause first. Wherever a message names a specific value, the runtime you
typed, the scope, a path, it appears here as `‹placeholder›`.

## The refusals, by message

| Message | Exit | What to do |
| --- | --- | --- |
| `not inside a git repository: pass --global to write under the home directory` | `2` | run inside a repository, or add `--global` |
| `unknown runtime ‹key›; the table is: ‹every known key›` | `2` | the key is not in the closed table; see [Targets](../alvos/indice) |
| `‹key› has no destination in ‹scope› scope` | `3` | drop `--global`, or pick a different runtime |
| `unknown skill ‹name›; the pool is: ‹every known skill›` | `2` | check the name against [Reference](indice) |
| `list shows one item at a time, and got ‹every flag›` | `2` | leave a single selector on the line |
| `‹name› is not an MCP server in this catalog` | `2` | move the value to the flag it belongs under |
| `already exists, use --force to overwrite: ‹the paths›` | `3` | add `--force`, or run interactively |
| `‹path› is not ours to repair, and it is broken` | `3` | fix the file by hand and run again |
| `--from ‹url› is not a GitHub repository URL` | `2` | fix the URL to a real repository address |

## The three that confuse people most

**`unknown runtime` versus `has no destination`.** Both are about `--runtime` and
leave by different codes on purpose. The first is `2` because the value exists
nowhere: the message lists every valid key, because there is no partial match and
no `--dir` escape hatch to fall back on. The second is `3` because the value is
real and what does not exist is the pairing: it happens for `eve` and
`promptscript` under `--global`, since neither declares a global destination.

**`vscode` exits `3` on the same axis with a different message, and that one says
nothing about scope:**

```
`vscode` takes MCP servers and has no skills destination of its own;
the runtimes that take one there are: ...
```

It has no skills destination in either scope, so the refusal holds with and
without `--global`. `--runtime vscode --mcp <name>` installs normally.

**`already exists`.** In global scope, off a terminal or under `--yes` or
`--dry-run`, a destination that already has content is refused rather than
silently replaced. Global scope has no `git status` to reveal or undo an overwrite
the way project scope does.

```bash
uvx overpower@latest install --skill panlabs-python-standards --runtime cursor --global --force
```

**`is not ours to repair`.** The MCP configuration file overpower would graft into
already fails to parse, for a reason of its own, most commonly invalid JSON.
overpower will not repair a file it does not own.

:::warning
Fix the file by hand first, then re-run the install. It refuses rather than
repairs because repairing a document that is yours, on its own initiative, is not
something an install is allowed to do.
:::

## When the output comes out wrong

When the problem is the screen rather than the write, `doctor` answers the four
facts that explain it without a round trip to ask: whether a TTY is attached, what
colour system was detected, the terminal width, and whether `NO_COLOR` is set.

```bash
uvx overpower@latest doctor
```

:::note
Output under a pipe never carries ANSI codes, and the banner is suppressed when
there is no TTY. If you are seeing escape sequences inside a redirected file, the
problem is not colour configuration, and it is worth reporting.
:::
