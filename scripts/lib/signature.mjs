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

// A conta de exclusividade é a MESMA que o painel usa. Ver `membersInConflict`.
import {membersInConflict} from '../../src/theme/MDXComponents/line.mjs';

/** O par nome/versão que este validador conhece. Fechado. */
export const CONTRACT = 'signature';
export const VERSION = 2;

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
export const KINDS = ['application', 'command'];

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
 * campo cujo tipo é outra entrada **não aninha: ele linka** (o campo `entry`),
 * e profundidade que não existe não precisa de reset.
 */
export const NESTING_CEILING = 4;

/** O teto de erros documentados por entrada. Uma entrada já está nele. */
export const ERRORS_CEILING = 4;

/**
 * As dezesseis recusas. Acrescentar uma sem nomeá-la aqui reprova no `npm test`.
 *
 * **As quatro últimas são do modelo de linha, e chegaram com a versão 2.** Elas
 * cobrem a classe de defeito que o portão 5 sozinho não pega: ele regenera e
 * diffa, então um modelo internamente incoerente produz uma página byte a byte
 * igual à que o gerador acabou de emitir, com um painel que monta linha que a
 * ferramenta recusa. O diff fica limpo e a página fica errada.
 */
export const REFUSALS = {
  notJson: 'not-json',
  unknownContract: 'unknown-contract',
  duplicateId: 'duplicate-id',
  kindNotInList: 'kind-not-in-list',
  missingDescription: 'missing-description',
  handwrittenSignature: 'handwritten-signature',
  ambiguousExample: 'ambiguous-example',
  nestingAboveFour: 'nesting-above-four',
  moreThanFourErrors: 'more-than-four-errors',
  deadReference: 'dead-reference',
  receiverCycle: 'receiver-cycle',
  exclusiveGroupOfOne: 'exclusive-group-of-one',
  modelNamesNonexistentFlag: 'model-names-nonexistent-flag',
  mandatoryExclusive: 'mandatory-exclusive',
  incoherentArity: 'incoherent-arity',
};

/** Um segmento de JSON Pointer, escapado conforme a RFC 6901. */
const segment = (key) => String(key).replace(/~/g, '~0').replace(/\//g, '~1');

const pointerFor = (...parts) => parts.map((part) => `/${segment(part)}`).join('');

/**
 * Lê e parseia um contrato. **A recusa de YAML sai daqui**, por consequência de
 * o parser ser `JSON.parse` — e não por uma regra escrita à parte.
 *
 * @param {string} contractPath
 */
export function readContract(contractPath) {
  try {
    return JSON.parse(fs.readFileSync(contractPath, 'utf8'));
  } catch (cause) {
    const error = new Error(`${contractPath}: não é JSON legível — ${cause.message}`);
    error.refusal = REFUSALS.notJson;
    error.pointer = '';
    throw error;
  }
}

/**
 * Valida um contrato sozinho. Devolve a lista de recusas, na ordem em que o
 * documento as apresenta — vazia quando ele passa.
 *
 * @param {any} contract
 * @returns {{refusal: string, pointer: string, detail: string}[]}
 */
export function validate(contract) {
  const refusals = [];
  const refuse = (refusal, pointer, detail) => refusals.push({refusal, pointer, detail});

  if (contract?.contract !== CONTRACT || contract?.version !== VERSION) {
    refuse(
      REFUSALS.unknownContract,
      contract?.contract === CONTRACT ? '/version' : '/contract',
      `o par aceito é \`${CONTRACT}\` versão ${VERSION}, e este é ` +
        `\`${contract?.contract}\` versão ${contract?.version}`,
    );
    return refusals;
  }

  const entries = Array.isArray(contract.entries) ? contract.entries : [];

  // O id é varrido ANTES do resto, e não dentro do laço: um id repetido rouba a
  // identidade do irmão, e todas as referências ao roubado viram `referencia-
  // morta` — três recusas sobre um defeito só, com a causa em terceiro lugar.
  const ids = new Map();
  for (const [index, entry] of entries.entries()) {
    if (ids.has(entry?.id)) {
      refuse(
        REFUSALS.duplicateId,
        `${pointerFor('entries', index)}/id`,
        `o id \`${entry?.id}\` já é da entrada ${ids.get(entry?.id)}, e as duas escreveriam o mesmo arquivo`,
      );
      continue;
    }
    ids.set(entry?.id, index);
  }

  /** Um nó de campo — parâmetro, campo de retorno, ou campo aninhado. */
  const validateField = (field, pointer, level) => {
    if (level > NESTING_CEILING) {
      refuse(
        REFUSALS.nestingAboveFour,
        pointer,
        `nível ${level} de aninhamento, e o teto é ${NESTING_CEILING}`,
      );
      return;
    }
    if (typeof field?.description !== 'string' || field.description === '') {
      refuse(REFUSALS.missingDescription, pointer, `o campo \`${field?.name}\` não tem \`description\``);
    }
    if ('example' in (field ?? {}) && 'codeExample' in field) {
      refuse(
        REFUSALS.ambiguousExample,
        pointer,
        `\`${field.name}\` traz \`example\` e \`codeExample\` no mesmo nó, e o snippet só usa um`,
      );
    }
    validateReference(field?.entry, `${pointer}/entry`);
    for (const [index, child] of (field?.fields ?? []).entries()) {
      validateField(child, `${pointer}${pointerFor('fields', index)}`, level + 1);
    }
  };

  function validateReference(id, pointer) {
    if (id !== undefined && !ids.has(id)) {
      refuse(REFUSALS.deadReference, pointer, `nenhuma entrada tem o id \`${id}\``);
    }
  }

  /**
   * A coerência interna do modelo de linha — as quatro recusas da versão 2.
   *
   * **Ela é sobre o modelo consigo mesmo, não sobre a ferramenta.** Nenhuma
   * varredura de JSON descobre que a exclusividade da CLI é outra; o que ela
   * descobre é um modelo que não fecha em si — um grupo exclusivo de um membro,
   * uma restrição apontando para flag que não existe, um mínimo que exige duas
   * flags que se excluem, um separador em campo que não acumula. Cada um desses
   * produz painel quebrado com portão 5 verde.
   */
  function validateLineModel(entry, root) {
    const parameters = entry.parameters ?? [];
    const names = new Set(parameters.map((parameter) => parameter?.name));

    const checkName = (name, pointer) => {
      if (name !== undefined && name !== null && !names.has(name)) {
        refuse(
          REFUSALS.modelNamesNonexistentFlag,
          pointer,
          `\`${name}\` não está em \`parameters\` de \`${entry.id}\``,
        );
      }
    };

    for (const [i, parameter] of parameters.entries()) {
      const arity = parameter?.arity;
      if (arity?.separator !== undefined && !arity?.multiple) {
        refuse(
          REFUSALS.incoherentArity,
          `${root}${pointerFor('parameters', i)}/arity`,
          `\`${parameter?.name}\` declara separador \`${arity.separator}\` e não acumula, ` +
            'então não há o que separar — em `list` a vírgula é caractere do nome',
        );
      }
    }

    const constraints = entry.constraints ?? [];
    for (const [i, constraint] of constraints.entries()) {
      const pointer = `${root}${pointerFor('constraints', i)}`;

      if (constraint?.type === 'exclusive') {
        const members = constraint.members ?? [];
        if (members.length < 2) {
          refuse(
            REFUSALS.exclusiveGroupOfOne,
            `${pointer}/members`,
            `${members.length} membro(s), e uma exclusividade de um só nunca dispara`,
          );
        }
        members.forEach((name, j) => checkName(name, `${pointer}${pointerFor('members', j)}`));
        for (const [j, block] of (constraint.partition ?? []).entries()) {
          block.forEach((name, k) =>
            checkName(name, `${pointer}${pointerFor('partition', j, k)}`),
          );
        }
      }

      checkName(constraint?.guard, `${pointer}/guard`);
      checkName(constraint?.when, `${pointer}/when`);
      checkName(constraint?.forbidden, `${pointer}/forbidden`);
    }

    for (const [i, minimum] of (entry.minimum ?? []).entries()) {
      const pointer = `${root}${pointerFor('minimum', i)}`;
      const flags = minimum?.flags ?? [];
      flags.forEach((name, j) => checkName(name, `${pointer}${pointerFor('flags', j)}`));

      // O mínimo é uma linha que a ferramenta aceita. Se ele próprio viola uma
      // restrição, o painel abriria já recusado — e a página estaria ensinando
      // uma invocação que não roda.
      const present = new Set(flags);
      for (const constraint of constraints) {
        // A conta de colisão vem de `line.mjs`, e não de uma cópia aqui: o
        // validador e o painel precisam concordar sobre o que é linha válida, e
        // duas implementações da mesma partição divergiriam em silêncio — o
        // validador aprovaria um mínimo que o painel recusa.
        const members = membersInConflict(constraint, present);
        if (members.length >= 2) {
          refuse(
            REFUSALS.mandatoryExclusive,
            `${pointer}/flags`,
            `o mínimo do contexto \`${minimum?.context}\` exige ${members.join(' e ')}, ` +
              'e a mesma restrição as declara mutuamente exclusivas',
          );
        }
      }
    }
  }

  for (const [index, entry] of entries.entries()) {
    const root = pointerFor('entries', index);

    if (ids.get(entry?.id) !== index) {
      continue;
    }

    if (!KINDS.includes(entry?.kind)) {
      refuse(
        REFUSALS.kindNotInList,
        `${root}/kind`,
        // A contagem NÃO entra na redação. Ela já mudou uma vez e vai mudar de
        // novo no ticket do port; uma recusa que dissesse "uma das três" com
        // cinco na lista mentiria sobre o próprio motivo, e quem a recebe lê o
        // detalhe justamente por não saber a lista de cor.
        `\`${entry?.kind}\` não está na lista fechada: ${KINDS.join(', ')}`,
      );
      continue;
    }

    // **A recusa inverteu de sinal na versão 2.** Até a 1 o campo era exigido:
    // o cabeçalho do painel saía dele. Ele era escrito à mão ao lado dos
    // `parameters`, e nada obrigava os dois a concordarem — estava certo por
    // sorte. Agora `signatureOf` o deriva do modelo, e carregá-lo no JSON
    // reabriria a segunda fonte de verdade que derivar existe para fechar.
    if (entry.signature !== undefined) {
      refuse(
        REFUSALS.handwrittenSignature,
        `${root}/signature`,
        'a assinatura é derivada de `parameters` por `line.mjs`, e escrevê-la abre a segunda fonte',
      );
    }

    validateLineModel(entry, root);

    for (const key of ['summary', 'description']) {
      if (typeof entry[key] !== 'string' || entry[key] === '') {
        refuse(REFUSALS.missingDescription, `${root}/${key}`, `a entrada \`${entry.id}\` não tem \`${key}\``);
      }
    }

    for (const [i, parameter] of (entry.parameters ?? []).entries()) {
      validateField(parameter, `${root}${pointerFor('parameters', i)}`, 1);
    }

    if (entry.returnValue) {
      if (typeof entry.returnValue.description !== 'string' || entry.returnValue.description === '') {
        refuse(REFUSALS.missingDescription, `${root}/returnValue`, `o retorno de \`${entry.id}\` não tem \`description\``);
      }
      validateReference(entry.returnValue.entry, `${root}/returnValue/entry`);
      for (const [i, field] of (entry.returnValue.fields ?? []).entries()) {
        validateField(field, `${root}${pointerFor('returnValue', 'fields', i)}`, 1);
      }
    }

    const errors = entry.errors ?? [];
    if (errors.length > ERRORS_CEILING) {
      refuse(
        REFUSALS.moreThanFourErrors,
        `${root}/errors`,
        `${errors.length} erros documentados, e o teto é ${ERRORS_CEILING}`,
      );
    } else {
      for (const [i, error] of errors.entries()) {
        if (typeof error?.when !== 'string' || error.when === '') {
          refuse(
            REFUSALS.missingDescription,
            `${root}${pointerFor('errors', i)}`,
            `o erro \`${error?.name}\` não diz quando acontece`,
          );
        }
      }
    }

    for (const key of ['exports', 'flow']) {
      for (const [i, id] of (entry[key] ?? []).entries()) {
        validateReference(id, `${root}${pointerFor(key, i)}`);
      }
    }
    validateReference(entry.receiver, `${root}/receiver`);
  }

  // O ciclo de receptor, depois de tudo: uma referência morta já reprovou acima,
  // e caminhar sobre ela aqui só produziria um segundo erro sobre o mesmo nó.
  if (!refusals.some((r) => r.refusal === REFUSALS.deadReference)) {
    for (const [index, entry] of entries.entries()) {
      const seen = new Set([entry.id]);
      let current = entry.receiver;
      while (current !== undefined) {
        if (seen.has(current)) {
          refuse(
            REFUSALS.receiverCycle,
            `${pointerFor('entries', index)}/receiver`,
            `a cadeia de receptor volta a \`${current}\`, e o preâmbulo do snippet não fecha`,
          );
          break;
        }
        seen.add(current);
        current = entries[ids.get(current)]?.receiver;
      }
    }
  }

  return refusals;
}
