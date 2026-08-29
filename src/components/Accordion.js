/**
 * `accordion` e `accordion-group`.
 *
 * `<details>` e `<summary>` nativos. **Zero `keydown` escrito aqui**: que tecla
 * abre, o que recebe foco na abertura, o que o leitor de tela anuncia e onde vai
 * `aria-expanded` são responsabilidade do navegador, e o navegador é a
 * especificação. Um `<div onClick>` seria pixel a pixel idêntico para quem não
 * usa teclado — é esse modo de falhar invisível que a regra existe para fechar.
 *
 * Três coisas caem de graça e ninguém precisa construir: âncora de URL abre o
 * `<details>` ancestral sozinha, busca na página alcança o conteúdo, e o
 * atributo `name` daria exclusividade — que **não** usamos, porque em
 * documentação o leitor compara itens e fechar o que ele abriu é hostil.
 *
 * O caret é `mask-image` em `summary::after`, não um segundo `<svg>`: com dois
 * SVG irmãos dentro do mesmo `<summary>`, o seletor por tipo de elemento deixa
 * de alcançar o ícone do autor, e o contrato de partes teria que crescer para
 * compensar uma escolha de implementação.
 *
 * Procedência: docs/design/componentes/accordion.md · accordion-group.md.
 */

import React from 'react';
import Icon from './Icon';
import styles from './catalog.module.css';

export function AccordionGroup({children}) {
  return (
    <div className={styles.accordionGroup} data-pd-component="accordion-group">
      {children}
    </div>
  );
}

export default function Accordion({title, description, icon, defaultOpen, children}) {
  return (
    <details
      className={styles.accordion}
      data-pd-component="accordion"
      // Não controlado: quem guarda o estado é o elemento. `undefined` remove o
      // atributo, e é o `[open]` do DOM que o CSS e a skin leem.
      open={defaultOpen ? true : undefined}>
      <summary className={styles.accordionSummary}>
        {icon ? <Icon name={icon} size="sm" /> : null}
        <span className={styles.accordionTitle} data-pd-part="title">
          {title}
        </span>
        {description ? (
          <span className={styles.accordionDescription} data-pd-part="description">
            {description}
          </span>
        ) : null}
      </summary>
      <div className={styles.accordionBody}>{children}</div>
    </details>
  );
}
