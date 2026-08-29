/**
 * A escada de pontuação e a normalização — a lógica pura da busca.
 *
 * Ela mora fora do componente por dois motivos, e o segundo é o que decidiu:
 *
 *   1. o `SearchBar` fica sendo o que ele é — JSX mais os ganchos de `<dialog>`;
 *   2. **é o único algoritmo não trivial do projeto inteiro**, e sem separá-lo
 *      não há como cobrá-lo por máquina. O resto do repositório é conferido por
 *      varredura porque o resto do repositório é CSS e conteúdo; ordenação de
 *      resultado não é varrível, e afirmar *"determinística"* em prosa é
 *      exatamente a classe de afirmação que este projeto recusa.
 *
 * A régua está em `scripts/busca.test.mjs`, no `node --test` do próprio runtime.
 * **Zero dependência nova** — é o mesmo critério que escolheu `<dialog>` e
 * `<details>` em vez de biblioteca.
 *
 * `.mjs` e não `.js`: `package.json` não declara `type`, então só a extensão
 * explícita faz o Node ler o arquivo como módulo. O webpack lê os dois.
 *
 * Procedência: docs/design/busca.md.
 */

/**
 * A escada — **potências de dois, e isso é a decisão**.
 *
 * Cada degrau vale mais do que a soma de todos abaixo dele (32 > 16+8+4+2+1),
 * então a ordem é lexicográfica de verdade: casar no título nunca perde para
 * casar em três campos fracos ao mesmo tempo. Uma escala linear inverteria isso
 * em algum ponto, e ninguém conseguiria explicar em qual.
 *
 * `prefixo` é casamento no começo de **palavra**, em qualquer ponto do campo — e
 * não no começo do campo. `webhook` casa no degrau alto tanto em `Webhooks`
 * quanto em `Sobre webhooks`, porque nos dois o leitor digitou o começo de uma
 * palavra que está lá. O degrau abaixo é o que sobra: o termo aparece no MEIO de
 * uma palavra, que é casamento verdadeiro e mais fraco.
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
 * Minúsculas e `normalize('NFD')` sem diacrítico.
 *
 * São as poucas linhas que cobrem o erro mais comum do leitor brasileiro:
 * *conciliacao* acha `Conciliação`, *idempotencia* acha `Idempotência`. Ela roda
 * nos **dois lados** — no índice, uma vez, e na consulta, a cada tecla.
 * Normalizar só um lado é não normalizar.
 *
 * @param {string} text
 */
export function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

/** A consulta vira termos: normalizada, partida em espaço, sem vazio. */
export const termsFrom = (query) => normalize(query).split(/\s+/).filter(Boolean);

/** Casamento por prefixo de palavra: começo do campo, ou logo depois de um espaço. */
const startsWithWord = (text, term) => text.startsWith(term) || text.includes(` ${term}`);

/**
 * O índice normalizado — uma vez, na montagem, não a cada tecla.
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
 * Os resultados, ordenados.
 *
 * **Todo termo precisa casar em algum degrau.** Um termo que não casa derruba o
 * registro inteiro — senão uma consulta de duas palavras devolveria tudo o que
 * casa com a mais comum das duas, que é o oposto de refinar.
 *
 * **Sem teto de resultados.** Truncar em dez seria esconder acerto sem dizer que
 * escondeu, e falha silenciosa é o que este projeto recusa em toda parte.
 *
 * Desempate: pontos, depois a aba, depois a ordem da sidebar — que é a ordem em
 * que `src/plugins/pages.js` já entregou o índice.
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
 * O trecho mostrado: a descrição, ou o corpo quando é ele quem casou.
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
 * As faixas a realçar, em índices do texto **original**.
 *
 * A varredura é sobre o texto normalizado e as faixas voltam mapeadas para o
 * original, porque `normalize('NFD')` decompõe acento em dois pontos de código:
 * cortar pelo índice normalizado devolveria letra sem acento na tela, e o realce
 * apagaria o til de `informação` na frente do leitor.
 *
 * Quando a conta de deslocamento não fecha — um caractere cuja normalização por
 * pedaço difere da do todo —, a função devolve lista vazia. Perde-se ênfase,
 * nunca uma letra.
 *
 * @param {string} text
 * @param {string[]} terms
 * @returns {[number, number][]} pares `[de, ate)` sem sobreposição, em ordem
 */
export function highlightRanges(text, terms) {
  if (terms.length === 0 || !text) {
    return [];
  }
  const target = normalize(text);

  // Um mapa `índice normalizado → índice original`. `origem` acumula o
  // comprimento em UNIDADES DE CÓDIGO e não a posição do laço: iterar uma
  // string por `for…of` anda por ponto de código, e um par substituto mede dois.
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
