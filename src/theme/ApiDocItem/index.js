/**
 * `ApiDocItem` — **componente de tema próprio**, e a distinção importa.
 *
 * O `theme-classic` não tem `ApiDocItem`. Ele existe porque `docItemComponent`
 * é opção pública do `plugin-content-docs` e vira literalmente o `component` da
 * rota, então o Docusaurus só conhece o nome que a config deu. Acoplamento ao
 * upstream: **nenhum**. Chamá-lo de swizzle o faria parecer dívida, quando é a
 * técnica de menor acoplamento do projeto inteiro. Ver ADR 2.
 *
 * Neste slice ele **delega**. O layout de três colunas — prosa 672 + gutter 32 +
 * painel 448 sticky — é do slice 5, junto com o gerador e o contrato OpenAPI.
 * Delegar hoje é o que faz a segunda instância existir de verdade em vez de
 * existir só na config: a rota `/api-reference/*` responde, o comutador de
 * layout está no lugar certo, e o slice 5 troca o corpo desta função sem tocar
 * em mais nada.
 */

import React from 'react';
import DocItem from '@theme/DocItem';

export default function ApiDocItem(props) {
  return <DocItem {...props} />;
}
