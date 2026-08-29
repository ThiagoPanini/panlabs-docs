/**
 * O registro React dos ícones — o primeiro dos dois renderizadores.
 *
 * `resolveIcon('rocket')` devolve um **componente React** vindo do SVGR, que
 * o `preset-classic` já registra por padrão (`@docusaurus/plugin-svgr` é
 * dependência dele). O SVG do Lucide nasce com `stroke="currentColor"` e
 * `fill="none"`, então a tinta vem de graça e `stroke-width` é prop — que é o
 * que torna a compensação óptica por tamanho possível. Com `mask-image` não
 * seria: máscara é estêncil, não se restiliza o interior.
 *
 * O segundo renderizador é a sidebar, e ele é CSS — `mask-image` sobre
 * `::before`, em `src/css/chrome.css`. Não é inconsistência: não existe ponto de
 * swizzle `safe` para injetar componente React num item de sidebar, então a
 * rota de `className` + máscara é a **única** zero-swizzle. Os dois leem os
 * mesmos 60 arquivos.
 *
 * **Nada aqui degrada em silêncio.** Nome desconhecido lança; o Docusaurus
 * prerenderiza toda página no build, então o `throw` *é* falha de build, sem
 * infraestrutura nenhuma. Em `docusaurus start` vira overlay de erro do React,
 * que é o retorno certo em desenvolvimento.
 *
 * ---------------------------------------------------------------------------
 * Por que 60 `import` à mão e não um `require.context`
 *
 * Medido nesta implementação, não deduzido: a regra de SVGR do
 * `plugin-svgr@3.10.2` casa por **issuer**, e o issuer precisa ser um arquivo
 * `.js`/`.jsx`/`.ts`/`.tsx`/`.mdx`. Num `require.context`, o issuer de cada
 * arquivo é o módulo de CONTEXTO — um diretório —, então a regra não casa e o
 * SVG cai na regra de asset. O que volta é uma **data URI**, não um componente,
 * e o sintoma é `Invalid tag: data:image/svg+xml;base64,…` no prerender.
 *
 * Registro estático também é o que a decisão de orçamento pediu: os 61 no
 * bundle principal, que é o preço de `icon="rocket"` funcionar sem import
 * dinâmico. A medição que acompanhava esta linha — *"~20 KB crus e ~6 KB
 * gzip"* — era de quando eram 64, e sai em vez de ser ajustada a olho: número
 * medido que se corrige por estimativa deixa de ser medição.
 *
 * Custo aceito: a lista aparece duas vezes — aqui e no manifesto. A bijeção é
 * conferida nos dois sentidos logo abaixo, e o `--conferir` do vendorizador
 * cobre o terceiro lado (arquivo em `static/icons/` sem entrada).
 * ---------------------------------------------------------------------------
 *
 * Procedência: docs/design/icones.md.
 */

import {NAMES} from './manifest';

import Info from '@site/static/icons/info.svg';
import Lightbulb from '@site/static/icons/lightbulb.svg';
import TriangleAlert from '@site/static/icons/triangle-alert.svg';
import PencilLine from '@site/static/icons/pencil-line.svg';
import ChevronRight from '@site/static/icons/chevron-right.svg';
import Check from '@site/static/icons/check.svg';
import Copy from '@site/static/icons/copy.svg';
import WrapText from '@site/static/icons/wrap-text.svg';
import ExternalLink from '@site/static/icons/external-link.svg';
import Search from '@site/static/icons/search.svg';
import X from '@site/static/icons/x.svg';
import Menu from '@site/static/icons/menu.svg';
import Sun from '@site/static/icons/sun.svg';
import Moon from '@site/static/icons/moon.svg';
import Monitor from '@site/static/icons/monitor.svg';
import Languages from '@site/static/icons/languages.svg';
import LinkIcon from '@site/static/icons/link.svg';
import ListIcon from '@site/static/icons/list.svg';
import ArrowRight from '@site/static/icons/arrow-right.svg';

import Rocket from '@site/static/icons/rocket.svg';
import Shapes from '@site/static/icons/shapes.svg';
import BookOpen from '@site/static/icons/book-open.svg';
import Activity from '@site/static/icons/activity.svg';
import CodeXml from '@site/static/icons/code-xml.svg';
import Repeat from '@site/static/icons/repeat.svg';
import Undo2 from '@site/static/icons/undo-2.svg';

import Play from '@site/static/icons/play.svg';
import Download from '@site/static/icons/download.svg';
import Upload from '@site/static/icons/upload.svg';
import RefreshCw from '@site/static/icons/refresh-cw.svg';
import Trash2 from '@site/static/icons/trash-2.svg';
import Plus from '@site/static/icons/plus.svg';
import Filter from '@site/static/icons/filter.svg';
import FileText from '@site/static/icons/file-text.svg';
import Folder from '@site/static/icons/folder.svg';
import Terminal from '@site/static/icons/terminal.svg';
import Wrench from '@site/static/icons/wrench.svg';
import Database from '@site/static/icons/database.svg';
import Server from '@site/static/icons/server.svg';
import Cloud from '@site/static/icons/cloud.svg';
import Key from '@site/static/icons/key.svg';
import Lock from '@site/static/icons/lock.svg';
import Mail from '@site/static/icons/mail.svg';
import Calendar from '@site/static/icons/calendar.svg';
import Users from '@site/static/icons/users.svg';
import Globe from '@site/static/icons/globe.svg';
import Package from '@site/static/icons/package.svg';
import Zap from '@site/static/icons/zap.svg';
import Clock from '@site/static/icons/clock.svg';
import CircleAlert from '@site/static/icons/circle-alert.svg';
import CircleHelp from '@site/static/icons/circle-help.svg';
import Sparkles from '@site/static/icons/sparkles.svg';
import TrendingUp from '@site/static/icons/trending-up.svg';
import Gauge from '@site/static/icons/gauge.svg';
import Layers from '@site/static/icons/layers.svg';
import Workflow from '@site/static/icons/workflow.svg';
import Puzzle from '@site/static/icons/puzzle.svg';
import Bot from '@site/static/icons/bot.svg';
import Webhook from '@site/static/icons/webhook.svg';
import Bell from '@site/static/icons/bell.svg';

/** @type {Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>>} */
const DRAWINGS = {
  'info': Info,
  'lightbulb': Lightbulb,
  'triangle-alert': TriangleAlert,
  'pencil-line': PencilLine,
  'chevron-right': ChevronRight,
  'check': Check,
  'copy': Copy,
  'wrap-text': WrapText,
  'external-link': ExternalLink,
  'search': Search,
  'x': X,
  'menu': Menu,
  'sun': Sun,
  'moon': Moon,
  'monitor': Monitor,
  'languages': Languages,
  'link': LinkIcon,
  'list': ListIcon,
  'arrow-right': ArrowRight,

  'rocket': Rocket,
  'shapes': Shapes,
  'book-open': BookOpen,
  'activity': Activity,
  'code-xml': CodeXml,
  'repeat': Repeat,
  'undo-2': Undo2,

  'play': Play,
  'download': Download,
  'upload': Upload,
  'refresh-cw': RefreshCw,
  'trash-2': Trash2,
  'plus': Plus,
  'filter': Filter,
  'file-text': FileText,
  'folder': Folder,
  'terminal': Terminal,
  'wrench': Wrench,
  'database': Database,
  'server': Server,
  'cloud': Cloud,
  'key': Key,
  'lock': Lock,
  'mail': Mail,
  'calendar': Calendar,
  'users': Users,
  'globe': Globe,
  'package': Package,
  'zap': Zap,
  'clock': Clock,
  'circle-alert': CircleAlert,
  'circle-help': CircleHelp,
  'sparkles': Sparkles,
  'trending-up': TrendingUp,
  'gauge': Gauge,
  'layers': Layers,
  'workflow': Workflow,
  'puzzle': Puzzle,
  'bot': Bot,
  'webhook': Webhook,
  'bell': Bell,
};

// ---------------------------------------------------------------------------
// A bijeção manifesto ↔ registro, conferida alto no build.
//
// Arquivo faltando já quebra sozinho, no `import`. O que esta conferência pega é
// o outro lado — entrada de manifesto sem desenho, e desenho sem entrada —, que
// é onde a duplicação da lista pode envelhecer em silêncio.
// ---------------------------------------------------------------------------

const withoutDrawing = NAMES.filter((name) => !DRAWINGS[name]);
const withoutEntry = Object.keys(DRAWINGS).filter((name) => !NAMES.includes(name));

if (withoutDrawing.length > 0 || withoutEntry.length > 0) {
  throw new Error(
    [
      'O manifesto de ícones e o registro divergiram.',
      withoutDrawing.length > 0 && `  Sem desenho no registro: ${withoutDrawing.join(', ')}`,
      withoutEntry.length > 0 && `  Sem entrada no manifesto: ${withoutEntry.join(', ')}`,
    ]
      .filter(Boolean)
      .join('\n'),
  );
}

/**
 * Levenshtein, escrito à mão.
 *
 * `leven` é dependência transitiva do `@docusaurus/core`, mas amarrar em
 * dependência transitiva é dívida — e estas oito linhas são mais baratas que o
 * risco.
 *
 * @param {string} a
 * @param {string} b
 */
function distance(a, b) {
  const row = Array.from({length: b.length + 1}, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const saved = row[j];
      row[j] = Math.min(
        row[j] + 1,
        row[j - 1] + 1,
        previous + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      previous = saved;
    }
  }
  return row[b.length];
}

/**
 * @param {string} name
 * @returns {string | undefined} o vizinho mais próximo, se houver um plausível
 */
function nearestNeighbor(name) {
  let best;
  let smallest = Infinity;
  for (const candidate of NAMES) {
    const d = distance(name, candidate);
    if (d < smallest) {
      smallest = d;
      best = candidate;
    }
  }
  // Acima de um terço do comprimento a sugestão vira ruído — melhor não sugerir
  // do que mandar alguém para o glifo errado.
  return smallest <= Math.max(2, Math.ceil(name.length / 3)) ? best : undefined;
}

/**
 * Devolve o componente do ícone, ou lança.
 *
 * @param {string} name
 * @returns {React.ComponentType<React.SVGProps<SVGSVGElement>>}
 */
export function resolveIcon(name) {
  const drawing = DRAWINGS[name];
  if (drawing) {
    return drawing;
  }
  const suggestion = nearestNeighbor(name);
  throw new Error(
    [
      `Ícone "${name}" não existe.`,
      suggestion && `Você quis dizer "${suggestion}"?`,
      `${NAMES.length} ícones disponíveis em src/icons/manifest.js.`,
    ]
      .filter(Boolean)
      .join('\n'),
  );
}
