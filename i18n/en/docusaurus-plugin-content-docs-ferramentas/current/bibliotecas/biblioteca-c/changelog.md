---
title: Changelog
description: What changed in each version of Library C, in reverse chronological order, with contract breaks marked.
---

# Changelog

Reverse chronological order, one entry per published version. A contract break
takes a major, and the list of what counts as a break is the same for every
package in the house: it is in
[The versioning policy](/jornadas/api-owner/a-politica-de-versao).

The groupings by major exist for the navigation column: a list of twenty entries
with no headings is a list nobody scans.

## 4.x

<Update label="4.0.0" tag="break">
  **Generation now rejects third-party actions without a pinned version.** It was
  a warning; it became a rejection, which is why the version is a major.
  Repositories that reference by tag need to switch to the commit identifier
  before upgrading.

  Two smaller changes came along: the error pointer now names the step position,
  and `panlabs.toml` gained the permissions section.
</Update>

## 3.x

<Update label="3.4.0">
  **Check-only mode.** `--conferir` compares the committed YAML with what the
  Python produces and writes nothing. It is the entry point for repositories with
  an approval process over `.github/`.
</Update>

<Update label="3.3.1">
  Fix: `padrao.python()` emitted the scanning step before the installation step
  when the Python version was declared explicitly. The order is now stable.
</Update>

<Update label="3.3.0">
  **Importing existing workflows.** `panlabs.esteira importar` reads
  `.github/workflows` and writes the equivalent Python. It deletes nothing:
  adoption is still two pull requests.
</Update>

<Update label="3.2.0">
  `padrao.python()` now accepts `versao`, and the value feeds both `setup-python`
  and the image used by the container targets.
</Update>

<Update label="3.1.0">
  **Generated-file header.** Every emitted YAML opens by saying it is generated
  and pointing at the Python file it came from. Without it, the first reaction of
  whoever finds the file is to edit it.
</Update>

<Update label="3.0.0" tag="break">
  **`Esteira(em=...)` now requires a list.** Accepting both a string and a list
  made `em="pull_request"` and `em=["pull_request"]` produce different YAML in one
  edge case, and neither was wrong enough to fail.
</Update>

## 2.x

<Update label="2.7.0">
  First version published to the internal index. Before that the library lived as
  a copied directory, which is exactly the problem it exists to solve.
</Update>
