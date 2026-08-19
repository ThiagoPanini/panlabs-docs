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
--mcp cloudflare` is one ordinary invocation, not three commands stitched
together.

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
