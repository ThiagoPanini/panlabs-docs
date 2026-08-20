---
title: Screens
description: How a screen is tested, with structure in the gate and one snapshot per screen, and how to update a snapshot deliberately.
---

# Screens

This page covers the terminal output as a tested surface: what a snapshot
captures, which screens have one, and how to update a snapshot deliberately rather
than by accident. It draws the line between what the gate asserts about structure
and what the snapshot pins about appearance.

## Before you start

The suite running locally, and the understanding that colour does not break a test
here. Layout does. Splitting the assertion in two is what keeps both cheap.

## The steps

<Steps>
  <Step title="Run the screens on their own">
    Recorded screens live in `tests/snapshots/`, one plain-text file per screen,
    captured at 80 and 60 columns, without colour.

    ```bash
    uv run pytest tests/test_screens.py
    ```
  </Step>

  <Step title="Update only when the change was deliberate">
    Rewriting a snapshot is an explicit act, never a side effect of running the
    suite.

    ```bash
    uv run pytest --snapshot-update tests/test_screens.py
    ```
  </Step>

  <Step title="Read the diff before committing">
    If the diff after updating touches a screen you did not mean to change, that
    is the signal the change had a wider blast radius than intended.

    ```bash
    git diff --stat tests/snapshots/
    ```
  </Step>
</Steps>

## Checking it

Run the screen tests alone and read the diff, if there is one:

```bash
uv run pytest -k snapshot
```

With no screen change, the run closes with no failure. With one, `pytest` prints
the diff between the recorded screen and the new one, line by line. **Read the
diff before re-recording**: it is the only review a screen ever gets.

```bash
uv run pytest -k snapshot --snapshot-update
```

:::warning
Re-recording without reading the diff turns the snapshot into a rubber stamp. The
test starts recording what the tool does instead of what it should do, and stops
failing at exactly the moment you would need it to.
:::

## What a snapshot records

A snapshot is taken from the rendered console, with
`Console(record=True).export_text()`, never from the raw stream of bytes a
terminal would receive. Those two are not the same thing: the raw stream also
carries the transient progress bar's cursor-control sequences, which describe an
animation rather than the screen a person actually sees at the end.

:::note
Each snapshot renders a **fixture**, not the shipped catalog, so a content
refresh, a skill added or a description reworded upstream, does not rewrite screens
that have nothing to do with content.
:::
