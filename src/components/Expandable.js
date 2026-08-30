/**
 * `expandable`, the same primitive as `accordion`, without the frame.
 */

/* It exists for API field nesting: an object with properties, inside a
   `param-field` or `response-field`. The accordion's frame there would
   stack card inside card at every level, and the nesting cap is four.

   Level 1 opens by default, level 2 and deeper start closed. The choice
   holds under either reading of an unresolved question about `Ctrl+F`
   inside a closed `<details>`. The author decides per instance, via
   `defaultOpen`, since only they know which level they're at.

   No part attribute: `<summary>` is reached by type, and the body is the
   only `<div>` child of `<details>`. */

import React from 'react';
import styles from './catalog.module.css';

export default function Expandable({title, defaultOpen, children}) {
  return (
    <details
      className={styles.expandable}
      data-pd-component="expandable"
      open={defaultOpen ? true : undefined}>
      <summary className={styles.expandableSummary}>{title}</summary>
      <div className={styles.expandableBody}>{children}</div>
    </details>
  );
}
