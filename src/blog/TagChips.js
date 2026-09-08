/**
 * A post's tags, as chips that link to each tag's page. `@theme/Tag` is off
 * the swizzle budget, so this is a plain `<Link>` per tag instead.
 *
 * Three call sites, one look: the index card, the article's footer, and
 * the article's meta line all draw the same chip in the prototype (`2a` and
 * `2b`), so the ink lives in this component's OWN module rather than in
 * whichever page module happens to place it. That's why `Article.module.css`
 * no longer carries `.tagChip`.
 *
 * WHICH tags reach it is the caller's decision, not this component's: a card
 * passes everything but the accent tag it already shows, the article's
 * footer passes all of them. See `PostSummary.js` for why the two differ.
 */

import React from 'react';
import Link from '@docusaurus/Link';

import styles from './TagChips.module.css';

export default function TagChips({tags}) {
  if (!tags || tags.length === 0) {
    return null;
  }
  return (
    <ul className={styles.tagChips}>
      {tags.map((tag) => (
        <li key={tag.permalink}>
          <Link className={styles.tagChip} to={tag.permalink}>
            {tag.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
