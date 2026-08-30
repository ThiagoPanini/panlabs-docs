/**
 * `steps`, the numbered sequence.
 */

/* `<ol>` and `<li>`, and the marker's number comes from the `list-item`
   counter the element already increments. No number is rendered by
   JavaScript: the ordered list is the numbering, and that's what the
   screen reader announces.

   An icon replaces the number, it doesn't sit beside it, via `:has(svg)`
   in CSS rather than a variant, since the decision is per step, not per
   list. */

import React from 'react';
import Icon from './Icon';
import styles from './catalog.module.css';

export default function Steps({children}) {
  return (
    <ol className={styles.steps} data-pd-component="steps">
      {children}
    </ol>
  );
}

export function Step({title, icon, children}) {
  return (
    <li className={styles.step}>
      {/* No `data-pd-part`: the marker is the step's only `<span>` child,
          sibling to a `<div>`, so the skin reaches it through `li > span`. */}
      <span className={styles.stepMarker}>
        {icon ? <Icon name={icon} size="sm" /> : null}
      </span>
      <div className={styles.stepBody}>
        {title ? (
          <p className={styles.stepTitle} data-pd-part="title">
            {title}
          </p>
        ) : null}
        {children}
      </div>
    </li>
  );
}
