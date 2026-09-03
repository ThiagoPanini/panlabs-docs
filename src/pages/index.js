/**
 * The root: the landing, and the only page on the site written in the first
 * person.
 *
 * Until this file was rewritten the root wasn't a page at all — it jumped to
 * the first tab's bare route by three mechanisms and declared itself
 * `noindex`. All of that is gone: a visitor who lands here reads what the
 * collection is before deciding to enter it. See
 * DECISIONS.md#the-root-is-a-page-and-the-anchor-doesnt-reach-it.
 *
 * `<main>` is mandatory. A doc page gets one from the layout; a page under
 * `src/pages/` only has one if someone writes it, and without it the skip
 * link falls back to a substitute and the page landmark is wrong.
 *
 * The chrome is the SITE'S: navbar, search, mode toggle and footer all come
 * from `<Layout>`. The prototype drew its own because the design bundle
 * published to claude.ai/design deliberately excludes `chrome.css` — that
 * header and footer were scaffolding, not specification, and nothing from
 * them is reproduced here.
 */

import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import {HtmlClassNameProvider} from '@docusaurus/theme-common';
import Layout from '@theme/Layout';

import Callout from '@site/src/components/Callout';
import Card, {CardGroup} from '@site/src/components/Card';
import Icon from '@site/src/components/Icon';

/* Co-located, not `static/`: as a module the file gets a content hash, and
   the dev server reloads the browser when it changes. A file under `static/`
   gets neither — the server re-reads it from disk and never says so. */
import heroPhotoSrc from './hero-panlabs.jpg';

import styles from './index.module.css';

/**
 * The class the route hands to `<html>`, and the ONLY coupling between this
 * page and `chrome.css`.
 *
 * It can't be a module class: `chrome.css` is a separate stylesheet and
 * couldn't name a hash. It can't ride on `<Layout wrapperClassName>` either,
 * because the navbar the rule reaches lives OUTSIDE that wrapper.
 *
 * `<Head><html className=…/></Head>` is the obvious way to write it and it
 * FAILS SILENTLY — measured here, in the built site: `<html>` came back
 * carrying `plugin-pages plugin-id-default` and nothing else, the tab strip
 * stayed over the photo, and neither the build nor the console said a word.
 * Helmet doesn't merge `class`, it replaces it, and the plugin's own
 * provider writes last. Upstream ships the fix for exactly this and says so
 * in the source: `HtmlClassNameProvider` reads the class from context and
 * appends to it, one layer per provider.
 */
const ROUTE_CLASS = 'pd-landing';

/**
 * The four tabs, in the navbar's order, each described by the TYPE of record
 * it holds and never by how much of it there is.
 *
 * That distinction is what lets all four appear with the same weight while
 * two of them are still work in progress: a type is true the day the tab is
 * created, a volume goes stale on the next page published.
 *
 * The two tabs that already hold pages speak in the first person, the two
 * that are still empty define their type instead. The difference is
 * deliberate, and it's the closest this page gets to warning the reader.
 */
const RECORD_TYPES = [
  {
    title: 'Ferramentas',
    icon: 'terminal',
    route: '/ferramentas',
    body: 'O que eu desenvolvi e o que eu utilizo no dia a dia.',
  },
  {
    title: 'Jornadas',
    icon: 'book-open',
    route: '/jornadas',
    body: 'Aprendizados corporativos, como trilhas de API Owner e Security Champion.',
  },
  {
    title: 'Procedimentos',
    icon: 'list-checks',
    route: '/procedimentos',
    body: 'Tutoriais de configuração de ferramentas, pipelines ou procedimentos corporativos.',
  },
  {
    title: 'Times',
    icon: 'users',
    route: '/times',
    body: 'Times onde eu atuou ou atuei ao longo da minha trajetória corporativa no Itaú.',
  },
];

/**
 * The three principles that govern what enters the collection.
 *
 * The second one used to claim everything published here had passed through
 * the author's hands. The collection is mixed by definition, so the claim
 * names its own exception now instead of being false about four pages.
 */
const PRINCIPLES = [
  {
    title: 'Documentar é aprender',
    body:
      'Aqui eu registro vivências e descobertas importantes do universo Itaú capazes de facilitar meu próprio trabalho como especialista no mundo de tecnologia.',
  },
  {
    title: 'Soluções e experiências próprias',
    body:
      'Atuando como um grande defensor do aprendizado contínuo, registro aqui as soluções que desenvolvo e costumo entregar para o time, como libs e módulos.',
  },
  {
    title: 'Nada aqui é oficial',
    body:
      'Nenhuma documentação aqui é suportada por times robustos. Tudo o que está aqui tem um propósito primário de servir como referência pessoal e, de maneira secundária, para outros.',
  },
];

export default function Landing() {
  return (
    <HtmlClassNameProvider className={ROUTE_CLASS}>
      <Layout description="O acervo de aprendizado de um desenvolvedor: as ferramentas que passam pela minha mão, os papéis que eu vesti e o que ficou de cada um.">
        <main className={styles.landing}>
          <section className={styles.hero}>
            {/* Five absolute layers, in painting order. The photo is
                decorative: the headline beside it carries the meaning, and
                an alt text describing a portrait would only repeat the page
                to a reader who can't see it. */}
            <img
              className={styles.heroPhoto}
              src={heroPhotoSrc}
              alt=""
              fetchPriority="high"
            />
            <div className={styles.heroVeilY} />
            <div className={styles.heroVeilX} />
            <div className={styles.heroGlow} data-pd-part="hero-glow" />
            <div className={styles.heroGrid} />

            {/* Four children, and the count is load-bearing: the cascade's
                stagger is `:nth-child()` in the module. */}
            <div className={clsx(styles.bandInner, styles.heroContent)}>
              <p className={styles.pill}>
                panlabs-docs · uma documentação pessoal
              </p>
              <h1 className={styles.title}>
                O aprendizado de um<br />
                especialista no Itaú.
              </h1>
              <p className={styles.lead}>
                Esse é um espaço individual criado para documentar jornadas,
                ferramentas que eu desenvolvo, tutoriais que eu escrevo e
                experiências que eu vivencio. O objetivo é me ajudar (e, eventualmente, ajudar outros)
                a registrar itens fundamentais para o meu dia a dia de trabalho no Itaú.
              </p>
              <div className={styles.actions}>
                {/* `<Link>`, because it's the one call to action that leaves
                    this page: it resolves `baseUrl`, navigates inside the
                    SPA, and is what makes `onBrokenLinks: 'throw'` check the
                    route at build time. */}
                <Link
                  className={clsx(styles.action, styles.actionPrimary)}
                  to="/ferramentas">
                  <span>Ferramentas que eu criei</span>
                  <Icon name="chevron-right" size="sm" />
                </Link>
                {/* A plain `<a>`, because the target is an id on this same
                    page: the browser already scrolls to it, and the router
                    has nothing to add. `onBrokenAnchors: 'throw'` checks it
                    all the same. */}
                <a
                  className={clsx(styles.action, styles.actionSecondary)}
                  href="/jornadas">
                  <span>Times que eu participo</span>
                  <Icon name="info" size="sm" />
                </a>
              </div>
            </div>
          </section>

          <section id="sobre" className={styles.principles}>
            <div className={clsx(styles.bandInner, styles.principlesInner)}>
              {PRINCIPLES.map(({title, body}) => (
                <article className={styles.principle} key={title}>
                  <h2 className={styles.principleTitle}>{title}</h2>
                  <p className={styles.principleBody}>{body}</p>
                </article>
              ))}
            </div>
          </section>

          {/* The two revealed bands. `data-pd-part` is how `tokens.css`
              reaches them under reduced motion, where a scroll-driven
              animation is REMOVED rather than shortened. */}
          <section
            id="registros"
            className={clsx(styles.band, styles.reveal)}
            data-pd-part="reveal">
            <div className={clsx(styles.bandInner, styles.bandBody)}>
              <div className={styles.bandHead}>
                <h2 className={styles.bandTitle}>O que vive aqui</h2>
              </div>
              <CardGroup>
                {RECORD_TYPES.map(({title, icon, route, body}) => (
                  <Card key={title} title={title} icon={icon} href={route}>
                    <p>{body}</p>
                  </Card>
                ))}
              </CardGroup>
            </div>
          </section>

          <section
            className={clsx(styles.band, styles.reveal)}
            data-pd-part="reveal">
            <div className={clsx(styles.bandInner, styles.bandCallout)}>
              <Callout variant="info" title="O que este acervo não é">
                <p>
                  Não é um espaço oficial com documentações oficiais que servem
                  outras pessoas ou áreas. Tudo o que está aqui foi colocado para
                  servir meus propósitos individuais como um especialista em tecnolgia
                  no Itaú como uma forma de facilitar meu dia a dia de atuação. Não apoie
                  decisões estratégicas e críticas e itens que estejam aqui documentados.
                </p>
              </Callout>
            </div>
          </section>
        </main>
      </Layout>
    </HtmlClassNameProvider>
  );
}
