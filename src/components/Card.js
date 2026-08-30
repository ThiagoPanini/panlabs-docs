/**
 * `card` and `card-group`.
 */

/* Built from scratch: Docusaurus's `DocCard` is driven by sidebar metadata,
   takes no free props, and is itself `unsafe` territory.

   With `href` it's an `<a>`, and the whole card is the link. Without `href`
   it's a `<div>`: a card stays a surface-level affordance either way.

   The grid has no column prop, media query, or container query: card count
   alone does the work, with `--pd-card-min` as the floor. */

import React from 'react';
import Link from '@docusaurus/Link';
import Icon from './Icon';
import styles from './catalog.module.css';

export function CardGroup({children}) {
  return (
    <div className={styles.cardGroup} data-pd-component="card-group">
      {children}
    </div>
  );
}

export default function Card({title, icon, href, children}) {
  const content = (
    <>
      {icon ? <Icon name={icon} size="lg" /> : null}
      <span className={styles.cardTitle} data-pd-part="title">
        {title}
      </span>
      {children}
    </>
  );

  // `<Link>`, not `<a>`: it decides between client-side navigation and an
  // external link, and resolves `baseUrl` for an internal path.
  return href ? (
    <Link className={styles.card} data-pd-component="card" to={href}>
      {content}
    </Link>
  ) : (
    <div className={styles.card} data-pd-component="card">
      {content}
    </div>
  );
}
