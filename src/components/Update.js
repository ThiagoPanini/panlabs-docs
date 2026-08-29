/**
 * `update` — a entrada de changelog.
 *
 * O changelog é o **único** canal de comunicação de versão da API neste site: o
 * conteúdo não é versionado, a API é — por cabeçalho. Esta é a anatomia dessa
 * comunicação.
 *
 * Um `<section>` com `<header>`, e o header é o que evita atributo de parte:
 * dois `<div>` irmãos precisariam de nome, um `<header>` alcança por tipo. A
 * etiqueta também não ganha atributo — é o único elemento dentro do `<header>`,
 * e a skin a alcança por `header > span`. **Zero partes publicadas.**
 *
 * Procedência: docs/design/componentes/update.md.
 */

import React from 'react';
import styles from './catalog.module.css';

export default function Update({label, tag, children}) {
  return (
    <section className={styles.update} data-pd-component="update">
      <header className={styles.updateHead}>
        {label}
        {tag ? <span className={styles.updateTag}>{tag}</span> : null}
      </header>
      <div className={styles.updateBody}>{children}</div>
    </section>
  );
}
