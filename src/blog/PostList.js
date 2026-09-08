/**
 * The body shared by the index and a single tag's page: a header slot the
 * caller composes, the most recent post featured, the rest in a
 * chronological list, the page-to-page paginator, and the closing row.
 * Same renderer either way, per DECISIONS.md#the-blog-is-a-tab-not-a-docs-instance's
 * ask that a tag's page reuse the index's list instead of growing a second
 * one.
 *
 * THE FEATURED POST ONLY SHOWS ON PAGE 1. `items` is already just the
 * current listing page's slice, so `items[0]` on page 2 is simply the
 * eleventh post overall, not the most recent one — featuring it there would
 * present an out-of-order post as "recent."
 */

import React from 'react';
import Link from '@docusaurus/Link';

import Icon from '@site/src/components/Icon';

import PostSummary from './PostSummary';
import Paginator from './Paginator';

import styles from './PostList.module.css';

export default function PostList({header, items, metadata}) {
  const {page, previousPage, nextPage} = metadata;
  const [featuredItem, ...restItems] = page === 1 ? items : [undefined, ...items];

  return (
    <>
      {header}

      {featuredItem && <PostSummary post={featuredItem.content} featured />}

      {restItems.length > 0 && (
        <ul className={styles.list}>
          {restItems.map(({content}) => (
            <li key={content.metadata.permalink}>
              <PostSummary post={content} />
            </li>
          ))}
        </ul>
      )}

      <Paginator
        ariaLabel="Navegação entre páginas do blog"
        prev={previousPage && {href: previousPage, label: 'Página anterior'}}
        next={nextPage && {href: nextPage, label: 'Próxima página'}}
      />

      {/* The closing row. The path to the tag index is here on every page;
          the end marker only where the list actually ends, which is what
          keeps it from claiming a collection is over while a "next page"
          link sits right above it. */}
      <div className={styles.listFooter}>
        <Link className={styles.listFooterLink} to="/blog/tags">
          Ver todas as tags
          <Icon name="chevron-right" size="sm" />
        </Link>
        {!nextPage && <span className={styles.listFooterEnd}>Fim da coleção</span>}
      </div>
    </>
  );
}

/**
 * The header both listing pages open with: a mono eyebrow, the title, an
 * optional description line, and an optional trailing action — the index's
 * feed link is the one caller that passes it; a tag's page passes none,
 * because the feed is the whole blog's, not one tag's.
 */
export function ListHeader({eyebrow, title, description, action}) {
  return (
    <header className={styles.header}>
      <div>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {action}
    </header>
  );
}

/**
 * The index header's own action: the feed link, as text.
 *
 * It used to be a 44px bordered pill, and at the top of a page where
 * nothing competes with it that made the feed the heaviest object on the
 * index. The ink is now a mono label; the 44px SURVIVES as the hit area,
 * which is the part of a pill a touch target actually needs.
 */
export function FeedLink() {
  // `pathname://`: the same escape hatch the footer's `llms.txt` link uses.
  // `rss.xml` is a generated file, not an SPA route, so `onBrokenLinks` has
  // nothing to check it against — this tells `<Link>` to still prefix
  // `baseUrl` while skipping that check.
  return (
    <Link className={styles.feedLink} to="pathname:///blog/rss.xml">
      <span>Feed RSS</span>
      <Icon name="external-link" size="sm" />
    </Link>
  );
}
