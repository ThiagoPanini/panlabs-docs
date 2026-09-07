/**
 * A post's tags, as chips that link to each tag's page. Used twice on the
 * article page (the meta line, the footer) — DECISIONS.md's article page
 * spec asks for both, the second a reminder for whoever scrolled to the
 * end. `@theme/Tag` is off the swizzle budget, so this is a plain `<Link>`
 * per tag instead.
 */

import React from 'react';
import Link from '@docusaurus/Link';

import styles from './Article.module.css';

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
