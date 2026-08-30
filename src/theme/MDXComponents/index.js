/**
 * The catalog's global registry, rung 3 of the swizzle ladder.
 */

/* Mandatory version header, since the Docusaurus generator strips the
   license header on eject and there's nothing to diff against without it:

     ejected from @docusaurus/theme-classic@3.10.2 */

/* It's registration, not swizzle: the file is an object, and what happens
   to it is spreading the original and adding keys. No upstream logic line
   copied; `getSwizzleConfig` itself says it's meant to be ejected.

   What the upgrade costs: a new or removed key becomes a build error,
   never a runtime bug. */

/* Why everything is global and nothing gets imported: no content file
   writes an `import`. Reference measurement found zero snippet imports
   across the targets: authors don't import. A catalog that requires
   import is a catalog that turns into an inline `export const` in the
   file, over and over.

   Accepted cost, on the record: `MDXComponents` is imported by
   `MDXContent`, which wraps all MDX content, so this object ships in the
   bundle of every MDX page, with no tree-shaking. If that ever hurts,
   splitting off the three reference components (`ParamField`,
   `ResponseField`, `Expandable`) is mechanical and doesn't change the
   others' syntax.

   Closed trap: this file isn't annotated with
   `import type {MDXComponentsObject} from '@theme/MDXComponents'`. The
   alias would resolve to this very file and create a circular reference.
   The VALUE is imported from `@theme-original/` instead. */

/* TWO ELEMENT KEYS, and the difference between them is worth naming:
   `table` replaces the element with one of ours. `h1` wraps upstream's and
   adds a sibling, the subtitle. It's the first time this registry
   redefines an HTML element to add a node instead of swapping anatomy. */

/* Who's NOT here, and why:

   · `callout`: it's the native admonition. The syntax is `:::note`,
     reached through `src/theme/Admonition/Types.js`, the other rung-3
     registry.
   · `code-block`: it's the Markdown fence. Upstream already registers
     `pre` and `code`; what's missing is CSS over `.theme-code-block`
     (rung 1) plus `themeConfig.prism` (rung 2). */

import React from 'react';
import MDXComponents from '@theme-original/MDXComponents';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Accordion, {AccordionGroup} from '@site/src/components/Accordion';
import Card, {CardGroup} from '@site/src/components/Card';
import CodeGroup from '@site/src/components/CodeGroup';
import Expandable from '@site/src/components/Expandable';
import Frame from '@site/src/components/Frame';
import Icon from '@site/src/components/Icon';
import Steps, {Step} from '@site/src/components/Steps';
import Table from '@site/src/components/Table';
import Update from '@site/src/components/Update';
import {ParamField, ResponseField} from '@site/src/components/Field';

import CopyPage from './CopyPage';
import CommandPanel from './CommandPanel';

/**
 * The SUBTITLE, the line every page on the site gets below its title.
 *
 * It comes from the front matter's `description`, and there's a single
 * source: the same field that already feeds `<meta name="description">`,
 * `llms.txt`, and the search index. A component here would force the author
 * to type the same sentence twice and open the door to the subtitle and the
 * `<meta>` drifting apart.
 *
 * Why it fits at rung 3: the alternative was injecting a node into the
 * page body, which needs `DocItem/Layout` or `DocItem/Content`, both
 * `unsafe`, both off-limits. Anchoring on the `<h1>` through the registry
 * reaches it instead, and the condition that requires is checked: every page
 * writes its own `# Title`, and none writes two.
 *
 * Why it lives HERE and not in its own file: `src/components/` is the
 * CATALOG, each member reachable from MDX by its own tag and authored by
 * hand. The subtitle is none of that: it's chrome, has no catalog entry, and
 * the author never writes it themselves.
 *
 * It's required, and its absence BREAKS THE BUILD. Same doctrine as an
 * unknown icon name or a repeated `CodeGroup` label: fail loud, never
 * degrade silently.
 *
 * The order at the top of the page becomes `h1` → subtitle → body. The
 * subtitle is injected here, so it's born right below the title with no MDX
 * edits needed.
 *
 * The term `lead` stays dead and doesn't come back. The name is subtitle: a
 * term that already misled once doesn't get recycled with a new meaning.
 *
 * `useDoc` is public API from `@docusaurus/plugin-content-docs/client`,
 * already consumed by `CommandPanel` too. It throws outside a `DocProvider`,
 * and that's a feature, not an oversight: all MDX on this site is
 * documentation, and the day an `.mdx` is born outside `content/` is the day
 * to decide what its subtitle is, not the day to discover the page shipped
 * without one.
 */
const H1Original = MDXComponents.h1;

function Title(props) {
  const {frontMatter, metadata} = useDoc();
  const {description} = frontMatter;

  if (!description) {
    throw new Error(
      `Página sem \`description\` no front matter: ${metadata.source}\n` +
        'O subtítulo abaixo do título sai desse campo, e ele é obrigatório em ' +
        'toda página. Ver docs/design/chrome.md.',
    );
  }

  /* The TITLE ROW has two pieces, and the `<div>` holding them is the one
     new node this adds. It's `flex`, with the button pushed right by
     `margin-inline-start: auto`, the same anatomy as the anchor, measured:
     `h1` and the button as siblings, centered against each other.

     Is the subtitle still a sibling of `h1`? No, it's a sibling of the ROW
     instead. The rule that zeroed `h1`'s bottom margin via
     `:has(+ .subtitle)` moved target along with it: adjacent sibling
     margins collapse to the larger of the two, and the subtitle's measured
     indent only shows if the title's bottom air doesn't win.

     `.markdown h1:first-child` isn't shaken: it's still a DESCENDANT of
     `.markdown` and its parent's first child inside the row, and that
     selector is what carries `h1`'s type scale; losing it would bring back
     the type-scale defect this selector fixes. */
  return (
    <>
      <div className="title-row">
        <H1Original {...props} />
        <CopyPage permalink={metadata.permalink} />
      </div>
      <p className="subtitle">{description}</p>
    </>
  );
}

export default {
  ...MDXComponents,

  // The second ELEMENT key in this registry, and the one that changes the
  // screen the most: the subtitle is born glued to the title, inside the
  // same `<header>` Docusaurus's remark wraps around the MDX h1.
  h1: Title,

  // The other element key. Every Markdown table is born inside the
  // scrollable region; the author doesn't choose, and that's what makes the
  // accessibility fix reach the table nobody remembered to wrap.
  table: Table,

  // Consumed from Docusaurus as-is, global so `.md` reaches them with no
  // import. Zero swizzle: the missing anatomy is CSS-only.
  Tabs,
  TabItem,

  // The catalog components with their own MDX tag. `steps` accounts for two
  // keys (`Step` and `Steps`). The rest of the catalog has no tag: `callout`
  // is `:::`, `code-block` is the fence, `tabs` comes from Docusaurus above,
  // and `table` is the element key above.
  //
  // `CommandPanel` is NOT part of the catalog: it's a route's chrome, and
  // the note beside it explains why.
  //
  // Capitalized, not for style: in MDX v3 a lowercase tag is an HTML
  // element, and a `<card>` would come out as an unknown tag.
  Accordion,
  AccordionGroup,
  Card,
  CardGroup,
  CodeGroup,
  Expandable,
  Frame,
  Icon,
  // The one key in this registry no author writes, which is also why it's
  // the one key outside the component catalog: the only thing that emits
  // `<CommandPanel />` is `scripts/generate-reference.mjs`, in the body of
  // command pages. It enters through the same door as everything else,
  // since the registry is global and a flow block needs no route component
  // to exist.
  CommandPanel,
  ParamField,
  ResponseField,
  Step,
  Steps,
  Update,
};
