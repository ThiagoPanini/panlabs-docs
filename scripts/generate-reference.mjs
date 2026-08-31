/**
 * Reads the signature contract, validates it, and writes four `.mdx` pages
 * plus the sidebar fragment `sidebars-ferramentas.js` imports.
 *
 * Not wired into `docusaurus.config.js`: runs by hand
 * (`npm run generate:reference`) or automatically before every build, via
 * `prebuild`.
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {readContract, validate} from './lib/signature.mjs';
// The line model comes from the SAME file the panel reads, which is what
// keeps the signature emitted here and the line built there from
// diverging: same function, same field. See `line.mjs`'s header.
import {shellQuote, signatureOf} from '../src/theme/MDXComponents/line.mjs';

const CONTRACT_PATH = 'contracts/overpower.json';

const DESTINATION = 'content/ferramentas/bibliotecas/overpower/comandos';

const PREFIX = 'bibliotecas/overpower/comandos';

const FRAGMENT = 'sidebars-referencia.js';

/**
 * The panel tag, emitted in the body of every generated page.
 *
 * It's literal, with no purpose attribute: serializing the panel as a prop
 * inside the MDX would be a second copy of the `api_exemplos` the front
 * matter already carries, and regenerating from the contract wouldn't
 * catch the two drifting apart. The component reads the front matter
 * through the same door as the page, `useDoc()`.
 */
const PANEL = '<CommandPanel />';

/**
 * A generated leaf's icon key, given by the contract per entry, in
 * `entry.icon`: the Lucide slug `sidebars-icons.js`'s `icon()` resolves
 * against the installed package.
 *
 * Not derivable from `id`: nothing about an entry's id predicts which
 * glyph fits it, so the field is data, not convention. The generator
 * checks it exists; an entry with no key would come out with `undefined`
 * passed to `icon()`, with nothing downstream to notice.
 */
const iconKey = (entry) => {
  if (typeof entry.icon !== 'string' || entry.icon === '') {
    throw new Error(
      `${entry.id}: falta \`icon\` no contrato, e é ele que dá o \`className\` da folha na sidebar.`,
    );
  }
  return entry.icon;
};

/**
 * What each entry kind emits: a table that stands in for
 * `if (kind === ...)`. A kind declares its shape here and falls through
 * the same paths as every other kind.
 *
 * Fields:
 *
 *   · `members`: the children-table's label key, or `null`. Having
 *     members means being a root; the root walks `flow` in its snippet, a
 *     member emits its own chain, marked.
 *   · `fields`: the `<ParamField>` section's label key, or `null`.
 *   · `returnValue`: the `<ResponseField>` section's label key, and
 *     whether it appears ALWAYS (with the `noReturn` phrase when the entry
 *     has none) or only when there's something to say.
 *   · `errors`: whether the kind has an error table.
 *   · `dialect`: who composes the panel snippet, and in what language.
 *
 * The table is closed against `ESPECIES`, and `npm test` ties the two: a
 * kind added to the validator's list with no shape here throws a
 * `TypeError` mid-emission instead of failing with a named refusal.
 *
 * `ParamField` reads here as an OPTION and `ResponseField` as an EXIT
 * CODE. Neither is protocol- or language-specific.
 */
export const SHAPE = {
  // The CLI root: global options and the exit-code table shared by every
  // command. It ALWAYS carries the table, since it's the only place it
  // lives.
  application: {
    members: 'commands',
    fields: 'globalOptions',
    returnValue: {label: 'exitCodes', always: true},
    errors: true,
    dialect: 'cli',
  },
  // A command carries exit codes only when it has one the root doesn't
  // cover. Repeating the root's codes on every page would be the second
  // source of truth this generator exists to avoid.
  command: {
    members: null,
    fields: 'options',
    returnValue: {label: 'exitCodes', always: false},
    errors: true,
    dialect: 'cli',
  },
};

// ---------------------------------------------------------------------------
// A linha de comando, a partir de JSON
// ---------------------------------------------------------------------------

/**
 * Is the parameter editable?
 *
 * Scalar with an example, nothing more. A `dict` or a list inside a text
 * input would force the panel to parse text back into structure, an
 * interpreter inside a static site.
 */
const editable = (parameter) =>
  typeof parameter.example === 'string' || typeof parameter.example === 'number';

/**
 * What the parameter is worth inside the line: raw code wins, everything
 * else becomes a shell literal.
 *
 * `line.mjs` composes the editable line; the only lines this file still
 * composes are the root's, which are static.
 */
function valueFor(parameter) {
  if (parameter.codeExample !== undefined) {
    return parameter.codeExample;
  }
  return commandLiteral(parameter.example);
}

const hasExample = (parameter) =>
  parameter.example !== undefined || parameter.codeExample !== undefined;

/**
 * A JSON value written as one word of a shell line.
 *
 * The escaping comes from `line.mjs`, not a copy here: the two lines this
 * project emits (the root's example, composed at build time, and the
 * panel's edited one, composed client-side) need to escape the same way,
 * or a reader copying both gets different text.
 *
 * What's left here is the one real difference: a number takes no quotes.
 */
const commandLiteral = (value) =>
  typeof value === 'string' ? shellQuote(value) : String(value);

/**
 * A command's usage line, e.g. `overpower install --from "…"`.
 *
 * A boolean flag takes no value: `--json true` isn't a line anyone types,
 * so `true` enters bare and `false` doesn't enter at all. The name comes
 * whole from the contract, dashes included, since it's both what the
 * reader copies and the panel's marker key.
 */
function commandCall(entry) {
  const options = (entry.parameters ?? []).filter(hasExample).flatMap((parameter) => {
    if (typeof parameter.example === 'boolean') {
      return parameter.example ? [parameter.name] : [];
    }
    return [`${parameter.name} ${valueFor(parameter)}`];
  });
  return [entry.call, ...options].join(' ');
}

/**
 * Who composes the panel snippet, per dialect.
 *
 * The dialect belongs to the kind, not the contract: a `command` entry is
 * always used from a shell, so there's no contract field to invent for it.
 * `bash` is already registered with Prism
 * (`docusaurus.config.js`'s `additionalLanguages`), so the panel paints it
 * with no new dependency.
 */
const DIALECTS = {
  cli: {
    language: 'bash',
    call: commandCall,
    // Nothing to import before calling a command; a blank line at the top
    // of the block would be decoration the reader would copy along.
    preamble: () => null,
  },
};

/**
 * Usage lines, with the receiver emitted once, before whoever uses it.
 *
 * `receiver` stays here even though the CLI contract doesn't use it: it's
 * a signature-contract field, and the validator checks it in two of its
 * named refusals (`referencia-morta`, `ciclo-de-receptor`). Ignoring a
 * field the validator requires would be exactly the drift `npm test`
 * exists to catch.
 */
function emitChain(entry, porId, vistos, lines, dialect) {
  if (vistos.has(entry.id)) {
    return;
  }
  if (entry.receiver) {
    emitChain(porId.get(entry.receiver), porId, vistos, lines, dialect);
  }
  vistos.add(entry.id);
  lines.push(dialect.call(entry));
}

/**
 * The root's static lines: preamble, receiver, and each member's call.
 *
 * Only the root passes through here. A command's page carries no frozen
 * snippet; it ships the model, and the panel composes the line. The root
 * shows its members' flow, not itself, since what you type to use a CLI is
 * one of its commands, and having members is what makes something a root.
 */
function snippetFor(entry, {contract, porId}) {
  const shape = SHAPE[entry.kind];
  const dialect = DIALECTS[shape.dialect];
  const vistos = new Set();
  const lines = [];

  for (const id of entry.flow ?? []) {
    emitChain(porId.get(id), porId, vistos, lines, dialect);
  }

  const preamble = dialect.preamble(entry, {contract, shape});
  return (preamble === null ? lines : [preamble, '', ...lines]).join('\n');
}

// ---------------------------------------------------------------------------
// MDX
// ---------------------------------------------------------------------------

const attribute = (name, value) => ` ${name}="${String(value).replace(/"/g, '&quot;')}"`;

/**
 * A label, read from the contract's `labels` block, never with a
 * fallback.
 *
 * Reading through here instead of `labels.x` raw matters because a
 * missing key would otherwise come out as a literal `## undefined` with
 * nothing to catch it. This throws early instead, naming the key.
 */
function label(labels, key) {
  const value = labels[key];
  if (typeof value !== 'string' || value === '') {
    throw new Error(`o contrato não traz o rótulo \`${key}\`, e a seção sairia sem título.`);
  }
  return value;
}

/**
 * The link to another entry.
 *
 * A field whose type is another entry doesn't nest, it LINKS: there's no
 * inline expansion whose nesting budget depends on where it was
 * referenced. The target is a FILE path (`./x.mdx`), not a route, the form
 * `onBrokenMarkdownLinks: 'throw'` checks at build time.
 */
function entryLink(id, {porId, labels}) {
  const target = porId.get(id);
  return `${label(labels, 'seeAlso')} [\`${target.title}\`](./${target.id}.mdx)`;
}

/** A `<ParamField>`/`<ResponseField>`, recursing through `<Expandable>`. */
function fieldMdx(field, tag, context, nivel) {
  const {labels} = context;
  const opening =
    `<${tag}${attribute('name', field.name)}${attribute('type', field.type)}` +
    `${field.defaultValue === undefined ? '' : attribute('default', field.defaultValue)}` +
    `${field.required ? ' required' : ''}${field.deprecated ? ' deprecated' : ''}>`;

  const body = [field.description];

  // Arity is the model's, and the page states it on its own. Five
  // `install` flags accumulate (repeating the flag or comma-separating
  // reach the same tuple), and no page said so by hand. Writing the
  // sentence here means every `<ParamField>` inherits it from the field
  // that declares it.
  if (field.arity?.multiple) {
    body.push('', label(labels, 'multipleArity'));
  }

  if (field.entry !== undefined) {
    body.push('', entryLink(field.entry, context));
  }

  if ((field.fields ?? []).length > 0) {
    body.push('', `<Expandable${attribute('title', field.type)}${nivel === 1 ? ' defaultOpen' : ''}>`, '');
    for (const filho of field.fields) {
      body.push(fieldMdx(filho, tag, context, nivel + 1), '');
    }
    body.push('</Expandable>');
  }

  return [opening, ...body, `</${tag}>`].join('\n');
}

/** The error table: name, then when it happens, in that order. */
function errorsTable(errors, {labels}) {
  return [
    `| ${label(labels, 'errorColumn')} | ${label(labels, 'whenColumn')} |`,
    '| --- | --- |',
    ...errors.map((error) => `| \`${error.name}\` | ${error.when} |`),
  ].join('\n');
}

/**
 * The root's member table: name, kind, and each entry's own summary.
 *
 * Serves a module's exports and an application's commands without knowing
 * the difference: both cases are the root pointing at its children, and
 * only the section label, already data, changes.
 */
function membersTable(entry, {porId, labels}) {
  return [
    `| ${label(labels, 'nameColumn')} | ${label(labels, 'kindColumn')} | ${label(labels, 'summaryColumn')} |`,
    '| --- | --- | --- |',
    ...entry.exports.map((id) => {
      const target = porId.get(id);
      return `| [\`${target.title}\`](./${id}.mdx) | ${label(labels, target.kind)} | ${target.summary} |`;
    }),
  ].join('\n');
}

/**
 * The page body, in the fixed order the generator always produces:
 *
 *   1. `# Title`
 *   2. kind and qualified name, in prose
 *   3. the description
 *   4. the member table: `## Exports` for a module, `## Commands` for an
 *      application; absent for anything that isn't a root
 *   5. the `<ParamField>` section: `## Parameters`, `## Global Options`, or
 *      `## Options`; absent when there are none
 *   6. the `<ResponseField>` section: `## Return`, `## Attributes`, or
 *      `## Exit Codes`, with the field tree or the "returns nothing"
 *      phrase
 *   7. `## Errors`: the table; absent when the entry raises nothing
 *
 * `SHAPE` chooses the sections, the contract writes the titles. The
 * function never names a kind: it reads the kind's shape and indexes the
 * `labels` block by the key the shape points at.
 */
export function bodyMdx(entry, context) {
  const {labels} = context;
  const shape = SHAPE[entry.kind];
  const parts = [
    `# ${entry.title}`,
    '',
    // Marks every generated page as quoting tool output, mandatory on all
    // of them, not just the two that carry an em dash today: `api_exemplos`
    // is a projection of the contract, and a refusal message that grows an
    // em dash tomorrow would fail a page nobody touched.
    //
    // It comes AFTER the `h1`, not before: the `ai-era` plugin fails the
    // build on a page that doesn't open with `# title`.
    //
    // `{/* */}`, not `<!-- -->`: under MDX 3, an HTML comment doesn't
    // compile.
    '{/* cita-saida-de-ferramenta */}',
    '',
    `**${label(labels, entry.kind)}** · \`${entry.qualified}\``,
    '',
    // The panel (signature, editable arguments, snippet) goes HERE, in
    // flow, immediately after the line naming the command and before the
    // prose: the line says how this is called, and the next question for
    // someone landing on a CLI page is how to type it. Prose between the
    // two would force scrolling past it to find the copyable line, and
    // prose explains what the signature already showed, so explaining
    // after showing is the cheap order.
    //
    // The tag carries no prop: `useDoc()` reads the front matter's
    // `api_exemplos` for it.
    PANEL,
    '',
    entry.description,
  ];

  if (shape.members) {
    parts.push('', `## ${label(labels, shape.members)}`, '', membersTable(entry, context));
  }

  if (shape.fields && (entry.parameters ?? []).length > 0) {
    parts.push('', `## ${label(labels, shape.fields)}`, '');
    for (const parameter of entry.parameters) {
      parts.push(fieldMdx(parameter, 'ParamField', context, 1), '');
    }
    parts.pop();
  }

  if (shape.returnValue && (shape.returnValue.always || entry.returnValue)) {
    parts.push('', `## ${label(labels, shape.returnValue.label)}`, '', ...returnLines(entry, context));
  }

  if (shape.errors && (entry.errors ?? []).length > 0) {
    parts.push('', `## ${label(labels, 'errors')}`, '', errorsTable(entry.errors, context));
  }

  return `${parts.join('\n')}\n`;
}

/** The return section's lines: a phrase, a link, or a field tree. */
function returnLines(entry, context) {
  const {labels} = context;

  if (!entry.returnValue) {
    // The root is the ONLY owner of the exit-code table; commands don't
    // repeat it, they link to it. A root with no return value would emit
    // the "returns nothing" phrase, the very page that should carry the
    // codes saying there are none instead. Stopping here is the same fix
    // as the missing-label one.
    if (SHAPE[entry.kind].members) {
      throw new Error(
        `${entry.id}: a raiz \`${entry.kind}\` não traz \`retorno\`, e é ela que carrega a tabela para todos os membros.`,
      );
    }
    return [label(labels, 'noReturn')];
  }

  if ((entry.returnValue.fields ?? []).length === 0) {
    return [
      entry.returnValue.entry === undefined
        ? entry.returnValue.description
        : `${entry.returnValue.description} ${entryLink(entry.returnValue.entry, context)}`,
    ];
  }

  const lines = [entry.returnValue.description, ''];
  for (const field of entry.returnValue.fields) {
    lines.push(fieldMdx(field, 'ResponseField', context, 1), '');
  }
  lines.pop();
  return lines;
}

/**
 * The front matter: two content fields, plus the panel's switch.
 *
 * The panel receives a model (arity, minimum context, constraints), not a
 * frozen template: a frozen template can't say "optional", since clearing
 * the field would produce `--skill ""`, not a line the CLI accepts.
 *
 * The root isn't assemblable, and stays lines: what you type to use a CLI
 * is one of its commands, so the root's page shows its members' flow,
 * static text with nothing to edit.
 */
export function frontMatter(entry, context) {
  const shape = SHAPE[entry.kind];

  const panel = {
    // Derived, never read from the contract: a hand-written `signature`
    // was a second source of truth about a command's shape, and it and
    // `parameters` could disagree about flag order with nothing to notice.
    signature: signatureOf(entry),
    language: DIALECTS[shape.dialect].language,
  };

  if (shape.members) {
    panel.lines = snippetFor(entry, context).split('\n');
  } else {
    panel.model = {
      call: entry.call ?? entry.qualified,
      qualified: entry.qualified,
      // The context the page opens the panel in: the contract's FIRST
      // `minimum`, and that order is the decision. For `install` it's
      // `terminal`, since a bare `overpower install` is a complete
      // terminal line and the one most people type; the piped line stays
      // in the model, reachable by adding the flags it requires.
      context: (entry.minimum ?? [{context: 'always'}])[0].context,
      parameters: (entry.parameters ?? []).map((parameter) => ({
        name: parameter.name,
        type: parameter.type,
        arity: parameter.arity,
        ...(editable(parameter) ? {example: String(parameter.example)} : {}),
      })),
      minimum: entry.minimum ?? [],
      constraints: entry.constraints ?? [],
    };
  }

  return [
    '---',
    `# GENERATED by scripts/generate-reference.mjs from ${context.contractPath}.`,
    '# Edit the contract, not this file: `prebuild` regenerates it.',
    `title: ${entry.title}`,
    `description: ${entry.summary}`,
    `api_exemplos: ${JSON.stringify(panel)}`,
    '---',
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Emission
// ---------------------------------------------------------------------------

/**
 * The emission context: the contract, indexed by id.
 *
 * Split out of `writeDocs` because tests need to emit a page without
 * writing to disk. The on-disk fixture pair exists and is read by tests,
 * but they also assemble synthetic pairs to exercise what the published
 * contract doesn't have on purpose (a boolean flag, a missing label, a
 * root with no return table), and a test that had to call the whole
 * generator would rewrite the generated branch just to check a string.
 */
export function contextFor(contract, contractPath) {
  return {
    contract,
    contractPath,
    labels: contract.labels,
    porId: new Map(contract.entries.map((entry) => [entry.id, entry])),
  };
}

/**
 * Writes the whole directory, deleting any `.mdx` left over from a
 * previous contract.
 */
function writeDocs(contract) {
  const context = contextFor(contract, CONTRACT_PATH);
  const destination = DESTINATION;
  fs.mkdirSync(destination, {recursive: true});

  const written = new Set();
  for (const entry of contract.entries) {
    const file = `${entry.id}.mdx`;
    written.add(file);
    fs.writeFileSync(
      path.join(destination, file),
      `${frontMatter(entry, context)}\n\n${bodyMdx(entry, context)}`,
    );
  }

  // Orphan sweep only reaches `.mdx`: that's the cut that separates the
  // two ownership domains now that they share a folder. The authored leaf
  // that opens the branch, `Comandos › Índice`, lives inside this folder
  // by decision and owns the empty-right-panel fixture, whose contrast
  // only exists between siblings.
  //
  // Deleting everything not written this round was correct while the
  // folder belonged entirely to the generator; now it would mean the
  // generator claiming a file that isn't its own. The extension is already
  // the greppable signal of "generated, don't edit".
  for (const orphan of fs.readdirSync(destination)) {
    if (orphan.endsWith('.mdx') && !written.has(orphan)) {
      fs.rmSync(path.join(destination, orphan), {recursive: true});
    }
  }
  return written.size;
}

/** The fragment: a list of leaf items, nothing more. The tab's sidebar builds the tree. */
function writeFragment(contract) {
  const lines = [
    '// @ts-check',
    '',
    "import {icon} from './sidebars-icons.js';",
    '',
    '/**',
    ' * `Ferramentas › Bibliotecas › overpower › Comandos`, GENERATED by',
    ' * `scripts/generate-reference.mjs`: a FRAGMENT of leaf items, not a tree.',
    ' * Edit the contract, not this file.',
    ' *',
    ' * Each item\'s icon key belongs to its own entry, one per page.',
    ' * @type {import(\'@docusaurus/plugin-content-docs\').SidebarItemConfig[]}',
    ' */',
    'const referencia = [',
    ...contract.entries.map(
      (entry) => `  {type: 'doc', id: '${PREFIX}/${entry.id}', ...icon('${iconKey(entry)}')},`,
    ),
    '];',
    '',
    'export default referencia;',
    '',
  ];
  fs.writeFileSync(FRAGMENT, lines.join('\n'));
}

// ---------------------------------------------------------------------------

function main() {
  let contract;
  try {
    contract = readContract(CONTRACT_PATH);
  } catch (error) {
    console.error(`RECUSADO ${error.refusal} em "${error.pointer}" — ${error.message}`);
    process.exit(1);
  }

  const refusals = validate(contract);
  if (refusals.length > 0) {
    console.error(`O contrato foi RECUSADO em ${refusals.length} ponto(s):`);
    for (const {refusal, pointer, detail} of refusals) {
      console.error(`  ${refusal}  em "${pointer}"`);
      console.error(`    ${detail}`);
    }
    process.exit(1);
  }

  const written = writeDocs(contract);
  writeFragment(contract);

  console.log(`Referência gerada — ${written} página(s) · ${FRAGMENT}`);
}

/**
 * Is this file being executed, or was it imported?
 *
 * The symlink has to be resolved on both sides: `import.meta.url` already
 * carries the real path, `process.argv[1]` doesn't. Invoked through a
 * symlink, a raw `path.resolve` compares a real path against a link path,
 * decides this isn't the command, and exits with nothing generated, in
 * silence.
 */
function isTheCommand() {
  if (!process.argv[1]) {
    return false;
  }
  try {
    return fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url));
  } catch {
    // `argv[1]` that doesn't exist on disk isn't this file.
    return false;
  }
}

// Only runs when it's the command, never when imported: `npm test` imports
// `bodyMdx` and `frontMatter` from here to exercise shapes the published
// contract doesn't have; without this guard, `node --test` would rewrite
// the generated branch as a side effect of checking a string.
if (isTheCommand()) {
  main();
}
