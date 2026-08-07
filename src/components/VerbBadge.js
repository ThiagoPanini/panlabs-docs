/**
 * `verb-badge` — a pílula de verbo HTTP.
 *
 * A cor sai de uma **escada de dano** e não de convenção copiada: a medição
 * divergiu (uma referência usa GET verde e POST azul, outra inverte), e onde a
 * medição diverge não há valor a herdar. `DELETE` já estava travado em
 * `--sd-state-danger` pela direção de arte; fixado esse ponto, a escada é a
 * única ordenação monotônica que os outros quatro admitem — e ela é
 * **derivável em vez de memorizável**.
 *
 * Custo zero em token novo: a lista fechada de quatro matizes continua fechada.
 *
 * Verbo fora da escada **lança**, como nome de ícone inexistente. Degradar em
 * silêncio produziria uma pílula sem cor numa página de referência, que é o
 * defeito que a âncora tem e que a spec nomeou para não copiar.
 *
 * Sem ícone: o verbo já é o significado, e um glifo ali compete com o texto.
 *
 * Procedência: docs/design/componentes/verb-badge.md.
 */

import React from 'react';
import clsx from 'clsx';
import estilos from './catalogo.module.css';

/**
 * A escada de dano — ler · criar · substituir/alterar · destruir.
 *
 * Classe de módulo para o nosso CSS (0,1,0), `data-sd-variant` para a skin
 * (0,2,0). Nosso CSS nunca lê `data-sd-*`.
 */
const ESCADA = {
  get: estilos.verbGet,
  post: estilos.verbPost,
  put: estilos.verbPut,
  patch: estilos.verbPatch,
  delete: estilos.verbDelete,
};

export default function VerbBadge({verb}) {
  const chave = String(verb).toLowerCase();
  if (!ESCADA[chave]) {
    throw new Error(
      [
        `Verbo "${verb}" não existe na escada de dano.`,
        `Os cinco: ${Object.keys(ESCADA).join(', ').toUpperCase()}.`,
      ].join('\n'),
    );
  }
  return (
    <span
      className={clsx(estilos.verbBadge, ESCADA[chave])}
      data-sd-component="verb-badge"
      data-sd-variant={chave}>
      {chave.toUpperCase()}
    </span>
  );
}
