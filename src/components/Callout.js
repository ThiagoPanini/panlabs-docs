/**
 * `callout`, the body of the native admonition.
 */

/* Not registered in `MDXComponents`: it's reached through
   `src/theme/Admonition/Types.js`, the registry that swaps Docusaurus's
   `type → component` map. The root `Admonition` (which is `unsafe`) stays
   untouched and dispatches by type into the map; from there the DOM is
   ours, with no upstream line copied. Infima's 5px side bar and uppercase
   title band don't exist because we never write them, and this DOM isn't
   `.alert`.

   Four variants, and the author doesn't pick an icon: the icon carries the
   variant's semantics. */

import React from 'react';
import clsx from 'clsx';
import Icon from './Icon';
import styles from './catalog.module.css';

/**
 * One glyph per variant, fixed. `info` is the neutral variant, `note` is
 * blue, the inversion is deliberate.
 *
 * One map per variant, not two maps with the same keys, since two parallel
 * tables are how a variant ends up with a glyph and no class.
 *
 * The variant lands in the DOM twice, on purpose: as a module class, since
 * that's what our CSS paints with (specificity (0,1,0)), and as
 * `data-pd-variant`, since that's what the skin repaints with
 * (specificity (0,2,0), which wins with no `!important`). Our CSS never reads
 * `data-pd-*`; if it did, the two layers would tie and load order would
 * decide. `info` has no class because it's the neutral variant, and neutral
 * is the default `.callout` already declares.
 */
const VARIANTES = {
  note: {glifo: 'pencil-line', classe: styles.calloutNote, tamanho: 'sm'},
  info: {glifo: 'info', classe: undefined, tamanho: 'md'},
  tip: {glifo: 'lightbulb', classe: styles.calloutTip, tamanho: 'md'},
  warning: {glifo: 'triangle-alert', classe: styles.calloutWarning, tamanho: 'md'},
};

/* No `id` prop: a callout isn't a link target on this site (navigation
   anchors are headings, which Docusaurus already anchors on its own). Add it
   back together with the call site the day a callout needs its own
   address. */
export default function Callout({variant, title, children}) {
  const {glifo, classe, tamanho} = VARIANTES[variant] ?? VARIANTES.info;
  return (
    <div
      className={clsx(styles.callout, classe)}
      data-pd-component="callout"
      data-pd-variant={variant}>
      <Icon name={glifo} size={tamanho} />
      {/* No `data-pd-part` on the body: it's the only `<div>` child, sibling
          to an `<svg>`, so the skin reaches it through `> div`. The title
          needs one, since it's a `<p>` among the `<p>`s the author writes,
          and no type selector separates it from them. */}
      <div className={styles.calloutContent}>
        {title ? (
          <p className={styles.calloutTitle} data-pd-part="title">
            {title}
          </p>
        ) : null}
        {children}
      </div>
    </div>
  );
}
