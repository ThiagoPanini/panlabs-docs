/**
 * Single entry point both the search plugin and AI-era artifacts read: the
 * full content tree, in reading order, with each page's MDX body, so the
 * two consumers can't drift into different orders.
 *
 * Reads MDX source, not rendered HTML. Uses `allContentLoaded` because
 * `contentLoaded` only sees a plugin's own content, and this module has none.
 */

import fs from 'node:fs';
import path from 'node:path';

const DOCS_PLUGIN = 'docusaurus-plugin-content-docs';
const BLOG_PLUGIN = 'docusaurus-plugin-content-blog';

/**
 * The blog's id in `TABS`, hardcoded rather than derived: the blog is a
 * named exception (DECISIONS.md#the-blog-is-a-tab-not-a-docs-instance), the
 * one tab that isn't a `plugin-content-docs` instance, not a second kind of
 * docs instance a config value could generalize away. Exported so the
 * ai-era plugin can recognize a blog page without re-declaring the string.
 */
export const BLOG_TAB = 'blog';

const FRONT_MATTER = /^---\r?\n[\s\S]*?\r?\n---[ \t]*\r?\n?/;

/** `import` or `export` on a line, tested only at the TOP, never in the body. */
const IMPORT_OR_EXPORT = /^[ \t]*(?:import|export)\s/;

/**
 * Removes only the import/export block at the very top of the file.
 *
 * Scoped to the top on purpose: recipe pages have `import` at column 0
 * inside fenced code blocks, because that's what an SDK snippet shows.
 * A global scan would eat the example silently, the page would ship with
 * mutilated code and the build would still pass.
 *
 * Content files currently import nothing, the whole component catalog is
 * registered in `@theme/MDXComponents`. This removal keeps that promise
 * true even if someone breaks the convention.
 *
 * @param {string} text
 */
function withoutTopImport(text) {
  const lines = text.split('\n');
  let i = 0;
  while (i < lines.length && (lines[i].trim() === '' || IMPORT_OR_EXPORT.test(lines[i]))) {
    i += 1;
  }
  return lines.slice(i).join('\n');
}

/**
 * Resolves an `@site/...`-aliased source path to a file on disk and reads
 * its body, front matter and top import/export block stripped.
 *
 * Shared by the docs and blog branches of `pagesFrom`: `doc.source` and
 * `post.metadata.source` are both `aliasedSitePath`, the same Docusaurus
 * convention regardless of which content plugin produced them.
 *
 * @param {string} source `@site/...`-aliased path
 * @param {string} siteDir
 * @returns {{filePath: string, body: string}}
 */
function readPageBody(source, siteDir) {
  const filePath = path.join(siteDir, source.replace(/^@site[/\\]/, ''));
  const raw = fs.readFileSync(filePath, 'utf8');
  return {filePath, body: withoutTopImport(raw.replace(FRONT_MATTER, ''))};
}

/**
 * Sidebar order, flattened by depth.
 *
 * Used as the search's second tiebreaker and as the listing order in
 * `llms.txt`. A clickable category appears via its `link`, before its
 * children, matching where the reader sees it.
 *
 * @param {Record<string, unknown[]>} sidebars
 * @returns {Map<string, number>} document id to position
 */
function sidebarOrder(sidebars) {
  const order = new Map();
  let n = 0;
  const mark = (id) => {
    if (id !== undefined && !order.has(id)) {
      order.set(id, n);
      n += 1;
    }
  };
  const visit = (items) => {
    for (const item of items ?? []) {
      if (item.type === 'doc') {
        mark(item.id);
      } else if (item.type === 'category') {
        if (item.link?.type === 'doc') {
          mark(item.link.id);
        }
        visit(item.items);
      }
    }
  };
  for (const name of Object.keys(sidebars ?? {})) {
    visit(sidebars[name]);
  }
  return order;
}

/**
 * Each tab's label, read from the navbar, never declared a second time.
 *
 * Both surfaces that need it here (the `llms.txt` section and the search
 * result grouping) show the reader the exact word they just clicked.
 * Declaring the label in the plugin options would create a second copy
 * that could drift from the navbar.
 *
 * Every tab but the blog is a `docSidebar` item, matched by
 * `docsPluginId`. The blog is a plain link (`{to: '/blog', ...}`), not a
 * `docSidebar` item, because it isn't a `plugin-content-docs` instance —
 * matched by `to` instead.
 *
 * @param {{navbar?: {items?: any[]}}} themeConfig
 * @param {string[]} tabs
 * @returns {string[]} one label per tab, in declared order
 */
export function tabLabels(themeConfig, tabs) {
  const items = themeConfig?.navbar?.items ?? [];
  return tabs.map((tab) => {
    const item =
      tab === BLOG_TAB
        ? items.find((candidate) => candidate.to === '/blog')
        : items.find(
            (candidate) =>
              candidate.type === 'docSidebar' && (candidate.docsPluginId ?? 'default') === tab,
          );
    if (!item) {
      throw new Error(
        `A aba "${tab}" não tem item de navbar correspondente. O rótulo da aba é o do navbar — sem ele não há o que escrever.`,
      );
    }
    return item.label;
  });
}

/**
 * The blog's own branch of `pagesFrom`, read from `docusaurus-plugin-content-blog`
 * instead of `DOCS_PLUGIN`: a blog post has no `loadedVersions`, no
 * sidebar, and therefore no `sidebarOrder` to derive a position from.
 *
 * `content.blogPosts` arrives already sorted by date descending — that's
 * `generateBlogPosts`'s own default, not something read from a sidebar —
 * so `order` here is just the position in that array. `draft` needs no
 * filter: the blog plugin already drops a draft post before it ever
 * reaches `blogPosts` (unlike a docs draft, which only production build
 * excludes). `unlisted` does, same reason as docs: it still ships in dev.
 *
 * @param {object} args
 * @param {Record<string, Record<string, any>>} args.allContent
 * @param {string} args.siteDir
 * @param {number} args.tabIndex
 */
function blogPagesFrom({allContent, siteDir, tabIndex}) {
  const content = allContent?.[BLOG_PLUGIN]?.default;
  if (!content) {
    // Same silent-failure guard as the docs branch: a `blog` id left in
    // `TABS` with the plugin itself missing from the config would
    // otherwise drop every article from search and `llms.txt` with
    // nothing raised to say so.
    throw new Error(
      `A aba "${BLOG_TAB}" não existe em allContent. A instância "default" de ${BLOG_PLUGIN} não foi encontrada.`,
    );
  }

  return content.blogPosts
    .filter((post) => !post.metadata.unlisted)
    .map((post, order) => ({
      tab: BLOG_TAB,
      tabIndex,
      order,
      id: post.id,
      title: post.metadata.title,
      description: post.metadata.description,
      permalink: post.metadata.permalink,
      ...readPageBody(post.metadata.source, siteDir),
    }));
}

/**
 * The full tree, in the order the reader sees it.
 *
 * @param {object} args
 * @param {Record<string, Record<string, any>>} args.allContent
 * @param {string} args.siteDir
 * @param {string[]} args.tabs tab ids, in navbar order — every one a docs
 *   instance except `BLOG_TAB`, read through `blogPagesFrom` instead
 */
export function pagesFrom({allContent, siteDir, tabs}) {
  const instances = allContent?.[DOCS_PLUGIN] ?? {};
  const pages = [];

  tabs.forEach((tab, tabIndex) => {
    if (tab === BLOG_TAB) {
      pages.push(...blogPagesFrom({allContent, siteDir, tabIndex}));
      return;
    }

    const content = instances[tab];
    if (!content) {
      // A missing declared tab is a silent failure: search would drop part
      // of the site and `llms.txt` would lie, with nothing raised to say so.
      throw new Error(
        `A aba "${tab}" não existe em allContent. As instâncias de ${DOCS_PLUGIN} são: ${Object.keys(instances).join(', ')}.`,
      );
    }

    for (const version of content.loadedVersions) {
      const order = sidebarOrder(version.sidebars);

      for (const doc of version.docs) {
        // `draft` is already excluded from `docs` in production, but
        // `unlisted` is not. Both are filtered explicitly here because in
        // `docusaurus start` dev mode, drafts stay in the list.
        if (doc.draft || doc.unlisted) {
          continue;
        }

        pages.push({
          tab,
          tabIndex,
          order: order.get(doc.id) ?? Number.MAX_SAFE_INTEGER,
          id: doc.id,
          title: doc.title,
          description: doc.description,
          permalink: doc.permalink,
          ...readPageBody(doc.source, siteDir),
        });
      }
    }
  });

  return pages.sort((a, b) => a.tabIndex - b.tabIndex || a.order - b.order);
}
