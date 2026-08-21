---
title: The federated bundle
description: How a repository federates a named composition in .overpower/catalog.yaml, and what that changes in the plan.
---

# The federated bundle

A **bundle** is a named composition, and a repository federates one by writing
`.overpower/catalog.yaml` at its root.

## Write the manifest

```yaml
bundles:
  api-python:
    description: Everything needed to work on the Python API.
    items:
      - fastapi-conventions
      - pytest-fixtures
```

| Field | What it accepts |
| --- | --- |
| `bundles.<name>` | the name `--bundle` asks the composition by |
| `description` | the sentence `list` prints in full, never truncated |
| `items` | **names**, never paths, of the skills that same repository offers under `skills/` |

That file is read by the **same reader** that reads the catalog overpower ships,
so a malformed manifest is refused naming the same field on both sides and there
is no second validator anywhere to disagree with the first. `items` reach neither
the embedded catalog nor a third repository, and a name that does not resolve
exits `3` and says which name.

## The anatomy of the manifest

The manifest nests up to four levels, and that is the ceiling: a fifth one never
showed up in any federated repository, and a declared ceiling is what keeps the
file from turning into a map of the whole catalog.

<ResponseField name="bundles" type="object">
  Every composition this repository federates, under a single key.

  <Expandable title="fields">
    <ResponseField name="bundle-name" type="object">
      One composition. The key is the name `--bundle` asks it by.

      <Expandable title="fields">
        <ResponseField name="description" type="string">
          The sentence `list` prints in full, never truncated.
        </ResponseField>

        <ResponseField name="items" type="array">
          The skills that make up the bundle, in the order the plan writes them.

          <Expandable title="fields">
            <ResponseField name="name" type="string">
              The skill name, as it appears under `skills/` in the same
              repository. Never a path.
            </ResponseField>

            <ResponseField name="provenance" type="string">
              Always `federated`. The reader fills it from the `--from` that
              fetched the manifest, not from the file.
            </ResponseField>
          </Expandable>
        </ResponseField>
      </Expandable>
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
