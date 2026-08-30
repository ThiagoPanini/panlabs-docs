/**
 * `frame`, a diagram frame, not a screenshot frame.
 */

/* No CDN means a binary asset lands in the repository, a third-party UI
   capture rots on its own, and raster doesn't inherit `currentColor`. All
   three cut against binary media of any origin; what the frame holds is
   flow, lifecycle, data model. That shrinks the component down to a tinted
   stage, with no caption support.

   This is the second of the catalog's two exceptions to the rule that no
   component knows color mode: the stage declares `color`, and an in-house
   diagram living inside it uses `currentColor`, one file for both modes,
   never one asset per mode. That case ships as an inline SVG, since
   `<img src="x.svg">` doesn't inherit `currentColor`.

   An externally-sourced diagram takes the other route: draw.io doesn't
   emit `currentColor`, it emits `light-dark()`, which resolves against the
   `color-scheme` inherited from the host document and crosses the `<img>`
   boundary. Same one-file-for-both-modes invariant, different
   mechanism. */

import React from 'react';
import styles from './catalog.module.css';

export default function Frame({children}) {
  return (
    <figure className={styles.frame} data-pd-component="frame">
      <div className={styles.frameStage}>{children}</div>
    </figure>
  );
}
