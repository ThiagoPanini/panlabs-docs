---
paths:
  - "content/**/*.md"
  - "content/**/*.mdx"
  - "contracts/**/*.json"
  - "src/pages/**/*.js"
---

# Content, what the information architecture asks for

Nothing here is enforced by machine. One more page breaks no build, and no sweep checks the counts below, they describe today's tree, and go stale quietly.

**Two of these sections reach `src/pages/`, and the rest don't.** Voice and Em dash apply to any published prose, routes included. Prohibition by location, The depth ceiling, and the diagram sections are about the collection's tree and the components that live in it: a route under `src/pages/` has no tab, no sidebar and no depth.

## Prohibition by location

`<Steps>` is `Procedimentos`'s backbone and doesn't enter `Jornadas`, without that split the reader can't tell why the page isn't in the other tab. `<CardGroup>` doesn't enter a jornada index, because a grid has no order and the trait that justifies the type is ordering by time.

## The depth ceiling

It's **4**, and it's **confined** to two branches: `content/ferramentas/bibliotecas/overpower/` closes at 4 and `content/jornadas/api-owner/` closes at 3. Outside those two, nothing passes level 2. The rationale is in [Decisions § A Sidebar Category Is Not a Destination](../../DECISIONS.md#a-sidebar-category-is-not-a-destination).

## Voice

**`you` plus imperative. Zero first person**, everywhere the site documents something. The collection is personal in what it chooses to document, not in its grammar.

**One exception, and it's the root.** The landing talks *about* the collection instead of documenting inside it, and it's written in the first person. Scoped to `src/pages/`; nothing under `content/` inherits it. Rationale in [Context § House voice](../../CONTEXT.md#the-collection).

## Em dash

**Zero `—` in published prose.** That means `content/`, `contracts/`, and a route's own copy under `src/pages/`. The em dash is machine-written text's tell, and this repo's product is a site meant to be looked at. The way out is a comma, a colon, parentheses, or the sentence rewritten, **chosen one at a time**: the em dash is legitimate Portuguese punctuation, and swapping it for one fixed character produces a truncated sentence or doubled punctuation.

The rule is scoped by INTENT, and the cost of that is written down: a path list is checkable with one search, an intent is not, and this repo has no automated gate left to lean on. It was widened anyway because the version scoped to `content/` and `contracts/` stopped exactly at the most-looked-at page on the site.

Applies to a co-located diagram's `.drawio.svg` too, where the label shows up twice, once in the rendered `<text>`, once in the XML embedded in the `content` attribute.

**The exception is quoting a tool's own output**: inside a code fence, in a generated page's `api_exemplos:` line, or in a `"message"` value, where the em dash is what the tool printed.

It does **not** reach a repo document nobody publishes: `AGENTS.md`, `CONTEXT.md`, `DECISIONS.md`, `docs/agents/` and these rule files are written for a reader who is looking for the em dash, not at it.

Check by hand: `grep -rn '—' content/ contracts/ src/pages/`. In a comment inside `src/pages/` it's fine, and that's the one place the search reports something the rule doesn't forbid.

## Broken link

`onBrokenLinks: 'throw'` only fires on `npm run build`. `docusaurus start` returns 200 with the SPA shell for any route, it will never warn you.

## Which tab of a diagram a page renders

A `.drawio.svg` draws one tab, whichever was open when the editor saved. To render a specific one, name it in the import:

```mdx
import Visao from './arquitetura.drawio.svg?aba=visao-geral';
import Rede from './arquitetura.drawio.svg?aba=rede';
```

The slug is the tab's own name, lowercased, without accents. A wrong slug fails the build naming the tabs the file actually has.

An import without `?aba=` still resolves to the master, so a single-tab diagram needs no query and gets no generated file.

Each tab named this way generates a committed sibling, `arquitetura.<slug>.svg`. Don't edit one, and don't open one in the diagram editor: draw in the tab, in the master. The dev server rewrites the sibling when you save the master, and writes a missing one when you change which tab an import asks for, with no restart either way. `npm run build` refuses a sibling older than the tab it came from, and never renders.
