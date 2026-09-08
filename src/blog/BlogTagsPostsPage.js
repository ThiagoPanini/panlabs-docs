/**
 * `blogTagsPostsComponent`: one tag's articles. Reuses `PostList`, the same
 * renderer the index uses, with a header that names the tag instead of the
 * blog — DECISIONS.md's article-pages ticket asks for exactly this reuse
 * instead of a second list built from scratch.
 *
 * The description line is the TAG'S OWN, straight out of `content/blog/
 * tags.yml`. It used to print the article count, which the mono eyebrow
 * above it now says on its own — two lines saying `3 artigos` in a row was
 * the whole header. The catalog already writes a sentence per tag and it
 * only ever reached the page's `<meta>`; this is where it reads.
 */

import React from 'react';
import clsx from 'clsx';
import {HtmlClassNameProvider, PageMetadata, ThemeClassNames} from '@docusaurus/theme-common';
import Layout from '@theme/Layout';

import PostList, {ListHeader} from './PostList';
import {formatArticleCount} from './format';

import styles from './PostList.module.css';

export default function BlogTagsPostsPage({tag, items, listMetadata}) {
  const {label, count, description} = tag;

  return (
    <HtmlClassNameProvider
      className={clsx(ThemeClassNames.wrapper.blogPages, ThemeClassNames.page.blogTagPostListPage)}>
      <PageMetadata title={label} description={description} />
      <Layout>
        <main className={styles.page}>
          <PostList
            header={
              <ListHeader
                eyebrow={formatArticleCount(count)}
                title={label}
                description={description}
              />
            }
            items={items}
            metadata={listMetadata}
          />
        </main>
      </Layout>
    </HtmlClassNameProvider>
  );
}
