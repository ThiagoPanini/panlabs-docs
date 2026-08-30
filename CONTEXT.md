# panlabs-docs

A reference documentation project built with Docusaurus. The content is a developer's personal learning collection; the product is its **structure** and **visual customization**.

## Language

### The collection

**panlabs**:
The collection the documentation is — a developer's learning record inside a company that's never named, and the site's `title`. It's **mixed**: mocked content and real content coexist, and the mocked kind gets replaced as real things show up.
_Avoid_: Trilho (the earlier fictional domain, dead)

**House voice**:
`you` plus imperative, across the whole site, with **zero first person**. The collection is personal in what it chooses to document, not in its grammar.

**Tab**:
One of the four top-level navigation axes — `Ferramentas`, `Jornadas`, `Procedimentos`, `Times`, in this order. Each is an instance of `plugin-content-docs`, one to one, because `routeBasePath` and versioning are per instance.
_Avoid_: section, area

**Page type**:
A **content** convention, never a layout one: no type owns its own CSS, front matter, or component. Each has a template, and the template can require, limit, or forbid a component.

**Jornada**:
A category of the `Jornadas` tab, and **a role the author put on** — not a topic. A role has a beginning, a middle, and a lesson learned, which is what keeps a jornada from turning into a `Procedimentos` category under another name.

**Sweep**:
The act of checking the `overpower` documentation published here **against the real tool** — its `--help`, its built-in catalog, its `CHANGELOG.md`.

**Drift**:
The divergence a sweep finds: a page or contract claiming something about the tool that's stopped being true. **Has no local symptom**, nothing in the build detects it.

**Verdict**:
What a sweep concludes, and the negative counts as much as the positive: `swept` means there was drift and it got fixed, `no-drift` means the sweep ran and there was nothing to change.

### The visual system

**Anchor**:
**Mintlify**, in the `mint` theme, with **Devin** as its one reference — the system panlabs-docs inherits by default. It dictates the look; where the project departs from it, that's a platform constraint, not a choice.
_Avoid_: inspiration, reference

**Skin**:
The swappable layer of the token system. Swapping the skin rebrands the entire documentation without touching layout, motion, or component.

**Swap surface**:
The ten lines of the `/* SKIN */` block, in the root layer, that get edited to rebrand the whole documentation. Editing outside it is **redesigning**, not rebranding.

**Layer**:
One of the token system's three tiers: **root** (the only place with a literal), **semantic** (color only, where the role is named and the mode resolved), and **component** (declared in the component's own scope, never at `:root`). Color always flows down through the semantic layer; dimension comes straight from the root.

**Derivation rule**:
No value enters the system as a literal, except in the root layer. Everything else comes from something already there, through a declared operation — relative syntax, `color-mix()`, or `calc()`.

**`pd`**:
The prefix on everything this repo's design system names — `--pd-*` in variables, `data-pd-*` in the parts contract, and the same `pd-` in keyframes and ids. Comes from `panlabs-docs`.

**Adapter**:
The block that assigns `--ifm-*` from `var(--pd-*)`. One-way: the system **never reads** an Infima variable, only writes. It's the boundary that keeps Docusaurus a consumer of the system instead of its foundation.

**Parts contract**:
The attributes the skin hooks into to repaint a component through CSS — `data-pd-component`, `data-pd-variant`, and `data-pd-part`. Can't be a CSS Module class, because the name gets hashed at build time. **State never becomes an attribute**.

### The frame

**Chrome**:
The navigation frame Docusaurus already provides — navbar, sidebar, TOC, pagination, breadcrumbs, search modal, footer. Not authored; **bent**, through Infima variables and swizzle.
_Avoid_: layout, theme

**Content component**:
What the author writes inside MDX, as opposed to chrome. A **closed catalog of sixteen**, all registered globally through `@theme/MDXComponents`: no content file imports anything, and there's no escape hatch — when a page needs an arrangement the catalog doesn't cover, the page changes.
_Avoid_: widget, block

**Subtitle**:
The line under the `h1`, on every page. **Not written by the author** — it's the front matter's `description`, the same field that feeds the `<meta>` tag and the search index. It's chrome, not a component, and a missing `description` breaks the build.
_Avoid_: lead, tagline

**Separator**:
The sidebar's **top** node, and it isn't a page: bold label, no link, no arrow, no icon, always expanded. The icon rule that follows from it is depth-agnostic — no icon on the separator, an icon on everything below it, leaf or group, at any level.
_Avoid_: top-level category, group

**Native substrate**:
The rule that no catalog component implements its own interactive behavior. Either the browser element delivers (`<details>`, `<a>`, `<table>`), or Docusaurus delivers (`Tabs`). Zero `keydown` written in the project.

**Icon manifest**:
The single registry of names and roles, in `src/icons/manifest.js`, which is **contract**; the drawings are skin and get swapped whole while keeping the names. A nonexistent name breaks the build, with a nearest-neighbor suggestion — never a placeholder, never silent degradation.
