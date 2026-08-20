---
title: Overview
slug: /
description: What overpower is, the three questions its three commands answer, and why the version you pin is the catalog you get.
---

# Overview

overpower is a CLI that installs curated agent equipment, skills, MCP servers and
whole frameworks of them, into a repository or onto a machine. It does not
scaffold, it does not generate, and it does not ask an LLM anything. It copies
files a curator already decided are worth having, and it grafts configuration a
runtime already knows how to read.

## Install in five steps

<Steps>
  <Step title="Run without installing">
    `uvx` downloads the package into an ephemeral environment, runs it, and
    throws the environment away. Nothing is left on the machine except whatever
    overpower itself wrote.

    ```bash
    uvx overpower@latest --version
    ```
  </Step>

  <Step title="See what is there">
    The catalog prints in four blocks, each entry with its size, its file count
    and its description in full.

    ```bash
    uvx overpower@latest list
    ```
  </Step>

  <Step title="Read the plan before any write">
    `--dry-run` resolves everything, prints every destination and who reads it,
    mirrors the real exit code, and never touches disk.

    ```bash
    uvx overpower@latest install --skill panlabs-python-standards --runtime claude-code --dry-run
    ```
  </Step>

  <Step title="Write">
    In a terminal the command asks before writing. Off a terminal it never asks,
    so the same line behaves identically inside a script.

    ```bash
    uvx overpower@latest install --skill panlabs-python-standards --runtime claude-code
    ```
  </Step>

  <Step title="Check that it is still standing">
    `doctor` answers whether what was written is still what was written, and
    exits `3` when it finds a problem.

    ```bash
    uvx overpower@latest doctor
    ```
  </Step>
</Steps>

## The three commands, and what each one answers

Every invocation of overpower answers one of exactly three questions.

| Command | Question | Answer |
| --- | --- | --- |
| `list` | What is there? | The catalog, or the whole content of one item in it. |
| `install` | Write it. | A plan, printed before anything touches disk, then the write itself. |
| `doctor` | Is it still what it was? | A report on the terminal and on the integrity of what was installed. |

Typed bare, overpower prints a banner and the top-level help, and exits `0`. Under
a pipe the banner is dropped and only the help goes through, so a `grep` or a
redirect to a file gets something worth reading.

:::info
`--version` reads the version from the installed package's own metadata, not from
a constant baked into the source. That is what makes it evidence the package
landed intact, rather than just a string that happened to be in there.
:::

## The first use, end to end

Three lines, in order, each answering one thing. Run inside a git repository.

```bash
# 1. what there is to install
uvx overpower@latest list

# 2. the plan, writing nothing
uvx overpower@latest install --skill panlabs-python-standards \
  --runtime claude-code --dry-run

# 3. the write, with the confirmation it asks for
uvx overpower@latest install --skill panlabs-python-standards \
  --runtime claude-code
```

Step 2 is what makes step 3 unsurprising: `--dry-run` resolves everything,
prints every destination and who reads it, mirrors the real exit code, and
writes nothing, not even an empty directory. What it prints is what step 3
writes.

Then the check:

```bash
uvx overpower@latest doctor
```

It exits `0` when the five checks pass and `3` when one finds a problem, and
never `1` for an unhealthy report. That is what makes it chainable in a
pipeline:

```bash
uvx overpower@latest install --skill panlabs-python-standards \
  --runtime claude-code --yes && uvx overpower@latest doctor
```

:::note
If you leave out `--runtime` in a terminal, the line does not refuse: it opens
the wizard on the step that was missing. In a pipe, the same line exits `2`. The
difference is in [Commands](/ferramentas/bibliotecas/overpower/comandos/indice).
:::

## Keeping the version current with `@latest`

The catalog is not fetched over the network at install time or at run time. It is
**embedded in the package**, and `list` reads it by walking the filesystem. That
single fact has a consequence that is easy to miss: the version of overpower is
the version of the catalog it carries. There is no separate catalog version to
track, and no way to get a newer catalog without getting a newer overpower.

`uvx` complicates this in one specific way. Run as `uvx overpower`, without a
version pin, it resolves the latest release the first time it is invoked and then
caches that resolution with no time-to-live. A bare `uvx overpower` today and the
same bare `uvx overpower` in six months can run the exact same build, and
therefore serve the exact same catalog. A catalog that never ages would be a
curiosity; a catalog whose staleness is invisible is a defect.

```bash
uvx overpower@latest list
```

:::warning
Pinning `@latest` is what breaks that cache on every invocation. Every line on
this site carries it, and not as house style copied from some other README, but
because it is the one spelling that keeps *the catalog you get* equal to *the
catalog that exists*.
:::

## Where to go next

<CardGroup>
  <Card title="Install" icon="download" href="/ferramentas/bibliotecas/overpower/instalacao">
    Getting overpower onto a machine, including the one shortcut it deliberately
    does not create for you.
  </Card>
  <Card title="Concepts" icon="book-open" href="/ferramentas/bibliotecas/overpower/conceitos">
    The vocabulary the rest of this site leans on without re-explaining.
  </Card>
  <Card title="Commands" icon="terminal" href="/ferramentas/bibliotecas/overpower/comandos/indice">
    What is true of every invocation, before you reach any single command.
  </Card>
</CardGroup>
