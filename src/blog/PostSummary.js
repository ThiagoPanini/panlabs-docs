/**
 * One post, in either of the list renderer's two variants: `featured` (the
 * most recent post, big) or `row` (every other one, compact). Same fields
 * either way, only the size changes — DECISIONS.md's article contract asks
 * for the featured post and the chronological list to carry identical data.
 *
 * A STRETCHED LINK, not the whole card wrapped in one `<a>`: the title is
 * the actual link, and `::after` (in the CSS module) stretches its hit area
 * over the whole card. `Card.js` wraps its whole content in one `<Link>`
 * instead, which is fine for a short title plus one line — here the
 * description is a full sentence, and a screen reader announcing an
 * anchor's name reads its ENTIRE text content. Keeping the link's name to
 * the title alone is what stays legible read out loud.
 */

import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';

import {articleTypeTag} from './articleType';
import {formatDate, formatReadingTime} from './format';

import styles from './PostList.module.css';

export default function PostSummary({post, featured = false}) {
  const {metadata, assets, frontMatter} = post;
  const {title, description, date, permalink, readingTime, tags} = metadata;

  const type = articleTypeTag(tags);
  // `assets.image` is the bundler-resolved path for a co-located cover;
  // `frontMatter.image` is what's left when the cover is a bare URL
  // instead. Neither existing means the post has none, and that's not a
  // broken state — the card just runs one row shorter.
  const cover = assets.image ?? frontMatter.image;
  const Title = featured ? 'h2' : 'h3';

  return (
    <article
      className={clsx(styles.post, featured ? styles.postFeatured : styles.postRow)}
      data-pd-component="blog-post-summary"
      data-pd-variant={featured ? 'featured' : 'row'}>
      {cover && <img className={styles.postCover} src={cover} alt="" />}
      <div className={styles.postBody}>
        {type && <span className={styles.postType}>{type.label}</span>}
        <Title className={styles.postTitle}>
          <Link className={styles.postLink} to={permalink}>
            {title}
          </Link>
        </Title>
        {description && <p className={styles.postDescription}>{description}</p>}
        <p className={styles.postMeta}>
          <span>{formatDate(date)}</span>
          {readingTime !== undefined && <span>{formatReadingTime(readingTime)}</span>}
        </p>
      </div>
    </article>
  );
}
