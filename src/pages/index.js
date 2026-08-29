/**
 * A raiz — uma rota que não é página: ela leva à primeira doc.
 *
 * A âncora não tem página de abertura. A raiz dela responde **308** e a porta de
 * entrada mora no host irmão; aqui a raiz vai para a **rota nua da primeira
 * aba**, e a primeira aba é `Ferramentas`.
 *
 * **O destino segue a ordem do navbar, e não uma aba nomeada.** Quando
 * `Ferramentas` passou à frente na faixa, a raiz foi junto: o que se procura
 * mais é o que saiu daqui. A rota nua resolve por `slug: /` na folha de
 * abertura da instância, então trocar qual folha abre a aba não mexe neste
 * arquivo. Ver a `## Procedência` de docs/design/informacao.md.
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
 * O caminho aparece em duas formas, e não pela mesma razão. **O roteador NÃO
 * tem `basename`** — `<BrowserRouter>` sobe sem ele (`clientEntry.js`), e toda
 * rota registrada já carrega o `baseUrl` embutido no `path`. `<Link>` compensa
 * sozinho, prependendo `baseUrl` por dentro; `<Redirect>` é o `Redirect` cru do
 * `react-router-dom`, sem essa compensação, e por isso recebe `url`, já
 * resolvida por `useBaseUrl` — não `DESTINO` cru. Era esse o bug: `<Redirect
 * to={DESTINO}>` navegava para uma rota sem prefixo, que não batia com nenhuma
 * registrada, caía no catch-all e piscava `NotFound` até o `meta` corrigir. O
 * `meta` também é HTML cru fora do roteador e precisa da mesma resolução — é
 * ela que faz o redirecionamento acertar o locale: no EN o `baseUrl` já carrega
 * o `/en/`.
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
 * A ROTA NUA da primeira aba. Ela existe porque a folha de abertura de
 * `sidebars-ferramentas.js` carrega `slug: /` no front matter — `/ferramentas`
 * é página de verdade, não redirecionamento nem 404 (ADR 10 §h).
 *
 * **Ela segue a ordem do navbar, e já se mexeu uma vez por isso.** Apontava
 * para `/jornadas` enquanto `Jornadas` abria a faixa; com a reordenação para
 * `Ferramentas` · `Procedimentos` · `Jornadas` · `Times`, seguiu junto. O
 * acoplamento é com a POSIÇÃO, não com a aba: quem trocar a ordem outra vez
 * troca esta linha, e nenhum portão casa as duas — a lacuna fica nomeada aqui.
 *
 * **O acoplamento encolheu antes disso, e vale dizer o que ele era.** Esta
 * constante soletrava `/jornadas/api-owner/indice`: o `link` de uma categoria,
 * copiado à mão de outro arquivo. Com a rota nua, o alvo é a **instância**, não
 * a página: trocar qual folha abre a aba não mexe neste arquivo, porque quem
 * muda de dono é o `slug: /`, que viaja com a folha.
 *
 * O que sobra de acoplamento é o que o portão 6 cobre: ele confere que
 * `/ferramentas`, `/procedimentos`, `/jornadas` e `/times` devolvem 200 no host
 * publicado, e a primeira das quatro é exatamente este destino.
 */
const DESTINATION = '/ferramentas';

export default function Root() {
  const url = useBaseUrl(DESTINATION);

  return (
    <>
      <Head>
        <meta httpEquiv="refresh" content={`0; url=${url}`} />
        {/* A raiz não é conteúdo: ela é um salto. Indexá-la competiria com o
            destino pela mesma consulta. `follow` mantém o destino alcançável. */}
        <meta name="robots" content="noindex, follow" />
      </Head>

      <Redirect to={url} />

      <Layout
        title={translate({
          id: 'panlabs-docs.raiz.titulo',
          message: 'Documentação',
          description: 'Título da rota raiz, que redireciona para a primeira doc',
        })}
        noFooter>
        <main className="container margin-vert--xl">
          <p>
            <Translate
              id="panlabs-docs.raiz.aviso"
              description="Aviso da rota raiz quando o redirecionamento não acontece sozinho">
              Esta página leva à documentação.
            </Translate>
          </p>
          <Link to={DESTINATION}>
            <Translate
              id="panlabs-docs.raiz.link"
              description="Link manual para o destino da rota raiz">
              Abrir a documentação
            </Translate>
          </Link>
        </main>
      </Layout>
    </>
  );
}
