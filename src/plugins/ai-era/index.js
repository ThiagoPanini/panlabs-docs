/**
 * `pd-ai-era` — o `.md` por rota, o `llms.txt` e o `llms-full.txt`.
 *
 * Zero swizzle, zero dependência, zero serviço. O plugin lê a mesma porta que a
 * busca (`allContentLoaded`) e escreve três formatos no `outDir`.
 *
 * **Os permalinks saem de `allContentLoaded`, e não de `postBuild({routesPaths})`.**
 * Dois motivos verificados no fonte do 3.10.2, não deduzidos:
 *
 *   1. `routesPaths[0]` é **sempre `/404.html`** — a lista carrega rota que não
 *      é página, e filtrá-la exigiria saber de cor quais são;
 *   2. a API tem TODO de depreciação para a v4, escrito no próprio tipo.
 *
 * **`applyTrailingSlash` não é importado.** Ele existe e é exportado de
 * `@docusaurus/utils-common`, mas não tem página de documentação oficial nem
 * semver documentada — importá-lo é amarrar o build a um contrato que ninguém
 * prometeu. E sob `trailingSlash: false` (ADR 7) ele seria no-op: o permalink
 * já vem sem barra, então `permalink + '.md'` é concatenação pura, sem uma
 * transformação no caminho.
 *
 * **Perda aceita e nomeada:** em `docusaurus start` as rotas `.md` não existem.
 * O servidor de desenvolvimento é uma SPA, então elas devolvem 200 com o shell
 * do site — não 404. É recurso de build, e quem o verifica é o portão 6 rota 2,
 * contra o host real. `npm run build && npm run serve` mostra o mesmo.
 *
 * Procedência: docs/design/informacao.md §9.
 */

import fs from 'node:fs/promises';
import path from 'node:path';

import {pagesFrom, tabLabels} from '../pages';

/**
 * O separador de documento do `llms-full.txt`, na forma do Neon.
 *
 * Das três referências que publicam o artefato, é a única inequívoca para
 * máquina: o separador carrega a URL de origem, então o parser não precisa
 * inferir onde um documento termina nem de onde ele veio.
 */
const separator = (url) => `--- [Document source](${url}) ---`;

/**
 * O corpo com o subtítulo emitido como citação abaixo do `h1`.
 *
 * O corpo servido é o MDX **sem front matter**, e o subtítulo mora no
 * `description` — então o `.md` sairia sem ele, enquanto a tela o pinta logo
 * abaixo do título (`@theme/MDXComponents`, o override de `h1`) e o `llms.txt`
 * o carrega em cada linha de listagem. Perder a informação só no formato lido
 * por máquina é o avesso do que os três artefatos existem para fazer.
 *
 * A forma é a do export do Devin, a única das três referências medidas que
 * resolve o caso: citação imediatamente abaixo do `h1`, na mesma posição em que
 * a tela a mostra. Adotar é herdar uma convenção que já circula entre parsers.
 *
 * **A âncora é o `h1`, e a falta dele estoura.** Uma citação no topo do
 * arquivo já significa outra coisa aqui — é o ponteiro de volta ao índice. Sem
 * `h1` para separá-los, os dois blocos se fundiriam num só e o subtítulo viraria
 * segunda linha do ponteiro, calado.
 *
 * **A busca é na PRIMEIRA linha com texto, e não pela primeira que casa.** A
 * diferença aparece no dia em que uma página abrir com bloco cercado:
 * `# comentário` de shell casaria a mesma marca, e a citação entraria no meio do
 * código — sem erro, sem aviso, e visível só para quem abrisse o `.md`. Como
 * `pagesFrom` já tirou o front matter e o `import` do topo, a primeira linha com
 * texto é o `h1` do autor em todas as 73 páginas, e exigir isso troca a
 * inserção errada por uma mensagem.
 *
 * O `llms-full.txt` NÃO passa por aqui: lá a descrição já entra como
 * `> Summary:` acima do separador de documento, que é a forma do Neon. Duas
 * cópias do mesmo campo no mesmo documento seriam ruído para o parser.
 *
 * @param {{body: string, description: string, permalink: string}} page
 */
function withSubtitle({body, description, permalink}) {
  // A carga também é conferida, e não só a âncora. O override de `h1` já
  // estoura sem `description` — mas ele é swizzle, e swizzle sai. Se saísse, o
  // `.md` passaria a emitir uma citação vazia: um `>` solto, sem erro e sem
  // aviso, que é o modo de falhar que esta função existe para não ter.
  if (!description?.trim()) {
    throw new Error(
      `Página sem \`description\`: ${permalink}\n` +
        'O subtítulo do `.md` servido sai desse campo, e ele é obrigatório em ' +
        'toda página. Ver docs/design/informacao.md §9.2.',
    );
  }

  const lines = body.split('\n');
  const titleIndex = lines.findIndex((line) => line.trim() !== '');
  if (titleIndex === -1 || !lines[titleIndex].startsWith('# ')) {
    throw new Error(
      `Página que não abre com \`# título\`: ${permalink}\n` +
        'O `.md` servido emite o subtítulo como citação abaixo do `h1`, e a ' +
        'âncora é a primeira linha com texto do corpo. ' +
        'Ver docs/design/informacao.md §9.2.',
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
      pages = pagesFrom({
        allContent,
        siteDir: context.siteDir,
        tabs: options.tabs,
        translatedLocale: i18n.currentLocale !== i18n.defaultLocale,
      });
    },

    async postBuild({outDir}) {
      const write = async (relative, text) => {
        const destination = path.join(outDir, relative);
        await fs.mkdir(path.dirname(destination), {recursive: true});
        await fs.writeFile(destination, text, 'utf8');
      };

      // --- o `.md` por rota ---------------------------------------------------
      //
      // Escritos no `outDir`, nunca em `static/`. O que se commita é artefato
      // que muda por DECISÃO; um `.md` que muda toda vez que a prosa muda seria
      // dezenas de arquivos de ruído em todo diff de conteúdo.
      //
      // O ponteiro de volta ao índice é o que transforma arquivos soltos em
      // grafo navegável: quem chega num `.md` por link direto descobre que
      // existe uma lista, e a máquina que o lê acha o resto do site.
      await Promise.all(
        pages.map((page) =>
          write(
            `${page.permalink.slice(baseUrl.length)}.md`,
            `> [Índice para máquinas](${indexUrl}) · [Página](${absoluteUrl(page.permalink)})\n\n${withSubtitle(page).trim()}\n`,
          ),
        ),
      );

      // --- llms.txt -----------------------------------------------------------
      //
      // `## Optional` NÃO é usada. Ela tem significado especial na spec do
      // llms.txt — *pode ser pulada se o contexto for curto* — e nenhuma das
      // três referências medidas a usa. Marcar uma seção inteira como
      // descartável é uma decisão sobre o conteúdo que este site não tomou.
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

      // --- llms-full.txt ------------------------------------------------------
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
 * O preâmbulo global — o mesmo nos dois artefatos.
 *
 * Ele existe para dizer à máquina o que ela tem em mãos antes do primeiro
 * documento: quantas páginas, por qual eixo estão divididas, e o que dentro
 * delas é ficção. A última linha não é modéstia: sem ela, um assistente responde
 * sobre as ferramentas do `panlabs` como se todas existissem.
 *
 * **Ela deixou de dizer *nada existe* e passou a nomear a exceção**, porque o
 * acervo virou misto: o `overpower` é real, MIT, publicado no PyPI, e uma linha
 * que o declarasse fictício mandaria a máquina desmentir uma ferramenta que
 * existe. A regra é a mesma de antes lida com um item a menos — o que não é
 * nomeado aqui não existe —, e o custo de mantê-la é uma linha por ferramenta
 * real que entrar.
 *
 * **Ele sai em pt-BR nos dois locales, e é a mesma regra do resto do site.** As
 * 28 páginas sem contraparte em inglês também saem em português sob `/en/`
 * (`informacao.md` §8) — o preâmbulo é a mesma classe de fallback, num artefato
 * cujo leitor é máquina. O que TEM tradução chega traduzido: título, descrição
 * e rótulo de seção. A rota para mudar isso está registrada e não foi comprada:
 * `getTranslationFiles` + `translateContent` no plugin põem a prosa em
 * `i18n/<locale>/pd-ai-era/`.
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
