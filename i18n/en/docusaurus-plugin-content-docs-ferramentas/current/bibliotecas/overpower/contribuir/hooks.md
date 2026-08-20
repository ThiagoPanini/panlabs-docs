---
title: The two hooks
description: What lefthook runs before commit and before push, and what to do when one of them fails.
---

# The two hooks

`lefthook` installs two hooks in the clone, and both run before the commit
exists. They do not replace the pull request gates; they shorten the loop.

## What each hook checks

| Hook | Over what | What it rejects |
| --- | --- | --- |
| `pre-commit` | the staged set, in parallel | formatting outside the standard on staged `.py` files, lint on the same files, anything under `src/overpower/content/` hidden from git, and a secret found by `gitleaks` over the staged diff |
| `commit-msg` | the message | Conventional Commits with a lower-case subject, via `commitlint` |

:::warning
A subject-less run, where the directory does not exist or git tracks nothing under
it, is treated as failure, not as a vacuous pass. A gate that passes for having
nothing to check is a gate that disappears the day the path is renamed.
:::

## When a hook rejects

Read the output right there. When a hook rejects a commit, it prints the failing
command's own output straight to the terminal, at the moment of the rejection, so
there is no separate log to go find.

```bash
lefthook run pre-commit
```

Running the hook by hand, without committing, is how you check the fix before
trying again.

## When the machine lacks the tooling

`lefthook`, `gitleaks` and the tooling `commitlint` needs are equipment of the
machine, not of the repository. A clone on a machine without them loses the
shortcut by design, and still meets the same gate on the pull request.

```bash
lefthook install
```

:::note
Skipping a hook is possible with `git commit --no-verify`, and changes nothing
about the outcome: the pull request checks the same things, and the rejection
just arrives later.
:::
