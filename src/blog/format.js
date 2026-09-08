/**
 * The blog's own vocabulary: dates, reading time, and the one count the
 * listing pages print.
 *
 * Hand-written instead of imported: `useDateTimeFormat` lives in
 * `@docusaurus/theme-common/internal` and returns the THEME's translated
 * string, and DECISIONS.md#the-blog-is-a-tab-not-a-docs-instance asks for
 * this project's own words, not the theme's. `Intl.DateTimeFormat` is what
 * the theme itself calls underneath, called here the same way.
 *
 * TWO FORMS, AND THE CRITERION IS THE SLOT, NOT THE PAGE. The long form
 * ("7 de setembro de 2026", "15 min de leitura") goes where the line has
 * room to read as a sentence: the featured card's byline. The short form
 * ("07 SET 2026", "2 MIN") goes where the datum is a COLUMN — the list
 * row's right rail and the article's meta line, both of them mono, both of
 * them read by scanning down rather than across. A slot doesn't get to pick
 * the long form because it has room; it gets it because it's prose.
 */

const DATE_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  // Front matter's `date` has no time of day, and without a fixed zone the
  // reader's own offset can roll it back to the previous day.
  timeZone: 'UTC',
});

const DATE_SHORT_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

/** @param {string} isoDate */
export function formatDate(isoDate) {
  return DATE_FORMATTER.format(new Date(isoDate));
}

/**
 * `07 SET 2026`.
 *
 * Assembled from `formatToParts`, not from `format()`: pt-BR's short month
 * is abbreviated WITH a trailing period ("7 de set. de 2026"), and the
 * connective "de" appears twice. Reading the parts is what gets three
 * tokens and a space between them without a locale-specific string
 * surgery that breaks the day ICU changes its mind about the period.
 *
 * @param {string} isoDate
 */
export function formatDateShort(isoDate) {
  const parts = DATE_SHORT_FORMATTER.formatToParts(new Date(isoDate));
  const part = (type) => parts.find((piece) => piece.type === type)?.value ?? '';
  return `${part('day')} ${part('month').replace('.', '')} ${part('year')}`.toUpperCase();
}

/** @param {number | undefined} minutes */
export function formatReadingTime(minutes) {
  if (minutes === undefined) {
    return undefined;
  }
  return `${roundMinutes(minutes)} min de leitura`;
}

/** `2 MIN`. @param {number | undefined} minutes */
export function formatReadingTimeShort(minutes) {
  if (minutes === undefined) {
    return undefined;
  }
  return `${roundMinutes(minutes)} MIN`;
}

/** The floor is 1: a 20-second article still takes a minute to open. */
function roundMinutes(minutes) {
  return Math.max(1, Math.round(minutes));
}

/**
 * `3 artigos`, the eyebrow over both listing headers, uppercased by CSS.
 *
 * It counts the WHOLE collection, not the page: the index reads
 * `metadata.totalCount` and a tag page reads the tag's own `count`. What it
 * deliberately does NOT say is when the collection started — `items` is only
 * the current page's slice and `blogSidebarCount: 0` removes the one other
 * full list, so "desde <mês>" would be right for as long as there is a
 * single page of articles and quietly wrong from the eleventh on.
 *
 * @param {number} count
 */
export function formatArticleCount(count) {
  return count === 1 ? '1 artigo' : `${count} artigos`;
}
