/**
 * A porta única para o conteúdo — o que a busca e os artefatos AI-era leem.
 *
 * Os dois plugins deste slice são a mesma mecânica vista de dois lados: ambos
 * precisam da árvore inteira, na ordem em que o leitor a vê, com o MDX de cada
 * página à mão. Escrever isso duas vezes produziria duas ordens que divergem no
 * dia em que uma tab entrar — então a ordem, a leitura do arquivo e a detecção
 * de fallback moram aqui, e cada plugin consome o resultado.
 *
 * **A fonte é o MDX, não o HTML renderizado.** É o que dispensa `cheerio` e o
 * que faz as 24 páginas geradas da Referência entrarem pelo mesmo caminho das
 * 43 autorais: uma página gerada é um `.mdx` em disco como qualquer outra.
 *
 * **A porta é `allContentLoaded`.** `contentLoaded` só enxerga o conteúdo do
 * PRÓPRIO plugin, e estes dois não têm conteúdo nenhum — eles leem o das três
 * instâncias de `plugin-content-docs`. Ver `busca/index.js` para a correção de
 * fato que isso registra.
 *
 * Procedência: docs/design/informacao.md §9.
 */

import fs from 'node:fs';
import path from 'node:path';

const PLUGIN_DE_DOCS = 'docusaurus-plugin-content-docs';

/** O front matter YAML, delimitado por `---` na primeira linha. */
const FRONT_MATTER = /^---\r?\n[\s\S]*?\r?\n---[ \t]*\r?\n?/;

/** `import` ou `export` numa linha — testado só no TOPO, nunca no corpo. */
const IMPORT_OU_EXPORT = /^[ \t]*(?:import|export)\s/;

/**
 * Remove o bloco de `import`/`export` do topo, e só o do topo.
 *
 * *Do topo* não é detalhe de redação: dez páginas de `Receitas` têm `import` na
 * primeira coluna DENTRO de bloco cercado, porque é o que uma receita de SDK
 * mostra. Uma varredura global comeria o exemplo e ninguém veria — o `.md`
 * sairia com o código mutilado e o build passaria.
 *
 * Hoje o topo está sempre vazio: nenhum arquivo de `conteudo/` importa nada,
 * porque o catálogo inteiro é registrado em `@theme/MDXComponents`. A remoção é
 * o que mantém a promessa verdadeira quando alguém esquecer.
 *
 * @param {string} texto
 */
function semImportDoTopo(texto) {
  const linhas = texto.split('\n');
  let i = 0;
  while (i < linhas.length && (linhas[i].trim() === '' || IMPORT_OU_EXPORT.test(linhas[i]))) {
    i += 1;
  }
  return linhas.slice(i).join('\n');
}

/**
 * A ordem da sidebar, achatada em profundidade.
 *
 * É o segundo critério de desempate da busca e a ordem de listagem do
 * `llms.txt`. Uma categoria clicável aparece pelo `link`, antes dos filhos —
 * que é onde o leitor a vê.
 *
 * @param {Record<string, unknown[]>} sidebars
 * @returns {Map<string, number>} id do documento → posição
 */
function ordemDaSidebar(sidebars) {
  const ordem = new Map();
  let n = 0;
  const marcar = (id) => {
    if (id !== undefined && !ordem.has(id)) {
      ordem.set(id, n);
      n += 1;
    }
  };
  const visitar = (itens) => {
    for (const item of itens ?? []) {
      if (item.type === 'doc') {
        marcar(item.id);
      } else if (item.type === 'category') {
        if (item.link?.type === 'doc') {
          marcar(item.link.id);
        }
        visitar(item.items);
      }
    }
  };
  for (const nome of Object.keys(sidebars ?? {})) {
    visitar(sidebars[nome]);
  }
  return ordem;
}

/**
 * O rótulo de cada aba — lido do NAVBAR, nunca declarado uma segunda vez.
 *
 * O rótulo da aba é o que o navbar diz que ele é: são a mesma decisão, e as
 * duas superfícies que precisam dele aqui (a seção do `llms.txt` e o
 * agrupamento dos resultados de busca) mostram ao leitor exatamente a palavra
 * que ele acabou de clicar.
 *
 * E ele chega **traduzido de graça**. O `translatePluginContent` do core aplica
 * `translateThemeConfig` durante o carregamento de conteúdo — antes de
 * `allContentLoaded` — então `i18n/en/docusaurus-theme-classic/navbar.json` já
 * está dentro de `context.siteConfig.themeConfig` quando estes dois plugins
 * rodam. Declarar o rótulo na opção do plugin criaria uma segunda cópia, e ela
 * sairia em português no build do EN.
 *
 * @param {{navbar?: {items?: any[]}}} themeConfig
 * @param {string[]} abas
 * @returns {string[]} um rótulo por aba, na ordem declarada
 */
export function rotulosDasAbas(themeConfig, abas) {
  const itens = themeConfig?.navbar?.items ?? [];
  return abas.map((aba) => {
    const item = itens.find(
      (candidato) =>
        candidato.type === 'docSidebar' && (candidato.docsPluginId ?? 'default') === aba,
    );
    if (!item) {
      throw new Error(
        `A aba "${aba}" não tem item \`docSidebar\` no navbar. O rótulo da aba é o do navbar — sem ele não há o que escrever.`,
      );
    }
    return item.label;
  });
}

/**
 * A árvore inteira, na ordem em que o leitor a vê.
 *
 * @param {object} args
 * @param {Record<string, Record<string, any>>} args.allContent
 * @param {string} args.siteDir
 * @param {string[]} args.abas ids das instâncias de docs, na ordem do navbar
 * @param {boolean} args.localeTraduzido `currentLocale !== defaultLocale`
 */
export function paginasDe({allContent, siteDir, abas, localeTraduzido}) {
  const instancias = allContent?.[PLUGIN_DE_DOCS] ?? {};
  const paginas = [];

  abas.forEach((aba, indiceAba) => {
    const conteudo = instancias[aba];
    if (!conteudo) {
      // Aba declarada e ausente é a falha que some sozinha: a busca perderia um
      // terço do site e o `llms.txt` mentiria, sem uma linha de aviso.
      throw new Error(
        `A aba "${aba}" não existe em allContent. As instâncias de ${PLUGIN_DE_DOCS} são: ${Object.keys(instancias).join(', ')}.`,
      );
    }

    for (const versao of conteudo.loadedVersions) {
      const ordem = ordemDaSidebar(versao.sidebars);

      for (const doc of versao.docs) {
        // `draft` já sai de `docs` em produção, e `unlisted` não. Os dois vão
        // escritos porque o critério é do slice, não do upstream — e porque em
        // `docusaurus start` o rascunho continua na lista.
        if (doc.draft || doc.unlisted) {
          continue;
        }

        const caminho = path.join(siteDir, doc.source.replace(/^@site[/\\]/, ''));
        const bruto = fs.readFileSync(caminho, 'utf8');

        paginas.push({
          aba,
          indiceAba,
          ordem: ordem.get(doc.id) ?? Number.MAX_SAFE_INTEGER,
          id: doc.id,
          titulo: doc.title,
          descricao: doc.description,
          permalink: doc.permalink,
          caminho,
          corpo: semImportDoTopo(bruto.replace(FRONT_MATTER, '')),
          // Sem lista para manter: se o fonte não está sob a árvore localizada,
          // é a página de fallback em pt-BR servida sob `/en/`. No locale de
          // origem não há fallback nenhum, e a árvore localizada dele sequer
          // existe em disco — daí a guarda.
          fallback: localeTraduzido && !caminho.startsWith(versao.contentPathLocalized),
        });
      }
    }
  });

  return paginas.sort((a, b) => a.indiceAba - b.indiceAba || a.ordem - b.ordem);
}
