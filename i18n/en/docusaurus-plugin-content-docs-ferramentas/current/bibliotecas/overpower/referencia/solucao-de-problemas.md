---
title: Troubleshooting
description: The common refusals organized by the message you actually saw, what each one means, and what to do about it.
---

# Troubleshooting

{/* cita-saida-de-ferramenta */}

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
| `a skill and an MCP server on one line need --runtime named explicitly` | `2` | name the runtime, or split it into two commands |
| `nothing to install: name at least one --skill, --ai-framework, --bundle or --mcp` | `2` | say what to install, or run in a terminal and let the wizard ask |
| `‹key› has no MCP document in ‹scope› scope` | `3` | pick another scope, or another runtime |
| `‹path› is not in ‹owner›/‹repo› at ‹ref›` | `3` | the `--from` subpath does not exist at that ref |
| `‹source› offers nothing to install` | `3` | the repository has neither directory `--from` looks for at its root |
| `no skill named ‹name› under ‹source›` | `3` | check the name against what that repository offers |
| `‹name› is ambiguous under ‹source›: ‹the paths›` | `3` | point `--from` at one of them |
| `no bundle named ‹name› in ‹source›` | `3` | same, for a bundle |
| `the bundle ‹name› of ‹source› names ‹item›, which is not among the skills that repository offers` | `3` | the bundle manifest is broken on their side |
| `` `--from` names where to look, and no --skill and no --mcp name what to look for `` | `2` | add a selector, or run in a terminal and let the showcase open |
| `` `--from` on `list` shows skills, MCP servers and bundles `` | `2` | drop `--ai-framework`; a framework is a folder of the wheel, and does not exist remotely |

### The refusals by class name

The table above is indexed by the message, which is what you see. When what you
have is the exception name, from a traceback, a CI report, or reading the
source, come in here:

| Class | Exit | The message it prints |
| --- | --- | --- |
| `TooManySelectorsError` | `2` | `list shows one item at a time, and got ‹every flag›` |
| `MixedClassesWithoutRuntimeError` | `2` | `a skill and an MCP server on one line need --runtime named explicitly` |
| `NothingToSearchForError` | `2` | `` `--from` names where to look, and no --skill and no --mcp name what to look for `` |
| `UnsupportedRemoteListUnitError` | `2` | `` `--from` on `list` shows skills, MCP servers and bundles `` |
| `UnsupportedRemoteUnitError` | `2` | `` `--from` installs skills, MCP servers and bundles `` |
| `OutsideRepositoryError` | `2` | `not inside a git repository: pass --global to write under the home directory` |
| `NothingSelectedError` | `2` | `nothing to install: name at least one --skill, --ai-framework, --bundle or --mcp` |

The last three rows of the message table, and the first three of this one, are the
same refusal seen from both sides.

### The three messages that carry an em dash

Three refusals carry a literal em dash, and the table above abbreviates them
because a table row is not a quotation. They leave the terminal exactly like this:

```text
a skill and an MCP server on one line need --runtime named explicitly, or two separate commands — one per class

`--from` on `list` shows skills, MCP servers and bundles — an AI Framework does not exist remotely: it is a folder of the overpower's own wheel, and --ai-framework names one of those

`--from` installs skills, MCP servers and bundles — an AI Framework does not exist remotely: it is a folder of the overpower's own wheel, and --ai-framework names one of those
```

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

## The five findings of `doctor`

A **finding** is a defect in what landed, and one alone takes `doctor` to exit
`3`. There are five, and the list is closed.

| Finding | What it means | What to do |
| --- | --- | --- |
| dangling link | a landed write points at something that is not there | reinstall the artifact, or remove what is left over |
| link turned text | a file inside landed equipment is a link target and is spelled as content | reinstall; the copy lost the link on the way |
| divergence | two copies of one artifact, in one scope, do not agree on content | reinstall to reconcile, and decide which scope owns it |
| pending approval | a server was written into a graft Claude Code gates, and it has not approved it | approve the server in the runtime, outside overpower |
| runner gone | a graft rendered from a `source:` recipe names a runner that is no longer on `PATH` | install the runner the recipe asks for, `uvx` or `npx`, or remove the graft |

On screen, each finding comes out with the path involved right below the name,
and the exit is `3`:

```text
  _____   _____ _ __ _ __   _____      _____ _ __
 / _ \ \ / / _ \ '__| '_ \ / _ \ \ /\ / / _ \ '__|
| (_) \ V /  __/ |  | |_) | (_) \ V  V /  __/ |
 \___/ \_/ \___|_|  | .__/ \___/ \_/\_/ \___|_|
                    |_|

  installs curated agent equipment   v0.27.3
╭─ terminal  how this screen is set up ────────────────────╮
│                                                          │
│  tty       yes                                           │
│  colour    truecolor                                     │
│  width     60 columns                                    │
│  NO_COLOR  unset                                         │
│                                                          │
╰──────────────────────────────────────────────────────────╯

╭─ integrity  what is installed ───────────────────────────╮
│                                                          │
│  2 artifacts · 3 places                                  │
│                                                          │
│  dangling link                                           │
│    .agents/skills/panlabs-python-standards-old/  ←       │
│    ../../.claude/skills/panlabs-python-standards-old     │
│                                                          │
│  copies of `panlabs-python-standards` differ             │
│    .agents/skills/panlabs-python-standards/              │
│    .claude/skills/panlabs-python-standards/              │
│                                                          │
╰──────────────────────────────────────────────────────────╯
```

## The notice of `doctor`

A **notice** is an observation about the environment, not about what landed. It
does **not** fail: a run carrying only notices exits `0`.

| Notice | What it means | What to do |
| --- | --- | --- |
| unset slot | a graft reads a slot out of the environment, and this environment lacks it | set the variable, or accept that this server does not come up here |

:::note
Finding and notice are product vocabulary, and each definition lives in
[concepts](../conceitos). What separates the two is the exit code, which is why
they travel in separate lists.
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
