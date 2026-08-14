/**
 * A raiz — uma rota que não é página: ela leva à primeira doc.
 *
 * A âncora não tem página de abertura. A raiz dela responde **308** e a porta de
 * entrada mora no host irmão; aqui a raiz vai para o índice da primeira jornada,
 * que é o primeiro destino declarado em `sidebars-jornadas.js`.
 *
 * **O destino é o índice da categoria, não o primeiro capítulo.** O índice é o
 * décimo tipo de página do site e é o destino do rótulo da categoria — mandar a
 * raiz para o capítulo 1 pularia a abertura da jornada. Ver o dissenso na
 * `## Procedência` de docs/design/informacao.md.
 *
 * **Três mecanismos, e cada um cobre o que o outro não alcança:**
 *
 * 1. `<meta http-equiv="refresh">` — atende a entrada direta na URL, e é o único
 *    que funciona **sem JavaScript**. O host é o GitHub Pages, que não emite
 *    redirecionamento de servidor configurável: a divergência contra o 308 da
 *    âncora é de host, não de desenho, e está carimbada como `lacuna por
 *    restrição`.
 * 2. `<Redirect>` do `@docusaurus/router` — atende a navegação **dentro** da SPA,
 *    onde o `<head>` não é reavaliado. É o caminho do clique na marca do navbar,
 *    que aponta para a raiz. Vem do núcleo do gerador: **zero dependência nova**.
 * 3. O `<Link>` visível — atende o caso em que os dois primeiros falham, e paga
 *    por si duas vezes: é ele que faz `onBrokenLinks: 'throw'` conferir a rota no
 *    build, porque `<Redirect to>` não passa por essa verificação.
 *
 * **`<main>` é obrigatório.** Página de doc ganha um pelo layout; página em
 * `src/pages/` só tem se alguém escrever, e sem ele o skip link cai na reserva e
 * o marco de página fica errado. Ver docs/design/foco.md §9.
 *
 * O caminho aparece em duas formas de propósito. `<Redirect>` e `<Link>` recebem
 * a rota **sem** `baseUrl` — o roteador tem `basename`, e o `<Link>` resolve
 * sozinho. O `meta` é HTML cru fora do roteador, e precisa da URL resolvida por
 * `useBaseUrl`. É essa resolução que faz o redirecionamento acertar o locale: no
 * EN o `baseUrl` já carrega o `/en/`.
 *
 * Procedência: docs/design/informacao.md.
 */

import React from 'react';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import Translate, {translate} from '@docusaurus/Translate';
import {Redirect} from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';

/**
 * O primeiro destino declarado na primeira sidebar — `sidebars-jornadas.js`, o
 * `link` da categoria `API Owner`. A ordem é declarada lá e em lugar nenhum
 * mais; esta constante é a segunda leitura dela, e é a única do projeto.
 */
const DESTINO = '/jornadas/api-owner/indice';

export default function Raiz() {
  const url = useBaseUrl(DESTINO);

  return (
    <>
      <Head>
        <meta httpEquiv="refresh" content={`0; url=${url}`} />
        {/* A raiz não é conteúdo: ela é um salto. Indexá-la competiria com o
            destino pela mesma consulta. `follow` mantém o destino alcançável. */}
        <meta name="robots" content="noindex, follow" />
      </Head>

      <Redirect to={DESTINO} />

      <Layout
        title={translate({
          id: 'shinydoc.raiz.titulo',
          message: 'Documentação',
          description: 'Título da rota raiz, que redireciona para a primeira doc',
        })}
        noFooter>
        <main className="container margin-vert--xl">
          <p>
            <Translate
              id="shinydoc.raiz.aviso"
              description="Aviso da rota raiz quando o redirecionamento não acontece sozinho">
              Esta página leva à documentação.
            </Translate>
          </p>
          <Link to={DESTINO}>
            <Translate
              id="shinydoc.raiz.link"
              description="Link manual para o destino da rota raiz">
              Abrir a documentação
            </Translate>
          </Link>
        </main>
      </Layout>
    </>
  );
}
