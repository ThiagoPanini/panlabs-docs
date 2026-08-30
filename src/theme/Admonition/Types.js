/**
 * The admonition's `type → component` map, rung 3 of the swizzle ladder.
 */

/* Mandatory version header, since the Docusaurus generator strips the
   license header on eject and there's nothing to diff against without it:

     ejected from @docusaurus/theme-classic@3.10.2 */

/* Why here, not in `Admonition/Layout`: that would be rung 5, `--eject` of
   a `safe` component, with manual reconciliation on every upgrade and
   upstream a11y fixes that never arrive with no warning. Not needed: this
   file is an object, and nothing forces its entries to point at
   `@theme/AdmonitionLayout`. They point straight at our `Callout`, and
   from there the whole DOM is ours, with no upstream line copied.

   The root `Admonition` stays `unsafe` and stays untouched: it dispatches
   by type into this map, and that's all we need from it. */

/* Why four keys, not nine: upstream registers five types plus four legacy
   aliases. Here it's `note`, `info`, `tip`, and `warning`, and each
   absence has a reason:

   · `danger` measured at zero usage;
   · `caution` is deprecated in Docusaurus's own code (`TODO remove before
     v4`);
   · `check` was merged into `tip`: measurement showed the two
     pixel-for-pixel identical across two different systems, and keeping
     two names for the same drawing is vocabulary debt;
   · `secondary`, `important`, and `success` are legacy aliases upstream
     keeps with a fixed, untranslated label.

   What happens with a missing type is known and accepted: the root
   `Admonition` warns in the console and falls back to `info`. No broken
   screen.

   Restoring a type is one line here. `admonitions.keywords` is a public
   option, declared per content-plugin instance. The mechanism stays
   documented and unexercised. */

import React from 'react';
import Callout from '@site/src/components/Callout';

const AdmonitionTypes = {
  note: (props) => <Callout variant="note" {...props} />,
  info: (props) => <Callout variant="info" {...props} />,
  tip: (props) => <Callout variant="tip" {...props} />,
  warning: (props) => <Callout variant="warning" {...props} />,
};

export default AdmonitionTypes;
