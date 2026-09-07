/**
 * `blogTagsListComponent`: every tag, with its count, linking to its own
 * page. No letter grouping (`@theme/TagsListByLetter` is `unsafe`, and the
 * catalog here is small enough that a flat list needs none).
 */

import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import {HtmlClassNameProvider, PageMetadata, ThemeClassNames} from '@docusaurus/theme-common';
import Layout from '@theme/Layout';

import styles from './PostList.module.css';

export default function BlogTagsListPage({tags}) {
  return (
    <HtmlClassNameProvider
      className={clsx(ThemeClassNames.wrapper.blogPages, ThemeClassNames.page.blogTagsListPage)}>
      <PageMetadata title="Todas as tags" />
      <Layout>
        <main className={styles.page}>
          <header className={styles.header}>
            <div>
              <h1 className={styles.title}>Todas as tags</h1>
            </div>
          </header>
          <ul className={styles.tagIndex}>
            {tags.map((tag) => (
              <li key={tag.permalink}>
                <Link className={styles.tagIndexLink} to={tag.permalink}>
                  <span>{tag.label}</span>
                  <span className={styles.tagIndexCount}>{tag.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </main>
      </Layout>
    </HtmlClassNameProvider>
  );
}
