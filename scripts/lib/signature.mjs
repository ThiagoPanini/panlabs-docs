/**
 * Validator for the signature contract: a closed list of named refusals,
 * each naming the JSON Pointer (RFC 6901) of the offending node.
 *
 * Parsing is `JSON.parse` only, so YAML input fails as a parse error rather
 * than a dedicated check. The validator always refuses loudly rather than
 * silently accepting input it doesn't understand.
 */

import fs from 'node:fs';

// The conflict check here is the same one the line-model panel uses. See
// `membersInConflict`.
import {membersInConflict} from '../../src/theme/MDXComponents/line.mjs';

/** The name/version pair this validator accepts. Closed. */
export const CONTRACT = 'signature';
export const VERSION = 2;

/**
 * The kinds a contract entry may declare (ADR 9 §a). Anything outside this
 * list is refused via `kindNotInList`.
 */
export const KINDS = ['application', 'command'];

/**
 * The nesting ceiling, calibrated against a real page: `Infraestrutura ›
 * O output de um módulo`, the deepest hand-written page in this docs set,
 * nests exactly four levels deep; a fifth would refuse before it renders
 * illegibly.
 *
 * A field whose type is another entry links rather than nesting (the
 * `entry` field), so it never accumulates depth and needs no reset.
 */
export const NESTING_CEILING = 4;

export const ERRORS_CEILING = 4;

/**
 * The closed list of named refusals.
 *
 * Four of them (exclusive-group-of-one, model-names-nonexistent-flag,
 * mandatory-exclusive, incoherent-arity) validate the line model's internal
 * coherence: regenerating a page from the contract doesn't catch this
 * defect class, since an internally incoherent model can still generate
 * cleanly, producing a panel that renders a line the tool itself refuses.
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

/** A JSON Pointer segment, escaped per RFC 6901. */
const segment = (key) => String(key).replace(/~/g, '~0').replace(/\//g, '~1');

const pointerFor = (...parts) => parts.map((part) => `/${segment(part)}`).join('');

/**
 * Reads and parses a contract file. YAML input fails here as invalid JSON.
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
 * Validates a contract on its own. Returns the list of refusals in document
 * order, empty when it passes.
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

  // ids are scanned before the rest, not inside the loop below: a duplicated
  // id would otherwise steal its sibling's identity, and every downstream
  // reference to it would misreport as `dead-reference` instead of the
  // actual `duplicate-id` cause.
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

  /** A field node: parameter, return field, or nested field. */
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
   * The line model's internal coherence, checked against itself rather than
   * the CLI: an exclusive group of one member, a constraint that points at
   * a flag that doesn't exist, a minimum invocation that requires two
   * mutually exclusive flags, or a separator on a field that doesn't
   * accumulate.
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

      // A minimum is a line the tool accepts. If it violates a constraint
      // itself, the panel would render already refused, teaching an
      // invocation that doesn't run.
      const present = new Set(flags);
      for (const constraint of constraints) {
        // The conflict check comes from `line.mjs`, not a copy here: the
        // validator and the panel must agree on what counts as a valid
        // line, and two implementations of the same partition would
        // diverge silently, with the validator approving a minimum the
        // panel refuses.
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
        // The message never hardcodes a count of how many kinds exist: a
        // refusal that said "one of three" while the list held five would
        // misstate its own reason, and the reader consults `detail`
        // precisely because they don't have the list memorized.
        `\`${entry?.kind}\` não está na lista fechada: ${KINDS.join(', ')}`,
      );
      continue;
    }

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

  // Receiver-cycle check runs last: a dead reference already refused above,
  // and walking it here would only produce a second error on the same node.
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
