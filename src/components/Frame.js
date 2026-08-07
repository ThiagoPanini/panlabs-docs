/**
 * `frame` — a moldura de **diagrama**, não de screenshot.
 *
 * A decisão de conteúdo vem antes da de anatomia: um produto fictício não tem
 * UI para fotografar, e screenshot de produto que não existe seria o artefato
 * mais caro e mais falso do repositório. O que a moldura enquadra é fluxo de
 * API, ciclo de vida de webhook, modelo de dados.
 *
 * Isso encolhe o componente: o fundo quadriculado da âncora existe para
 * enquadrar imagem com transparência, e sem screenshot ele perde a razão de ser.
 * Sobra borda mais legenda.
 *
 * E cria a segunda das **duas** exceções do catálogo à regra de que nenhum
 * componente conhece modo de cor: o palco declara `color`, e o diagrama que
 * vive nele usa `currentColor` — **um arquivo para os dois modos**, nunca um
 * asset por modo.
 *
 * Procedência: docs/design/componentes/frame.md.
 */

import React from 'react';
import estilos from './catalogo.module.css';

export default function Frame({caption, children}) {
  return (
    <figure className={estilos.frame} data-sd-component="frame">
      <div className={estilos.frameStage}>{children}</div>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
