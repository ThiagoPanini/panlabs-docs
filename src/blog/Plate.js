/**
 * The generated plate: what fills the media slot when an article has no
 * `image:` in its front matter.
 *
 * WHY IT EXISTS AT ALL. Covers on this blog are optional and will stay
 * optional, so a card that renders its media slot only when a cover exists
 * changes shape with the content: some rows 96px tall, some 40px, and a
 * list with no rhythm. One slot that is never empty is what makes the
 * geometry a property of the LAYOUT instead of a property of whichever
 * articles happen to be on page 1.
 *
 * The plate is deliberately the same drawing every time. Nothing here
 * hashes the slug into an angle or a hue: two plates differ by their word,
 * never by their pattern, so renaming a folder can't silently repaint a
 * card, and a page of them reads as one surface rather than a quilt.
 *
 * `word` and `caption` are both optional, and the CALLER decides which it
 * passes, because the word must appear exactly once per card: a featured
 * card already carries its first tag as an accent chip, so its plate takes
 * the permalink instead; a row has no chip, so its plate carries the word.
 *
 * The caption leaves the accessibility tree — a URL read out loud is noise,
 * and the link beside it already names the article. The word stays in it:
 * on a row it's the only place the first tag appears.
 */

import React from 'react';
import clsx from 'clsx';

import styles from './Plate.module.css';

export default function Plate({className, word, caption}) {
  return (
    <div className={clsx(styles.plate, className)} data-pd-component="blog-plate">
      {word && <span className={styles.plateWord}>{word}</span>}
      {caption && (
        <span className={styles.plateCaption} aria-hidden="true">
          {caption}
        </span>
      )}
    </div>
  );
}
