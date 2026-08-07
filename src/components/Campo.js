/**
 * `param-field` e `response-field` — os dois campos da Referência da API.
 *
 * Um componente interno com uma prop de espécie, e não duas anatomias
 * paralelas: duplicar a anatomia inteira para ganhar duas props é como se
 * acumula divergência visual entre irmãos. Continuam sendo **dois componentes
 * autoráveis** e dois arquivos de spec — o gabarito é por tag, não por arquivo
 * de código.
 *
 * **Zero JS.** Nenhum dos dois alimenta playground: a edição do nível 1 mora no
 * painel do `ApiDocItem`, que é território da rota e não do catálogo. O
 * aninhamento é `expandable`, e a recursão de `response-field` é o autor
 * escrevendo outro `response-field` dentro do primeiro.
 *
 * Duas coisas que a âncora decidiu e nós herdamos: só `required` se marca — a
 * ausência é o sinal de opcional, e marcar as duas divide por dois a saliência
 * do que importa —, e `deprecated` é tachado mais texto apagado, **sem abrir cor
 * nova**, para não dividir o âmbar com `PUT` na mesma página.
 *
 * Procedência: docs/design/componentes/param-field.md · response-field.md.
 */

import React from 'react';
import clsx from 'clsx';
import Translate from '@docusaurus/Translate';
import estilos from './catalogo.module.css';

function Campo({especie, name, type, required, deprecated, padrao, children}) {
  return (
    <div
      // Classe de módulo para o nosso CSS (0,1,0); `data-sd-variant` para a
      // skin (0,2,0). Nosso CSS nunca lê `data-sd-*`.
      className={clsx(estilos.field, deprecated && estilos.fieldDeprecated)}
      data-sd-component={especie}
      data-sd-variant={deprecated ? 'deprecated' : undefined}>
      <p className={estilos.fieldHead}>
        <code>{name}</code>
        {/* `meta` é a única parte publicada do catálogo que a régua estreita
            NÃO obriga: ela é o único `<span>` do cabeçalho, e a skin a
            alcançaria por `> span`. Ela fica porque a rota da Referência da API
            a nomeia verbatim no contrato, e despublicar depois quebra quem já
            dependeu — o que a régua também diz. */}
        <span className={estilos.fieldMeta} data-sd-part="meta">
          {type}
          {padrao === undefined ? null : (
            <>
              <Translate id="shinydoc.campo.padrao" description="Rótulo do valor default de um campo de API">
                padrão
              </Translate>{' '}
              <code>{padrao}</code>
            </>
          )}
          {required ? (
            <strong>
              <Translate
                id="shinydoc.campo.obrigatorio"
                description="Chip que marca um parâmetro obrigatório">
                obrigatório
              </Translate>
            </strong>
          ) : null}
        </span>
      </p>
      <div className={estilos.fieldBody}>{children}</div>
    </div>
  );
}

export function ParamField({default: padrao, ...resto}) {
  return <Campo especie="param-field" padrao={padrao} {...resto} />;
}

export function ResponseField({default: padrao, ...resto}) {
  return <Campo especie="response-field" padrao={padrao} {...resto} />;
}
