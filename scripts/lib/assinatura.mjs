/**
 * O validador do contrato de assinatura — **lista fechada de doze recusas**, e
 * cada uma nomeia o JSON Pointer (RFC 6901) do nó ofensor.
 *
 * A disciplina é a do [ADR 5](../../docs/adr/0005-referencia-da-api-gerada-de-contrato.md),
 * e ela sobreviveu inteira à troca de premissa: o que morreu foi OpenAPI, não a
 * régua. O que o ADR 8 registra é a lista NOVA — as recusas de HTTP não têm
 * assunto num contrato que descreve assinatura de função, tipo e módulo.
 *
 * **Zero dependência de parser.** O parser inteiro é `JSON.parse`, e a recusa de
 * YAML é consequência disso, não regra em separado — é o axioma 2 escrito como
 * código.
 *
 * **Recusa alto, nunca em silêncio.** Um validador que ignora o que não entende
 * é um gerador que emite página errada sem ninguém ver.
 *
 * Procedência: docs/adr/0008-referencia-de-biblioteca-gerada-de-contrato-de-assinatura.md ·
 * docs/design/referencia.md §5.
 */

import fs from 'node:fs';

/** O par nome/versão que este validador conhece. Fechado. */
export const CONTRATO = 'assinatura';
export const VERSAO = 1;

/**
 * As espécies de entrada. Fechado.
 *
 * **Duas, e o expand–contract fechou.** `modulo`, `tipo` e `funcao` descreviam
 * superfície de biblioteca (ADR 8) e saíram com o `panlabs-esteira`, o contrato
 * mockado que elas serviam; `aplicacao` e `comando` descrevem superfície de CLI
 * (ADR 9 §a), e é o `overpower` que está no ar. A fatia **expand** ensinou as
 * duas espécies novas à máquina enquanto o sujeito ainda era `Biblioteca C`;
 * esta é a **contract**, e a lista volta ao tamanho que tinha.
 *
 * A lista continua **fechada e validada**, com a mesma recusa nomeada e o mesmo
 * JSON Pointer do nó ofensor — o que o ADR 9 §a) preserva não é o tamanho, é a
 * propriedade.
 */
export const ESPECIES = ['aplicacao', 'comando'];

/**
 * O teto de aninhamento, calibrado e não redondo.
 *
 * `Infraestrutura › O output de um módulo` — escrito à mão no acervo, antes
 * deste contrato — tem exatamente quatro; um quinto nível reprova antes de virar
 * página ilegível.
 *
 * **O reset de nível morreu com o `$ref`, e não deixou buraco.** No contrato
 * OpenAPI a contagem reiniciava ao alcançar um schema nomeado, senão o mesmo
 * objeto lia com orçamentos diferentes conforme onde fosse embutido. Aqui um
 * campo cujo tipo é outra entrada **não aninha: ele linka** (o campo `entrada`),
 * e profundidade que não existe não precisa de reset.
 */
export const TETO_DE_ANINHAMENTO = 4;

/** O teto de erros documentados por entrada. Uma entrada já está nele. */
export const TETO_DE_ERROS = 4;

/** As doze recusas. Acrescentar uma sem nomeá-la aqui reprova no `npm test`. */
export const RECUSAS = {
  naoEJson: 'nao-e-json',
  contratoDesconhecido: 'contrato-desconhecido',
  idDuplicado: 'id-duplicado',
  especieForaDaLista: 'especie-fora-da-lista',
  descricaoAusente: 'descricao-ausente',
  assinaturaAusente: 'assinatura-ausente',
  exemploAmbiguo: 'exemplo-ambiguo',
  aninhamentoAcimaDeQuatro: 'aninhamento-acima-de-quatro',
  maisDeQuatroErros: 'mais-de-quatro-erros',
  referenciaMorta: 'referencia-morta',
  cicloDeReceptor: 'ciclo-de-receptor',
  contratosIncongruentes: 'contratos-incongruentes',
};

/**
 * As chaves de PROSA — as únicas que podem divergir entre os dois contratos.
 *
 * Tudo o mais é estrutura, e estrutura divergente é o defeito que a congruência
 * existe para pegar: nome de campo, tipo, obrigatoriedade e exemplo são
 * **contrato, não prosa**, e traduzi-los produziria um leitor de EN escrevendo
 * código que não roda.
 */
const PROSA = new Set(['resumo', 'descricao', 'quando']);

/** Um segmento de JSON Pointer, escapado conforme a RFC 6901. */
const seg = (chave) => String(chave).replace(/~/g, '~0').replace(/\//g, '~1');

const ponteiroDe = (...partes) => partes.map((parte) => `/${seg(parte)}`).join('');

const ehObjeto = (valor) => typeof valor === 'object' && valor !== null && !Array.isArray(valor);

/**
 * Lê e parseia um contrato. **A recusa de YAML sai daqui**, por consequência de
 * o parser ser `JSON.parse` — e não por uma regra escrita à parte.
 *
 * @param {string} caminho
 */
export function lerContrato(caminho) {
  try {
    return JSON.parse(fs.readFileSync(caminho, 'utf8'));
  } catch (causa) {
    const erro = new Error(`${caminho}: não é JSON legível — ${causa.message}`);
    erro.recusa = RECUSAS.naoEJson;
    erro.ponteiro = '';
    throw erro;
  }
}

/**
 * Valida um contrato sozinho. Devolve a lista de recusas, na ordem em que o
 * documento as apresenta — vazia quando ele passa.
 *
 * @param {any} contrato
 * @returns {{recusa: string, ponteiro: string, detalhe: string}[]}
 */
export function validar(contrato) {
  const recusas = [];
  const recusar = (recusa, ponteiro, detalhe) => recusas.push({recusa, ponteiro, detalhe});

  if (contrato?.contrato !== CONTRATO || contrato?.versao !== VERSAO) {
    recusar(
      RECUSAS.contratoDesconhecido,
      contrato?.contrato === CONTRATO ? '/versao' : '/contrato',
      `o par aceito é \`${CONTRATO}\` versão ${VERSAO}, e este é ` +
        `\`${contrato?.contrato}\` versão ${contrato?.versao}`,
    );
    return recusas;
  }

  const entradas = Array.isArray(contrato.entradas) ? contrato.entradas : [];

  // O id é varrido ANTES do resto, e não dentro do laço: um id repetido rouba a
  // identidade do irmão, e todas as referências ao roubado viram `referencia-
  // morta` — três recusas sobre um defeito só, com a causa em terceiro lugar.
  const ids = new Map();
  for (const [indice, entrada] of entradas.entries()) {
    if (ids.has(entrada?.id)) {
      recusar(
        RECUSAS.idDuplicado,
        `${ponteiroDe('entradas', indice)}/id`,
        `o id \`${entrada?.id}\` já é da entrada ${ids.get(entrada?.id)}, e as duas escreveriam o mesmo arquivo`,
      );
      continue;
    }
    ids.set(entrada?.id, indice);
  }

  /** Um nó de campo — parâmetro, campo de retorno, ou campo aninhado. */
  const validarCampo = (campo, ponteiro, nivel) => {
    if (nivel > TETO_DE_ANINHAMENTO) {
      recusar(
        RECUSAS.aninhamentoAcimaDeQuatro,
        ponteiro,
        `nível ${nivel} de aninhamento, e o teto é ${TETO_DE_ANINHAMENTO}`,
      );
      return;
    }
    if (typeof campo?.descricao !== 'string' || campo.descricao === '') {
      recusar(RECUSAS.descricaoAusente, ponteiro, `o campo \`${campo?.nome}\` não tem \`descricao\``);
    }
    if ('exemplo' in (campo ?? {}) && 'exemploCodigo' in campo) {
      recusar(
        RECUSAS.exemploAmbiguo,
        ponteiro,
        `\`${campo.nome}\` traz \`exemplo\` e \`exemploCodigo\` no mesmo nó, e o snippet só usa um`,
      );
    }
    validarReferencia(campo?.entrada, `${ponteiro}/entrada`);
    for (const [indice, filho] of (campo?.campos ?? []).entries()) {
      validarCampo(filho, `${ponteiro}${ponteiroDe('campos', indice)}`, nivel + 1);
    }
  };

  function validarReferencia(id, ponteiro) {
    if (id !== undefined && !ids.has(id)) {
      recusar(RECUSAS.referenciaMorta, ponteiro, `nenhuma entrada tem o id \`${id}\``);
    }
  }

  for (const [indice, entrada] of entradas.entries()) {
    const raiz = ponteiroDe('entradas', indice);

    if (ids.get(entrada?.id) !== indice) {
      continue;
    }

    if (!ESPECIES.includes(entrada?.especie)) {
      recusar(
        RECUSAS.especieForaDaLista,
        `${raiz}/especie`,
        // A contagem NÃO entra na redação. Ela já mudou uma vez e vai mudar de
        // novo no ticket do port; uma recusa que dissesse "uma das três" com
        // cinco na lista mentiria sobre o próprio motivo, e quem a recebe lê o
        // detalhe justamente por não saber a lista de cor.
        `\`${entrada?.especie}\` não está na lista fechada: ${ESPECIES.join(', ')}`,
      );
      continue;
    }

    if (typeof entrada.assinatura !== 'string' || entrada.assinatura === '') {
      recusar(RECUSAS.assinaturaAusente, `${raiz}/assinatura`, 'o cabeçalho do painel sai deste campo');
    }

    for (const chave of ['resumo', 'descricao']) {
      if (typeof entrada[chave] !== 'string' || entrada[chave] === '') {
        recusar(RECUSAS.descricaoAusente, `${raiz}/${chave}`, `a entrada \`${entrada.id}\` não tem \`${chave}\``);
      }
    }

    for (const [i, parametro] of (entrada.parametros ?? []).entries()) {
      validarCampo(parametro, `${raiz}${ponteiroDe('parametros', i)}`, 1);
    }

    if (entrada.retorno) {
      if (typeof entrada.retorno.descricao !== 'string' || entrada.retorno.descricao === '') {
        recusar(RECUSAS.descricaoAusente, `${raiz}/retorno`, `o retorno de \`${entrada.id}\` não tem \`descricao\``);
      }
      validarReferencia(entrada.retorno.entrada, `${raiz}/retorno/entrada`);
      for (const [i, campo] of (entrada.retorno.campos ?? []).entries()) {
        validarCampo(campo, `${raiz}${ponteiroDe('retorno', 'campos', i)}`, 1);
      }
    }

    const erros = entrada.erros ?? [];
    if (erros.length > TETO_DE_ERROS) {
      recusar(
        RECUSAS.maisDeQuatroErros,
        `${raiz}/erros`,
        `${erros.length} erros documentados, e o teto é ${TETO_DE_ERROS}`,
      );
    } else {
      for (const [i, erro] of erros.entries()) {
        if (typeof erro?.quando !== 'string' || erro.quando === '') {
          recusar(
            RECUSAS.descricaoAusente,
            `${raiz}${ponteiroDe('erros', i)}`,
            `o erro \`${erro?.nome}\` não diz quando acontece`,
          );
        }
      }
    }

    for (const chave of ['exporta', 'fluxo']) {
      for (const [i, id] of (entrada[chave] ?? []).entries()) {
        validarReferencia(id, `${raiz}${ponteiroDe(chave, i)}`);
      }
    }
    validarReferencia(entrada.receptor, `${raiz}/receptor`);
  }

  // O ciclo de receptor, depois de tudo: uma referência morta já reprovou acima,
  // e caminhar sobre ela aqui só produziria um segundo erro sobre o mesmo nó.
  if (!recusas.some((r) => r.recusa === RECUSAS.referenciaMorta)) {
    for (const [indice, entrada] of entradas.entries()) {
      const visto = new Set([entrada.id]);
      let atual = entrada.receptor;
      while (atual !== undefined) {
        if (visto.has(atual)) {
          recusar(
            RECUSAS.cicloDeReceptor,
            `${ponteiroDe('entradas', indice)}/receptor`,
            `a cadeia de receptor volta a \`${atual}\`, e o preâmbulo do snippet não fecha`,
          );
          break;
        }
        visto.add(atual);
        atual = entradas[ids.get(atual)]?.receptor;
      }
    }
  }

  return recusas;
}

/**
 * A congruência do par — a única recusa que nenhum contrato sozinho produz.
 *
 * Ela percorre os dois em paralelo e reprova a **primeira** divergência fora das
 * chaves de prosa. Um contrato bilíngue dispensaria esta função e custaria a
 * transplantabilidade do arquivo; dois monolíngues custam esta varredura.
 *
 * @param {any} pt
 * @param {any} en
 */
export function validarPar(pt, en) {
  const recusas = [...validar(pt), ...validar(en)];
  if (recusas.length > 0) {
    return recusas;
  }

  const divergencia = comparar(pt, en, '');
  if (divergencia !== null) {
    recusas.push({
      recusa: RECUSAS.contratosIncongruentes,
      ponteiro: divergencia,
      detalhe: 'o par é monolíngue e congruente: só prosa diverge entre os dois arquivos',
    });
  }
  return recusas;
}

/**
 * A primeira divergência estrutural entre dois nós, ou `null`.
 *
 * `rotulos` é o único nó em que **as chaves são estrutura e os valores são
 * prosa**. Os valores divergem por definição — é o que faz o par ser monolíngue
 * e o que dispensa o gerador de carregar uma tabela de strings por locale. As
 * chaves, não: cada uma é o título de uma seção que a forma da espécie exige, e
 * uma que exista só de um lado é uma seção sem título num locale só.
 */
function comparar(a, b, ponteiro) {
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) {
      return ponteiro;
    }
    for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
      if (i >= a.length || i >= b.length) {
        return `${ponteiro}${ponteiroDe(i)}`;
      }
      const dentro = comparar(a[i], b[i], `${ponteiro}${ponteiroDe(i)}`);
      if (dentro !== null) {
        return dentro;
      }
    }
    return null;
  }

  if (ehObjeto(a) || ehObjeto(b)) {
    if (!ehObjeto(a) || !ehObjeto(b)) {
      return ponteiro;
    }
    const chaves = [...new Set([...Object.keys(a), ...Object.keys(b)])].sort();
    for (const chave of chaves) {
      if (PROSA.has(chave)) {
        continue;
      }
      if (!(chave in a) || !(chave in b)) {
        return `${ponteiro}${ponteiroDe(chave)}`;
      }
      // O bloco de rótulos: confere o conjunto de chaves e para aí. Sem isto o
      // par podia perder `opcoes` num locale só, e o defeito só apareceria na
      // emissão daquele locale.
      if (ponteiro === '' && chave === 'rotulos' && ehObjeto(a[chave]) && ehObjeto(b[chave])) {
        const rotulos = [...new Set([...Object.keys(a[chave]), ...Object.keys(b[chave])])].sort();
        for (const nome of rotulos) {
          if (!(nome in a[chave]) || !(nome in b[chave])) {
            return `${ponteiro}${ponteiroDe(chave)}${ponteiroDe(nome)}`;
          }
        }
        continue;
      }
      const dentro = comparar(a[chave], b[chave], `${ponteiro}${ponteiroDe(chave)}`);
      if (dentro !== null) {
        return dentro;
      }
    }
    return null;
  }

  return a === b ? null : ponteiro;
}
