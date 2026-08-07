/**
 * A marca — **componente de tema próprio**, não swizzle.
 *
 * O `theme-classic` não tem `NavbarItem/Marca`; o Docusaurus só conhece o nome
 * que o registro deu. Acoplamento ao upstream: nenhum.
 *
 * Por que ela não é `themeConfig.navbar.logo`, que seria degrau 2: o
 * `LogoSchema` exige `src` e o `Logo` renderiza `ThemedImage`, ou seja um
 * `<img>` — e `<img>` não herda `currentColor`. A marca é **tipo mais um glifo
 * do manifesto**, em `--sd-accent`, nunca arquivo de imagem. `Logo` e
 * `Navbar/Logo` não estão no `getSwizzleConfig`, logo caem no default `unsafe`,
 * que o ADR 2 proíbe. Sobra o degrau 3 — o registro de
 * `NavbarItem/ComponentTypes`, que o próprio Docusaurus marca como
 * *"meant to be ejected"*.
 *
 * O lockup é atômico de propósito: glifo e palavra dentro do MESMO link. Marca
 * partida em dois nós é marca em que metade não clica.
 *
 * Procedência: docs/design/icones.md §3 · docs/design/swizzle.md.
 */

import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import {resolverIcone} from '@site/src/icons/registry';

export default function MarcaNavbarItem({mobile = false, className, onClick}) {
  const Glifo = resolverIcone('train-track');

  const conteudo = (
    <>
      <Glifo className="marca__glifo" aria-hidden="true" />
      <b className="marca__palavra">Trilho</b>
    </>
  );

  // No painel de tela estreita os itens da esquerda viram lista de menu. A
  // marca vira a primeira entrada dela — o cabeçalho do painel não é alcançável
  // sem swizzle, e uma entrada de lista é alcançável por Tab, que é o que
  // importa.
  if (mobile) {
    return (
      <li className="menu__list-item">
        <Link className={clsx('menu__link', 'marca', className)} to="/" onClick={onClick}>
          {conteudo}
        </Link>
      </li>
    );
  }

  return (
    <Link className={clsx('navbar__brand', 'marca', className)} to="/">
      {conteudo}
    </Link>
  );
}
