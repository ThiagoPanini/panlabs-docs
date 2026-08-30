/**
 * The header's segmented pair: copy the page, and the menu for the rest.
 */

/* It's the SECOND piece the `h1` override injects, born for the same
   reason as the subtitle: `DocItem/Layout` and `DocItem/Content` are
   `unsafe`, and anchoring on the `<h1>` reaches the header without
   touching them. */

/* THE SOURCE IS THE `.md` THAT ALREADY EXISTS, and that's what makes the
   button cheap. The `src/plugins/ai-era/` plugin publishes every route as
   Markdown too, at `permalink + '.md'`. The button doesn't serialize
   anything, doesn't read the DOM, and has no second idea of what the page
   is: it FETCHES the file the site already serves. A single source, like
   the subtitle: the day the `.md` shape changes, what the reader copies
   changes with it, with nobody needing to remember this file.

   In `docusaurus start` the `.md` route doesn't exist and returns 200
   with the SPA shell. With no guard, the reader would copy HTML thinking
   they copied Markdown, the worst way this kind of action can fail,
   since the error only shows up on the other end, already pasted. The
   guard looks at the body: an HTML document where Markdown belongs
   becomes an error state, visible on the button itself. */

/* THE LABEL DOESN'T CHANGE WIDTH when the state changes: "Copy page" and
   "Copied" have different widths, and swapping the text would make the
   whole pair jump the instant it's clicked. The fix: both labels stacked
   in the SAME grid cell, the one not on screen holding the width with
   `visibility: hidden`. The box measures the wider of the two and never
   moves. */

/* THE MENU IS A NATIVE `popover`.

   This file writes no interaction model: `Escape`, arrow keys, and
   close-on-blur are the browser's job, not `onKeyDown`/`onBlur` handlers.
   `SearchBar` is the project's one deliberate exception, and its rule is
   narrow for a reason: whoever writes key handling obligates the spec to
   describe key, focus, and ARIA in prose.

   `popover` delivers `Escape`, click-outside-to-close, and focus return
   to the trigger, all three for free, all three the browser's. It's the
   same move `SearchBar` makes with `<dialog>` and `showModal()`: writing
   it would mean re-writing what the browser already does.

   What that trade cost, on the record: the WAI-ARIA `menu` pattern wants
   `ArrowDown`/`ArrowUp` between items, and that's key handling; there's
   no having it without writing one. Without the arrows, `role="menu"`
   would be ARIA lying about the model, so the menu doesn't use it: the
   four items are plain links and buttons, in a plain tab order, which is
   what `Tab` already walks. A keyboard user reaches all four, with the
   right key for a group of controls, which is what this became. */

import React, {useCallback, useEffect, useId, useRef, useState} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Icon from '@site/src/components/Icon';

import styles from './copy.module.css';

/* How long the button keeps showing its "copied" notice before reverting.
   Not animation: it's this file's only duration, and it doesn't go through
   the motion vocabulary since there's no transition to name, just a
   state `setTimeout`. */
const NOTICE_DURATION = 2000;

/** The body came back as the page, not as Markdown. */
function looksLikeHtml(text) {
  return /^\s*<(!doctype|html)\b/i.test(text);
}

export default function CopyPage({permalink}) {
  const {siteConfig} = useDocusaurusContext();
  const [state, setState] = useState('idle'); // idle | copied | error
  const [open, setOpen] = useState(false);
  const menu = useRef(null);
  const timer = useRef(null);
  /* `useId` because `popovertarget` matches by `id`, and the page could one
     day have two headers; a fixed `id` would point them at the same menu. */
  const menuId = useId();

  /* The Markdown route is pure concatenation, made possible by ADR 7
     (`trailingSlash: false`): the permalink already arrives with no
     trailing slash. The absolute URL is what goes in the assistant prompt,
     which needs an address that resolves outside the reader's browser. */
  const mdRoute = `${permalink}.md`;
  const mdUrl = `${siteConfig.url}${mdRoute}`;

  useEffect(() => () => clearTimeout(timer.current), []);

  const notify = useCallback((which) => {
    setState(which);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState('idle'), NOTICE_DURATION);
  }, []);

  const copy = useCallback(async () => {
    menu.current?.hidePopover?.();
    try {
      const response = await fetch(mdRoute);
      if (!response.ok) throw new Error(String(response.status));
      const text = await response.text();
      if (looksLikeHtml(text)) throw new Error('a rota devolveu a página, não o Markdown');
      await navigator.clipboard.writeText(text);
      notify('copied');
    } catch {
      notify('error');
    }
  }, [notify, mdRoute]);

  /* The three labels are plain strings, not elements, since the two that
     stay off-screen still need to be TEXT: they hold the box's width, and
     an off-screen React node would measure differently from an on-screen
     one. */
  const labels = {
    idle: 'Copiar página',
    copied: 'Copiado',
    error: 'Não copiou',
  };

  const assistantPrompt = `Leia ${mdUrl} para eu poder fazer perguntas sobre esta página da documentação.`;

  const actions = [
    {
      key: 'copiar',
      icon: 'copy',
      onActivate: copy,
      title: 'Copiar página',
      support: 'O Markdown desta página, para colar num assistente',
    },
    {
      key: 'ver',
      icon: 'file-text',
      href: mdRoute,
      title: 'Ver como Markdown',
      support: 'A mesma página em texto puro',
    },
    {
      key: 'chatgpt',
      icon: 'external-link',
      href: `https://chatgpt.com/?q=${encodeURIComponent(assistantPrompt)}`,
      external: true,
      title: 'Abrir no ChatGPT',
      support: 'Perguntar sobre esta página',
    },
    {
      key: 'claude',
      icon: 'external-link',
      href: `https://claude.ai/new?q=${encodeURIComponent(assistantPrompt)}`,
      external: true,
      title: 'Abrir no Claude',
      support: 'Perguntar sobre esta página',
    },
  ];

  return (
    <div className={styles.pair} data-pd-component="copy-page">
      <button
        type="button"
        className={styles.copy}
        data-pd-part="copiar"
        data-pd-state={state}
        onClick={copy}>
        <Icon name={state === 'copied' ? 'check' : 'copy'} size="sm" />
        {/* The three labels stacked: the one on screen and the two that only
            hold the width. `aria-hidden` on the hidden ones keeps the screen
            reader from reading all three in sequence. */}
        <span className={styles.labels}>
          {Object.entries(labels).map(([which, text]) => (
            <span
              key={which}
              className={styles.label}
              data-pd-visible={which === state ? 'true' : 'false'}
              aria-hidden={which === state ? undefined : 'true'}>
              {text}
            </span>
          ))}
        </span>
      </button>

      {/* `popovertarget` is the whole wiring: the browser opens it, closes
          it on `Escape`, closes it on an outside click, and returns focus to
          the trigger. `aria-expanded` tracks the `toggle` event, the browser
          itself reporting what it did. */}
      <button
        type="button"
        className={styles.more}
        data-pd-part="mais"
        popovertarget={menuId}
        aria-expanded={open}
        aria-label="Mais formas de levar esta página">
        <Icon name="chevron-right" size="sm" />
      </button>

      <div
        ref={menu}
        id={menuId}
        popover="auto"
        className={styles.menu}
        data-pd-part="menu"
        onToggle={(event) => setOpen(event.newState === 'open')}>
        {actions.map(({key, icon, title, support, href, external, onActivate}) => {
          const content = (
            <>
              <Icon name={icon} size="sm" />
              <span className={styles.texts}>
                <span className={styles.title}>{title}</span>
                <span className={styles.support}>{support}</span>
              </span>
            </>
          );
          return href ? (
            <a
              key={key}
              className={styles.item}
              href={href}
              target="_blank"
              rel={external ? 'noreferrer' : undefined}>
              {content}
            </a>
          ) : (
            <button key={key} type="button" className={styles.item} onClick={onActivate}>
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
}
