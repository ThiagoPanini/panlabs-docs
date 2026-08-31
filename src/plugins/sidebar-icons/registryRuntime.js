/**
 * The static half of `src/icons/registry.js`: everything after the
 * generated `import` list and `DRAWINGS` map. Concatenated as TEXT by
 * `./index.js`, not imported as a module — `DRAWINGS` below is a free
 * variable, defined by the generated block this gets appended to, not by
 * this file. Kept as real, lintable JS instead of a hand-escaped string
 * template: the alternative was this exact source, one indirection later.
 */

/**
 * Levenshtein distance, hand-written: a dependency for eight lines is the
 * worse trade. `src/plugins/sidebar-icons/index.js` carries its own copy
 * of this same function — that one runs here in Node, at build time; this
 * one runs in the browser/SSR, inside the bundle this file becomes part
 * of. Neither can import the other.
 *
 * @param {string} a
 * @param {string} b
 */
function distance(a, b) {
  const row = Array.from({length: b.length + 1}, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const saved = row[j];
      row[j] = Math.min(
        row[j] + 1,
        row[j - 1] + 1,
        previous + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      previous = saved;
    }
  }
  return row[b.length];
}

/**
 * @param {string} name
 * @returns {string | undefined} the nearest neighbor, if a plausible one exists
 */
function nearestNeighbor(name) {
  let best;
  let smallest = Infinity;
  for (const candidate of Object.keys(DRAWINGS)) {
    const d = distance(name, candidate);
    if (d < smallest) {
      smallest = d;
      best = candidate;
    }
  }
  // Past a third of the length, the suggestion turns into noise: better not
  // to suggest than to send someone to the wrong glyph.
  return smallest <= Math.max(2, Math.ceil(name.length / 3)) ? best : undefined;
}

/**
 * Unknown names throw instead of degrading silently: Docusaurus prerenders
 * every page at build time, so this throw is a build failure, not a
 * runtime one (in `docusaurus start` it surfaces as a React error
 * overlay).
 *
 * @param {string} name
 * @returns {React.ComponentType<React.SVGProps<SVGSVGElement>>}
 */
export function resolveIcon(name) {
  const drawing = DRAWINGS[name];
  if (drawing) {
    return drawing;
  }
  const suggestion = nearestNeighbor(name);
  throw new Error(
    [
      `Ícone "${name}" não está no registro gerado.`,
      suggestion && `Você quis dizer "${suggestion}"?`,
      'Se for um slug válido do Lucide, rode a build de novo para incluí-lo.',
    ]
      .filter(Boolean)
      .join('\n'),
  );
}
