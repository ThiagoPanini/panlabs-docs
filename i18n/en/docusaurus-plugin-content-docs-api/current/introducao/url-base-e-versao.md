---
title: Base URL and version
description: One base for both environments, and how the Trilho-Version header replaces a version in the URL.
---

# Base URL and version

## One base only

```
https://api.trilho.dev/v1
```

There is no second base for the sandbox. The environment is decided by the
key, not the URL — see [Authentication](autenticacao#the-environment-lives-in-the-key).
This means an integration can switch from sandbox to production by
changing **one line of configuration**, without touching any other part of
the code that builds requests.

The `v1` in the path is not the same mechanism as the version described
below. It exists for the day — not planned — when a change is too large to
fit in a header, and that is why it belongs to the URL and not the header:
a path change is always a deliberate, rare event, unlike header-based
versioning, which changes with every release.

## Version by header, not in the URL

```http
Trilho-Version: 2026-01-15
```

Every account is created with a fixed version — the latest one on the day
the key was created — and stays on it **until someone asks otherwise**.
Sending the header on a specific request overrides the account's version
only for that call; not sending it uses the account's fixed version.

This is the opposite of what most REST APIs do, and it is deliberate: an
integration that upgrades versions on its own, with every release, is an
integration that can break on a deploy nobody on your team made. Trilho
prefers version upgrades to be a conscious act — read the
[Changelog](/docs/operacao/changelog), decide whether the change matters to
your integration, and only then declare the header with the new version.

### How to migrate versions

<Steps>
<Step title="Read the target version's changelog">

Each [Changelog](/docs/operacao/changelog) entry lists what changed and,
when applicable, what breaks contract — a removed field, a narrowed enum, a
new status your integration does not recognize.

</Step>
<Step title="Test in the sandbox with the header pinned">

Send `Trilho-Version` explicitly on every call from your test environment,
with the target version's value, before touching production.

</Step>
<Step title="Upgrade the account's version" icon="check">

A call to `PATCH /conta` — outside the scope of this reference — declares
the new version as the default. From then on, calls without the header use
the new version.

</Step>
</Steps>

### What a version never does

:::note[A contract-breaking change is always a new version]

A field that changes type, an enum that loses a value, a resource that
changes shape — none of these changes land on an existing version. They
wait for the next version date, documented ahead of time in the changelog.
New fields, new endpoints, and new **additive** enum values arrive at any
time, in any version — they are the only changes Trilho considers
compatible.

:::

This is what makes it safe to pin a version and never touch it again: the
worst that can happen is the integration missing out on a new resource,
never breaking.

## Version format

The version is a date, in `YYYY-MM-DD` format — the day the release's
change set took effect. Dates are not comparable by the arbitrary
alphabetical ordering a semantic version number would need; they already
sort correctly, and that is why the format was chosen: `2026-01-15` is
visibly earlier than `2026-03-01`, with no conversion table to consult.
