/**
 * Local search index, shipped as global client data, not a JSON file
 * fetched at runtime. That path fails invisibly: under the SPA and
 * `onBrokenLinks`, a missing route returns 200 with the site shell, so
 * `fetch().json()` throws on parse, never on a 404. Global data also
 * works in `docusaurus start`, since it ships inside the bundle, which
 * exists on the dev server.
 */

import {pagesFrom, tabLabels} from '../pages';

/**
 * 64 KB serialized ceiling, self-enforced: a ceiling, not a target.
 *
 * No separate CI step checks this, the build itself fails over budget.
 * An index that grows unchecked turns into a megabyte in the main bundle
 * of every page on the site, and the symptom is diffuse slowness nobody
 * traces back to search.
 */
const CEILING = 64 * 1024;

/** Indexed body per page, deliberately short: enough to match, not a copy. */
const BODY_LIMIT = 200;

const FENCE = /^\s*(?:```|~~~)/;

const HEADING = /^(#{1,6})\s+(.+?)\s*(?:\{#[^}]*\})?\s*$/;

/**
 * MDX to the text search matches against.
 *
 * Fenced code blocks are dropped entirely: a query that matched inside a
 * `curl` example would return a snippet that highlights mid-JSON-string,
 * unreadable to the reader.
 *
 * @param {string} body MDX with front matter and the top `import` block removed
 */
function extract(body) {
  const headings = [];
  const prose = [];
  let insideFence = false;

  for (const line of body.split('\n')) {
    if (FENCE.test(line)) {
      insideFence = !insideFence;
      continue;
    }
    if (insideFence) {
      continue;
    }
    const h = HEADING.exec(line);
    if (h) {
      // Level 1 is the title, already captured as `t`. Levels 5 and 6
      // never occur here, headings in this content are capped at 4.
      if (h[1].length >= 2 && h[1].length <= 4) {
        headings.push(h[2]);
      }
      continue;
    }
    prose.push(line);
  }

  return {headings, text: toPlainText(prose.join('\n'))};
}

/**
 * Strips markup, returns prose.
 *
 * Not a parser: just enough that the snippet shown to the reader doesn't
 * start with `<ParamField name=` or a table's leading pipe.
 *
 * @param {string} text
 */
function toPlainText(text) {
  return text
    // The accessible label is pulled out BEFORE the tag is discarded: it's
    // the only prose that describes a diagram. The line below would strip
    // the whole tag together with it, making the diagram unfindable in the
    // index.
    .replace(/<[^>]*\saria-label="([^"]*)"[^>]*>/g, ' $1 ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/^\s*:::.*$/gm, ' ')
    .replace(/^\s*\|.*$/gm, ' ')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[`*_>#]/g, '')
    .replace(/^\s*[-+]\s+/gm, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, BODY_LIMIT);
}

/**
 * @param {import('@docusaurus/types').LoadContext} context
 * @param {{tabs: string[]}} options
 * @returns {import('@docusaurus/types').Plugin}
 */
export default function searchPlugin(context, options) {
  return {
    name: 'pd-search',

    // `contentLoaded` only sees a plugin's own content, and this plugin has
    // none: it reads three `docusaurus-plugin-content-docs` instances via
    // `allContent`. `allContentLoaded` is the hook that receives that, and
    // it exposes the same `setGlobalData` action.
    async allContentLoaded({allContent, actions}) {
      const {i18n, siteDir} = context;

      const records = pagesFrom({allContent, siteDir, tabs: options.tabs}).map((page) => {
        const {headings, text} = extract(page.body);
        return {
          u: page.permalink,
          t: page.title,
          d: page.description,
          s: headings,
          b: text,
          x: page.tabIndex,
        };
      });

      const bytes = Buffer.byteLength(JSON.stringify(records), 'utf8');
      if (bytes > CEILING) {
        const largest = [...records]
          .sort((a, b) => JSON.stringify(b).length - JSON.stringify(a).length)
          .slice(0, 5)
          .map((r) => `  ${JSON.stringify(r).length} B  ${r.u}`)
          .join('\n');
        throw new Error(
          [
            `O índice de busca estourou o teto: ${bytes} B contra ${CEILING} B (locale ${i18n.currentLocale}).`,
            'É teto, não meta — o índice viaja no bundle principal de toda página do site.',
            'As cinco maiores entradas:',
            largest,
          ].join('\n'),
        );
      }

      // Labels travel with the data because the server is what translates
      // them: they come from the navbar, already localized by the core by
      // the time this hook runs. Resolving them on the client would mean
      // reimplementing the same rule a second time.
      actions.setGlobalData({
        records,
        tabs: tabLabels(context.siteConfig.themeConfig, options.tabs),
      });
    },
  };
}
