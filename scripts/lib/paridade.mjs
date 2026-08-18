/**
 * A lógica pura do comparador de paridade — ler o alvo publicado, decidir se o
 * medido fecha, e ordenar o que sobrou.
 *
 * **NENHUM VALOR DE DESENHO MORA AQUI.** Os alvos são lidos das tabelas
 * publicadas em `docs/design/`, e é essa a decisão que dá sentido ao
 * instrumento: a spec *é* o alvo. Um segundo arquivo com os mesmos números
 * seria uma segunda verdade, e duas verdades divergem caladas — foi assim que
 * *"a coluna do TOC dá 288 contra os 304 da âncora"* virou prosa que não
 * reprovava nada. O verificador de contraste já resolve o mesmo problema do
 * mesmo jeito: lê a tabela publicada e confere célula a célula.
 *
 * Por que este módulo existe separado de `scripts/paridade.mjs`: dirigir
 * Chromium é I/O e não se testa sem navegador; decidir se `288` fecha com `304`
 * dentro de `±1` é aritmética sobre texto, e é onde o erro é caro — um
 * comparador que erra a conta não acusa nada e ainda parece verde. Separar é o
 * que torna a metade cara conferível, e é a mesma decisão que a escada de
 * pontuação da busca tomou.
 *
 * `.mjs` e não `.js`: `package.json` não declara `type`, então só a extensão
 * explícita faz o Node ler o arquivo como módulo.
 *
 * A régua está em `scripts/paridade.test.mjs`.
 *
 * Procedência: research/paridade-devin · docs/design/principios.md §6.
 */

/* A spec escreve número como a prosa pt-BR escreve: vírgula decimal e menos
   tipográfico. Ler isso é obrigação do comparador, não da pessoa que publica —
   exigir `-0.9` numa tabela de design seria fazer o documento servir ao script. */
const MENOS = /[−–—]/g;

/** As unidades que uma tabela de alvo pode publicar. Vazia é número puro. */
const UNIDADE = /^(-?\d+(?:\.\d+)?)(px|rem|em|ms|s|%)?$/;

/** Tira as crases da célula publicada e normaliza o espaço. */
const cru = (celula) =>
  String(celula ?? '')
    .trim()
    .replace(/^`+|`+$/g, '')
    .trim();

/**
 * Analisa uma célula de valor publicada.
 *
 * @returns {null | {tipo: 'numero', numero: number, unidade: string}
 *                 | {tipo: 'texto', texto: string}}
 *   `null` quando a célula está vazia — ausência de alvo é diferente de `0`.
 */
export function analisarValor(celula) {
  const texto = cru(celula);
  if (!texto) return null;

  const casa = texto.replace(MENOS, '-').replace(',', '.').match(UNIDADE);
  if (casa) return {tipo: 'numero', numero: Number(casa[1]), unidade: casa[2] ?? ''};

  return {tipo: 'texto', texto: texto.toLowerCase()};
}

/**
 * Analisa a célula de tolerância: `exato` ou `±N`.
 *
 * Lança em vez de assumir um default. Uma tolerância ilegível que virasse
 * `exato` calado reprovaria linhas honestas; que virasse `±∞` aprovaria tudo.
 *
 * @returns {{tipo: 'exato'} | {tipo: 'margem', margem: number}}
 */
export function analisarTolerancia(celula) {
  const texto = cru(celula);
  if (/^exato$/i.test(texto)) return {tipo: 'exato'};

  const casa = texto.replace(',', '.').match(/^±\s*(\d+(?:\.\d+)?)$/);
  if (casa) return {tipo: 'margem', margem: Number(casa[1])};

  throw new Error(`tolerância ilegível: "${texto}" — use \`exato\` ou \`±N\``);
}

/** Recorta uma linha de tabela markdown em células já aparadas. */
function celulasDe(linha) {
  const aparada = linha.trim();
  if (!aparada.startsWith('|')) return null;
  const miolo = aparada.endsWith('|') ? aparada.slice(1, -1) : aparada.slice(1);
  const celulas = miolo.split('|').map((c) => c.trim());
  if (celulas.every((c) => /^:?-{3,}:?$/.test(c))) return null; // a régua da tabela
  return celulas;
}

/**
 * Recorta as linhas de uma seção `## `, da abertura até a próxima do mesmo
 * nível. Sem isso, um rótulo repetido em outra tabela do mesmo documento seria
 * lido no lugar do alvo — e um documento de spec tem dezenas de tabelas.
 *
 * @returns {string[] | null} `null` quando a seção não existe
 */
function recortar(texto, secao) {
  const linhas = texto.split('\n');
  if (!secao) return linhas;

  const abre = linhas.findIndex((l) => l.startsWith(secao));
  if (abre < 0) return null;
  const fecha = linhas.findIndex((l, i) => i > abre && /^## /.test(l));
  return linhas.slice(abre, fecha < 0 ? undefined : fecha);
}

/**
 * Lê os alvos de um documento da spec.
 *
 * A declaração amarra **rótulo publicado** a **identificador de sonda** — e é
 * só isso que mora no script. O número mora no documento. Uma linha declarada
 * que sumiu da tabela reprova: renomeá-la não a tira da conferência.
 *
 * @param {string} documento caminho, usado no relatório
 * @param {string} texto conteúdo do markdown
 * @param {{colunas: string[], linhas: [string, string[]][], secao?: string}} declaracao
 * @returns {{alvos: object[], falhas: string[]}}
 */
export function lerAlvos(documento, texto, declaracao) {
  const {colunas, linhas, secao} = declaracao;
  const alvos = [];
  const falhas = [];

  const recorte = recortar(texto, secao);
  if (recorte === null) {
    return {alvos, falhas: [`${documento}: a seção "${secao}" sumiu — é onde os alvos são publicados`]};
  }

  const tabela = recorte.map(celulasDe).filter(Boolean);
  const largura = 1 + colunas.length + 1; // rótulo + valores + tolerância

  linhas.forEach(([rotulo, sondas], ordem) => {
    if (sondas.length !== colunas.length) {
      falhas.push(`${documento}: "${rotulo}" declara ${sondas.length} sonda(s) para ${colunas.length} coluna(s)`);
      return;
    }

    const celulas = tabela.find((c) => c[0] === rotulo);
    if (!celulas) {
      falhas.push(`${documento}: a linha "${rotulo}" sumiu da tabela — renomeá-la não a tira da conferência`);
      return;
    }
    if (celulas.length !== largura) {
      falhas.push(`${documento}: a linha "${rotulo}" tem ${celulas.length} células e a declaração pede ${largura}`);
      return;
    }

    let tolerancia;
    try {
      tolerancia = analisarTolerancia(celulas[largura - 1]);
    } catch (erro) {
      falhas.push(`${documento}: "${rotulo}" — ${erro.message}`);
      return;
    }

    colunas.forEach((coluna, i) => {
      const publicado = cru(celulas[1 + i]);
      const valor = analisarValor(celulas[1 + i]);
      if (valor === null) {
        falhas.push(`${documento}: "${rotulo}" não publica valor na coluna ${coluna}`);
        return;
      }
      if (tolerancia.tipo === 'margem' && valor.tipo !== 'numero') {
        falhas.push(
          `${documento}: "${rotulo}" declara tolerância numérica sobre valor não numérico (${publicado}) — use \`exato\``,
        );
        return;
      }
      alvos.push({sonda: sondas[i], rotulo, documento, secao: secao ?? '', coluna, ordem, valor, tolerancia, publicado});
    });
  });

  return {alvos, falhas};
}

/** Decide se o medido fecha com o alvo dentro da tolerância declarada. */
function fecha(alvo, medido, tolerancia) {
  if (alvo.tipo !== medido.tipo) return false;
  if (alvo.tipo === 'texto') return alvo.texto === medido.texto;
  if (alvo.unidade !== medido.unidade) return false;
  if (tolerancia.tipo === 'exato') return alvo.numero === medido.numero;
  return Math.abs(medido.numero - alvo.numero) <= tolerancia.margem;
}

/* Um `sem-alvo` não tem documento nem ordem de publicação; ele vai para o fim
   da lista, e não para o começo, porque é achado do instrumento e não dívida
   do produto. */
const FIM = '￿';

/**
 * Compara o medido contra o publicado e devolve a lista de diferenças.
 *
 * Três desfechos, e distingui-los é o ponto: `divergente` (os dois existem e
 * não fecham), `sem-medida` (o alvo existe e o navegador não achou o elemento)
 * e `sem-alvo` (mediu-se algo que a spec não publica). Confundir o segundo com
 * o primeiro faria um seletor quebrado parecer regressão de desenho.
 *
 * Sonda ausente do objeto de medidas é **ignorada** — um cenário mede um
 * subconjunto das sondas, e cobrar o que não se pediu seria ruído. Para cobrar
 * uma sonda, meça-a e devolva `null` quando o elemento não existir.
 *
 * A ordem é estável: documento, depois ordem de publicação, depois sonda.
 * Nunca a ordem em que as medidas chegaram.
 */
export function comparar(alvos, medidas) {
  const diferencas = [];
  const declaradas = new Set();

  for (const alvo of alvos) {
    declaradas.add(alvo.sonda);
    if (!Object.prototype.hasOwnProperty.call(medidas, alvo.sonda)) continue;

    const bruto = medidas[alvo.sonda];
    const base = {
      sonda: alvo.sonda,
      rotulo: alvo.rotulo,
      documento: alvo.documento,
      secao: alvo.secao,
      coluna: alvo.coluna,
      ordem: alvo.ordem,
      alvo: alvo.publicado,
    };

    if (bruto === null || bruto === undefined || cru(bruto) === '') {
      diferencas.push({...base, tipo: 'sem-medida', medido: null, delta: null});
      continue;
    }

    const medido = analisarValor(bruto);
    if (fecha(alvo.valor, medido, alvo.tolerancia)) continue;

    const delta =
      alvo.valor.tipo === 'numero' && medido.tipo === 'numero' && alvo.valor.unidade === medido.unidade
        ? Number((medido.numero - alvo.valor.numero).toFixed(2))
        : null;

    diferencas.push({...base, tipo: 'divergente', medido: cru(bruto), delta});
  }

  for (const sonda of Object.keys(medidas)) {
    if (declaradas.has(sonda)) continue;
    diferencas.push({
      sonda,
      rotulo: sonda,
      documento: FIM,
      secao: '',
      coluna: '',
      ordem: 0,
      tipo: 'sem-alvo',
      alvo: null,
      medido: medidas[sonda] === null ? null : cru(medidas[sonda]),
      delta: null,
    });
  }

  /* A seção entra na chave porque um documento publica mais de uma tabela de
     alvo — `tokens.md` publica a paleta e a escala de tipo. Sem ela, as duas
     compartilham o `documento` e cada uma reinicia a `ordem` em zero, e o
     resultado é a paleta e o tipo saírem intercalados linha a linha. */
  return diferencas.sort(
    (a, b) =>
      a.documento.localeCompare(b.documento) ||
      a.secao.localeCompare(b.secao) ||
      a.ordem - b.ordem ||
      a.sonda.localeCompare(b.sonda),
  );
}

/**
 * Lê a lista de divergências aceitas.
 *
 * Uma linha por sonda; `#` abre comentário e a linha em branco é ignorada. O
 * formato é o do `scripts/swizzle-list.txt`, e pelo mesmo motivo: um estado
 * congelado que a máquina confere, versionado ao lado do script que o confere.
 *
 * O que a lista NÃO é: uma tolerância. Tolerância alarga o alvo e esconde a
 * distância; esta lista mantém o alvo intacto e diz *"esta distância está
 * julgada"*. O relatório continua imprimindo o número.
 */
export function lerAbertas(texto) {
  const abertas = new Map();
  for (const linha of String(texto ?? '').split('\n')) {
    const corte = linha.indexOf('#');
    const sonda = (corte < 0 ? linha : linha.slice(0, corte)).trim();
    if (!sonda) continue;
    abertas.set(sonda, (corte < 0 ? '' : linha.slice(corte + 1)).trim());
  }
  return abertas;
}

/**
 * Separa o que a lista de aceitas já cobre do que ela não cobre.
 *
 * DOIS desfechos reprovam, e o segundo é o que faz a lista não envelhecer:
 *
 * · `novas` — divergência que a lista não menciona. É regressão, ou alvo novo
 *   publicado sem o código ter chegado nele.
 * · `fechadas` — sonda listada como aberta que passou a FECHAR. A lista virou
 *   mentira, e uma lista de dívida que não encolhe quando a dívida é paga
 *   ensina a ignorá-la — o mesmo defeito que tirou a linha `Sidebar visível a
 *   1010` da tabela de alvo.
 *
 * Uma sonda listada e sem alvo nenhum também entra em `fechadas`: a linha ficou
 * apontando para nada.
 */
export function triar(diferencas, abertas) {
  const divergentes = new Set(diferencas.filter((d) => d.tipo === 'divergente').map((d) => d.sonda));
  return {
    conhecidas: diferencas.filter((d) => d.tipo === 'divergente' && abertas.has(d.sonda)),
    novas: diferencas.filter((d) => d.tipo !== 'divergente' || !abertas.has(d.sonda)),
    fechadas: [...abertas.keys()].filter((s) => !divergentes.has(s)),
  };
}

/** Formata o delta com o sinal e a vírgula que a spec usa. */
const sinal = (n) => `${n > 0 ? '+' : '−'}${String(Math.abs(n)).replace('.', ',')}`;

/** Monta o relatório legível — a saída do modo padrão do comando. */
export function formatar(diferencas) {
  if (!diferencas.length) return 'A paridade fecha — nenhuma diferença contra os alvos publicados.';

  const linhas = [];
  let documentoAtual = null;

  for (const d of diferencas) {
    if (d.documento !== documentoAtual) {
      documentoAtual = d.documento;
      linhas.push('', documentoAtual === FIM ? 'medido sem alvo publicado' : documentoAtual);
    }
    if (d.tipo === 'sem-medida') {
      linhas.push(`  · ${d.rotulo} — alvo ${d.alvo}, e o navegador não achou o elemento`);
    } else if (d.tipo === 'sem-alvo') {
      linhas.push(`  · ${d.rotulo} — mediu ${d.medido} e a spec não publica alvo`);
    } else {
      const dl = d.delta === null ? '' : ` (Δ ${sinal(d.delta)})`;
      linhas.push(`  · ${d.rotulo} — alvo ${d.alvo}, medido ${d.medido}${dl}`);
    }
  }

  const divergentes = diferencas.filter((d) => d.tipo === 'divergente').length;
  const semMedida = diferencas.filter((d) => d.tipo === 'sem-medida').length;
  const semAlvo = diferencas.filter((d) => d.tipo === 'sem-alvo').length;
  linhas.push(
    '',
    `${diferencas.length} diferença(s): ${divergentes} divergente(s), ${semMedida} sem medida, ${semAlvo} sem alvo.`,
  );

  return linhas.join('\n').trimStart();
}
