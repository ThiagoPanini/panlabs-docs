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
 * `groupId` faz a linguagem escolhida seguir o leitor entre páginas;
 * `queryString` põe a escolha na URL, que é o delta de outra referência
 * chegando sem componente novo e sem uma linha de JavaScript nossa.
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
import estilos from './catalogo.module.css';

const TITULO = /title="([^"]*)"/;
const LINGUAGEM = /language-([\w-]+)/;

/**
 * O rótulo da aba: o título da cerca; na falta dele, a linguagem; na falta das
 * duas, a posição. Nunca vazio — aba sem nome é aba que não se clica de novo.
 *
 * @param {{className?: string, metastring?: string}} props
 * @param {number} indice
 */
function rotuloDe(props, indice) {
  const titulo = props.metastring?.match(TITULO)?.[1];
  if (titulo) {
    return titulo;
  }
  const linguagem = props.className?.match(LINGUAGEM)?.[1];
  return linguagem ?? String(indice + 1);
}

export default function CodeGroup({groupId = 'code-lang', queryString = 'lang', children}) {
  const cercas = React.Children.toArray(children).filter(React.isValidElement);

  return (
    <div className={estilos.codeGroup} data-sd-component="code-group">
      <Tabs groupId={groupId} queryString={queryString}>
        {cercas.map((cerca, indice) => {
          const props = cerca.props?.children?.props ?? cerca.props;
          const rotulo = rotuloDe(props, indice);
          const resto = (props.metastring ?? '').replace(TITULO, '').trim();
          return (
            <TabItem key={rotulo} value={rotulo} label={rotulo}>
              <CodeBlock
                className={props.className}
                metastring={resto === '' ? undefined : resto}>
                {props.children}
              </CodeBlock>
            </TabItem>
          );
        })}
      </Tabs>
    </div>
  );
}
