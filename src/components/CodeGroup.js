/**
 * `code-group` — o mesmo trecho em várias linguagens.
 *
 * Ele **compõe** o `<Tabs>` do Docusaurus; não swizzla nada. O `Tabs` é
 * `unsafe` e não precisamos dele ejetado: a anatomia que falta sai só de CSS, e
 * o `role="tablist"`, o `aria-selected` e o `tabindex` roving já vêm prontos.
 *
 * O autor escreve cercas de código com `title=`, como escreveria fora do grupo.
 * Este componente lê o título de cada cerca, monta as abas, e **remove o título
 * do bloco** — mantê-lo desenharia a mesma palavra duas vezes, na aba e na
 * moldura.
 *
 * `groupId` faz a escolha seguir o leitor entre páginas e `queryString` a põe na
 * URL — o delta de outra referência chegando sem componente novo e sem uma
 * linha de JavaScript nossa. **Os dois são opcionais e nascem desligados**, e
 * isso é decisão, não descuido: as abas de um grupo de código nem sempre são
 * linguagens. Um grupo cujas abas são `Node`, `Python` e `Resposta` gravaria
 * `Resposta` na escolha compartilhada, e o defeito apareceria noutra página,
 * como a aba errada selecionada. Quem sincroniza é quem sabe que as abas são
 * comparáveis: o autor.
 *
 * Nota de leitura do MDX: uma cerca dentro de JSX chega como `<pre>` cujo único
 * filho é o `<code>`, e é no `<code>` que moram `className` e `metastring`. O
 * `MDXComponents/Pre` do upstream é um passa-adiante, então a forma é estável.
 *
 * Procedência: docs/design/componentes/code-group.md · tabs.md.
 */

import React from 'react';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';
import styles from './catalog.module.css';

const TITLE = /title="([^"]*)"/;
const LANGUAGE = /language-([\w-]+)/;

/**
 * Uma cerca dentro de JSX chega como `<pre>` cujo único filho é o `<code>`, e é
 * no `<code>` que moram `className` e `metastring`. Esta função é o único lugar
 * do projeto que conhece essa forma.
 *
 * @param {React.ReactElement} fence
 * @returns {{className?: string, metastring?: string, children?: unknown}}
 */
function fenceContent(fence) {
  return fence.props?.children?.props ?? fence.props;
}

/**
 * O rótulo da aba: o título da cerca; na falta dele, a linguagem; na falta das
 * duas, a posição. Nunca vazio — aba sem nome é aba que não se clica de novo.
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

  // Rótulo repetido é o valor da aba repetido, e o `Tabs` resolve isso
  // selecionando a primeira — o autor clica na segunda e a primeira acende.
  // Falha alto, como nome de ícone inexistente e verbo fora da escada.
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
