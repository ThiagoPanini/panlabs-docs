/**
 * Which of an article's tags is its TYPE: the closed set the article
 * contract enforces exactly one of, checked by `processBlogPosts` in
 * `docusaurus.config.js` (`ARTICLE_TYPES`) against `content/blog/tags.yml`'s
 * three top entries.
 *
 * A third copy of the same three names, on purpose: `docusaurus.config.js`
 * already accepts the two-file cost of this list having no single source,
 * since it runs in Node with no YAML parser to share one with — and this
 * file runs in the browser, where importing that Node config isn't on the
 * table either.
 */
const ARTICLE_TYPE_SLUGS = ['novidades', 'tutoriais', 'notas'];

/** @param {string} permalink */
function slugOf(permalink) {
  return permalink.split('/').pop();
}

/**
 * @param {{label: string, permalink: string}[]} tags
 * @returns {{label: string, permalink: string} | undefined}
 */
export function articleTypeTag(tags) {
  return tags.find((tag) => ARTICLE_TYPE_SLUGS.includes(slugOf(tag.permalink)));
}
