/**
 * The root: a route that is not a page. It jumps to the bare route of the
 * navbar's first tab.
 *
 * `<main>` is mandatory. A doc page gets one from the layout; a page under
 * `src/pages/` only has one if someone writes it, and without it the skip
 * link falls back to a substitute and the page landmark is wrong.
 */

import React from 'react';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import {Redirect} from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';

/**
 * The BARE ROUTE of the first tab. It resolves because the opening leaf of
 * `sidebars-ferramentas.js` carries `slug: /` in its front matter, so
 * `/ferramentas` is a real page, not a redirect and not a 404.
 *
 * The coupling is with the POSITION in the navbar, not with a named tab:
 * whoever reorders the tabs changes this line too, and no machine pairs the
 * two. Which leaf opens the tab stays free to move — the target is the docs
 * instance, and `slug: /` travels with the leaf.
 */
const DESTINATION = '/ferramentas';

export default function Root() {
  // `<Redirect>` takes `url`, never `DESTINATION`. The router runs with no
  // `basename`, and every registered route already carries `baseUrl` inside
  // its `path`. `<Link>` prepends `baseUrl` on its own; `<Redirect>` is
  // `react-router-dom`'s raw component and does not, so an unprefixed path
  // matches nothing, falls into the catch-all and renders `NotFound`. The
  // `meta` tag is raw HTML outside the router and needs the same resolution.
  const url = useBaseUrl(DESTINATION);

  // Three mechanisms, each covering what the others cannot reach.
  return (
    <>
      <Head>
        {/* Direct entry at the URL, and the only one of the three that works
            with JavaScript off. The host emits no configurable server
            redirect, so there is no cheaper rung than this. */}
        <meta httpEquiv="refresh" content={`0; url=${url}`} />
        {/* The root is a jump, not content: indexing it would compete with
            the destination for the same query. `follow` keeps the
            destination reachable. */}
        <meta name="robots" content="noindex, follow" />
      </Head>

      {/* Navigation inside the SPA, where `<head>` is not re-evaluated — the
          navbar brand points here. It comes from the generator's own core:
          no new dependency. */}
      <Redirect to={url} />

      <Layout title="Documentação" noFooter>
        <main className="container margin-vert--xl">
          <p>Esta página leva à documentação.</p>
          {/* The case where the two above fail, and it pays for itself twice:
              it is what makes `onBrokenLinks: 'throw'` check the route at
              build time, because `<Redirect to>` is not checked. */}
          <Link to={DESTINATION}>Abrir a documentação</Link>
        </main>
      </Layout>
    </>
  );
}
