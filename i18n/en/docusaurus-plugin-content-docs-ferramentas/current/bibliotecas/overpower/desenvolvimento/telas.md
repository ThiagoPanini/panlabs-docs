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

## Structure in the gate, appearance in the snapshot

A full-session recording is a diff nobody reads: a small, deliberate visual
adjustment can touch half the bytes of a long capture, and a real regression can
hide inside that noise.

**The gate asserts structure**, with properties that carry meaning and that a
border or spacing tweak has no business touching: piped output carries no ANSI
codes at all, the banner is suppressed when there is no TTY, no description is
truncated at either 80 or 60 columns, no rendered line exceeds the terminal width,
and every path in the plan is also in the rendered output.

**The snapshot pins appearance**, one file per screen, so a redesign that touches
one screen shows up as a change to exactly one file.

:::warning
There is no snapshot plugin in this project. The comparator is small and lives in
`tests/support/snapshots.py`, alongside `--snapshot-update`, declared in
`conftest.py`. One dev dependency less, and the update path stays something you
read in the test file.
:::

## What is not a snapshot

The wizard's own selection screen, the list `questionary` draws for choosing
artifacts, is largely not this project's to record: the lines a person picks from
are drawn by `questionary`'s own `InquirerControl`, and recording someone else's
rendering pins someone else's future change.

What **is** this project's own drawing, the locked block, the viewport, the counter
and the footer around that list, is asserted structurally instead: question, static
block, viewport, counter and footer all have to fit within a real terminal's
height, and the viewport itself can never fall below a floor of visible rows.
Alongside that arithmetic, one PTY test proves that the surrounding chrome reaches
a real terminal at all, the same split used everywhere else on this page.
