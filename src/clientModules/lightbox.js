/**
 * The diagram lightbox: the behavior half of `src/components/Frame.js`.
 */

/* WHY A CLIENT MODULE, AND NOT REACT.

   `clientModules` is a public configuration key — rung 2 of the swizzle
   ladder — and it costs nothing from the zero-unsafe budget. React has no
   rung that reaches here: `Root`, `Layout`, and `DocItem/Layout` are all
   absent from `@docusaurus/theme-classic`'s swizzle ledger, so each falls
   through to the `unsafe` default, and the budget for those is fixed at
   zero. See DECISIONS.md#the-swizzle-ladder-and-a-zero-unsafe-budget.

   THE HOOK IS THE PARTS CONTRACT, never a CSS Module class. The reason is
   the same one the contract itself carries: a module class is hashed at
   build time, so nothing outside the module that declares it can name one.
   That makes `data-pd-part` the only stable address for a file that is
   compiled separately from the component it drives. State stays out of
   attributes, here as everywhere: what this file reads is structure.

   ONE `document` LISTENER OPENS EVERY FRAME, and everything else is wired
   lazily, once per dialog, on its first open. Delegation is what makes the
   module indifferent to client-side navigation: a frame rendered by a route
   that mounts after this file ran is reached by the same listener, with no
   `onRouteDidUpdate` to keep in step. */

import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

/* The parts `Frame.js` publishes. Every selector this file uses is here.

   There is no `expand` entry, and its absence is the point: the corner
   button lives INSIDE the stage, so a click on it already matches `STAGE`.
   A second branch for it would be a branch nothing can exercise. */
const FRAME = '[data-pd-component="frame"]';
const STAGE = '[data-pd-part="stage"]';
const LIGHTBOX = '[data-pd-part="lightbox"]';
const LIGHTBOX_STAGE = '[data-pd-part="lightbox-stage"]';

/** Which button does what, by part. */
const BUTTONS = {
  'zoom-out': (k) => k / K_STEP,
  'zoom-in': (k) => k * K_STEP,
  fit: () => K_MIN,
};

/* THE ZOOM IS `anchor x k`, AND THE ANCHOR IS `min(fit, 1)`.

   A ladder of absolute stops was refused by measurement: at 6000px wide,
   "fit" is 12% and 50% is still 3000px, so half the ladder is unreachable
   scenery. Anchoring on fit adapts to any drawing, which is the point — the
   size of the diagram must not matter. Capping the anchor at 1 is what
   stops a drawing smaller than the window from opening stretched.

   `k` runs from 1 (the anchor itself) to 16. Both are counts, not lengths:
   there is no unit here for `tokens.css` to own. */
const K_MIN = 1;
const K_MAX = 16;

/** One press of `+` or `−`, and one notch of the wheel, move the same distance. */
const K_STEP = 1.5;

/* A wheel notch, in the unit the event reports. `deltaMode` is the
   browser's own declaration of that unit: 0 pixels, 1 lines, 2 pages.
   Chromium reports pixels for both a mouse wheel and a trackpad pinch;
   Firefox still reports lines for a mouse wheel on some platforms, where a
   notch is 3. Dividing by the notch is what makes one mouse click of the
   wheel worth one button press while a pinch, which reports the same unit
   in far smaller increments, stays continuous. */
const NOTCH = [100, 3, 1];

/** Per-dialog state: measured size, current `k`, and the nodes it moves. */
const state = new WeakMap();

/**
 * The drawing's own coordinate system, which is the only size that doesn't
 * change with how the page happens to be rendering it. `viewBox` survives
 * SVGO because `removeViewBox` is turned off in `docusaurus.config.js`.
 *
 * @param {SVGSVGElement} svg
 */
function naturalSize(svg) {
  const box = svg.viewBox?.baseVal;
  if (box && box.width > 0 && box.height > 0) {
    return {width: box.width, height: box.height};
  }
  const rect = svg.getBoundingClientRect();
  return {width: rect.width, height: rect.height};
}

/**
 * draw.io's current exporter writes a root `id` and a `<style>` scoped to
 * it (`--ge-adaptive-bg`). Cloning that verbatim would put two elements
 * carrying the same id in one document. The id is a random token from the
 * exporter, so swapping it inside the clone's own stylesheet is exact —
 * nothing else in the file can spell it. Neither diagram published today
 * carries one; the specimen, exported by a newer draw.io, does.
 *
 * @param {SVGSVGElement} clone
 */
function reidentify(clone) {
  const original = clone.getAttribute('id');
  if (!original) {
    return;
  }
  const renamed = `${original}-pd-lightbox`;
  clone.setAttribute('id', renamed);
  for (const sheet of clone.querySelectorAll('style')) {
    sheet.textContent = sheet.textContent.split(original).join(renamed);
  }
}

/**
 * The fit, and the anchor derived from it. Re-measured on every open and on
 * every resize, since both change the window the drawing has to fit.
 *
 * The stage carries no padding of its own — the dialog holds it — so
 * `clientWidth` and `clientHeight` are exactly the box available, minus a
 * scrollbar when one is showing.
 */
function measure(scope) {
  const fit = Math.min(
    scope.stage.clientWidth / scope.natural.width,
    scope.stage.clientHeight / scope.natural.height,
  );
  scope.anchor = Math.min(fit, 1);
}

/**
 * Places the scroll so a fixed point of the DRAWING stays under a fixed
 * point of the WINDOW, and reports the width it found there.
 *
 * `target` is in the drawing's own coordinates, so it survives the scale
 * changing underneath it — which is what lets the same function serve the
 * instant path and each frame of the animated one.
 */
function hold(scope, target, viewport) {
  const width = scope.drawing.getBoundingClientRect().width;
  const drawn = width / scope.natural.width;
  scope.stage.scrollLeft = target.x * drawn - viewport.x;
  scope.stage.scrollTop = target.y * drawn - viewport.y;
  return width;
}

/**
 * Moves `k`, then holds the focal point while the drawing settles into its
 * new size.
 *
 * A transition on the drawing's size animates the SCROLL CONTAINER'S OWN
 * EXTENT, so a scroll position written once, at the start, is clamped
 * against a range that hasn't grown yet — and the point the reader aimed at
 * drifts toward the top-left for the whole duration. Holding it per frame
 * is what makes the movement affordable.
 *
 * The loop stops when the drawing reaches the width it was asked for, not
 * on `transitionend`: a zoom that changes nothing — `+` already at the
 * ceiling — fires no transition at all, and a loop waiting for that event
 * would never end.
 *
 * It also stops on a frame that measured what the frame before it did,
 * which is the net under the equality: it ends the loop whatever the
 * drawing settles on, including a width that never rounds to the goal.
 * A loop with only one exit and no ceiling is a loop that can spin until
 * the dialog closes.
 *
 * @param {HTMLDialogElement} dialog
 * @param {number} next the requested `k`
 * @param {{x: number, y: number}} focus in client coordinates
 * @param {boolean} direct continuous input: no motion, no loop
 */
function zoom(dialog, next, focus, direct) {
  const scope = state.get(dialog);
  const before = scope.anchor * scope.k;
  scope.k = Math.min(Math.max(next, K_MIN), K_MAX);
  const after = scope.anchor * scope.k;

  const box = scope.stage.getBoundingClientRect();
  const viewport = {x: focus.x - box.left, y: focus.y - box.top};
  const target = {
    x: (scope.stage.scrollLeft + viewport.x) / before,
    y: (scope.stage.scrollTop + viewport.y) / before,
  };

  // The empty string hands the property back to the stylesheet, which is
  // where the movement token lives. `none` is not a duration, and this file
  // writes no other value for it.
  scope.drawing.style.transition = direct ? 'none' : '';
  scope.drawing.style.inlineSize = `${scope.natural.width * after}px`;
  scope.drawing.style.blockSize = `${scope.natural.height * after}px`;

  cancelAnimationFrame(scope.frame);
  const goal = Math.round(scope.natural.width * after);
  let previous = hold(scope, target, viewport);
  if (Math.round(previous) === goal || direct) {
    return;
  }

  const step = () => {
    const width = hold(scope, target, viewport);
    if (Math.round(width) === goal || width === previous) {
      return;
    }
    previous = width;
    scope.frame = requestAnimationFrame(step);
  };
  scope.frame = requestAnimationFrame(step);
}

/** The window's centre, the only focal point a button press can mean. */
function centre(stage) {
  const box = stage.getBoundingClientRect();
  return {x: box.left + box.width / 2, y: box.top + box.height / 2};
}

/**
 * Wires one dialog, once, on its first open: wheel, drag, the control row,
 * and the two ways out that aren't Escape.
 */
function wire(dialog) {
  const scope = state.get(dialog);

  /* `passive: false` because zooming has to preventDefault: a ctrl-wheel
     the page ignores is a browser zoom of the whole document, and a
     trackpad pinch arrives as exactly that event. Without the modifier the
     wheel is left alone, and the stage scrolls natively. */
  scope.stage.addEventListener(
    'wheel',
    (event) => {
      if (!event.ctrlKey) {
        return;
      }
      event.preventDefault();
      const notch = NOTCH[event.deltaMode] ?? NOTCH[0];
      zoom(dialog, scope.k * K_STEP ** (-event.deltaY / notch), {x: event.clientX, y: event.clientY}, true);
    },
    {passive: false},
  );

  /* DRAG IS THE POINTER'S AFFORDANCE, and touch is left to the browser: a
     finger already pans an `overflow: auto` box natively, and a pinch there
     is the browser's own visual-viewport zoom. Taking either over would
     mean writing what the substrate already delivers.

     `setPointerCapture` retargets the compatibility mouse events too, so
     the `click` that follows a drag reports the stage as its target no
     matter where the press landed. That's why closing is decided from the
     press, recorded here, and not from the click. */
  let gesture = null;
  scope.stage.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'touch' || event.button !== 0) {
      return;
    }
    gesture = {
      origin: event.target,
      x: event.clientX,
      y: event.clientY,
      left: scope.stage.scrollLeft,
      top: scope.stage.scrollTop,
      panned: false,
    };
    scope.stage.setPointerCapture(event.pointerId);
  });

  scope.stage.addEventListener('pointermove', (event) => {
    if (!gesture) {
      return;
    }
    const left = gesture.left - (event.clientX - gesture.x);
    const top = gesture.top - (event.clientY - gesture.y);
    scope.stage.scrollLeft = left;
    scope.stage.scrollTop = top;
    gesture.panned ||= scope.stage.scrollLeft !== gesture.left || scope.stage.scrollTop !== gesture.top;
  });

  const release = (event) => {
    if (scope.stage.hasPointerCapture(event.pointerId)) {
      scope.stage.releasePointerCapture(event.pointerId);
    }
  };
  scope.stage.addEventListener('pointerup', release);
  scope.stage.addEventListener('pointercancel', release);

  /* Clicking beside the drawing closes, and a drag that moved the view
     doesn't — otherwise every pan would end by dismissing what it was
     reading. */
  scope.stage.addEventListener('click', () => {
    if (gesture && !gesture.panned && gesture.origin === scope.stage) {
      dialog.close();
    }
    gesture = null;
  });

  /* The backdrop. `showModal()` paints it, and a click on it is dispatched
     to the dialog itself — which is the whole reason the panel keeps a
     gutter of it showing on every side instead of running edge to edge. */
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });

  dialog.addEventListener('click', (event) => {
    const button = event.target.closest('[data-pd-part]');
    const part = button?.getAttribute('data-pd-part');
    if (part === 'close') {
      dialog.close();
    } else if (BUTTONS[part]) {
      zoom(dialog, BUTTONS[part](scope.k), centre(scope.stage), false);
    }
  });

  dialog.addEventListener('close', () => cancelAnimationFrame(scope.frame));
}

/**
 * ONE STATE OBJECT PER DIALOG, FOR ITS WHOLE LIFE, and reopening MUTATES it
 * instead of replacing it. `wire` closes over the object once; handing it a
 * new one on the second open would leave every listener reading a `k` and a
 * drawing from the previous visit. Measured before it was fixed: after the
 * second open, `+` computed `1 x 1.5` forever and the zoom stopped at one
 * step, no matter how many times it was pressed.
 *
 * @param {Element} frame the `<figure>`
 */
function openLightbox(frame) {
  const dialog = frame.querySelector(LIGHTBOX);
  const source = frame.querySelector(`${STAGE} svg`);
  if (!dialog || !source || dialog.open) {
    return;
  }

  const clone = source.cloneNode(true);
  reidentify(clone);
  // The page's own copy is sized by the stylesheet; the clone is sized by
  // `zoom`, so it must not carry a width in from where it was cloned.
  clone.removeAttribute('width');
  clone.removeAttribute('height');

  const stage = dialog.querySelector(LIGHTBOX_STAGE);
  stage.replaceChildren(clone);

  const first = !state.has(dialog);
  if (first) {
    state.set(dialog, {stage, drawing: clone, natural: null, anchor: 1, k: K_MIN, frame: 0});
  }
  const scope = state.get(dialog);
  scope.drawing = clone;
  scope.natural = naturalSize(source);
  scope.k = K_MIN;
  if (first) {
    wire(dialog);
  }

  // `showModal()` first: the stage has no size to measure until the dialog
  // is in the top layer.
  dialog.showModal();
  measure(scope);
  zoom(dialog, K_MIN, centre(stage), true);
}

if (ExecutionEnvironment.canUseDOM) {
  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }
    // A link inside the drawing keeps its own click. draw.io writes one at
    // the foot of every export, inside a `<switch>` branch that only renders
    // where `<foreignObject>` doesn't.
    if (event.target.closest('a')) {
      return;
    }
    const stage = event.target.closest(`${FRAME} ${STAGE}`);
    if (stage) {
      openLightbox(stage.closest(FRAME));
    }
  });

  /* A resize changes the window the drawing has to fit, so the anchor every
     `k` multiplies moves with it. Rotating a phone is the case that makes
     this worth wiring. */
  window.addEventListener('resize', () => {
    for (const dialog of document.querySelectorAll(`${LIGHTBOX}[open]`)) {
      const scope = state.get(dialog);
      if (scope) {
        measure(scope);
        zoom(dialog, scope.k, centre(scope.stage), true);
      }
    }
  });
}
