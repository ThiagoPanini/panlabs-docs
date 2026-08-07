/**
 * `update` — a entrada de changelog.
 *
 * O changelog é o **único** canal de comunicação de versão da API neste site: o
 * conteúdo não é versionado, a API é — por cabeçalho. Esta é a anatomia dessa
 * comunicação.
 *
 * Um `<section>` com `<header>`, e o header é o que evita atributo de parte: dois
 * `<div>` irmãos precisariam de nome, um `<header>` alcança por tipo. Só a
 * etiqueta de versão ganha `data-sd-part`, porque ela é um `<span>` no meio de
 * texto.
 *
 * Procedência: docs/design/componentes/update.md.
 */

import React from 'react';
import estilos from './catalogo.module.css';

export default function Update({label, tag, children}) {
  return (
    <section className={estilos.update} data-sd-component="update">
      <header className={estilos.updateHead}>
        {label}
        {tag ? (
          <span className={estilos.updateTag} data-sd-part="tag">
            {tag}
          </span>
        ) : null}
      </header>
      <div className={estilos.updateBody}>{children}</div>
    </section>
  );
}
