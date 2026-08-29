/**
 * `card` e `card-group`.
 *
 * O cartão nasce do zero porque o `DocCard` do Docusaurus é dirigido por
 * metadado de sidebar e não aceita props livres — e ele é um dos componentes
 * reestruturados dentro do próprio v3, ou seja território `unsafe`.
 *
 * Com `href` ele é um `<a>`, e o link é o cartão INTEIRO. Sem `href` ele é um
 * `<div>`: cartão continua sendo nível de superfície, não afordância.
 *
 * A grade não tem prop de colunas, nem media query, nem container query: a
 * contagem de cartões faz o trabalho sozinha, e o piso é `--pd-card-min`.
 *
 * Procedência: docs/design/componentes/card.md · card-group.md.
 */

import React from 'react';
import Link from '@docusaurus/Link';
import Icon from './Icon';
import styles from './catalog.module.css';

export function CardGroup({children}) {
  return (
    <div className={styles.cardGroup} data-pd-component="card-group">
      {children}
    </div>
  );
}

export default function Card({title, icon, href, children}) {
  const content = (
    <>
      {icon ? <Icon name={icon} size="lg" /> : null}
      <span className={styles.cardTitle} data-pd-part="title">
        {title}
      </span>
      {children}
    </>
  );

  // `<Link>` e não `<a>`: ele decide entre navegação client-side e link externo,
  // e é ele que resolve `baseUrl` num caminho interno.
  return href ? (
    <Link className={styles.card} data-pd-component="card" to={href}>
      {content}
    </Link>
  ) : (
    <div className={styles.card} data-pd-component="card">
      {content}
    </div>
  );
}
