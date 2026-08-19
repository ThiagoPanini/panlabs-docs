---
title: Commands
description: The shape of the line, with selectors that mix freely and a plan that always runs in the same order.
---

# Commands

Before any single command, two things hold across all of them. This page is what
comes before the four pages beside it, which come out of the command surface
contract rather than out of this prose.

## Selectors compose

`--ai-framework`, `--bundle`, `--skill` and `--mcp` are **selectors**, flags that
name what a line is about. Every one of them accepts a comma-separated value, a
repeated flag, or both, and they accumulate rather than override.

```bash
overpower install --skill one-skill --skill another-skill --bundle api-python,another-bundle
```

Mixing selectors of different kinds on a single `install` line is the normal
case, not an edge case. `--ai-framework matt-pocock --skill some-other-skill
--mcp cloudflare --runtime claude-code` is one ordinary invocation, not three
commands stitched together.

The `--runtime` on that line is not decoration. **A skill and an MCP server
together require the runtime named**, and the refusal lands before any lookup in
the catalog or on disk:

```
a skill and an MCP server on one line need --runtime named explicitly,
or two separate commands, one per class
```

The reason is that the two classes write into different tables, and not every
runtime is in both. Without the runtime on the line, the wizard would have to
open two steps of different shapes at once, and it is one gesture. Exit `2`.

:::note
`list` is the one place this does not hold. It answers about a single item, so
more than one selector on a `list` line is a question with two answers, and the
command refuses rather than silently picking one.
:::

## The plan runs in one fixed order

When a line resolves to writes across more than one unit, a framework and an
individual skill on the same `install`, say, the writes always happen in the same
order. It is not the order you typed the flags in.

| Order | Unit | Why here |
| --- | --- | --- |
| 1 | AI Framework | the broadest unit, and the least specific |
| 2 | Bundle | more specific than a framework, less than an artifact |
| 3 | Individual artifact | you named it directly, so it wins |
| 4 | MCP server | not a copy but a graft, and it lands in a file of yours |

The order matters most where two selections would land on the same destination.
Rather than raising an error for that overlap, the fixed order decides it: the
most specific unit is written last, so its content is what survives on disk.

```bash
overpower install --ai-framework matt-pocock --skill panlabs-python-standards --runtime claude-code
```

## The wizard opens the gap, not the screen

In a terminal, an `install` line that does not add up to a plan opens the wizard
instead of refusing. The trigger is the **gap**, not the empty line: it is enough
to be missing what to install, or missing the runtime.

It opens only the steps your line left open, always in this order:

<Steps>
<Step title="Artifacts">
What to install. Opens only when the line named no artifact, framework, bundle or
MCP server.
</Step>
<Step title="Scope">
Project or machine. Opens only when the line carried neither `--runtime` nor
`--global`, because scope is what decides the set the next step offers.
</Step>
<Step title="Runtimes">
Who receives it. Pre-ticked with whatever the tool found on disk.
</Step>
<Step title="Confirmation">
The whole plan, before the first byte.
</Step>
</Steps>

What it collects becomes exactly the request the hand-typed line would have
built. `--dry-run`, `--force` and `--yes` are not steps and travel through the
session untouched.

:::warning
**Backing out of any step abandons everything**, and does not resume at the
previous step. Nothing is written, and the exit is `1`. It is the same
all-or-nothing shape the final confirmation has.
:::

Off a terminal the wizard never opens: the same incomplete line falls into the
same two errors it always did and exits `2`. That is what makes a partial
invocation in a pipe fail early instead of hanging for an answer.

## The four pages beside this one

`overpower`, `list`, `install` and `doctor` are generated from the command
surface contract, and none of them is written by hand. What you read on them is
the projection of the contract: the options, the exit codes and the panel's usage
line all come out of the same JSON, which is why they cannot drift from the table
above without the drift showing up in the diff of whoever touched the contract.

This page is the exception in the section, and it is the exception on purpose: it
is the only authored leaf here, and the right-hand panel does not exist on it. Its
four siblings paint the panel from `api_exemplos`; this one goes through the leg
of the switch that merely delegates, and the contrast between the two sits in the
same section, one click apart.
