/**
 * `callout` — o corpo da **admonition nativa**.
 *
 * Este componente não é registrado em `MDXComponents`: quem o alcança é
 * `src/theme/Admonition/Types.js`, o registro de degrau 3 que troca o mapa
 * `tipo → componente` do Docusaurus. O `Admonition` raiz — que é `unsafe` —
 * continua intocado e despacha por tipo para dentro do mapa; a partir daí o DOM
 * é inteiramente nosso, **sem uma linha de upstream copiada**.
 *
 * Consequência de anatomia: a barra lateral de 5px e a faixa de título
 * MAIÚSCULA do Infima não existem porque não as escrevemos. O `.alert` também
 * não — este DOM não é um `.alert`.
 *
 * Quatro variantes, e o autor não escolhe ícone: os tipados da âncora não
 * aceitam prop nenhuma, e o ícone é o que carrega a semântica da variante.
 *
 * Procedência: docs/design/componentes/callout.md.
 */

import React from 'react';
import clsx from 'clsx';
import Icon from './Icon';
import estilos from './catalogo.module.css';

/**
 * O glifo por variante — fixo, do papel `sistema` do manifesto.
 *
 * `info` é a variante NEUTRA e `note` é a azul. A inversão é deliberada e é o
 * que faz o sistema ler como a âncora; ver `componentes/callout.md`.
 */
const GLIFO = {
  note: 'pencil-line',
  info: 'info',
  tip: 'lightbulb',
  warning: 'triangle-alert',
};

/**
 * A variante entra DUAS vezes, e é de propósito.
 *
 * Como classe de módulo, porque é assim que o nosso CSS pinta — especificidade
 * (0,1,0). Como `data-sd-variant`, porque é assim que a skin corporativa repinta
 * — (0,2,0), que vence sem um único `!important`. Nosso CSS nunca lê
 * `data-sd-*`: se lesse, as duas camadas empatariam e a ordem de carga passaria
 * a decidir.
 *
 * `info` não aparece aqui porque ela é a variante NEUTRA, e neutro é o default
 * declarado no próprio `.callout`.
 */
const VARIANTE = {
  note: estilos.calloutNote,
  tip: estilos.calloutTip,
  warning: estilos.calloutWarning,
};

export default function Callout({variant, title, id, children}) {
  return (
    <div
      className={clsx(estilos.callout, VARIANTE[variant])}
      id={id}
      data-sd-component="callout"
      data-sd-variant={variant}>
      <Icon name={GLIFO[variant]} size="sm" />
      <div className={estilos.calloutContent} data-sd-part="content">
        {title ? (
          <p className={estilos.calloutTitle} data-sd-part="title">
            {title}
          </p>
        ) : null}
        {children}
      </div>
    </div>
  );
}
