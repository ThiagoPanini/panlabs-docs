/**
 * Manual imports, not require.context: measured against plugin-svgr@3.10.2,
 * whose rule matches by issuer file (.js/.jsx/.ts/.tsx/.mdx). require.context's
 * issuer is the context module itself (a directory), so the rule misses, the
 * SVG falls to the asset rule, and you get a data URI instead of a component:
 * `Invalid tag: data:image/svg+xml;base64,...` at prerender.
 */

// This is the first of two renderers. The sidebar renders icons via CSS
// mask-image in chrome.css instead, since there is no safe swizzle point for
// a React component in a sidebar item; both read the same icon files.

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

// The registry is static, not dynamic: every icon here ships in the main
// bundle so `resolveIcon` can return synchronously, without an import().

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

// The manifest/registry bijection, checked at the top of every build.
//
// A missing file already fails on its own `import`. This check catches the
// other direction: a manifest entry with no drawing, or a drawing with no
// entry, which the duplicated list (here and in the manifest) could
// otherwise let drift silently. `vendor-icons.mjs --conferir` covers the
// third side: a file under static/icons/ with no entry anywhere.

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
 * Levenshtein distance, hand-written.
 *
 * `leven` is a transitive dependency of `@docusaurus/core`, but pinning to a
 * transitive dependency is debt: these eight lines are cheaper than that
 * risk.
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
 * @returns {string | undefined} the nearest neighbor, if a plausible one exists
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
  // Past a third of the length, the suggestion turns into noise: better not
  // to suggest than to send someone to the wrong glyph.
  return smallest <= Math.max(2, Math.ceil(name.length / 3)) ? best : undefined;
}

/**
 * Unknown names throw instead of degrading silently: Docusaurus prerenders
 * every page at build time, so this throw is a build failure, not a runtime
 * one (in `docusaurus start` it surfaces as a React error overlay).
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
