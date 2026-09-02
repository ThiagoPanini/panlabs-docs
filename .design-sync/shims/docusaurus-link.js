/**
 * Stand-in for `@docusaurus/Link`, used only by the design-sync bundle.
 *
 * The real one decides between client-side navigation and an external link,
 * and resolves `baseUrl` for an internal path. None of that exists outside a
 * Docusaurus app: there is no router and no `baseUrl`. What survives, and
 * what `Card` actually depends on, is the anchor and its `href`.
 *
 * Not a catalog component and never published as one — it is a framework
 * dependency substituted at the boundary, the same way React itself is
 * externalized to `window.React` by the converter.
 */

import React from 'react';

export default function Link({to, href, ...rest}) {
  return <a href={to ?? href ?? '#'} {...rest} />;
}
