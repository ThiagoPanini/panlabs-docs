/**
 * `CommandPanel`, the signature, the arguments, and the usage snippet, in
 * the flow of the prose, right below the line that names the command.
 */

/* The front matter carries the model, and the line is assembled by
   `line.mjs`, the same module the generator uses to derive the signature.
   That's what lets this component know things a frozen template string
   couldn't: that a flag is optional, that two selectors on the same line
   are mutually exclusive, and that the same flag accumulates in `install`
   but not in `list`.

   The component is content, the layout is theme: in flow it's an MDX
   block like `<Steps>` or `<CodeGroup>`, and the route needs no component
   of its own; the generator emits `<CommandPanel />` in the body and the
   global `MDXComponents` registry resolves it.

   The source stays the front matter, read via `useDoc()`. The component
   takes no prop: a bare `<CommandPanel />` is what the generator can emit
   without serializing JSON inside the MDX body. */

/* Route territory, not catalog territory, and the address proves it:
   `ParamField` and `ResponseField` explicitly refuse to have an editable
   field, and `src/components/` closes at zero handler and zero state.
   This file holds `useState` and listens for `onChange`, so it can't live
   there; it lives beside `CopyPage.js`, the other chrome registry in this
   folder. */

/* A11y is the narrowest surface there is, and it didn't grow: a `<label>`
   with native `<input type="checkbox">` and `<input type="text">`. A
   checkbox isn't a handwritten interaction model, it's the control HTML
   already has for turning something on and off, which is exactly what
   toggling a flag is. A refused field uses native `disabled`, with the
   reason as one paragraph per rule below the grid, pointed to by
   `aria-describedby` from every box that rule refused; no key handling,
   no programmatic focus, no invented ARIA. Three boxes pointing at the
   same description is what the spec already provides for, and cheaper
   for someone listening than three identical sentences. */

/* Composition, not swizzle: `CodeBlock` is the same block `CodeGroup` uses
   for the catalog, but the authored `CodeGroup` reads STATIC code fences
   from MDX, and here the snippet's text changes on every keystroke. */

import React, {useMemo, useState} from 'react';
import CodeBlock from '@theme/CodeBlock';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
// The line model is read from the SAME file the generator imports. The
// signature emitted at build time and the line assembled here are the same
// function reading the same field, so they can't diverge.
import {evaluate, initialState, assemble, lineRefusals} from './line.mjs';
import styles from './panel.module.css';

export default function CommandPanel() {
  const {frontMatter} = useDoc();
  const examples = frontMatter.api_exemplos;

  // Fail loud, at build time. A `<CommandPanel />` on a page with no
  // `api_exemplos` can only come from hand-edited MDX; the generated page
  // always brings both together.
  if (!examples) {
    throw new Error(
      '`<CommandPanel />` numa página sem `api_exemplos` no front matter. ' +
        'A página de comando é gerada por `npm run gerar:referencia`, e o corpo não se edita à mão.',
    );
  }

  return examples.model ? <Assembler examples={examples} /> : <Flow examples={examples} />;
}

/**
 * The root page: a static flow of members.
 *
 * There's nothing to assemble; what you type to use a CLI is one of its
 * commands, and the root shows which ones exist. With no field, the
 * signature header is the only line that says what this is called, and it
 * stays.
 */
function Flow({examples}) {
  const text = examples.lines.join('\n');
  return (
    <div className={styles.panel} data-pd-component="api-panel">
      <p className={styles.panelHeader}>
        <code>{examples.signature}</code>
      </p>
      <CodeBlock language={examples.language}>{text}</CodeBlock>
    </div>
  );
}

function Assembler({examples}) {
  const {signature, language, model} = examples;

  // This instance's id prefix. It comes from the command, unique on the
  // generated page, not from a counter; a counter would depend on render
  // order, and SSR and hydration could disagree about it.
  const baseId = `panel-${(model.qualified ?? 'command').replace(/[^a-z0-9]+/gi, '-')}`;

  // The initial state is derived, and that's why SSR matches: the server
  // renders `initialState(model, context)` and the client rehydrates by
  // computing the same function over the same data. Nothing here reads the
  // browser.
  const [state, setState] = useState(() => initialState(model, model.context));

  const verdict = useMemo(() => evaluate(model, state), [model, state]);
  const text = useMemo(() => assemble(model, state), [model, state]);

  // A refusal is grouped by RULE, and the reason is measured: checking
  // `--mcp` in `install` used to print the SAME sentence three times and
  // push the grid 132px; checking `--skill` in `list` printed three
  // sentences differing only in flag name. The text showed up under three
  // controls the reader hadn't touched, which is what made it look like it
  // came from nowhere. One rule, one sentence, in one place: below the grid,
  // on the path between what they checked and the line.
  const refusedRules = useMemo(() => lineRefusals(model, state), [model, state]);

  // The message id, per flag: three disabled boxes' `aria-describedby` all
  // point at the SAME paragraph, instead of three.
  const refusalId = useMemo(() => {
    const map = {};
    refusedRules.forEach((rule, index) => {
      rule.refused.forEach((name) => {
        map[name] = `${baseId}-recusa-${index}`;
      });
    });
    return map;
  }, [refusedRules, baseId]);

  const toggle = (name) =>
    setState((current) => ({...current, [name]: {...current[name], on: !current[name].on}}));

  const type = (name, value) =>
    setState((current) => ({...current, [name]: {...current[name], value}}));

  // A command with no options at all has a signature identical to its
  // snippet, like `doctor`: both say `overpower doctor`. Two copies of the
  // same line aren't two pieces of information, they're the same one, and
  // the second sends the reader looking for a difference that doesn't
  // exist. The comparison runs on the text ALREADY ASSEMBLED, so checking a
  // flag makes the header reappear on its own, exactly when it starts
  // saying something the line doesn't.
  const duplicated = text.trim() === signature.trim();

  return (
    <div className={styles.panel} data-pd-component="api-panel">
      {/* The signature is the panel's header since it's the only line that
          answers "what is this called" without the reader dropping into the
          prose. */}
      {!duplicated && (
        <p className={styles.panelHeader}>
          <code>{signature}</code>
        </p>
      )}

      {model.parameters.length > 0 && (
        <div className={styles.panelParameters}>
          {model.parameters.map((parameter) => (
            <Field
              key={parameter.name}
              parameter={parameter}
              field={state[parameter.name]}
              verdict={verdict[parameter.name]}
              reasonId={refusalId[parameter.name]}
              onToggle={() => toggle(parameter.name)}
              onType={(value) => type(parameter.name, value)}
            />
          ))}
        </div>
      )}

      {/* The refusal, one per rule, between the grid and the line, which is
          the path the eye already takes after checking a box. The message
          is the CLI's, byte for byte, carried by the contract: translating
          it would send the reader looking in the terminal for text that
          doesn't exist. */}
      {refusedRules.map((rule, index) => (
        <p
          key={rule.errorClass ?? index}
          className={styles.panelRefusal}
          id={`${baseId}-recusa-${index}`}
        >
          {rule.message}
          {rule.exit === undefined ? null : <> (exit {rule.exit})</>}
        </p>
      ))}

      <CodeBlock language={language}>{text}</CodeBlock>
    </div>
  );
}

/**
 * A flag: the box that toggles it and the value field.
 *
 * The refusal disables instead of hiding: a flag that vanishes from the
 * screen when another is checked sends the reader looking for what they
 * saw; one that stays visible and disabled, with the message the tool
 * prints, teaches the rule, the difference between a panel that prevents
 * the error and one that explains it.
 *
 * The reason doesn't live here: it belongs to the rule, not the flag, and a
 * rule that refuses three flags would write three copies of itself. What's
 * left here is `data-refused`, which dims the cell, and `aria-describedby`
 * pointing at the single sentence below.
 */
function Field({parameter, field, verdict, reasonId, onToggle, onType}) {
  const allowed = verdict?.allowed !== false;
  const boolean = parameter.type === 'flag';

  return (
    <div className={styles.panelField} data-refused={allowed ? undefined : ''}>
      <label className={styles.panelLabel}>
        <input
          type="checkbox"
          checked={field?.on ?? false}
          disabled={!allowed}
          aria-describedby={allowed ? undefined : reasonId}
          onChange={onToggle}
        />
        <span>{parameter.name}</span>
      </label>

      {!boolean && (
        <input
          type="text"
          aria-label={parameter.name}
          value={field?.value ?? ''}
          disabled={!allowed || !field?.on}
          onChange={(event) => onType(event.target.value)}
        />
      )}
    </div>
  );
}
