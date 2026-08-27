---
title: The federated bundle
description: How a repository declares what it offers in a single .overpower.yaml at its root, and what that changes in the plan.
---

# The federated bundle

A **bundle** is a named composition, and a repository federates one by writing
`.overpower.yaml` at its root. The same file also declares the MCP servers the
repository offers: **one file, one format, one reader**.

## Write the manifest

```yaml
bundles:
  api-python:
    description: Everything needed to work on the Python API.
    items:
      - skill:fastapi-conventions
      - skill:pytest-fixtures
      - mcp:my-server

mcp:
  my-server:
    description: The internal catalog server, run as a local process.
    transport: stdio
    server:
      command: "npx"
      args: ["-y", "@internal/catalog-mcp@1.4.0"]

  sourced-server:
    description: The server our own repository maintains.
    source:
      git: https://github.com/acme/catalog-mcp
      ref: v1.4.0
      runner: uvx
      entrypoint: catalog-mcp
```

| Field | What it accepts |
| --- | --- |
| `bundles.<name>` | the name `--bundle` asks the composition by |
| `bundles.<name>.description` | the sentence `list` prints in full, never truncated |
| `bundles.<name>.items` | **names carrying the namespace as a prefix**, `skill:<name>` or `mcp:<name>`, resolved inside that same repository. Never a path |
| `mcp.<slug>` | the name `--mcp` asks the server by, with the whole recipe inside |
| `mcp.<slug>.source` | the **address** of the server's code: `git`, `ref`, `runner` and `entrypoint`, all four required. Whatever declares `source` declares neither `transport`, nor `server.command`, nor a runner precondition, because those three become derived |

That file is read by the **same reader** that reads the catalog overpower ships,
so a malformed manifest is refused naming the same field on both sides and there
is no second validator anywhere to disagree with the first. `items` reach neither
the embedded catalog nor a third repository, and a name that does not resolve
exits `3` and says which name.

**The file is optional.** A repository that never wrote one is not broken: its
skills stay listed and installable, and what is missing is only what the
declaration would have said.

:::warning
**The previous convention is not read, and there is no compatibility window.** A
repository still carrying `.overpower/mcp/<slug>.toml` at its root and no
`.overpower.yaml` exits `3`, naming the files it found and the one file to write
instead. The alternative would be the silent half: list the skills, omit the
servers, exit `0`, describing the repository as offering less than its author
declared.
:::

:::warning
**The prefix in `items` has no compatibility window either.** An entry with no
prefix, or with a prefix outside the closed set, is refused by name. Every
`items` written before has to gain its `skill:`, and it holds the same for the
embedded catalog and for a federated one. The reason is that a bundle now
reaches an MCP server, and without the namespace a bare name would be ambiguous
between the two.
:::

## The anatomy of the manifest

The manifest nests up to four levels, and that is the ceiling: a fifth one never
showed up in any federated repository, and a declared ceiling is what keeps the
file from turning into a map of the whole catalog.

<ResponseField name=".overpower.yaml" type="object">
  Everything the repository declares, in a single file, at its root.

  <Expandable title="fields">
    <ResponseField name="bundles" type="object">
      The named compositions. Each key is the name `--bundle` asks it by.

      <Expandable title="fields">
        <ResponseField name="bundle-name" type="object">
          One composition.

          <Expandable title="fields">
            <ResponseField name="description" type="string">
              The sentence `list` prints in full, never truncated.
            </ResponseField>

            <ResponseField name="items" type="array">
              The names of the artifacts that make up the bundle, each carrying
              the namespace as a prefix: `skill:<name>` resolves against this
              same repository's `skills/`, `mcp:<name>` against the recipes this
              same file declares. Never a path, and never an address.
            </ResponseField>
          </Expandable>
        </ResponseField>
      </Expandable>
    </ResponseField>

    <ResponseField name="mcp" type="object">
      The MCP server recipes, under the same key and through the same reader as
      the embedded catalog.
    </ResponseField>
  </Expandable>
</ResponseField>

## Install from a federated bundle

```bash
uvx overpower@latest install --from https://github.com/owner/repo --bundle api-python
```

:::note
There is no cache. Every `--from` run fetches fresh, by decision. Remote content
changes on someone else's schedule, and a locally cached copy would silently
defeat the entire reason `--from` exists.
:::

## What changes about the plan

What changes about the plan is only [provenance](../conceitos). The confirmation,
the `--dry-run` mirror and the write mechanics are the same as for content from
the embedded catalog.

**The declaration is anchored at the root, not reached.** A `tree/<ref>/<path>`
subpath narrows what `--skill` searches, and does not move the file `--bundle`
and `--mcp` read: a vendored dependency carrying its own `.overpower.yaml` speaks
for its own repository, and letting it answer would change what this repository
is said to offer.
