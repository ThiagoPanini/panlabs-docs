/**
 * `SearchBar`, rung 5 of the swizzle ladder, the project's first `--eject`.
 */

/* Mandatory version header: the Docusaurus generator strips the license
   header on eject, and there's nothing to diff against on upgrade
   without it:

     ejected from @docusaurus/theme-classic@3.10.2 */

/* Zero line of upstream copied, and that's a fact, not discipline: the
   `theme-classic` `SearchBar` is `export {default} from '@docusaurus/Noop'`,
   one line, returning `null`. The classic theme has no search; it has the
   extension point. That's why rung 5 here doesn't carry the debt rung 5
   usually does: there's no upstream implementation to reconcile against. */

/* On the `--typescript` flag: the rule exists for what the flag protects,
   prop signatures. Measured against 3.10.2: both consumers
   (`Navbar/Content` and `NavbarItem/SearchNavbarItem`) mount
   `<SearchBar />` with no prop, and this repository doesn't have
   `typescript` installed; what compiles `.tsx` here is
   `@babel/preset-typescript` via `@docusaurus/babel`, which strips types
   without checking any. The flag would deliver the shape of the guarantee
   without the guarantee, for the cost of a toolchain dependency.

   What stands in for it: this file has a zero prop surface, so the change
   the flag would catch doesn't exist. What can change is the component's
   name upstream. */

/* What this file does NOT write: a focus trap, a top layer above every
   `z-index` on the page, `::backdrop`, `Escape`, and returning focus to
   whatever opened the modal. All of that comes from `<dialog>` +
   `showModal()`, the browser's. There's not one line of focus management
   here, and that's why the modal is a `<dialog>` instead of a `<div>` with
   `position: fixed`.

   This is the one interaction script the project authors, and it lives in
   chrome; the content catalog stays at zero (see "native substrate" in
   `CONTEXT.md`).

   The scoring ladder, normalization, and highlight calculation don't live
   here: they're pure logic, living in `./ladder.mjs`. What's left in this
   file is JSX plus the `<dialog>` hooks, the part only a browser knows how
   to verify. */

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useHistory} from '@docusaurus/router';
import {usePluginData} from '@docusaurus/useGlobalData';
import Icon from '@site/src/components/Icon';
import styles from './styles.module.css';
import {
  highlightRanges,
  normalizeIndex,
  score,
  termsFrom,
  excerpt,
} from './ladder.mjs';

const LIST_ID = 'pd-search-list';
const optionId = (i) => `pd-search-option-${i}`;

export default function SearchBar() {
  const data = usePluginData('pd-search');
  const history = useHistory();
  const dialog = useRef(null);
  const input = useRef(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [mac, setMac] = useState(false);

  // The normalized index, once at mount, not per keystroke. `undefined`
  // when the plugin isn't in the config; see the `return null` below.
  const index = useMemo(() => data && normalizeIndex(data.records), [data]);

  const results = useMemo(() => (index ? score(index, query) : []), [index, query]);

  const open = useCallback(() => {
    dialog.current?.showModal();
    // Not focus management: it's placing the cursor in the modal's one
    // field. The trap, the layer, and the restoration are still `<dialog>`'s.
    input.current?.select();
  }, []);

  const close = useCallback(() => dialog.current?.close(), []);

  // The key glyph is decided only AFTER mount, on purpose: the server
  // doesn't know what platform the page will open on, and rendering `⌘` in
  // the HTML would produce a hydration mismatch. `Ctrl` is the initial
  // state since it's the majority's; on Mac it swaps on the first frame.
  useEffect(() => setMac(/mac|iphone|ipad/i.test(navigator.userAgent)), []);

  // `⌘K` / `Ctrl K` and NOTHING ELSE. `/` is refused: it needs an "am I
  // inside a field?" guard, and that guard's failure mode is invisible; the
  // reader types a slash in a form and the modal opens on top.
  useEffect(() => {
    if (!index) {
      return undefined;
    }
    const onKeyDown = (event) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        if (dialog.current?.open) {
          close();
        } else {
          open();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [index, open, close]);

  // No result cap, so the list scrolls, and the active option needs to stay
  // in view. Scrolling isn't focus: focus never leaves the field, which is
  // what `aria-activedescendant` buys.
  useEffect(() => {
    document.getElementById(optionId(active))?.scrollIntoView({block: 'nearest'});
  }, [active]);

  const choose = useCallback(
    (i) => {
      const target = results[i];
      if (target) {
        close();
        history.push(target.u);
      }
    },
    [results, close, history],
  );

  const onFieldKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((i) => (i + 1) % Math.max(results.length, 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((i) => (i - 1 + results.length) % Math.max(results.length, 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      choose(active);
    }
    // `Escape` does NOT appear here. `<dialog>` handles it, closes, and
    // returns focus to the button: writing it would mean re-writing what
    // the browser already does.
  };

  // When search doesn't exist, the navbar doesn't change: removing the
  // plugin from the config makes `usePluginData` return `undefined`; the
  // component returns `null`, and upstream's `Navbar/Search` hides the
  // empty container via its own `:empty`. No button, no shortcut, no modal,
  // and the navbar reflows on its own.
  if (!index) {
    return null;
  }

  const labels = data.tabs;
  const terms = termsFrom(query);

  return (
    <>
      <button
        type="button"
        className={styles.button}
        data-pd-component="search"
        data-pd-part="trigger"
        onClick={open}>
        <Icon name="search" size="sm" />
        <span className={styles.label}>Buscar</span>
        <kbd className={styles.shortcut}>{mac ? '⌘' : 'Ctrl'} K</kbd>
      </button>

      <dialog ref={dialog} className={styles.modal} data-pd-component="search" onClose={() => setActive(0)}>
        {/* ARIA by CITATION of the WAI-ARIA APG's `Combobox With List
            Autocomplete` pattern, not invented: `role="combobox"` on the
            field itself (ARIA 1.2, not the 1.0 wrapper), `aria-controls`
            for the listbox, `aria-autocomplete="list"`, and
            `aria-activedescendant`, which is what keeps FOCUS in the field
            while selection moves through the list. */}
        <div className={styles.field} data-pd-part="field">
          <Icon name="search" size="sm" />
          <input
            ref={input}
            type="text"
            role="combobox"
            autoComplete="off"
            spellCheck="false"
            aria-expanded={results.length > 0}
            aria-controls={LIST_ID}
            aria-autocomplete="list"
            aria-activedescendant={results.length > 0 ? optionId(active) : undefined}
            aria-label="Buscar na documentação"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={onFieldKeyDown}
          />
          <button
            type="button"
            className={styles.close}
            onClick={close}
            aria-label="Fechar a busca">
            <Icon name="x" size="sm" />
          </button>
        </div>

        <ul
          id={LIST_ID}
          role="listbox"
          className={styles.list}
          aria-label="Resultados">
          {results.map((r, i) => (
            <li
              key={r.u}
              id={optionId(i)}
              role="option"
              aria-selected={i === active}
              className={styles.option}
              data-pd-part="result"
              onClick={() => choose(i)}
              onMouseMove={() => setActive(i)}>
              <span className={styles.title}>{highlight(r.t, terms)}</span>
              <span className={styles.tab}>{labels[r.x]}</span>
              <span className={styles.excerpt}>{highlight(excerpt(r, terms), terms)}</span>
            </li>
          ))}
        </ul>

        <p role="status" className={styles.visuallyHidden}>
          {query.trim() === '' ? '' : `${results.length} resultados`}
        </p>

        {/* The keys are PLAIN CHARACTERS, not icons or keyboard elements:
            `↑` is already the arrow. */}
        <footer className={styles.footer}>
          <span>↑↓ navegar</span>
          <span>↵ abrir</span>
          <span>esc fechar</span>
        </footer>
      </dialog>
    </>
  );
}

/**
 * The highlight: weight plus accent ink.
 */

/* The element stays `<mark>` because it's what carries the meaning; what
   the CSS swaps is the ink and the weight.

   What knows WHERE to cut is `ladder.mjs`, which returns ranges already
   mapped to the original text. Only the JSX gets assembled here. */
function highlight(text, terms) {
  const ranges = highlightRanges(text, terms);
  if (ranges.length === 0) {
    return text;
  }
  const pieces = [];
  let cursor = 0;
  for (const [from, to] of ranges) {
    pieces.push(text.slice(cursor, from));
    pieces.push(<mark key={`${from}-${to}`}>{text.slice(from, to)}</mark>);
    cursor = to;
  }
  pieces.push(text.slice(cursor));
  return pieces;
}
