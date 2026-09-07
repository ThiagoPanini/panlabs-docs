/**
 * A flat, two-link nav: `PaginatorNavLink` and `DocPaginator` are `unsafe`,
 * so this is a from-scratch replacement, shared by the list pages'
 * page-to-page nav and the article's post-to-post nav. `chrome.css`'s own
 * pagination section describes the target look — no border, no fill, no
 * padding — even though its rules don't reach this component (they're
 * scoped to `html.docs-doc-page`).
 *
 * Each side is `undefined` or `{href, label, sublabel}`: the list pages
 * pass no `sublabel` (there's no title to preview), the article passes the
 * neighboring post's title as `label` and "Artigo anterior"/"Próximo
 * artigo" as `sublabel` — this project's own words, never the theme's
 * "Older post"/"Newer post".
 */

import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';

import Icon from '@site/src/components/Icon';

import styles from './PostList.module.css';

function Side({item, direction}) {
  if (!item) {
    return <span className={styles.paginatorSlot} />;
  }
  const {href, label, sublabel} = item;
  return (
    <Link
      className={clsx(
        styles.paginatorSlot,
        styles.paginatorLink,
        direction === 'next' && styles.paginatorLinkNext,
      )}
      to={href}>
      {direction === 'prev' && <Icon name="chevron-left" size="sm" />}
      <span className={styles.paginatorText}>
        {sublabel && <span className={styles.paginatorSublabel}>{sublabel}</span>}
        <span className={styles.paginatorLabel}>{label}</span>
      </span>
      {direction === 'next' && <Icon name="chevron-right" size="sm" />}
    </Link>
  );
}

export default function Paginator({ariaLabel, prev, next}) {
  if (!prev && !next) {
    return null;
  }
  return (
    <nav className={styles.paginator} aria-label={ariaLabel}>
      <Side item={prev} direction="prev" />
      <Side item={next} direction="next" />
    </nav>
  );
}
