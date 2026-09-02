/**
 * `ThemeRoot` — the host setup Docusaurus provided, restored at the boundary.
 *
 * **The mode attribute.** `tokens.css` puts the DARK palette on bare `:root` (the canonical mode is the
 * fallback) and the LIGHT palette on `:root[data-theme='light']`. On the real
 * site that attribute is written by Docusaurus's inline script, before first
 * paint. Nothing writes it here, so without this wrapper a design gets the dark
 * ink tokens over whatever background the host paints — the failure is a
 * contrast collapse, not an error.
 *
 * The default is `dark`, matching `colorMode.defaultMode` in
 * `docusaurus.config.js`: "Dark is canonical, it's where the design was born."
 * Light is legitimate and complete — pass `mode="light"` for it.
 *
 * **The page fill.** The shipped stylesheet paints `:root`, exactly as Infima
 * does (`html { background-color: var(--ifm-background-color) }`) — that file
 * stays faithful and touches `body` never, because the real site's body has no
 * background of its own. A foreign host is free to paint one, though, and a
 * white body over a dark root is that same contrast collapse with an extra
 * step. So the fill is reasserted on `body` here, where the wrapper already is.
 *
 * It is written as the VARIABLE, not a color: `var(--ifm-background-color)`
 * resolves per element, so a design that redefines `--pd-surface-page` (the
 * token the adapter feeds it from) still gets its own fill through this
 * declaration. Nothing is invented and nothing is pinned.
 *
 * Same substitution as the `@docusaurus/Link` shim: host setup the framework
 * used to provide, restored at the boundary. It renders no markup of its own.
 *
 * Why the attribute can't be CSS: the selector is `:root[data-theme='light']`,
 * so only `<html>` can carry it — a wrapper element can't. Everything else the
 * adapter declares about the page (ink, family, size, leading, links, headings)
 * does live in the stylesheet, so a design that forgets this wrapper still gets
 * the typography; what it loses is the mode.
 *
 * Written during render, not in an effect: both writes have to land before the
 * subtree paints, which is what Docusaurus's pre-paint script buys. Both are
 * idempotent, so a double render costs nothing.
 */

import React from 'react';

export default function ThemeRoot({mode = 'dark', children}) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', mode);
    document.body.style.background = 'var(--ifm-background-color)';
  }
  return <>{children}</>;
}
