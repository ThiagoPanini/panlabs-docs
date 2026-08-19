---
title: Exit codes
description: The four exit codes, the claim each one makes, and the axis that separates a defect in the line from a fact about the world.
---

# Exit codes

The exit code is the line's answer, and it means the same across the three
commands. This page is the table and the reasoning that decided it, and the same
table is generated onto the [root page](../comandos/overpower) from the contract.

## The table

| Code | Meaning |
| --- | --- |
| `0` | did what was asked |
| `1` | could not run |
| `2` | you invoked me wrong |
| `3` | ran, and the answer is no |

```bash
uvx overpower@latest doctor; echo "exited $?"
```

## The axis between `2` and `3`

The axis between `2` and `3` is **whose defect it is**, and that distinction is
exactly what makes both usable in a script or a CI pipeline, where *fix your
input* and *the input was fine and the answer is no* call for different
responses.

A `--runtime` value outside the closed table is `2`: the value you typed does not
exist anywhere, so the defect is in the line itself. A `--runtime` value that **is**
in the table, but has no destination in the scope you asked for, is `3`: the value
is real, the flag is real, nothing about the invocation is malformed, and the
destination simply does not exist for that pairing. That is a fact about the
world, not about what you typed.

:::note
The same reading applies to `--from`. A search root that could not be obtained at
all, network unreachable, repository not found, no read access, is `1`, and the
underlying transport's own error message is passed through unmodified, because
that message is the one that names the problem. Once the root **was** obtained and
searched, and the skill you asked for either is not there or is ambiguous, that is
`3`.
:::

## Why an unhealthy report is never `1`

`doctor` exits `3` when it found a problem, and `0` when it did not, never `1` for
an unhealthy result, because an unhealthy result is not a crash: the command ran
correctly and computed a real, negative answer. That distinction is what lets
`doctor` sit in CI right next to `install --dry-run` as a gate, because a script
can tell *the check ran and failed* apart from *the check itself broke* by exit
code alone, without parsing output.

```bash
uvx overpower@latest install --skill panlabs-python-standards --runtime claude-code --dry-run \
  && uvx overpower@latest doctor
```

A traceback never reaches the terminal. An exception the product does not
recognise as one of its own named failures becomes an error panel instead of raw
Python output, and exits `1`. That is itself a claim: it says the bug is in
overpower, not in what you typed.
