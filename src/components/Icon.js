/**
 * `icon`, the vehicle for authored icons inside MDX.
 */

/* It doesn't resolve the drawing itself: that's delegated to
   `src/icons/registry.js`, which throws with a nearest-neighbor suggestion
   when the name doesn't exist. An unknown name is a build error, since
   Docusaurus prerenders every page.

   Per-size optical compensation exists only because the technique is
   SVGR, not `mask-image`: a mask can't restyle the drawing's interior,
   and the alternative would be one file per size. */

import React from 'react';
import clsx from 'clsx';
import {resolveIcon} from '@site/src/icons/registry';
import styles from './catalog.module.css';

/**
 * One map per size, not two with the same keys.
 *
 * `strokeWidth` is the optical-compensation table, and it's a prop, never a
 * CSS token, since the value has to restyle the drawing's interior.
 * `iconClass` is how our CSS sizes it; `data-pd-variant` is the skin's hook.
 */
const SIZES = {
  sm: {strokeWidth: 2.25, iconClass: styles.iconSm},
  md: {strokeWidth: 2, iconClass: styles.iconMd},
  lg: {strokeWidth: 1.75, iconClass: styles.iconLg},
};

export default function Icon({name, size = 'sm'}) {
  const Drawing = resolveIcon(name);
  const {strokeWidth, iconClass} = SIZES[size] ?? SIZES.sm;

  // The icon is always decorative and leaves the accessibility tree; meaning
  // lives in the text beside it. `focusable="false"` closes the legacy IE
  // trap that still lives in screen readers over an `<svg>` inside a link.
  //
  // No `label` prop: an ARIA branch that never runs is worse than absent,
  // since it reads as accessibility coverage without being exercised. If an
  // icon ever needs to carry meaning on its own, the prop comes back together
  // with its call site; without a call site it can't be checked.
  return (
    <Drawing
      data-pd-component="icon"
      data-pd-variant={size}
      className={clsx(styles.icon, iconClass)}
      strokeWidth={strokeWidth}
      focusable="false"
      aria-hidden="true"
    />
  );
}
