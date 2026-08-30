/**
 * `param-field` and `response-field`: a function parameter and a return
 * field, the two fields of the library reference.
 */

/* Both use only name, type, required-ness, default value, and description,
   the same five facts a function argument and a returned field carry.

   One internal component with a kind prop, not two parallel anatomies:
   duplicating the whole anatomy for two props is how sibling components
   drift apart visually. Still two authorable components and two spec
   files; the template is per tag, not per code file.

   Zero JS. Neither feeds a playground: level-1 editing lives in the
   command panel, which is route territory, not catalog territory. Nesting
   is `expandable`, and `response-field` recursion is the author writing
   another `response-field` inside the first.

   Only `required` gets marked; absence is the signal for optional, and
   marking both would halve the salience of what matters. Its chip is red,
   spelled out. `deprecated` stays struck-through with faded text and no
   color, since red now belongs to the required chip. */

import React from 'react';
import clsx from 'clsx';
import styles from './catalog.module.css';

// Code identifiers only as input, lowercase and ASCII per the generator's
// contract (`scripts/lib/signature.mjs`). No accent normalization needed:
// there's no accent to normalize.
function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function Field({kind, name, type, required, deprecated, defaultValue, children}) {
  const id = `field-${kind}-${slugify(name)}`;

  return (
    <div
      id={id}
      // Module class for our CSS (0,1,0); `data-pd-variant` for the skin
      // (0,2,0). Our CSS never reads `data-pd-*`.
      className={clsx(styles.field, deprecated && styles.fieldDeprecated)}
      data-pd-component={kind}
      data-pd-variant={deprecated ? 'deprecated' : undefined}>
      <p className={styles.fieldHead}>
        {/* The line anchor, in the left gutter, the same idea as Infima's
            heading `.hash-link`, hand-built since no `remark-plugin`
            generates it here (a field isn't a heading). Published part
            (`data-pd-part="ancora"`) so the tap fallback in `focus.css` can
            reach it without depending on the CSS Module hash. */}
        <a
          href={`#${id}`}
          className={styles.fieldAnchor}
          data-pd-part="ancora"
          aria-label={`Link para ${name}`}>
          #
        </a>
        <code>{name}</code>
        {/* `meta` is the one published part the narrow rule doesn't require:
            it's the header's only `<span>`, reachable by the skin through
            `> span`. It stays published because the generated route names it
            verbatim in its own parts contract, and unpublishing later breaks
            whoever already depends on it. */}
        <span className={styles.fieldMeta} data-pd-part="meta">
          <span className={styles.fieldChip}>{type}</span>
          {defaultValue === undefined ? null : (
            <span className={styles.fieldChip}>
              padrão <code>{defaultValue}</code>
            </span>
          )}
          {required ? <strong>obrigatório</strong> : null}
        </span>
      </p>
      <div className={styles.fieldBody}>{children}</div>
    </div>
  );
}

export function ParamField({default: defaultValue, ...rest}) {
  return <Field kind="param-field" defaultValue={defaultValue} {...rest} />;
}

export function ResponseField({default: defaultValue, ...rest}) {
  return <Field kind="response-field" defaultValue={defaultValue} {...rest} />;
}
