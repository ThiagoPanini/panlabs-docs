/**
 * Date and reading-time formatting for the blog's own vocabulary.
 *
 * Hand-written instead of imported: `useDateTimeFormat` lives in
 * `@docusaurus/theme-common/internal` and returns the THEME's translated
 * string, and DECISIONS.md#the-blog-is-a-tab-not-a-docs-instance asks for
 * this project's own words, not the theme's. `Intl.DateTimeFormat` is what
 * the theme itself calls underneath, called here the same way.
 */

const DATE_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  // Front matter's `date` has no time of day, and without a fixed zone the
  // reader's own offset can roll it back to the previous day.
  timeZone: 'UTC',
});

/** @param {string} isoDate */
export function formatDate(isoDate) {
  return DATE_FORMATTER.format(new Date(isoDate));
}

/** @param {number | undefined} minutes */
export function formatReadingTime(minutes) {
  if (minutes === undefined) {
    return undefined;
  }
  return `${Math.max(1, Math.round(minutes))} min de leitura`;
}
