/**
 * `pd-ai-era`: emits a per-route `.md`, `llms.txt`, and `llms-full.txt`.
 * Permalinks come from `allContentLoaded`, not `postBuild({routesPaths})`:
 * `routesPaths[0]` is always `/404.html`, and the API carries a v4
 * deprecation TODO in its own type. `applyTrailingSlash` is not imported:
 * it has no official doc page or documented semver, so importing it would
 * bind the build to an unpromised contract.
 */

import fs from 'node:fs/promises';
import path from 'node:path';

import {pagesFrom, tabLabels} from '../pages';

/**
 * Document separator for `llms-full.txt`.
 *
 * Carries the source URL so the parser doesn't need to infer where one
 * document ends or where it came from.
 */
const separator = (url) => `--- [Document source](${url}) ---`;

/**
 * Emits the subtitle as a blockquote right below the `h1`.
 *
 * The served body is MDX without front matter, so the subtitle (which
 * lives in `description`) would otherwise be missing only from the `.md`,
 * while the screen and `llms.txt` both show it.
 *
 * The anchor is the `h1`: without it, the two blockquotes (index pointer
 * and subtitle) would merge into one, silently.
 *
 * The search is for the FIRST non-blank line, not the first line that
 * matches `# `: a shell comment (`# comment`) inside a fenced code block
 * could match first, inserting the subtitle mid-code with no error.
 * `pagesFrom` already strips front matter and the top `import`, so the
 * first non-blank line is reliably the author's `h1`.
 *
 * `llms-full.txt` does not use this: the description already appears
 * there as `> Summary:` above the document separator, so adding it here
 * too would duplicate the field.
 *
 * @param {{body: string, description: string, permalink: string}} page
 */
function withSubtitle({body, description, permalink}) {
  // The payload is checked too, not just the anchor. The `h1` override
  // already throws without `description`, but it's a swizzle, and this
  // repo carries no swizzle; if it were removed, the `.md` would emit a
  // bare `>` silently instead of erroring.
  if (!description?.trim()) {
    throw new Error(
      `Página sem \`description\`: ${permalink}\n` +
        'O subtítulo do `.md` servido sai desse campo, e ele é obrigatório em ' +
        'toda página.',
    );
  }

  const lines = body.split('\n');
  const titleIndex = lines.findIndex((line) => line.trim() !== '');
  if (titleIndex === -1 || !lines[titleIndex].startsWith('# ')) {
    throw new Error(
      `Página que não abre com \`# título\`: ${permalink}\n` +
        'O `.md` servido emite o subtítulo como citação abaixo do `h1`, e a ' +
        'âncora é a primeira linha com texto do corpo.',
    );
  }

  return [
    ...lines.slice(0, titleIndex + 1),
    '',
    `> ${description}`,
    ...lines.slice(titleIndex + 1),
  ].join('\n');
}

/**
 * @param {import('@docusaurus/types').LoadContext} context
 * @param {{tabs: string[]}} options
 * @returns {import('@docusaurus/types').Plugin}
 */
export default function aiEraPlugin(context, options) {
  const {siteConfig, baseUrl, i18n} = context;
  /** @type {ReturnType<typeof pagesFrom>} */
  let pages = [];

  const absoluteUrl = (permalink) => `${siteConfig.url}${permalink}`;
  const indexUrl = absoluteUrl(`${baseUrl}llms.txt`);

  return {
    name: 'pd-ai-era',

    async allContentLoaded({allContent}) {
      pages = pagesFrom({allContent, siteDir: context.siteDir, tabs: options.tabs});
    },

    // All three outputs (per-route `.md`, `llms.txt`, `llms-full.txt`) exist
    // only after a build: the dev server is a SPA and returns 200 with the
    // site shell for these paths, not 404. Verify with `build && serve`
    // against a real host.
    async postBuild({outDir}) {
      const write = async (relative, text) => {
        const destination = path.join(outDir, relative);
        await fs.mkdir(path.dirname(destination), {recursive: true});
        await fs.writeFile(destination, text, 'utf8');
      };

      // --- per-route .md ---
      //
      // Written to `outDir`, never `static/`: what's committed changes by
      // decision, and an `.md` that changes every time the prose changes
      // would be dozens of noise files in every content diff.
      await Promise.all(
        pages.map((page) =>
          write(
            `${page.permalink.slice(baseUrl.length)}.md`,
            `> [Índice para máquinas](${indexUrl}) · [Página](${absoluteUrl(page.permalink)})\n\n${withSubtitle(page).trim()}\n`,
          ),
        ),
      );

      // --- llms.txt ---
      //
      // `## Optional` is never used: it has special meaning in the llms.txt
      // spec (it may be skipped when context is short), so adding it marks
      // a whole section as discardable, a content decision this site
      // hasn't made.
      const labels = tabLabels(siteConfig.themeConfig, options.tabs);
      const sections = options.tabs.map((tab, i) => {
        const lines = pages
          .filter((page) => page.tab === tab)
          .map((page) => `- [${page.title}](${absoluteUrl(page.permalink)}.md): ${page.description}`);
        return `## ${labels[i]}\n\n${lines.join('\n')}`;
      });

      const opening = [
        `# ${siteConfig.title}`,
        '',
        `> ${siteConfig.tagline}`,
        '',
        preamble({pages, tabs: options.tabs, labels, locale: i18n.currentLocale}),
      ];

      await write('llms.txt', [...opening, '', sections.join('\n\n'), ''].join('\n'));

      // --- llms-full.txt ---
      await write(
        'llms-full.txt',
        [
          ...opening,
          '',
          ...pages.map((page) =>
            [
              separator(absoluteUrl(page.permalink)),
              '',
              `> Summary: ${page.description}`,
              '',
              page.body.trim(),
              '',
            ].join('\n'),
          ),
        ].join('\n'),
      );
    },
  };
}

/**
 * The global preamble, the same in both artifacts.
 *
 * It tells the machine what it has before the first document: how many
 * pages, which axis they're split by, and what inside them is fiction.
 * The last line isn't modesty: without it, an assistant would answer
 * about `panlabs`'s tools as if they all existed.
 *
 * The rule is: what isn't named here doesn't exist. `overpower` is the
 * one named exception (real, MIT, published on PyPI); every other real
 * tool added later costs one more line here.
 *
 * It ships in pt-BR: the site is single-locale, so there's no
 * translation to design for, and the preamble reads the same title,
 * description, and section labels the human reader sees.
 */
function preamble({pages, tabs, labels, locale}) {
  const count = tabs
    .map((tab, i) => `${pages.filter((page) => page.tab === tab).length} em ${labels[i]}`)
    .join(', ');
  return [
    `\`panlabs\`: o acervo de aprendizado de um desenvolvedor. ${pages.length} páginas (${count}), locale \`${locale}\`.`,
    '',
    `Toda página deste site também é servida como Markdown: acrescente \`.md\` à URL dela.`,
    '',
    `O \`panlabs\` é **ficção**, e esta documentação é conteúdo de demonstração de um projeto de estrutura e customização visual em Docusaurus. O acervo é **misto**: o \`overpower\` é uma ferramenta real, MIT, publicada no PyPI, e a documentação dele descreve a ferramenta de verdade. Todo o resto — os módulos, as skills e os servidores MCP descritos — não existe, e a empresa em que eles teriam sido escritos nunca é nomeada.`,
  ].join('\n');
}
