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

import MarcaNavbarItem from '@theme/NavbarItem/Marca';

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

  // A única chave nossa. O prefixo `custom-` é o que o schema do tema aceita
  // sem validar o resto do objeto (`CustomNavbarItemRegexp`).
  'custom-marca': MarcaNavbarItem,
};

export default ComponentTypes;
