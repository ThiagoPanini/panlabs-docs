/**
 * `frame` — a moldura de **diagrama**, não de screenshot.
 *
 * A decisão de conteúdo vem antes da de anatomia, e ela não depende mais de o
 * produto ser fictício: sem CDN o asset binário entra no repositório, captura de
 * UI de terceiro apodrece sozinha, e **raster não herda `currentColor`**. Os três
 * cortam contra mídia binária de qualquer origem. O que a moldura enquadra é
 * fluxo, ciclo de vida, modelo de dados.
 *
 * Isso encolhe o componente: o fundo quadriculado da âncora existe para
 * enquadrar imagem com transparência, e sem screenshot ele perde a razão de ser.
 * Sobra o palco tingido — sem legenda: o alvo não renderiza `figcaption`, e
 * `research/paridade-devin` §11 mede isso contra o mesmo `mint` do Devin que
 * pediu o palco tingido.
 *
 * E cria a segunda das **duas** exceções do catálogo à regra de que nenhum
 * componente conhece modo de cor: o palco declara `color`, e o diagrama de
 * origem própria que vive nele usa `currentColor` — **um arquivo para os dois
 * modos**, nunca um asset por modo. Esse é o caso que entra como SVG INLINE,
 * porque `<img src="x.svg">` não herda `currentColor`.
 *
 * Diagrama de procedência externa entra pelo outro lado: o draw.io não emite
 * `currentColor`, emite `light-dark()`, que resolve contra o `color-scheme`
 * herdado do documento hospedeiro e atravessa a fronteira do `<img>`. Mesmo
 * invariante de um arquivo para os dois modos, outro mecanismo. A delimitação
 * das duas rotas está em frame.md § Light e dark.
 *
 * Procedência: docs/design/componentes/frame.md.
 */

import React from 'react';
import styles from './catalog.module.css';

export default function Frame({children}) {
  return (
    <figure className={styles.frame} data-pd-component="frame">
      <div className={styles.frameStage}>{children}</div>
    </figure>
  );
}
