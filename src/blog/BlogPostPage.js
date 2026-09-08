/**
 * `blogPostComponent`: one article. `@theme/BlogPostPage`, `BlogPostItem`
 * and every component under it are `unsafe`, so the breadcrumb, the header,
 * the meta line, the signature, and the footer are all written here from
 * scratch — the only theme pieces reused are the ones the handoff cleared:
 * `@theme/Layout`, `@theme/TOC`, `@theme/MDXContent`, and this repository's
 * own `CopyPage` (not a theme component — it's this project's file, just
 * parked under `src/theme/` alongside the swizzles it was born to reach).
 *
 * THE `markdown` ID isn't conditional on `isBlogPostPage` the way upstream's
 * is: this component only ever renders the standalone post page, never a
 * truncated list preview, so the RSS feed's anchor (`blogPostContainerID`,
 * consumed by `feed.js` after the build) can be written unconditionally.
 *
 * THE FIRST TAG IS THE ACCENT, here as the breadcrumb's second segment and
 * again as the media banner's word. Unlike a card, this page repeats it on
 * purpose: the two sit far enough apart that the banner reads as a label
 * for what's below it rather than as an echo. The footer then lists EVERY
 * tag, the accent included, for whoever scrolled all the way down.
 */

import React from 'react';
import clsx from 'clsx';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import {HtmlClassNameProvider, PageMetadata, ThemeClassNames} from '@docusaurus/theme-common';
import {BlogPostProvider, useBlogPostStructuredData} from '@docusaurus/plugin-content-blog/client';
import {blogPostContainerID} from '@docusaurus/utils-common';
import Layout from '@theme/Layout';
import MDXContent from '@theme/MDXContent';
import TOC from '@theme/TOC';

import CopyPage from '@site/src/theme/MDXComponents/CopyPage';

import Plate from './Plate';
import TagChips from './TagChips';
import Paginator from './Paginator';
import {formatDateShort, formatReadingTimeShort} from './format';

import styles from './Article.module.css';

/** Needs `useBlogPost()` under the hood, hence living inside the provider. */
function StructuredData() {
  const structuredData = useBlogPostStructuredData();
  return (
    <Head>
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
    </Head>
  );
}

function Signature({author, imageUrl}) {
  const {name, title, url} = author;
  const photo = imageUrl ?? author.imageURL;
  const body = (
    <>
      {photo && <img className={styles.signaturePhoto} src={photo} alt="" />}
      <span className={styles.signatureText}>
        {name && <span className={styles.signatureName}>{name}</span>}
        {title && <span className={styles.signatureRole}>{title}</span>}
      </span>
    </>
  );
  // No author page exists on this site (DECISIONS.md#the-blog-is-a-tab-not-a-docs-instance
  // refuses one), but `url` — the author's own profile, from `authors.yml` —
  // still makes the signature worth linking, external target like any other
  // profile link on the site.
  return url ? (
    <a className={styles.signature} href={url} target="_blank" rel="noreferrer">
      {body}
    </a>
  ) : (
    <span className={styles.signature}>{body}</span>
  );
}

export default function BlogPostPage({content}) {
  const BlogPostContent = content;
  const {metadata, assets, frontMatter, toc} = content;
  const {
    title,
    description,
    date,
    permalink,
    readingTime,
    tags,
    authors,
    nextItem,
    prevItem,
  } = metadata;
  const {
    hide_table_of_contents: hideToc,
    toc_min_heading_level: tocMinLevel,
    toc_max_heading_level: tocMaxLevel,
    title_meta: titleMeta,
  } = frontMatter;

  // One value, two jobs since this ticket: it still feeds `og:image`, and
  // it now decides whether the banner below is a photograph or a plate.
  const image = assets.image ?? frontMatter.image;
  const [accent] = tags;
  const showToc = !hideToc && toc.length > 0;

  return (
    <BlogPostProvider content={content} isBlogPostPage>
      <HtmlClassNameProvider
        className={clsx(ThemeClassNames.wrapper.blogPages, ThemeClassNames.page.blogPostPage)}>
        <PageMetadata title={titleMeta ?? title} description={description} image={image}>
          <meta property="og:type" content="article" />
        </PageMetadata>
        <StructuredData />
        <Layout>
          <main className={styles.page}>
            <article className={styles.articleShell}>
              {/* `.headStack` caps this block to prose width and centers it
                  inside the wider shell (prose + gutter + TOC rail) — the
                  title reads at the same width as the body under it, never
                  stretched under where the TOC rail sits. */}
              <div className={styles.headStack}>
                <nav className={styles.breadcrumb} aria-label="Trilha">
                  <Link className={styles.breadcrumbRoot} to="/blog">
                    Blog
                  </Link>
                  {accent && (
                    <>
                      <span className={styles.breadcrumbSlash} aria-hidden="true">
                        /
                      </span>
                      <Link className={styles.breadcrumbLeaf} to={accent.permalink}>
                        {accent.label}
                      </Link>
                    </>
                  )}
                </nav>

                <div className={styles.titleRow}>
                  <h1 className={styles.title}>{title}</h1>
                  <CopyPage permalink={permalink} />
                </div>
                <p className={styles.subtitle}>{description}</p>

                {/* Signature and stamp on one line, the stamp pushed to the
                    far end. The tag chips used to sit here too; `2b` moved
                    them to the footer, which is also the only place they
                    aren't competing with the byline for the same row. */}
                <div className={styles.meta}>
                  {authors.map((author, i) => (
                    <Signature
                      key={author.name ?? author.imageURL ?? i}
                      author={author}
                      imageUrl={assets.authorsImageUrls[i]}
                    />
                  ))}
                  <span className={styles.metaStamp}>
                    <span>{formatDateShort(date)}</span>
                    {readingTime !== undefined && (
                      <span>{formatReadingTimeShort(readingTime)}</span>
                    )}
                  </span>
                </div>

                {image ? (
                  <img className={styles.banner} src={image} alt="" />
                ) : (
                  <Plate
                    className={styles.banner}
                    word={accent?.label}
                    caption={permalink}
                  />
                )}
              </div>

              {/* Below 1280px the rail (further down) is `display: none` —
                  this native `<details>` is what "recolhido como na
                  documentação" means at that width: the same collapsed
                  affordance `DocItemTOCMobile` gives a doc page, built from
                  scratch since `TOCCollapsible`'s own `CollapseButton`
                  hardcodes the theme's translated label ("On this page"),
                  which the blog's vocabulary rule (DECISIONS.md's article
                  spec) doesn't allow. */}
              {showToc && (
                <details className={styles.tocMobile}>
                  <summary className={styles.tocMobileSummary}>Nesta página</summary>
                  <TOC toc={toc} minHeadingLevel={tocMinLevel} maxHeadingLevel={tocMaxLevel} />
                </details>
              )}

              <div className={styles.grid}>
                <div id={blogPostContainerID} className={clsx('markdown', styles.prose)}>
                  <MDXContent>
                    <BlogPostContent />
                  </MDXContent>
                </div>
                {showToc && (
                  <div className={styles.tocRail}>
                    <TOC toc={toc} minHeadingLevel={tocMinLevel} maxHeadingLevel={tocMaxLevel} />
                  </div>
                )}
              </div>

              <div className={styles.footStack}>
                <footer className={styles.footer}>
                  <span className={styles.footerLabel}>Tags</span>
                  <TagChips tags={tags} />
                </footer>

                {(prevItem || nextItem) && (
                  <Paginator
                    ariaLabel="Navegação entre artigos"
                    prev={
                      prevItem && {
                        href: prevItem.permalink,
                        label: prevItem.title,
                        sublabel: 'Artigo anterior',
                      }
                    }
                    next={
                      nextItem && {
                        href: nextItem.permalink,
                        label: nextItem.title,
                        sublabel: 'Próximo artigo',
                      }
                    }
                  />
                )}
              </div>
            </article>
          </main>
        </Layout>
      </HtmlClassNameProvider>
    </BlogPostProvider>
  );
}
