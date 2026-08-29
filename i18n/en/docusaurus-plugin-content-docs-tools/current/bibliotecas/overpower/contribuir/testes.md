---
title: Tests
description: The doctrine, with a real disk, one suite running whole across nine cells, and the network never inside a gate.
---

# Tests

This page covers how overpower is tested and why that shape was chosen: the disk
is real rather than mocked, there is one suite rather than a fast tier and a slow
tier, and it runs whole across the nine cells of the matrix.

## The doctrine in one table

| Question | Answer |
| --- | --- |
| filesystem double | **does not exist**, and `tmp_path` instead, always |
| `git` behind `--from` | **real subprocess**, against a local remote |
| the real GitHub | **outside every gate**, a curation act, with `OVERPOWER_NETWORK_TESTS=1` |
| plan against screen against disk | one assertion, the **three-way identity**, across all 9 cells |
| visual output | **structure in the gate**, one snapshot **per screen**, no colour, at 80 and 60 columns |
| interactive selection | the seam is a **stub**, and one PTY test proves the wiring |
| coverage | ephemeral diagnostic, **nothing** in `pyproject.toml` |

## The disk is real

`tmp_path`, always. No `FakeFileSystem`, no port, no `mock_open`, no environment
gate on a write test. A double that does not implement a real symlink and a real
junction stays green exactly where the product breaks, and every write path has to
exercise three concrete traps: removing a symlinked destination without writing
through it, removing a junction with the predicate that actually recognises one,
and installing over a previous version without leaving a stale file behind.

```bash
uv run pytest
```

:::warning
`os.path.islink()` is `False` for a junction, and `shutil.rmtree()` refuses it
anyway. That is Windows only, and the exclusion is keyed on `sys.platform`, never
on an environment variable, so it cannot be silently forgotten out of a workflow
file.
:::

## One suite, running whole across the nine cells

There is no *runs on one platform only* category, and no `slow` marker. Splitting
the suite does not buy time, because, measured, the fixed overhead of standing up
a job is comparable to the whole battery. And what gets tested here is disk
behaviour, which is precisely what diverges between the nine cells, three
operating systems times three Python versions.

Three absences are recorded as **known**, not as coverage: the no-symlink-privilege
case on Windows is not reproducible on hosted CI, because the runner image turns on
Developer Mode; PyPy has no `CreateJunction` and is not in the matrix; and building
a `questionary` prompt does not run on the Windows cells, because the construction
raises `NoConsoleScreenBufferError` in a process with no console screen buffer.

## The network never enters a gate

Whatever depends on a third party is verified by hand, at curation time, never by
automation on a pull request or a release. The end-to-end test against the real
upstream repository exists, is documented, and runs in no CI job.

```bash
OVERPOWER_NETWORK_TESTS=1 uv run pytest -m network
```

With the variable set, the skip condition can no longer be satisfied, so a network
test that gets renamed or lost turns red instead of quietly disappearing. The gate
is its own, named marker, never the generic `CI` variable every runner sets.

## The three-way identity

A `--dry-run` has to mirror not just the exit code of a real run, but its content:
the set of paths a dry run announces, the set a real run announces, and the set
actually found on disk after the real run all have to be the *same* set.

That single assertion proves three properties at once, and it runs across all nine
cells, because the property most likely to break by platform, path separators,
`Path` versus `PurePosixPath`, a filesystem that ignores case, is exactly the kind
of bug that passes green on a single cell.

:::note
The identity also drives the design, not just the test: the writer consumes the
plan and nothing beyond it. A writer that recomputed a path could diverge from what
the screen promised, and no later test would close that gap.
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
