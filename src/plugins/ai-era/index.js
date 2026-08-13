/**
 * `sd-ai-era` — o `.md` por rota, o `llms.txt` e o `llms-full.txt`.
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

import {paginasDe, rotulosDasAbas} from '../paginas';

/**
 * O separador de documento do `llms-full.txt`, na forma do Neon.
 *
 * Das três referências que publicam o artefato, é a única inequívoca para
 * máquina: o separador carrega a URL de origem, então o parser não precisa
 * inferir onde um documento termina nem de onde ele veio.
 */
const separador = (url) => `--- [Document source](${url}) ---`;

/**
 * @param {import('@docusaurus/types').LoadContext} context
 * @param {{abas: string[]}} options
 * @returns {import('@docusaurus/types').Plugin}
 */
export default function pluginAiEra(context, options) {
  const {siteConfig, baseUrl, i18n} = context;
  /** @type {ReturnType<typeof paginasDe>} */
  let paginas = [];

  const absoluta = (permalink) => `${siteConfig.url}${permalink}`;
  const urlDoIndice = absoluta(`${baseUrl}llms.txt`);

  return {
    name: 'sd-ai-era',

    async allContentLoaded({allContent}) {
      paginas = paginasDe({
        allContent,
        siteDir: context.siteDir,
        abas: options.abas,
        localeTraduzido: i18n.currentLocale !== i18n.defaultLocale,
      });
    },

    async postBuild({outDir}) {
      const escrever = async (relativo, texto) => {
        const destino = path.join(outDir, relativo);
        await fs.mkdir(path.dirname(destino), {recursive: true});
        await fs.writeFile(destino, texto, 'utf8');
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
        paginas.map((pagina) =>
          escrever(
            `${pagina.permalink.slice(baseUrl.length)}.md`,
            `> [Índice para máquinas](${urlDoIndice}) · [Página](${absoluta(pagina.permalink)})\n\n${pagina.corpo.trim()}\n`,
          ),
        ),
      );

      // --- llms.txt -----------------------------------------------------------
      //
      // `## Optional` NÃO é usada. Ela tem significado especial na spec do
      // llms.txt — *pode ser pulada se o contexto for curto* — e nenhuma das
      // três referências medidas a usa. Marcar uma seção inteira como
      // descartável é uma decisão sobre o conteúdo que este site não tomou.
      const rotulos = rotulosDasAbas(siteConfig.themeConfig, options.abas);
      const secoes = options.abas.map((aba, i) => {
        const linhas = paginas
          .filter((pagina) => pagina.aba === aba)
          .map((pagina) => `- [${pagina.titulo}](${absoluta(pagina.permalink)}.md): ${pagina.descricao}`);
        return `## ${rotulos[i]}\n\n${linhas.join('\n')}`;
      });

      const abertura = [
        `# ${siteConfig.title}`,
        '',
        `> ${siteConfig.tagline}`,
        '',
        preambulo({paginas, abas: options.abas, rotulos, locale: i18n.currentLocale}),
      ];

      await escrever('llms.txt', [...abertura, '', secoes.join('\n\n'), ''].join('\n'));

      // --- llms-full.txt ------------------------------------------------------
      await escrever(
        'llms-full.txt',
        [
          ...abertura,
          '',
          ...paginas.map((pagina) =>
            [
              separador(absoluta(pagina.permalink)),
              '',
              `> Summary: ${pagina.descricao}`,
              '',
              pagina.corpo.trim(),
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
 * documento: quantas páginas, por qual eixo estão divididas, e que o conteúdo é
 * ficção. A última linha não é modéstia: sem ela, um assistente responde sobre
 * as ferramentas do `panlabs` como se elas existissem.
 *
 * **Ele sai em pt-BR nos dois locales, e é a mesma regra do resto do site.** As
 * 31 páginas sem contraparte em inglês também saem em português sob `/en/`
 * (`informacao.md` §8) — o preâmbulo é a mesma classe de fallback, num artefato
 * cujo leitor é máquina. O que TEM tradução chega traduzido: título, descrição
 * e rótulo de seção. A rota para mudar isso está registrada e não foi comprada:
 * `getTranslationFiles` + `translateContent` no plugin põem a prosa em
 * `i18n/<locale>/sd-ai-era/`.
 */
function preambulo({paginas, abas, rotulos, locale}) {
  const contagem = abas
    .map((aba, i) => `${paginas.filter((pagina) => pagina.aba === aba).length} em ${rotulos[i]}`)
    .join(', ');
  return [
    `\`panlabs\` — o acervo de aprendizado de um desenvolvedor. ${paginas.length} páginas (${contagem}), locale \`${locale}\`.`,
    '',
    `Toda página deste site também é servida como Markdown: acrescente \`.md\` à URL dela.`,
    '',
    `O \`panlabs\` é **ficção**, e esta documentação é conteúdo de demonstração de um projeto de estrutura e customização visual em Docusaurus. As bibliotecas, módulos e skills descritos não existem, e a empresa em que eles teriam sido escritos nunca é nomeada.`,
  ].join('\n');
}
