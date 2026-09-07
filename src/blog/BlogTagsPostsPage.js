/**
 * `blogTagsPostsComponent`: one tag's articles. Reuses `PostList`, the same
 * renderer the index uses, with a header that names the tag instead of the
 * blog — DECISIONS.md's article-pages ticket asks for exactly this reuse
 * instead of a second list built from scratch.
 */

import React from 'react';
import clsx from 'clsx';
import {HtmlClassNameProvider, PageMetadata, ThemeClassNames} from '@docusaurus/theme-common';
import Layout from '@theme/Layout';

import PostList, {ListHeader} from './PostList';

import styles from './PostList.module.css';

function articleCount(count) {
  return count === 1 ? '1 artigo' : `${count} artigos`;
}

export default function BlogTagsPostsPage({tag, items, listMetadata}) {
  const {label, count, description} = tag;

  return (
    <HtmlClassNameProvider
      className={clsx(ThemeClassNames.wrapper.blogPages, ThemeClassNames.page.blogTagPostListPage)}>
      <PageMetadata title={label} description={description} />
      <Layout>
        <main className={styles.page}>
          <PostList
            header={<ListHeader title={label} description={articleCount(count)} />}
            items={items}
            metadata={listMetadata}
          />
        </main>
      </Layout>
    </HtmlClassNameProvider>
  );
}
