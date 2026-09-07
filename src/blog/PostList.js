/**
 * The body shared by the index and a single tag's page: a header slot the
 * caller composes, the most recent post featured, the rest in a
 * chronological list, and the page-to-page paginator. Same renderer either
 * way, per DECISIONS.md#the-blog-is-a-tab-not-a-docs-instance's ask that a
 * tag's page reuse the index's list instead of growing a second one.
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
    </>
  );
}

/**
 * The header both listing pages open with: title, an optional description
 * line, and an optional trailing action — the index's feed link is the one
 * caller that passes it; a tag's page passes none.
 */
export function ListHeader({title, description, action}) {
  return (
    <header className={styles.header}>
      <div>
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {action}
    </header>
  );
}

/** The index header's own action: the feed link. */
export function FeedLink() {
  // `pathname://`: the same escape hatch the footer's `llms.txt` link uses.
  // `rss.xml` is a generated file, not an SPA route, so `onBrokenLinks` has
  // nothing to check it against — this tells `<Link>` to still prefix
  // `baseUrl` while skipping that check.
  return (
    <Link className={styles.feedLink} to="pathname:///blog/rss.xml">
      <Icon name="rss" size="sm" />
      <span>Feed RSS</span>
    </Link>
  );
}
