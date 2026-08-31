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

/* THE LIGHTBOX IS MARKUP HERE AND BEHAVIOR SOMEWHERE ELSE.

   Scaled into the prose column a large diagram is unreadable by
   arithmetic, not by impression. Measured on the specimen
   (`content/_diagrama-grande.drawio.svg`, 62 cells, 21 AWS shapes): the
   drawing is 1904 x 953 and the stage gives it 699, so it renders at 36.7%
   and its 27 twelve-pixel labels land at 4.4px.

   What this file gains is a `<button>`, a `<dialog>`, and the
   `data-pd-part` hooks that address them. What it does NOT gain is one line
   of behavior: no `onClick`, no `useState`, no `useEffect`, no
   `addEventListener`. Opening, zooming, panning, and closing live in
   `src/clientModules/lightbox.js`, reached through the `clientModules` key
   of `docusaurus.config.js` — rung 2 of the swizzle ladder, a public config
   option, spending nothing from the zero-unsafe budget. See
   DECISIONS.md#the-diagram-lightbox.

   The native-substrate rule survives whole. It forbids a catalog component
   from IMPLEMENTING interactive behavior of its own, and both elements
   written here are the browser's: `<button>` brings Tab, Enter, and Space,
   and `<dialog>` plus `showModal()` bring Escape, the focus trap, the top
   layer, and the backdrop.

   The corner button exists because a click on the stage isn't reachable
   from the keyboard, and because a `<button>` is already covered by
   `src/css/focus.css` for free. It is visible at all times, never revealed
   on hover: a hover-revealed control is the failure mode `focus.css`
   catalogs three times over, invisible to whoever tests on a desktop.

   The `<dialog>` is the figure's child and the stage's SIBLING. The stage
   clips (`overflow: hidden`) and is the positioning context for the corner
   button; the enlarged diagram belongs to neither job.

   Every frame gets this, with no condition attached. The catalog says a
   frame holds flow, lifecycle, and data model — there is no second kind of
   content in there, and a branch nobody exercises is a defect waiting. */

import React from 'react';
import Icon from './Icon';
import styles from './catalog.module.css';

export default function Frame({children}) {
  return (
    <figure className={styles.frame} data-pd-component="frame">
      <div className={styles.frameStage} data-pd-part="stage">
        {children}
        <button
          type="button"
          className={styles.frameExpand}
          data-pd-part="expand"
          aria-label="Ampliar o diagrama">
          <Icon name="maximize" size="sm" />
        </button>
      </div>

      {/* The enlarged stage is EMPTY in the markup: the client module clones
          the drawing into it on open. Rendering the diagram twice would
          double the DOM of every page carrying one, for a surface most
          readers never open — and the clone is what leaves the page's own
          copy untouched. */}
      <dialog
        className={styles.lightbox}
        data-pd-part="lightbox"
        aria-label="Diagrama ampliado">
        <div className={styles.lightboxStage} data-pd-part="lightbox-stage" />

        {/* Two glyphs and a word, in plain text, never three more icons:
            `−` and `+` ARE the control, the way a calculator's keys are,
            and "caber" names a destination no glyph states. Same reading
            that keeps the search modal's key captions out of the icon
            set. */}
        <div className={styles.lightboxControls} data-pd-part="controls">
          <button
            type="button"
            className={styles.lightboxControl}
            data-pd-part="zoom-out"
            aria-label="Afastar">
            −
          </button>
          <button
            type="button"
            className={styles.lightboxControl}
            data-pd-part="fit">
            Caber
          </button>
          <button
            type="button"
            className={styles.lightboxControl}
            data-pd-part="zoom-in"
            aria-label="Aproximar">
            +
          </button>
          <button
            type="button"
            className={styles.lightboxClose}
            data-pd-part="close"
            aria-label="Fechar o diagrama ampliado">
            <Icon name="x" size="sm" />
          </button>
        </div>
      </dialog>
    </figure>
  );
}
