/**
 * Registro de tipos de item de navbar — **degrau 3** do ADR 2.
 *
 * Cabeçalho de versão obrigatório, porque o gerador do Docusaurus remove o
 * cabeçalho de licença ao ejetar e sem anotação não há contra o que diffar:
 *
 *   ejetado de @docusaurus/theme-classic@3.10.2
 *
 * É registro, não swizzle: o arquivo é um OBJETO, e o que se faz com ele é
 * espalhar o original e acrescentar uma chave. Zero linha de lógica upstream
 * copiada. `wrap` é `forbidden` aqui e `eject` é `safe` — o comentário do
 * próprio `getSwizzleConfig` diz *"meant to be ejected"*.
 *
 * O que o upgrade cobra: chave nova ou removida no objeto vira **erro de
 * build**, não bug de runtime.
 */

import DefaultNavbarItem from '@theme/NavbarItem/DefaultNavbarItem';
import DropdownNavbarItem from '@theme/NavbarItem/DropdownNavbarItem';
import LocaleDropdownNavbarItem from '@theme/NavbarItem/LocaleDropdownNavbarItem';
import SearchNavbarItem from '@theme/NavbarItem/SearchNavbarItem';
import HtmlNavbarItem from '@theme/NavbarItem/HtmlNavbarItem';
import DocNavbarItem from '@theme/NavbarItem/DocNavbarItem';
import DocSidebarNavbarItem from '@theme/NavbarItem/DocSidebarNavbarItem';
import DocsVersionNavbarItem from '@theme/NavbarItem/DocsVersionNavbarItem';
import DocsVersionDropdownNavbarItem from '@theme/NavbarItem/DocsVersionDropdownNavbarItem';

const ComponentTypes = {
  default: DefaultNavbarItem,
  localeDropdown: LocaleDropdownNavbarItem,
  search: SearchNavbarItem,
  dropdown: DropdownNavbarItem,
  html: HtmlNavbarItem,
  doc: DocNavbarItem,
  docSidebar: DocSidebarNavbarItem,
  docsVersion: DocsVersionNavbarItem,
  docsVersionDropdown: DocsVersionDropdownNavbarItem,

  // **Zero chaves nossas, e o objeto passa a ser idêntico ao do upstream.**
  //
  // A única que existia era `custom-marca`, e ela morreu com o glifo: a marca
  // ficou só com a palavra, e `navbar.title` a renderiza pelo `.navbar__brand`
  // nativo. Com ela some `NavbarItem/Marca`, e `src/theme/` fica com um arquivo
  // a menos.
  //
  // **Por isso a entrada de degrau 3 deste arquivo sai do ledger.** O ledger é
  // inventário de customização, e aqui não há mais nenhuma — o arquivo continua
  // como o ponto de extensão já ejetado, e o portão 7 continua casando o nome
  // dele com a lista congelada. A regra do ledger é *um item sai quando a
  // customização é removida*, e é isso que acabou de acontecer.
};

export default ComponentTypes;
