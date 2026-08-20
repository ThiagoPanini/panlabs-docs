---
title: The op shortcut
description: Why overpower ships no op executable, and how to write your own alias without shadowing the 1Password CLI.
---

# The `op` shortcut

Typing `overpower` in full, every time, is longer than most people want. The fix
is a shell alias, written by you, in your own profile.

## Pick the alias name

Pick the name before you write the line. Run `command -v op` and read what comes
back: a path means that name is already taken on your machine.

| What `command -v op` answers | Write the alias as |
| --- | --- |
| nothing | `alias op='uvx overpower@latest'` |
| `/usr/local/bin/op` or another path | `alias opw='uvx overpower@latest'` |
| an alias you set yourself | change the name, or accept replacing it |

```bash
alias op='uvx overpower@latest'
```

:::warning
If you already use 1Password's `op`, pick a name that does not collide. Only you
know what occupies that name on your machine, which is why the decision is left
to you, as a line you type once, rather than baked into what the package
installs.

```bash
alias opw='uvx overpower@latest'
```
:::

## Why the tool ships no `op`

overpower does not create this alias for you, and does not ship an `op`
executable. That is a deliberate omission, not an oversight. `op` is already the
name of the 1Password CLI, which lives at `/usr/local/bin/op` on a great many
developer machines and typically sits ahead of `~/.local/bin` on `PATH`. Shipping
a second `op` would silently shadow a credential tool, and `uv` will refuse the
entire installation the moment it detects a name collision among tools it
manages, so even the honest failure mode costs you the `overpower` command too.

## Where the alias does not apply

An alias is a convenience of an interactive shell and nothing more. It does not
expand under `sh -c`, which is how a Makefile target and many CI runners invoke a
command, so `op` inside one of those contexts fails with *command not found*
regardless of what your shell profile defines. That costs nothing in practice,
because the line a Makefile, a CI workflow, or this site itself actually writes is
the full `uvx overpower@latest` anyway.

:::note
Write the line in the file your shell reads on startup, `~/.zshrc` or
`~/.bashrc`, and open a new terminal for it to take effect. To check it, run
`op --version` and read back the version the [installation](instalacao) page
describes.
:::
