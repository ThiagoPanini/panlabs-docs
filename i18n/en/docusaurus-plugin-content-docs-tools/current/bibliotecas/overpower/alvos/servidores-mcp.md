---
title: MCP servers
description: The graft, one key inside a file that is yours, the slot whose landing place the scope decides, and targets derived rather than declared.
---

# MCP servers

Every other artifact overpower installs **copies**: a file or a directory appears
that was not there before, and `git status` shows it as new. An MCP server
**grafts**: one key appears inside a configuration document you already own and
already edit yourself, and `git diff` shows a change to your file rather than a
new one.

```bash
uvx overpower@latest install --mcp cloudflare --runtime claude-code
```

Because the destination is somebody else's file, yours and not overpower's, three
things follow, and all three are guarantees rather than incidental behaviour.

| Guarantee | What it means |
| --- | --- |
| The plan names the key | the last line before the write reads `.mcp.json › mcpServers.cloudflare ← claude-code`, the exact key inside the exact document |
| The rest of the document survives byte for byte | comments preserved, unknown root keys preserved, and a server already present is not reformatted |
| A server of the same name is overwritten | without asking and without `--force`, the same rule a colliding path follows |

Writing the whole file back out through a generic JSON serialiser would reflow it
regardless of whether anything meaningful changed, and `git diff` would stop
answering what the tool actually did versus what happened to be nearby.

:::warning
A configuration file that is *already* broken is **refused, never repaired**.
Editing a file that is not overpower's, on the tool's own initiative, is not
something an install is allowed to do.
:::

Where the runtime itself holds a freshly written server back from connecting, the
command says so. In Claude Code, a server written into `.mcp.json` is born pending
approval and stays inert until you approve it there, so the install prints that
warning naming the file, still at exit `0`, because the write succeeded and what
remains is a step that belongs to you.

:::warning
`doctor` reads the same fact the other way. A server pending approval is one of
its five **findings**, and a finding fails: an `install` that exited `0` followed
by a `doctor` on the same machine exits `3` over the same server, until you
approve it. In a pipeline that chains the two, approve first or split the steps.
:::

## `--global` writes your personal file instead

`--global` writes to one personal file per target instead of a repository one,
`~/.claude.json` for Claude Code, or the VS Code user profile, which is a
different path per operating system. That file is yours in a stronger sense than a
repository file: `~/.claude.json`, for instance, also carries your user ID and
onboarding state.

Nothing else in it is touched, and because a graft never replaces a whole file,
only adds a key, there is no approval gate either: a server written into your own
personal file is one you have already implicitly approved by having written it
yourself.

## A slot is declared as a name and a role, never as a value

A recipe declares a secret as a **slot**, a name and a role, never a value and
never a specific spelling. The address is a different thing: a base URL is not a
secret, and treating it like one would only leave the server unable to find what
it is supposed to talk to. That is why `server.env` is written into the file and
the slot is not.

```json
{
  "coolify": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@masonator/coolify-mcp@2.12.0"],
    "env": {
      "COOLIFY_BASE_URL": "https://vps.panlabs.tech",
      "COOLIFY_ACCESS_TOKEN": "${COOLIFY_ACCESS_TOKEN}"
    }
  }
}
```

Three slot roles exist, `env`, `header` and `bearer`. A `bearer` slot is rendered
as `Authorization: Bearer ${VAR}` without the recipe ever having to spell that
string out. No reference carries a default value, because `${VAR:-fallback}` syntax
is understood by exactly one runtime, and in every other runtime reading the very
same `.mcp.json` that whole expression is treated as a literal string.

## Where a slot's value lands depends on the scope

**Scope decides, and the ruler is where `git` reaches.** In repository scope what
lands is the reference above and nothing else: the file is versioned, and a
literal secret there travels on the first `push`. In machine scope the file is not
versioned, and `install` **asks for each slot's value and writes it literally**, so
that one run leaves the configuration complete instead of ending with a notice
that the variable is yours to export.

| Scope | What lands | Who fills it in |
| --- | --- | --- |
| repository | `${VAR}`, and nothing else | you, by exporting the variable |
| machine | the value you type, literal | the question asked during `install` |
| VS Code | `inputs[]` with `password: true` | the editor itself, which stores it under OS protection |

The question is **masked**, and the value is never echoed, neither on screen nor in
any output of the product. An already exported variable is offered as the default
inside that same masked field, so someone who exported the token to try the server
by hand confirms with one keystroke, without it ever being drawn.

Four rules close the behaviour, and none of them is implicit:

- **off a terminal, or with `--yes`, nothing is asked**, and what lands is the
  reference, exactly as before;
- **a value already stored is kept and not asked for again**, and `--force`
  reopens the question, because a stored value is what occupies the destination;
- **an empty answer writes `${VAR}` back**, which is the documented gesture for
  taking the secret out of the file;
- **`--dry-run` never asks**, and announces how many slots the real line would ask
  about.

:::warning
A secret written in machine scope lives in a file `git` does not reach, and that is
what authorises the write. Do not repeat the gesture in a versioned file: in
repository scope overpower refuses to write the value, and pasting one by hand
publishes the secret on the first `push`.
:::

## Targets are derived, never declared

`list --mcp` prints a `targets` line for every recipe, but there is no `targets`
field anywhere in the recipe file itself.

Which pairs of runtime and scope a given recipe can actually serve is computed
from its transport and the roles of its slots against a table in code, and printed
fresh every time. A declared field would go stale silently the day a runtime
gained the capability to receive that server; a derived one cannot, because it is
recomputed from the current table on every read.

:::note
Each target printed is a **pair**, a runtime and the scope it reads that server
in. A recipe that no target can serve at all prints `none` rather than an empty
line, because the empty list and the answer *none* are different things.
:::
