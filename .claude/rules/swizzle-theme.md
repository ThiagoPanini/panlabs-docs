---
paths:
  - "src/theme/**/*.js"
  - "src/theme/**/*.mjs"
  - "src/theme/**/*.css"
---

# `src/theme/`, swizzle, and the ladder that precedes it

**High silent-failure risk**: a swizzle breaks when `@docusaurus/theme-classic` changes version, and no build breaks before that happens. Nothing here is enforced by machine, the discipline is by reading.

## Zero `unsafe`

A component marked `unsafe` in Docusaurus's ledger **doesn't get in** as a matter of convenience. The ladder exists to find the rung that reaches without going down that far.

## Before reaching for a swizzle

The ladder has cheaper rungs, and the discipline is climbing until you find the one that doesn't reach:

- **Rung 0** — an Infima variable, through the adapter in `src/css/tokens.css`.
- **Rung 1** — a stable class hook in `src/css/chrome.css`.
- **Rung 2+** — swizzle.

When adding a swizzle, write down **why the rung above didn't reach**. That's what makes the decision reviewable later; the rationale is in [Decisions § The Swizzle Ladder, and a Zero-Unsafe Budget](../../DECISIONS.md#the-swizzle-ladder-and-a-zero-unsafe-budget).

## What already lives here

`src/theme/Admonition/` (custom admonition types), `src/theme/MDXComponents/` (the authored component registry), and `src/theme/SearchBar/` (the search modal and its scoring ladder). Three different things share this folder without mixing.
