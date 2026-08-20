---
title: Install
description: How to get overpower, the op shortcut that is deliberately not installed, and the flag that proves the package arrived whole.
---

# Install

There is nothing to install, in the usual sense, to try overpower once. Pick the
manager you already use.

## Getting it

<CodeGroup>

```bash title="uvx"
uvx overpower@latest install --skill panlabs-python-standards --runtime claude-code
```

```bash title="uv tool"
uv tool install overpower
uv tool upgrade overpower
```

```bash title="pipx"
pipx install overpower
pipx upgrade overpower
```

</CodeGroup>

`uvx` downloads the package into an isolated, ephemeral environment, runs it, and
throws the environment away. Nothing is left on the machine except whatever
overpower itself wrote: no global site-packages entry, no leftover virtualenv,
nothing to uninstall later because you tried a flag once. This is the right way
to run overpower from CI, from a one-off terminal, or from any context where
*installed forever* is the wrong default.

If you reach for overpower often enough that typing `uvx overpower@latest` every
time is friction, install it as a persistent tool. That puts an `overpower`
executable on your `PATH`, resolved once instead of on every invocation, which
means it no longer self-updates the way `@latest` does, and `uv tool upgrade`
becomes something you run on purpose.

## What it needs from the machine

**Python 3.12 or newer.** That is the floor the package declares, and `uvx`
respects it on its own: it builds the environment with an interpreter that
qualifies, downloading one if the machine has none that does.

The dependencies ship with the package and you install nothing by hand. There
are four, all of them terminal work: the command-line parser, the screen
painter, the engine behind the wizard's questions, and the keyboard layer under
it.

The catalog is **not** one of them. It is embedded in the package itself, which
is why the version of the tool is the version of the catalog.

## `--version` as proof the package arrived whole

```bash
uvx overpower@latest --version
```

`--version` reads the version from the package's own installed metadata, not from
a string hardcoded somewhere in the source. Since the catalog is embedded in the
same wheel as the code, the version number it prints is also, by construction, the
version of the catalog that came with it.

:::note
It is the cheapest available check that what landed on the machine is what was
supposed to land: no partial install, no stale cache masquerading as current, no
ambiguity about which catalog you are about to install from.
:::
