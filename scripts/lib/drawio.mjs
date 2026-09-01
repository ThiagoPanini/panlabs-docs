/**
 * The pure-Node half of tab selection: everything about a `.drawio.svg`
 * that can be answered without draw.io's own renderer.
 *
 * A `.drawio.svg` is one drawing plus its whole editable source. The
 * drawing is whichever tab was active when the editor saved; the source
 * rides along in the root `content` attribute as an `<mxfile>` listing
 * EVERY tab. Measured on this repository's two published diagrams: the
 * file carries a single `viewBox` and a single drawing, while `content`
 * can name any number of `<diagram id name>`. That asymmetry is the whole
 * problem — the format cannot render two tabs.
 *
 * Splitting that source is text work: inflate, pick one `<diagram>`, wrap
 * it in a fresh `<mxfile>`. Only turning the result back into a drawing
 * needs draw.io, which is why that lives in `drawio-render.mjs` and this
 * file has no dependency at all. The split running here is what lets the
 * build-time gate verify a derived file without launching a browser.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';

/** Masters. A tab is selected out of one of these, never out of a derived file. */
export const MASTER_SUFFIX = '.drawio.svg';

/**
 * `import X from './a.drawio.svg?aba=slug'`, as an MDX author writes it.
 *
 * The query is OPTIONAL by design: an import with no `?aba=` keeps
 * resolving to the master and rendering whatever draw.io drew, exactly as
 * before this existed. Only the query opts a file into generation, so the
 * single-tab diagrams already published need no edit and grow no twin.
 */
export const TAB_IMPORT = /from\s+['"]([^'"]*\.drawio\.svg)\?aba=([^'"]+)['"]/g;

/** Only these two extensions carry MDX; anything else under `content/` is an asset. */
const CONTENT_FILE = /\.mdx?$/i;

/**
 * The generated file's first line, and the only place the gate reads.
 *
 * It sits OUTSIDE the root element on purpose: SVGO strips comments, so
 * nothing here can reach the browser, and keeping it out of the element
 * means no attribute of draw.io's own output is touched. The gate reads
 * the file from disk, before any of that runs.
 */
const STAMP = /^<!-- pd-diagram-tabs (\{.*?\}) -->/;

/**
 * A tab name as it appears in the import. Accents are folded rather than
 * escaped: the names this has to survive are Portuguese (`Visão geral`),
 * and a slug that keeps `ã` would have to be percent-encoded in the query
 * to reach webpack intact.
 *
 * @param {string} name
 */
export function slugify(name) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * The XML entities draw.io writes into the `content` attribute. Ampersand
 * is undone LAST: doing it first would turn `&amp;lt;` — a literal `&lt;`
 * in someone's label — into a tag delimiter.
 *
 * @param {string} value
 */
function unescapeAttribute(value) {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#10;/g, '\n')
    .replace(/&amp;/g, '&');
}

/**
 * One tab's `<mxGraphModel>`. draw.io writes the body either as plain XML
 * or as base64 over a raw deflate stream with the result URI-encoded, and
 * the `compressed` attribute on `<mxfile>` does NOT reliably say which:
 * both files in this repository declare `compressed="false"` and carry the
 * compressed form. Sniffing the first character is what actually works.
 *
 * @param {string} body
 */
function inflatePage(body) {
  const trimmed = body.trim();
  if (trimmed.startsWith('<')) {
    return trimmed;
  }
  const raw = zlib.inflateRawSync(Buffer.from(trimmed, 'base64')).toString('utf8');
  return decodeURIComponent(raw);
}

/**
 * The identity a derived file is checked against. Twelve hex characters of
 * SHA-256 over the tab's own XML: the master's bytes change on every save
 * (draw.io rewrites the drawing), while a tab nobody touched hashes the
 * same, which is what keeps an edit to one tab from re-rendering the rest.
 *
 * @param {string} xml
 */
export function hashPage(xml) {
  return crypto.createHash('sha256').update(xml, 'utf8').digest('hex').slice(0, 12);
}

/**
 * Every tab in a master, in the order the editor shows them.
 *
 * @param {string} filePath
 * @returns {Promise<{id: string, name: string, slug: string, xml: string, hash: string}[]>}
 */
export async function readTabs(filePath) {
  const source = await fs.readFile(filePath, 'utf8');
  const attribute = source.match(/\scontent="([^"]*)"/);
  if (!attribute) {
    throw new Error(
      [
        `${path.basename(filePath)} não tem o atributo \`content\`.`,
        'Só um `.drawio.svg` salvo pelo editor carrega as abas; um SVG comum não tem aba para escolher.',
      ].join('\n'),
    );
  }

  const mxfile = unescapeAttribute(attribute[1]);
  const tabs = [];
  for (const [, attributes, body] of mxfile.matchAll(/<diagram\b([^>]*)>([\s\S]*?)<\/diagram>/g)) {
    const name = attributes.match(/\bname="([^"]*)"/)?.[1] ?? '';
    const id = attributes.match(/\bid="([^"]*)"/)?.[1] ?? '';
    const xml = inflatePage(body);
    tabs.push({id, name, slug: slugify(name), xml, hash: hashPage(xml)});
  }

  // Two tabs folding onto one slug would make the import ambiguous, and
  // the file that loses would be overwritten by the file that wins with no
  // sign anything happened.
  const seen = new Map();
  for (const tab of tabs) {
    if (seen.has(tab.slug)) {
      throw new Error(
        [
          `${path.basename(filePath)} tem duas abas com o mesmo slug "${tab.slug}":`,
          `  "${seen.get(tab.slug)}" e "${tab.name}".`,
          'Renomeie uma delas: o slug é o nome da aba sem acento, em minúsculas.',
        ].join('\n'),
      );
    }
    seen.set(tab.slug, tab.name);
  }

  return tabs;
}

/**
 * Where the drawing for one tab lands: next to its master, never in a
 * directory of its own. Co-location is what gives the file webpack's HMR —
 * the dev server re-reads `static/` from disk but never tells the browser,
 * while an asset beside the markdown is a module and reloads itself.
 *
 * The extension is `.svg`, not `.drawio.svg`, and that is load-bearing:
 * the VS Code extension claims `*.drawio`, `*.dio`, `*.drawio.svg`,
 * `*.dio.svg`, `*.drawio.png` and `*.dio.png`, so a plain `.svg` cannot be
 * opened in the diagram editor at all. Editing a derived file by mistake
 * is impossible by construction rather than by discipline.
 *
 * @param {string} masterPath
 * @param {string} slug
 */
export function derivedPathFor(masterPath, slug) {
  return masterPath.replace(/\.drawio\.svg$/, `.${slug}.svg`);
}

/**
 * The generated header, carrying the hash the gate compares against.
 *
 * @param {{master: string, name: string, slug: string, hash: string}} origin
 */
export function stampFor({master, name, slug, hash}) {
  const record = JSON.stringify({master, aba: name, slug, hash});
  return [
    `<!-- pd-diagram-tabs ${record} -->`,
    `<!-- GERADO a partir de ${master}, aba "${name}". Não edite: o próximo`,
    `     \`npm start\` reescreve. Desenhe na aba, no arquivo mestre. -->`,
  ].join('\n');
}

/**
 * The stamp a derived file carries, or `null` when the file is missing or
 * was not written by this plugin. A file without a stamp is never
 * overwritten and never accepted — both would be guesses about something
 * a human may have put there by hand.
 *
 * @param {string} derivedPath
 */
export async function readStamp(derivedPath) {
  let source;
  try {
    source = await fs.readFile(derivedPath, 'utf8');
  } catch {
    return null;
  }
  const match = source.match(STAMP);
  if (!match) {
    return null;
  }
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

/**
 * Every `?aba=` an MDX author wrote, anywhere under `content/`, resolved to
 * an absolute master path.
 *
 * Scanning the content tree — rather than generating every tab of every
 * master — is what keeps the repository free of files nobody imports. A
 * tab drawn for the author's own use costs nothing until a page asks for
 * it. Same shape as the icon registry, which resolves only the slugs
 * `content/**` actually names.
 *
 * @param {string} contentDir
 * @returns {Promise<{master: string, slug: string, source: string}[]>}
 */
export async function scanTabImports(contentDir) {
  const found = [];

  /** @param {string} dir */
  async function walk(dir) {
    const entries = await fs.readdir(dir, {withFileTypes: true});
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
        continue;
      }
      if (!CONTENT_FILE.test(entry.name)) {
        continue;
      }
      const source = await fs.readFile(full, 'utf8');
      for (const [, request, slug] of source.matchAll(TAB_IMPORT)) {
        found.push({
          master: path.resolve(path.dirname(full), request),
          slug,
          source: path.relative(contentDir, full),
        });
      }
    }
  }

  await walk(contentDir);
  return found;
}

/**
 * Levenshtein distance, hand-written for the reason the icon plugin gives:
 * a dependency for eight lines is the worse trade.
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
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = saved;
    }
  }
  return row[b.length];
}

/**
 * The refusal an unknown slug gets, with the tabs the file actually has
 * and a nearest neighbor when one is plausible. Same ratio as everywhere
 * else in this project: past a third of the length the suggestion turns
 * into noise.
 *
 * @param {string} slug
 * @param {{name: string, slug: string}[]} tabs
 * @param {string} masterPath
 * @param {string} source
 */
export function unknownTabError(slug, tabs, masterPath, source) {
  let best;
  let smallest = Infinity;
  for (const tab of tabs) {
    const d = distance(slug, tab.slug);
    if (d < smallest) {
      smallest = d;
      best = tab.slug;
    }
  }
  const suggestion = smallest <= Math.max(2, Math.ceil(slug.length / 3)) ? best : undefined;

  return new Error(
    [
      `${source} pede a aba "${slug}" de ${path.basename(masterPath)}, que não existe.`,
      suggestion && `Você quis dizer "${suggestion}"?`,
      `Abas do arquivo: ${tabs.map((tab) => `"${tab.slug}"`).join(', ') || 'nenhuma'}.`,
    ]
      .filter(Boolean)
      .join('\n'),
  );
}
