/**
 * `accordion` and `accordion-group`: native `<details>` and `<summary>`.
 */

/* Zero handwritten `keydown`: which key opens it, what receives focus, what
   the screen reader announces, and where `aria-expanded` goes are the
   browser's job. A `<div onClick>` would be pixel-identical for a mouse user
   while failing silently for keyboard users.

   Three things come free: a URL anchor opens the ancestor `<details>` on its
   own, in-page search reaches the content, and the `name` attribute would
   give mutual exclusivity, deliberately unused (a reader comparing items
   shouldn't have the one they opened closed for them).

   The caret is `mask-image` on `summary::after`, not a second `<svg>`: two
   sibling SVGs inside the same `<summary>` break the element-type
   selector's reach to the author's icon. */

import React from 'react';
import Icon from './Icon';
import styles from './catalog.module.css';

export function AccordionGroup({children}) {
  return (
    <div className={styles.accordionGroup} data-pd-component="accordion-group">
      {children}
    </div>
  );
}

export default function Accordion({title, description, icon, defaultOpen, children}) {
  return (
    <details
      className={styles.accordion}
      data-pd-component="accordion"
      // Uncontrolled: the element owns the state. `undefined` removes the
      // attribute, and the DOM's `[open]` is what CSS and the skin read.
      open={defaultOpen ? true : undefined}>
      <summary className={styles.accordionSummary}>
        {icon ? <Icon name={icon} size="sm" /> : null}
        <span className={styles.accordionTitle} data-pd-part="title">
          {title}
        </span>
        {description ? (
          <span className={styles.accordionDescription} data-pd-part="description">
            {description}
          </span>
        ) : null}
      </summary>
      <div className={styles.accordionBody}>{children}</div>
    </details>
  );
}
