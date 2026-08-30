/**
 * `code-group`, the same snippet in several languages.
 */

/* Composes Docusaurus's `<Tabs>`; nothing swizzled. `Tabs` is `unsafe`, and
   ejecting it isn't needed: the missing anatomy is CSS-only, and
   `role="tablist"`, `aria-selected`, and roving `tabindex` already come
   free.

   The author writes code fences with `title=`, same as outside a group.
   This component reads each fence's title, builds the tabs, and strips the
   title from the block (keeping it would draw the same word twice, in the
   tab and in the frame).

   `groupId` and `queryString` default off. Not an oversight: a code group's
   tabs aren't always languages. A group with `Node`, `Python`, and
   `Response` tabs would record `Response` into the shared choice,
   surfacing as the wrong tab selected on another page. Only the author
   knows the tabs are comparable, so syncing is opt-in.

   MDX reading note: a fence inside JSX arrives as a `<pre>` whose only
   child is the `<code>`, and `className`/`metastring` live on that
   `<code>`. Upstream's `MDXComponents/Pre` is a pass-through, so the shape
   is stable. */

import React from 'react';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';
import styles from './catalog.module.css';

const TITLE = /title="([^"]*)"/;
const LANGUAGE = /language-([\w-]+)/;

/**
 * A fence inside JSX arrives as a `<pre>` whose only child is the `<code>`,
 * and `className`/`metastring` live there. This function is the only place
 * in the project that knows this shape.
 *
 * @param {React.ReactElement} fence
 * @returns {{className?: string, metastring?: string, children?: unknown}}
 */
function fenceContent(fence) {
  return fence.props?.children?.props ?? fence.props;
}

/**
 * The tab's label: the fence title, falling back to the language, falling
 * back to position. Never empty, since an unnamed tab can't be clicked back
 * to.
 *
 * @param {{className?: string, metastring?: string}} props
 * @param {number} index
 */
function labelFor(props, index) {
  const title = props.metastring?.match(TITLE)?.[1];
  if (title) {
    return title;
  }
  const language = props.className?.match(LANGUAGE)?.[1];
  return language ?? String(index + 1);
}

export default function CodeGroup({groupId, queryString, children}) {
  const fences = React.Children.toArray(children).filter(React.isValidElement);
  const labels = fences.map((fence, i) => labelFor(fenceContent(fence), i));

  // A repeated label is a repeated tab value, and `Tabs` resolves that by
  // selecting the first one: the author clicks the second tab and the first
  // lights up. Fail loud here, same as an unknown icon name.
  const repeated = labels.find((r, i) => labels.indexOf(r) !== i);
  if (repeated) {
    throw new Error(
      [
        `Duas cercas do mesmo <CodeGroup> têm o rótulo "${repeated}".`,
        'O rótulo é o valor da aba, e valor repetido faz a seleção acender na aba errada.',
        'Dê um `title=` distinto a cada cerca.',
      ].join('\n'),
    );
  }

  return (
    <div className={styles.codeGroup} data-pd-component="code-group">
      <Tabs groupId={groupId} queryString={queryString}>
        {fences.map((fence, index) => {
          const props = fenceContent(fence);
          const label = labels[index];
          const rest = (props.metastring ?? '').replace(TITLE, '').trim();
          return (
            <TabItem key={label} value={label} label={label}>
              <CodeBlock
                className={props.className}
                metastring={rest === '' ? undefined : rest}>
                {props.children}
              </CodeBlock>
            </TabItem>
          );
        })}
      </Tabs>
    </div>
  );
}
