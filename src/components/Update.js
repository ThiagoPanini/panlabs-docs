/**
 * `update`, a changelog entry.
 */

/* The changelog is the only channel this site uses to communicate API
   versioning: content isn't versioned, the API is, per header.

   A `<section>` with a `<header>`, and the header is what avoids a part
   attribute: two sibling `<div>`s would need a name, a `<header>` is
   reached by type. The tag gets no attribute either, since it's the
   header's only element and the skin reaches it through `header > span`.
   Zero published parts. */

import React from 'react';
import styles from './catalog.module.css';

export default function Update({label, tag, children}) {
  return (
    <section className={styles.update} data-pd-component="update">
      <header className={styles.updateHead}>
        {label}
        {tag ? <span className={styles.updateTag}>{tag}</span> : null}
      </header>
      <div className={styles.updateBody}>{children}</div>
    </section>
  );
}
