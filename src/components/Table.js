/**
 * `table`, plain Markdown plus a scroll wrapper.
 */

/* The author writes a Markdown table and no tag at all: this component is
   reached through the `table` key of `MDXComponents`, so every table on
   the site is wrapped.

   It's the only place in the catalog where ARIA appears, because HTML has
   no element for this: without `role="region"` plus `tabindex`, a keyboard
   user can't scroll a wide table. A region with no accessible name is a
   defect, so the label is required.

   It also fixes an unnamed Infima defect: the framework declares
   `table { display: block; overflow: auto }`. That solves overflow and
   costs dearly, since `display: block` strips table semantics from the
   accessibility tree, and the scrolling container isn't focusable. The
   wrapper restores both: scrolling moves off the `<table>` into a named,
   Tab-reachable region, and the `<table>` goes back to `display: table`.

   The focus exception this `[role="region"]` could trigger is already
   closed: `focus.css`'s `:has()` requires the skip-content link as a
   direct child, and here the child is a `<table>`. */

import React from 'react';
import styles from './catalog.module.css';

export default function Table({children, ...rest}) {
  return (
    <div
      className={styles.table}
      data-pd-component="table"
      role="region"
      tabIndex={0}
      aria-label="Tabela">
      <table {...rest}>{children}</table>
    </div>
  );
}
