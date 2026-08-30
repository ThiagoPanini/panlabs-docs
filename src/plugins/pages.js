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
 * @param {{navbar?: {items?: any[]}}} themeConfig
 * @param {string[]} tabs
 * @returns {string[]} one label per tab, in declared order
 */
export function tabLabels(themeConfig, tabs) {
  const items = themeConfig?.navbar?.items ?? [];
  return tabs.map((tab) => {
    const item = items.find(
      (candidate) =>
        candidate.type === 'docSidebar' && (candidate.docsPluginId ?? 'default') === tab,
    );
    if (!item) {
      throw new Error(
        `A aba "${tab}" não tem item \`docSidebar\` no navbar. O rótulo da aba é o do navbar — sem ele não há o que escrever.`,
      );
    }
    return item.label;
  });
}

/**
 * The full tree, in the order the reader sees it.
 *
 * @param {object} args
 * @param {Record<string, Record<string, any>>} args.allContent
 * @param {string} args.siteDir
 * @param {string[]} args.tabs docs instance ids, in navbar order
 */
export function pagesFrom({allContent, siteDir, tabs}) {
  const instances = allContent?.[DOCS_PLUGIN] ?? {};
  const pages = [];

  tabs.forEach((tab, tabIndex) => {
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

        const filePath = path.join(siteDir, doc.source.replace(/^@site[/\\]/, ''));
        const raw = fs.readFileSync(filePath, 'utf8');

        pages.push({
          tab,
          tabIndex,
          order: order.get(doc.id) ?? Number.MAX_SAFE_INTEGER,
          id: doc.id,
          title: doc.title,
          description: doc.description,
          permalink: doc.permalink,
          filePath,
          body: withoutTopImport(raw.replace(FRONT_MATTER, '')),
        });
      }
    }
  });

  return pages.sort((a, b) => a.tabIndex - b.tabIndex || a.order - b.order);
}
