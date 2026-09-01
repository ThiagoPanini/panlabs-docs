---
paths:
  - "content/**/*.md"
  - "content/**/*.mdx"
  - "contracts/**/*.json"
---

# Content, what the information architecture asks for

Nothing here is enforced by machine. One more page breaks no build, and no sweep checks the counts below, they describe today's tree, and go stale quietly.

## Prohibition by location

`<Steps>` is `Procedimentos`'s backbone and doesn't enter `Jornadas`, without that split the reader can't tell why the page isn't in the other tab. `<CardGroup>` doesn't enter a jornada index, because a grid has no order and the trait that justifies the type is ordering by time.

## The depth ceiling

It's **4**, and it's **confined** to two branches: `content/ferramentas/bibliotecas/overpower/` closes at 4 and `content/jornadas/api-owner/` closes at 3. Outside those two, nothing passes level 2. The rationale is in [Decisions § A Sidebar Category Is Not a Destination](../../DECISIONS.md#a-sidebar-category-is-not-a-destination).

## Voice

**`you` plus imperative. Zero first person, no exception**, across the whole site. The collection is personal in what it chooses to document, not in its grammar.

## Em dash

**Zero `—` in `content/` and `contracts/`.** The em dash is machine-written text's tell, and this repo's product is a site meant to be looked at. The way out is a comma, a colon, parentheses, or the sentence rewritten, **chosen one at a time**: the em dash is legitimate Portuguese punctuation, and swapping it for one fixed character produces a truncated sentence or doubled punctuation.

Applies to a co-located diagram's `.drawio.svg` too, where the label shows up twice, once in the rendered `<text>`, once in the XML embedded in the `content` attribute.

**The exception is quoting a tool's own output**: inside a code fence, in a generated page's `api_exemplos:` line, or in a `"message"` value, where the em dash is what the tool printed.

Check by hand: `grep -rn '—' content/ contracts/`.

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

Each tab named this way generates a committed sibling, `arquitetura.<slug>.svg`. Don't edit one, and don't open one in the diagram editor: draw in the tab, in the master. The dev server rewrites the sibling on save, and `npm run build` refuses a sibling older than the tab it came from.
