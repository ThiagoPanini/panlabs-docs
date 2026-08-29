/**
 * `steps` — a sequência numerada.
 *
 * `<ol>` e `<li>`, e o número do marcador vem do contador `list-item` que o
 * próprio elemento já incrementa. Não há número renderizado por JavaScript: a
 * lista ordenada **é** a numeração, e é ela que o leitor de tela anuncia.
 *
 * Ícone SUBSTITUI o número, não o acompanha — e a substituição é `:has(svg)` no
 * CSS em vez de uma variante, porque a decisão é por passo e não por lista.
 *
 * Procedência: docs/design/componentes/steps.md · docs/design/icones.md §8.
 */

import React from 'react';
import Icon from './Icon';
import styles from './catalog.module.css';

export default function Steps({children}) {
  return (
    <ol className={styles.steps} data-pd-component="steps">
      {children}
    </ol>
  );
}

export function Step({title, icon, children}) {
  return (
    <li className={styles.step}>
      {/* Sem `data-pd-part`: o marcador é o único `<span>` filho do passo, e o
          irmão é um `<div>` — a skin alcança por `li > span`. */}
      <span className={styles.stepMarker}>
        {icon ? <Icon name={icon} size="sm" /> : null}
      </span>
      <div className={styles.stepBody}>
        {title ? (
          <p className={styles.stepTitle} data-pd-part="title">
            {title}
          </p>
        ) : null}
        {children}
      </div>
    </li>
  );
}
