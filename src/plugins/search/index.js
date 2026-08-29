/**
 * `pd-busca` — o índice local, sem serviço externo.
 *
 * O índice viaja como **dado global**, não como JSON no `outDir`. A alternativa
 * seria `postBuild` gravando um arquivo e o cliente buscando com `fetch()`, e
 * ela tem um modo de falhar invisível: sob `onBrokenLinks` e SPA, uma rota
 * ausente devolve **200 com o shell do site**, então o `fetch().json()` estoura
 * em parse — não em 404. Ninguém liga um parse error a um arquivo que não foi
 * escrito.
 *
 * Dado global também é o que faz a busca funcionar em `docusaurus start`, que
 * nenhum plugin de busca do ecossistema oferece: ele entra no bundle, e o bundle
 * existe no servidor de desenvolvimento.
 *
 * > **Correção de fato, medida nesta implementação.** A resolução do slice
 * > escreveu *`contentLoaded` + `setGlobalData`*. `contentLoaded` recebe o
 * > conteúdo do PRÓPRIO plugin, e este plugin não tem conteúdo nenhum — o que
 * > ele lê são as três instâncias de docs, que só chegam por `allContent`. O
 * > gancho certo é `allContentLoaded`, e ele expõe o mesmo `setGlobalData`
 * > (`server/plugins/actions.js` monta o mesmo objeto de ações para os dois
 * > ganchos). A decisão que a resolução tomou — dado global em vez de arquivo
 * > buscado — vale verbatim; só o nome do gancho estava errado.
 *
 * Zero dependência nova, zero serviço externo. Ver ADR 6.
 *
 * Procedência: docs/design/busca.md.
 */

import {pagesFrom, tabLabels} from '../pages';

/**
 * Teto de 64 KB serializados, autoenforçado — **teto, não meta**.
 *
 * Ele não acrescenta portão de CI: o próprio build reprova. Um índice que
 * cresce sem limite vira megabyte no bundle principal de toda página do site,
 * e o sintoma é lentidão difusa que ninguém atribui à busca.
 */
const CEILING = 64 * 1024;

/** Corpo indexado por página. Bem menos que a página; o suficiente para casar. */
const BODY_LIMIT = 200;

/** Linha cercada — abre e fecha o bloco de código. */
const FENCE = /^\s*(?:```|~~~)/;

/** `## Título {#ancora}` — nível 2 a 4, com a âncora explícita opcional. */
const HEADING = /^(#{1,6})\s+(.+?)\s*(?:\{#[^}]*\})?\s*$/;

/**
 * MDX → o texto que a busca casa.
 *
 * Bloco cercado sai inteiro: uma consulta que casasse dentro de um `curl`
 * devolveria a página com um trecho ilegível, e o realce cairia no meio de uma
 * string JSON.
 *
 * @param {string} body o MDX sem front matter e sem `import` do topo
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
      // O `#` de nível 1 é o título, que já viaja em `t`. Os de 5 e 6 não
      // existem na árvore — o teto de profundidade da spec é 4.
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
 * Tira a marcação e devolve prosa.
 *
 * Não é um parser: é o suficiente para que o trecho mostrado ao leitor não
 * comece com `<ParamField name=` nem com uma barra de tabela.
 *
 * @param {string} text
 */
function toPlainText(text) {
  return text
    // O rótulo acessível sai ANTES da tag ser descartada. Ele é a única prosa
    // que descreve um diagrama, e a linha de baixo levaria a tag inteira junto:
    // o desenho sairia do índice e ficaria inencontrável, do mesmo jeito que
    // rótulo de dentro do desenho já é.
    .replace(/<[^>]*\saria-label="([^"]*)"[^>]*>/g, ' $1 ')
    .replace(/<[^>]*>/g, ' ') // tag JSX do catálogo
    .replace(/^\s*:::.*$/gm, ' ') // marcador de admonition
    .replace(/^\s*\|.*$/gm, ' ') // linha de tabela
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1') // link e imagem, fica o rótulo
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

      // Os rótulos viajam junto porque quem os traduz é o servidor: eles saem
      // do navbar, que o core já traduziu quando este gancho roda. Resolvê-los
      // no cliente exigiria reimplementar a mesma regra num segundo lugar.
      actions.setGlobalData({
        records,
        tabs: tabLabels(context.siteConfig.themeConfig, options.tabs),
      });
    },
  };
}
