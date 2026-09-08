/**
 * One post, in either of the list renderer's two variants: `featured` (the
 * most recent post, big) or `row` (every other one, compact).
 *
 * A STRETCHED LINK, not the whole card wrapped in one `<a>`: the title is
 * the actual link, and `::after` (in the CSS module) stretches its hit area
 * over the whole card. `Card.js` wraps its whole content in one `<Link>`
 * instead, which is fine for a short title plus one line — here the
 * description is a full sentence, and a screen reader announcing an
 * anchor's name reads its ENTIRE text content. Keeping the link's name to
 * the title alone is what stays legible read out loud.
 *
 * THE MEDIA SLOT IS NEVER EMPTY. A real cover when the article declares
 * one, the generated `Plate` when it doesn't — see `Plate.js` for why the
 * list's rhythm can't be left to depend on which articles happen to have
 * art. The slot's box is identical either way, so a cover arriving later
 * changes the picture and nothing else.
 *
 * THE FIRST TAG IS THE ACCENT, and it appears exactly ONCE per card. On a
 * featured card that's the chip above the title, so its plate stays mute
 * and shows the permalink; on a row there is no chip, so the plate carries
 * the word. Either way the muted chip row below lists the REMAINING tags,
 * never the accent again — the same disjoint split the prototype's `2a`
 * draws. (The article page is the exception, and deliberately so: `2b`
 * repeats every tag in its footer, far from the breadcrumb that accents
 * the first.)
 */

import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';

import Plate from './Plate';
import TagChips from './TagChips';
import {
  formatDate,
  formatDateShort,
  formatReadingTime,
  formatReadingTimeShort,
} from './format';

import styles from './PostList.module.css';

/**
 * The byline's stand-in for a photograph, featured card only.
 *
 * `authors.yml`'s one portrait is 1800x1200 and 144 KB, and this circle is
 * 26 across. Shrinking it needs an image pipeline, which is the new
 * dependency AGENTS.md refuses, so the index draws initials and the article
 * page — where the portrait is 32px and the reader has already committed to
 * the download — keeps the real photo.
 */
function Monogram({name}) {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
  // Decorative: the name is spelled out in full immediately to its right.
  return (
    <span className={styles.postMonogram} aria-hidden="true">
      {letters}
    </span>
  );
}

export default function PostSummary({post, featured = false}) {
  const {metadata, assets, frontMatter} = post;
  const {title, description, date, permalink, readingTime, tags, authors} = metadata;

  // `assets.image` is the bundler-resolved path for a co-located cover;
  // `frontMatter.image` is what's left when the cover is a bare URL instead.
  const cover = assets.image ?? frontMatter.image;
  const [accent, ...restTags] = tags;
  const Title = featured ? 'h2' : 'h3';

  return (
    <article
      className={clsx(styles.post, featured ? styles.postFeatured : styles.postRow)}
      data-pd-component="blog-post-summary"
      data-pd-variant={featured ? 'featured' : 'row'}>
      {cover ? (
        <img className={styles.postCover} src={cover} alt="" />
      ) : (
        <Plate
          className={styles.postCover}
          word={featured ? undefined : accent?.label}
          caption={featured ? permalink : undefined}
        />
      )}

      <div className={styles.postBody}>
        <Title className={styles.postTitle}>
          <Link className={styles.postLink} to={permalink}>
            {title}
          </Link>
        </Title>

        {description && <p className={styles.postDescription}>{description}</p>}

        {featured && authors.length > 0 && (
          <p className={styles.postByline}>
            {authors.map((author, index) => (
              <span className={styles.postAuthor} key={author.name ?? index}>
                {author.name && <Monogram name={author.name} />}
                {author.name}
              </span>
            ))}
            <span className={styles.postDates}>
              <span>{formatDate(date)}</span>
              {readingTime !== undefined && <span>{formatReadingTime(readingTime)}</span>}
            </span>
          </p>
        )}

        <TagChips tags={restTags} />

        {/* LAST IN THE DOM, FIRST ON SCREEN, and the reason is paint order.
            `.postLink::after` is the stretched hit area, and this project
            writes no `z-index` anywhere (`index.module.css` says so out
            loud) — positioned siblings stack by tree order alone, so a chip
            authored ABOVE the title would sit under that overlay and stop
            being clickable. Authored below it and pulled back up with
            `order`, it stays a real link. The cost is that it takes focus
            after the tags rather than before the title, which reads as
            supplementary metadata either way. */}
        {featured && accent && (
          <span className={styles.postAccent}>
            <Link className={styles.postChip} to={accent.permalink}>
              {accent.label}
            </Link>
            <span className={styles.postRecent}>Mais recente</span>
          </span>
        )}
      </div>

      {!featured && (
        <p className={styles.postRail}>
          <span>{formatDateShort(date)}</span>
          {readingTime !== undefined && <span>{formatReadingTimeShort(readingTime)}</span>}
        </p>
      )}
    </article>
  );
}
