/**
 * O registro global do catálogo — **degrau 3** do ADR 2.
 *
 * Cabeçalho de versão obrigatório, porque o gerador do Docusaurus remove o
 * cabeçalho de licença ao ejetar e sem anotação não há contra o que diffar:
 *
 *   ejetado de @docusaurus/theme-classic@3.10.2
 *
 * É **registro, não swizzle**: o arquivo é um objeto, e o que se faz com ele é
 * espalhar o original e acrescentar chaves. Zero linha de lógica upstream
 * copiada — o próprio `getSwizzleConfig` diz *"meant to be ejected"*.
 *
 * O que o upgrade cobra: chave nova ou removida vira **erro de build**, não bug
 * de runtime.
 *
 * ---------------------------------------------------------------------------
 * Por que TUDO é global e nada se importa
 *
 * Nenhum arquivo de conteúdo escreve um `import`. A medição das referências
 * achou zero imports de snippet nos alvos: autor não importa. Catálogo que exige
 * import é catálogo que vira `export const` inline no arquivo — foram dezenas
 * delas nos dois sites medidos.
 *
 * **Custo aceito, registrado:** `MDXComponents` é importado por `MDXContent`,
 * que envolve todo conteúdo MDX, então este objeto entra no bundle de toda
 * página com MDX, sem tree-shaking. Se um dia doer, separar os quatro de
 * Referência da API — `ParamField`, `ResponseField`, `Expandable`, `VerbBadge` —
 * é mecânico e não muda a sintaxe dos outros.
 *
 * **Armadilha fechada:** não se anota este arquivo com
 * `import type {MDXComponentsObject} from '@theme/MDXComponents'`. O alias
 * resolveria para o próprio arquivo e criaria referência circular. Importa-se o
 * VALOR de `@theme-original/`.
 *
 * ---------------------------------------------------------------------------
 * Quem NÃO está aqui, e por quê
 *
 * · `callout` — é a admonition nativa. A sintaxe é `:::note`, e quem a alcança é
 *   `src/theme/Admonition/Types.js`, o outro registro de degrau 3.
 * · `code-block` — é a cerca de Markdown. O upstream já registra `pre` e `code`;
 *   o que falta é CSS sobre `.theme-code-block` (degrau 1) mais
 *   `themeConfig.prism` (degrau 2).
 *
 * Procedência: docs/design/componentes/README.md · docs/design/swizzle.md.
 */

import MDXComponents from '@theme-original/MDXComponents';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Accordion, {AccordionGroup} from '@site/src/components/Accordion';
import Card, {CardGroup} from '@site/src/components/Card';
import CodeGroup from '@site/src/components/CodeGroup';
import Expandable from '@site/src/components/Expandable';
import Frame from '@site/src/components/Frame';
import Icon from '@site/src/components/Icon';
import Steps, {Step} from '@site/src/components/Steps';
import Table from '@site/src/components/Table';
import Untranslated from '@site/src/components/Untranslated';
import Update from '@site/src/components/Update';
import VerbBadge from '@site/src/components/VerbBadge';
import {ParamField, ResponseField} from '@site/src/components/Campo';

export default {
  ...MDXComponents,

  // A ÚNICA chave de elemento que sobrescrevemos. Toda tabela de Markdown nasce
  // dentro da região rolável — o autor não escolhe, e é isso que faz a correção
  // de acessibilidade alcançar a tabela que ninguém lembrou de embrulhar.
  table: Table,

  // Consumidos do Docusaurus como estão, e globais para que `.md` os alcance sem
  // import. Zero swizzle: a anatomia que falta sai de CSS.
  Tabs,
  TabItem,

  // Os dezesseis com tag própria. Inicial maiúscula não é estilo: em MDX v3 a
  // tag minúscula é elemento HTML, e um `<card>` sairia como tag desconhecida.
  Accordion,
  AccordionGroup,
  Card,
  CardGroup,
  CodeGroup,
  Expandable,
  Frame,
  Icon,
  ParamField,
  ResponseField,
  Step,
  Steps,
  Untranslated,
  Update,
  VerbBadge,
};
