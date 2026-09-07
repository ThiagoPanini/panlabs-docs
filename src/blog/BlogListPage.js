/**
 * `blogListComponent`: the blog's index. A component of this repository,
 * not `@theme/BlogListPage` — that one, like every `@theme/Blog*`, is
 * `unsafe` in the swizzle ledger, and the budget for this project is zero.
 * See DECISIONS.md#the-swizzle-ladder-and-a-zero-unsafe-budget.
 *
 * Built the same way `src/pages/index.js` builds the landing: `@theme/Layout`
 * directly, an `HtmlClassNameProvider` for the one class the route needs on
 * `<html>`, and a hand-written `<main>` — nothing here goes through
 * `BlogLayout`, which is itself `unsafe`.
 */

import React from 'react';
import clsx from 'clsx';
import Head from '@docusaurus/Head';
import {HtmlClassNameProvider, PageMetadata, ThemeClassNames} from '@docusaurus/theme-common';
import {useBlogListPageStructuredData} from '@docusaurus/plugin-content-blog/client';
import Layout from '@theme/Layout';

import PostList, {FeedLink, ListHeader} from './PostList';

import styles from './PostList.module.css';

/** `useBlogListPageStructuredData` takes exactly the page's own props — the
 * same shape `@theme/BlogListPage/StructuredData` consumes upstream. */
function StructuredData(props) {
  const structuredData = useBlogListPageStructuredData(props);
  return (
    <Head>
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
    </Head>
  );
}

export default function BlogListPage(props) {
  const {metadata, items} = props;
  const {blogTitle, blogDescription} = metadata;

  return (
    <HtmlClassNameProvider
      className={clsx(ThemeClassNames.wrapper.blogPages, ThemeClassNames.page.blogListPage)}>
      <PageMetadata title={blogTitle} description={blogDescription} />
      <StructuredData {...props} />
      <Layout>
        <main className={styles.page}>
          <PostList
            header={
              <ListHeader title={blogTitle} description={blogDescription} action={<FeedLink />} />
            }
            items={items}
            metadata={metadata}
          />
        </main>
      </Layout>
    </HtmlClassNameProvider>
  );
}
