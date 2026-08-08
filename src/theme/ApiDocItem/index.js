/**
 * `ApiDocItem` — **componente de tema próprio**, e a distinção importa.
 *
 * O `theme-classic` não tem `ApiDocItem`. Ele existe porque `docItemComponent`
 * é opção pública do `plugin-content-docs` e vira literalmente o `component` da
 * rota, então o Docusaurus só conhece o nome que a config deu. Acoplamento ao
 * upstream: **nenhum**. Chamá-lo de swizzle o faria parecer dívida, quando é a
 * técnica de menor acoplamento do projeto inteiro. Ver ADR 2.
 *
 * **O comutador.** `frontMatter.api_exemplos` decide o layout inteiro, não só o
 * painel:
 *
 *   · ausente  → delega para `@theme/DocItem`, sem tocar em mais nada. Cartão
 *                864 + TOC 288 — idêntica a qualquer página de doc. É o ramo
 *                que `Referência da API › Introdução › Autenticação` exercita:
 *                o painel direito fica inalcançável, não vazio.
 *   · presente → layout próprio: prosa 672 + painel 448, SEM cartão. A
 *                aritmética é exata — 672 + 32 (`--sd-space-8`) + 448
 *                (`calc(--sd-container-width - --sd-prose-width - --sd-space-8)`)
 *                = 1152 = `--sd-container-width`. Não sobra pixel para os 96px
 *                de preenchimento do cartão, e por isso não existe cartão nesta
 *                página — é a décima perda nomeada da rota, e ela é aritmética,
 *                não gosto. Ver docs/design/api-reference.md.
 *
 * Front matter em vez de marcador solto no corpo do MDX: um marcador obrigaria
 * o painel a ser irmão de grid dos parágrafos, o que quebra `position: sticky`
 * (que precisa de um ancestral com altura conhecida, não de uma posição
 * arbitrária no fluxo). Também é por isso que nenhuma página desta instância
 * carrega `hide_table_of_contents` — seria segunda fonte para uma decisão que
 * este componente já toma sozinho.
 *
 * **Nenhum ponto de swizzle é ejetado ou envolvido aqui.** `DocProvider`,
 * `DocBreadcrumbs`, `DocItem/Paginator`, `DocItem/Metadata` e `MDXContent` são
 * consumidos como estão — a mesma composição que `@theme/DocItem/Layout` faz
 * internamente, só que com uma grade diferente no meio. Trocar o header do
 * theme-classic nesses arquivos não quebra nada aqui: o contrato que este
 * componente depende é a assinatura de `useDoc()`, não a implementação deles.
 */

import React from 'react';
import clsx from 'clsx';
import {HtmlClassNameProvider, ThemeClassNames} from '@docusaurus/theme-common';
import {DocProvider, useDoc} from '@docusaurus/plugin-content-docs/client';
import DocItem from '@theme/DocItem';
import DocItemMetadata from '@theme/DocItem/Metadata';
import DocItemPaginator from '@theme/DocItem/Paginator';
import DocBreadcrumbs from '@theme/DocBreadcrumbs';
import MDXContent from '@theme/MDXContent';
import Heading from '@theme/Heading';
import Painel from './Painel';
import estilos from './estilos.module.css';

/**
 * O corpo — título sintético mais o MDX. A mesma lógica de
 * `@theme/DocItem/Content`, sem a classe `.theme-doc-markdown`: aplicá-la
 * traria de volta o cartão que esta página deliberadamente não tem.
 */
function Prosa({children}) {
  const {metadata, frontMatter, contentTitle} = useDoc();
  const tituloSintetico = !frontMatter.hide_title && typeof contentTitle === 'undefined' ? metadata.title : null;
  return (
    // `markdown` é a classe de tipografia BASE do Infima — espaço entre
    // heading e parágrafo, lista, blockquote. Ela é diferente de
    // `ThemeClassNames.docs.docMarkdown` (`.theme-doc-markdown`), que é a
    // classe que carrega o CARTÃO em chrome.css. Esta página quer a
    // primeira e recusa a segunda — é assim que ela lê como prosa normal
    // sem ganhar a moldura que a aritmética do comutador não tem onde pôr.
    <div className={clsx('markdown', estilos.prosa)}>
      {tituloSintetico && (
        <header>
          <Heading as="h1">{tituloSintetico}</Heading>
        </header>
      )}
      <MDXContent>{children}</MDXContent>
    </div>
  );
}

function LayoutComPainel({MDXComponent}) {
  const {frontMatter} = useDoc();
  return (
    <div className="row">
      {/* O único filho de `.row` — herda a margem negativa do Infima que
          cancela o preenchimento do `.container`, dando à grade os 1152px
          inteiros que a aritmética do comutador promete. Sem este `div`, os
          filhos de `.row` virariam itens de flex lado a lado em vez de um
          bloco só, e a pilha vertical (breadcrumb → grade → paginação)
          quebraria. */}
      <div className={estilos.corpo}>
        <DocBreadcrumbs />
        <div className={estilos.grade}>
          <article className={estilos.colunaProsa}>
            <Prosa>
              <MDXComponent />
            </Prosa>
          </article>
          {/* `align-self: start` É o que faz o `position: sticky` funcionar
              dentro de um flex container — sem ele, o item esticaria para a
              altura do irmão mais alto (a prosa) e "sticky" pareceria
              travado desde o topo, porque a própria caixa já preenche a
              rolagem inteira. É o erro nº 1 de quem reconstrói este layout,
              e fica registrado aqui e em docs/design/api-reference.md. */}
          <aside className={estilos.colunaPainel}>
            <Painel exemplos={frontMatter.api_exemplos} />
          </aside>
        </div>
        <DocItemPaginator />
      </div>
    </div>
  );
}

export default function ApiDocItem(props) {
  const MDXComponent = props.content;
  const {frontMatter, metadata} = MDXComponent;

  if (!frontMatter.api_exemplos) {
    return <DocItem {...props} />;
  }

  return (
    <DocProvider content={props.content}>
      <HtmlClassNameProvider
        className={clsx(ThemeClassNames.wrapper.docsPages, ThemeClassNames.page.docsDocPage, `docs-doc-id-${metadata.id}`)}>
        <DocItemMetadata />
        <LayoutComPainel MDXComponent={MDXComponent} />
      </HtmlClassNameProvider>
    </DocProvider>
  );
}
