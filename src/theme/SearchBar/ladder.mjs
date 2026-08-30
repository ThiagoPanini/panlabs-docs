/**
 * The scoring ladder and normalization: the search's pure logic.
 */

/* It lives outside the component for two reasons, and the second is the
   one that decided it: the `SearchBar` stays what it is, JSX plus the
   `<dialog>` hooks; and it's the one non-trivial algorithm in the whole
   project, and separating it is what makes it machine-checkable. The rest
   of the repository is checked by sweep because the rest of the
   repository is CSS and content; result ordering isn't sweepable, and
   asserting "deterministic" in prose is exactly the kind of claim this
   project refuses.

   Zero new dependency, the same criterion that chose `<dialog>` and
   `<details>` over a library.

   `.mjs`, not `.js`: `package.json` doesn't declare `type`, so only the
   explicit extension makes Node read the file as a module. Webpack reads
   both. */

/**
 * The ladder: powers of two, and that's the decision.
 *
 * Each rung is worth more than the sum of every rung below it
 * (32 > 16+8+4+2+1), so the order is truly lexicographic: matching the
 * title never loses to matching three weak fields at once. A linear scale
 * would invert that somewhere, and nobody could explain exactly where.
 *
 * `prefix` is a match at the start of a WORD, anywhere in the field, not
 * just the start of the field. `webhook` matches on the high rung in both
 * `Webhooks` and `About webhooks`, since in both the reader typed the start
 * of a word that's there. The rung below is what's left over: the term
 * appears in the MIDDLE of a word, a real but weaker match.
 */
export const LADDER = [
  {weight: 64, field: 't', prefix: true},
  {weight: 32, field: 't'},
  {weight: 16, field: 's', prefix: true},
  {weight: 8, field: 's'},
  {weight: 4, field: 'd'},
  {weight: 2, field: 'b'},
  {weight: 1, field: 'u'},
];

/**
 * Lowercase and `normalize('NFD')` with no diacritic.
 *
 * These few lines cover the most common accent-typing gap for readers who
 * skip diacritics: *conciliacao* finds `Conciliação`, *idempotencia* finds
 * `Idempotência`. It runs on BOTH sides, once on the index and on every
 * keystroke on the query. Normalizing only one side is not normalizing.
 *
 * @param {string} text
 */
export function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

/** The query becomes terms: normalized, split on space, no empties. */
export const termsFrom = (query) => normalize(query).split(/\s+/).filter(Boolean);

/** Word-prefix match: start of the field, or right after a space. */
const startsWithWord = (text, term) => text.startsWith(term) || text.includes(` ${term}`);

/**
 * The normalized index, once at mount, not per keystroke.
 *
 * @param {{u: string, t: string, d?: string, s?: string[], b?: string, x: number, f?: number}[]} records
 */
export function normalizeIndex(records) {
  return records.map((r) => ({
    record: r,
    t: normalize(r.t),
    d: normalize(r.d ?? ''),
    s: normalize((r.s ?? []).join(' ')),
    b: normalize(r.b ?? ''),
    u: normalize(r.u),
  }));
}

/**
 * The results, ordered.
 *
 * Every term must match some rung: a term that doesn't drops the whole
 * record, otherwise a two-word query would return everything matching the
 * more common of the two, the opposite of refining.
 *
 * No result cap: truncating at ten would hide a match without saying it
 * hid one, and silent failure is what this project refuses everywhere.
 *
 * Tiebreak: points, then tab, then sidebar order, the order
 * `src/plugins/pages.js` already delivered the index in.
 *
 * @param {ReturnType<typeof normalizeIndex>} index
 * @param {string} query
 */
export function score(index, query) {
  const terms = termsFrom(query);
  if (terms.length === 0) {
    return [];
  }
  return index
    .map((entry, position) => {
      let points = 0;
      for (const term of terms) {
        const rung = LADDER.find(({field, prefix}) =>
          prefix ? startsWithWord(entry[field], term) : entry[field].includes(term),
        );
        if (!rung) {
          return null;
        }
        points += rung.weight;
      }
      return {...entry.record, points, position};
    })
    .filter(Boolean)
    .sort((a, b) => b.points - a.points || a.x - b.x || a.position - b.position);
}

/**
 * The excerpt shown: the description, or the body when that's what matched.
 *
 * @param {{d?: string, b?: string}} record
 * @param {string[]} terms
 */
export function excerpt(record, terms) {
  const description = record.d ?? '';
  const matchesDescription = terms.some((term) => normalize(description).includes(term));
  return matchesDescription || !record.b ? description : record.b;
}

/**
 * The ranges to highlight, in indices of the ORIGINAL text.
 *
 * The scan runs on normalized text, and the ranges come back mapped to the
 * original, since `normalize('NFD')` decomposes an accent into two code
 * points: cutting by the normalized index would put an unaccented letter
 * on screen, erasing the tilde of `informação` in front of the reader.
 *
 * When the offset count doesn't add up, a character whose piece-by-piece
 * normalization differs from the whole's, the function returns an empty
 * list. Emphasis is lost, never a letter.
 *
 * @param {string} text
 * @param {string[]} terms
 * @returns {[number, number][]} non-overlapping `[from, to)` pairs, in order
 */
export function highlightRanges(text, terms) {
  if (terms.length === 0 || !text) {
    return [];
  }
  const target = normalize(text);

  // A `normalized index → original index` map. `origin` accumulates length
  // in CODE UNITS, not loop position: iterating a string with `for…of`
  // walks by code point, and a surrogate pair measures as two.
  const offset = [];
  let origin = 0;
  for (const char of text) {
    const width = normalize(char).length;
    for (let n = 0; n < width; n += 1) {
      offset.push(origin);
    }
    origin += char.length;
  }
  offset.push(text.length);

  if (offset.length !== target.length + 1) {
    return [];
  }

  const raw = [];
  for (const term of terms) {
    let from = target.indexOf(term);
    while (from !== -1) {
      raw.push([from, from + term.length]);
      from = target.indexOf(term, from + term.length);
    }
  }
  raw.sort((a, b) => a[0] - b[0]);

  const ranges = [];
  let cursor = 0;
  for (const [from, to] of raw) {
    if (from < cursor) {
      continue;
    }
    ranges.push([offset[from], offset[to]]);
    cursor = to;
  }
  return ranges;
}
