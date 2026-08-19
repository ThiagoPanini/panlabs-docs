---
title: Changelog
description: What changed in each published version of overpower, in reverse chronology, assembled from the fragments each pull request left behind.
---

# Changelog

Reverse chronology, one entry per published version. Entries are not written by
hand: every pull request that changes behaviour drops a fragment into
`changelog.d/`, and the release assembles them. Since the project is `0.x`, a break
does not promote the first digit, and the whole rule is on
[Releasing](release).

The groupings by minor exist for the navigation column. A list of thirty entries
with no heading is a list nobody walks.

## 0.25.x

<Update label="0.25.1" tag="fixed">
  **`doctor` no longer reports `0 artifacts · 0 places` over a repository whose
  only installation is an MCP server.** The count was fed from the copy class
  alone, trees sitting in a runtime path, so a written graft sat two lines below a
  block headed *what is installed* without being in the number.

  **Both landing classes count now**, and the decision came from consistency
  rather than taste. The two are counted apart and added, never merged into one
  set: the pool namespaces by type, so a skill and a server may share a name, and a
  union would answer one where the disk holds two.
</Update>

<Update label="0.25.1" tag="fixed">
  **A configuration file with no JSON in it is refused in this product's words
  instead of the parser's.** A 0-byte `.mcp.json` answered *Expecting value: line 1
  column 1 (char 0)*, about a file that has no line 1 and no column 1. Empty and
  whitespace-only are now named before the reader is called, each in its own words.
</Update>

## 0.25.0

<Update label="0.25.0" tag="added">
  **The bundle crosses `--from`.** A repository declares its compositions in
  `.overpower/catalog.yaml` at its root, and `install --bundle <slug> --from <url>`
  equips a whole context of work in one command. `list --bundle <slug> --from
  <url>` shows what the bundle names first, so the decision is made with the
  contents in view.

  The manifest goes through the **same reader** as the catalog that ships, so a
  malformed manifest is refused naming the same field on both sides.
</Update>

## 0.24.x

<Update label="0.24.0" tag="changed">
  **The one file overpower writes about its own content is now YAML.**
  `catalog.toml` became `catalog.yaml` inside the wheel, and the reader that
  decodes it goes through a sanctioned module that answers `object`.

  **Nothing answers differently**: `list`, `install` and `doctor` print what they
  printed, byte for byte, and the same files land on disk. What the move buys is
  *one* reader. It costs one guarantee: TOML had no key type but string, so a table
  key is now checked where it used to be cast.
</Update>

<Update label="0.24.0" tag="fixed">
  **A skill description written as a YAML block no longer arrives with the block
  marker inside the text.** `description: >` produced *"> first half second half"*,
  because the frontmatter was read by a parser written here by hand instead of by
  YAML. **The hand-rolled parser is gone**, and it was invisible while the product
  only read its own content.
</Update>

## 0.23.x

<Update label="0.23.0" tag="changed">
  **The documentation site is now canonical, and `README.md` shrinks to point at
  it.** The six pages of the contributing sidebar carry real prose: the development
  loop and local hooks, the testing doctrine, how a screen is snapshot-tested, the
  module map and the two sibling content roots, how vendored content is curated,
  and how a release ships.
</Update>

## 0.22.x

<Update label="0.22.0" tag="added">
  **`--from` answers the question before the name, *what does this repository
  offer?*** `list --from <url>` with no selector prints that repository's showcase
  in one command, and `install --from <url>` with no selector opens the **same
  wizard** anyone already knows, with the remote catalog in place of the embedded
  one.

  The showcase is **anchored**: it walks `<repository>/skills/**` plus
  `<repository>/.overpower/mcp/*.toml`, and ignores the URL's subpath entirely,
  because an offer is a property of the repository and not of the path someone
  pasted. The price is declared rather than hidden, and **2 of the 75 `SKILL.md`
  measured** fall outside the anchor and stay installable by name.
</Update>

## 0.21.x

<Update label="0.21.4" tag="fixed">
  **A configuration file carrying the same key twice is refused instead of written
  into.** Every parser measured resolves a repeated key by the **last** occurrence,
  and the graft landed on the **first**: `install` exited `0`, reported `1 write · 1
  file`, named the key in its plan, and the runtime went on reading the user's old
  value.

  The refusal is **narrow by construction**: it covers the keys the graft actually
  looks up to decide where to land, and nothing else.
</Update>
