/**
 * The command-line model, what the panel assembles and what the generator
 * derives, in a single file.
 */

/* Why it exists: before it, the panel had no flag model. The generator
   froze a template at build time and `CommandPanel` did `String.replace`
   of `{{marker}}` over it. A frozen template can't say "optional":
   clearing the `--skill` field produced `overpower list --skill ""`, a
   line the CLI rejects, and turning on a second selector produced a line
   it refuses. The template also couldn't say the same flag has different
   arity across two subcommands.

   The `signature` field leaves the contract because of this file. It
   used to be hand-written beside `parameters`, with nothing forcing the
   two to agree. Deriving it here gives the contract one source for the
   command's shape, and keeps the panel and the signature from diverging,
   since they're the same function reading the same field.

   Zero React, zero DOM, so the build script can import it. Same doctrine
   as `SearchBar/ladder.mjs`: the consumers read the same file.
   `scripts/generate-reference.mjs` and `CommandPanel.js` are the
   consumers.

   What this model does NOT do, on purpose: it models the line, not the
   machine. Arity, guarded exclusivity, per-context minimums, and refusal
   by another flag's presence, yes. Disk state (`--force` is only
   required when the global destination already exists), a runtime's
   reachability by scope, and the non-monotonic jump where adding a flag
   turns a refusal into success stay out: none of that fits a static
   assembler, and it becomes prose beside the panel instead. */

/**
 * A shell word, double-quoted and escaped.
 *
 * Inside double quotes the shell still expands `$`, runs backticks, and
 * consumes the backslash, and this is the line the reader copies into their
 * terminal. Order matters: escaping `\\` after `"` would escape the
 * backslash just inserted.
 *
 * It's exported because the generator uses it too, and two copies of the
 * same rule are exactly the defect this module exists to not repeat: the
 * generator writes the root's example line and the panel writes the edited
 * line, and a reader copying both expects the same escaping. Two copies
 * would drift apart with nothing to catch it.
 */
export const shellQuote = (value) => `"${String(value).replace(/[\\$`"]/g, (c) => `\\${c}`)}"`;

/** A boolean flag enters bare; `--dry-run true` isn't a line anyone types. */
const isBoolean = (parameter) => parameter.type === 'flag';

const parametersOf = (entry) => entry.parameters ?? [];

/** The flag's position in the contract, the order the line writes it in. */
const orderOf = (entry) => {
  const position = new Map();
  parametersOf(entry).forEach((parameter, index) => position.set(parameter.name, index));
  return position;
};

/**
 * The signature, derived from the model.
 *
 * Every parameter enters in brackets since no parameter on this CLI is
 * required by the parser: all four groups are `required=False`, and the
 * real requirement is always conditional on something not in the line, no
 * terminal present, `cwd` outside a repository, the destination already
 * existing. A signature that hard-coded `<--skill>` would lie about the
 * parser; what the line actually needs lives in `minimum`, per context.
 *
 * The root announces the member, not itself: what you type to use a CLI is
 * one of its commands, and having `flow` is what makes something the root.
 */
export function signatureOf(entry) {
  const options = parametersOf(entry).map((parameter) =>
    isBoolean(parameter) ? `[${parameter.name}]` : `[${parameter.name} <${parameter.type}>]`,
  );

  const members = Array.isArray(entry.flow) && entry.flow.length > 0 ? ['<command>'] : [];

  return [entry.qualified, ...options, ...members].join(' ');
}

/**
 * The state the panel opens in, per context.
 *
 * The minimum is declared per context because a terminal and a pipe are
 * different lines: `overpower install` in a terminal opens the wizard and is
 * a complete line; the same text in a pipe errors out, since there's no
 * wizard to open. Two minimum lines, one per context, and the panel opens on
 * whichever context the page chose to show.
 *
 * It's deterministic on purpose: the panel is painted on the server and
 * rehydrated on the client, and an initial state that depended on the
 * browser would make React complain about a mismatch and the line flicker
 * on first paint.
 */
export function initialState(entry, context) {
  const minimum =
    (entry.minimum ?? []).find((candidate) => candidate.context === context) ??
    (entry.minimum ?? [])[0];
  const requiredFlags = new Set(minimum?.flags ?? []);

  return Object.fromEntries(
    parametersOf(entry).map((parameter) => [
      parameter.name,
      {
        on: requiredFlags.has(parameter.name),
        // With no example in the contract, the metavar fills the slot: it
        // says what to type without faking a value the tool may not know.
        value: isBoolean(parameter)
          ? ''
          : String(parameter.example ?? `<${parameter.type}>`),
      },
    ]),
  );
}

/** The flags the state has turned on, in contract order. */
const onFlags = (entry, state) =>
  parametersOf(entry)
    .filter((parameter) => state[parameter.name]?.on)
    .map((parameter) => parameter.name);

/**
 * The members of an exclusive group that collide in the given set, or empty.
 *
 * The partition is what separates `list` from `install`: in `list` all four
 * selectors exclude each other pairwise; in `install` the boundary is
 * between the MCP class and the other three, and two flags on the SAME side
 * coexist. A flat group would get both commands wrong.
 *
 * It's exported because the validator uses it too. `scripts/lib/signature.mjs`
 * asks exactly this about a `minimum`'s flags, and a second implementation of
 * the same check is the divergence this module exists to avoid: the
 * validator could approve a minimum line the panel refuses, or the other way
 * around.
 */
export function membersInConflict(constraint, present) {
  if (constraint?.type !== 'exclusive') {
    return [];
  }
  if (constraint.guard && present.has(constraint.guard)) {
    return [];
  }
  const members = (constraint.members ?? []).filter((name) => present.has(name));
  const blocks = constraint.partition
    ? new Set(members.map((name) => constraint.partition.findIndex((b) => b.includes(name))))
    : new Set(members);
  return blocks.size < 2 ? [] : members;
}

/**
 * The rule's message, with `{flags}` filled in contract order.
 *
 * `" and "` isn't a style choice made here. It's what `TooManySelectorsError`
 * does in `cli.py`, `" and ".join(self.flags)`, and its docstring says why:
 * it names every flag it was given, so the line can be cut in one edit. A
 * comma would look nicer and send the reader looking in the terminal for
 * text that doesn't exist.
 */
function messageFor(entry, constraint, flags) {
  const order = orderOf(entry);
  const named = [...new Set(flags)].sort((a, b) => order.get(a) - order.get(b));
  return (constraint.message ?? '').replace('{flags}', named.join(' and '));
}

/**
 * Whether turning on `candidate` would violate the constraint, and with what
 * message.
 *
 * Returns `null` when it doesn't. The evaluation always runs on the state
 * WITH the candidate turned on, never on the current state: the question the
 * panel asks is "can I turn this on?", and that only has an answer in the
 * world where it already did.
 */
function violation(entry, constraint, present) {
  // The guard suspends the whole rule. Without it, this model would flag as
  // invalid a line the CLI actually accepts.
  if (constraint.guard && present.has(constraint.guard)) {
    return null;
  }

  if (constraint.type === 'exclusive') {
    const members = membersInConflict(constraint, present);
    if (members.length === 0) {
      return null;
    }
    return {
      message: messageFor(entry, constraint, members),
      exit: constraint.exit,
      errorClass: constraint.class,
    };
  }

  if (constraint.type === 'forbids') {
    if (present.has(constraint.when) && present.has(constraint.forbidden)) {
      return {
        message: messageFor(entry, constraint, [constraint.when, constraint.forbidden]),
        exit: constraint.exit,
        errorClass: constraint.class,
      };
    }
    return null;
  }

  // `desliga` describes what a flag's presence changes in the tool's
  // behavior, not what the line can contain. It blocks no field; it's prose
  // the page writes beside the panel.
  return null;
}

/**
 * The verdict per flag: whether the line can have it, and the CLI's message
 * when it can't.
 *
 * Evaluation order is the contract's `precedencia`, and it matters because
 * it decides which message the reader sees when two rules hit the same
 * line. The CLI evaluates in an order; the panel copies it instead of
 * choosing its own.
 */
/**
 * The verdict carries `classe`, and it has a named consumer beyond the
 * screen.
 *
 * The screen doesn't show it; the reader wants the message, not the Python
 * exception's name. What reads it is overpower's own audit, which
 * instantiates the class from the tool's source and compares
 * `str(Erro(...))` against the contract's `mensagem`, byte for byte. Without
 * the class name that check has nowhere to start.
 */
const byPrecedence = (entry) =>
  [...(entry.constraints ?? [])].sort((a, b) => (a.precedence ?? 0) - (b.precedence ?? 0));

export function evaluate(entry, state) {
  const constraints = byPrecedence(entry);

  return Object.fromEntries(
    parametersOf(entry).map((parameter) => {
      const present = new Set(onFlags(entry, state));
      present.add(parameter.name);

      for (const constraint of constraints) {
        const found = violation(entry, constraint, present);
        if (found) {
          // `rule` is the constraint object, not a copy: grouping by rule
          // needs to get back to it to rewrite `{flags}` over the whole set,
          // and comparing by identity is cheaper and safer than matching on
          // `classe`.
          return [parameter.name, {allowed: false, rule: constraint, ...found}];
        }
      }
      return [parameter.name, {allowed: true}];
    }),
  );
}

/**
 * The refusals grouped BY RULE, one entry per rule that bites.
 *
 * Why it exists: the panel used to say the same thing N times. `evaluate`
 * answers per flag, which is what the interface needs to disable a field.
 * But an exclusivity rule refuses ALL the other members at once, and the
 * panel printed the message under each one. Measured in `install`: checking
 * `--mcp` made the SAME 105-character sentence appear three times and pushed
 * the grid 132px down; in `list`, three sentences differing only in flag
 * name, and 78px. Three copies of one rule aren't three pieces of
 * information.
 *
 * `{flags}` is rewritten over the whole set, not over the pair a per-flag
 * evaluation produced. The CLI names every flag it received, so the group
 * message is the one it would actually print for that line, not an
 * arbitrary pair among the several the rule refuses.
 *
 * The order is the contract's `precedencia`, the order the CLI evaluates in.
 */
export function lineRefusals(entry, state) {
  const verdict = evaluate(entry, state);
  const present = new Set(onFlags(entry, state));
  const groups = new Map();

  for (const parameter of parametersOf(entry)) {
    const current = verdict[parameter.name];
    if (current?.allowed !== false) {
      continue;
    }
    const group = groups.get(current.rule) ?? {rule: current.rule, refused: []};
    group.refused.push(parameter.name);
    groups.set(current.rule, group);
  }

  return byPrecedence(entry)
    .filter((constraint) => groups.has(constraint))
    .map((constraint) => {
      const {refused} = groups.get(constraint);
      // The ones already turned on that belong to the rule go into the
      // sentence: those are what the reader chose, and without them the
      // message would say the tool received only what they couldn't check.
      const involved = [
        ...refused,
        ...(constraint.members ?? [constraint.when]).filter((name) => present.has(name)),
      ];
      return {
        errorClass: constraint.class,
        exit: constraint.exit,
        refused,
        message: messageFor(entry, constraint, involved),
      };
    });
}

/**
 * The line the reader copies.
 *
 * Three rules, each existing for a measured defect:
 *
 * 1. An off flag doesn't enter. The panel opens at the minimum and the
 *    reader adds by choice, instead of deleting what they don't want.
 * 2. An on flag with no value doesn't enter. The frozen template used to
 *    write `--skill ""`, a shape no CLI line has. With no value the flag
 *    drops out, so the line stays valid while the reader types.
 * 3. A refused flag doesn't enter. The panel disables the field, so the
 *    state never arrives here violated by the interface; the filtering is
 *    what guarantees no other path assembles a line the evaluation itself
 *    refuses.
 */
export function assemble(entry, state) {
  const verdict = evaluate(entry, state);

  const options = parametersOf(entry).flatMap((parameter) => {
    const field = state[parameter.name];
    if (!field?.on || !verdict[parameter.name]?.allowed) {
      return [];
    }
    if (isBoolean(parameter)) {
      return [parameter.name];
    }
    const value = String(field.value ?? '').trim();
    return value === '' ? [] : [`${parameter.name} ${shellQuote(value)}`];
  });

  return [entry.call ?? entry.qualified, ...options].join(' ');
}
