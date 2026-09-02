/**
 * The library entry `panlabs-docs` doesn't have, because it isn't a library:
 * it's a Docusaurus site whose catalog is consumed through
 * `@theme/MDXComponents`, never imported.
 *
 * design-sync needs one module that names every export, so this file IS that
 * naming — and nothing more. It adds no component, wraps nothing, and
 * re-exports the real sources under the exact names
 * `src/theme/MDXComponents/index.js` registers.
 *
 * Deliberately absent, and why:
 *
 *   · `CommandPanel` and `CopyPage` — route chrome, not catalog. The registry
 *     itself says so: nobody authors a `<CommandPanel>`, the reference
 *     generator emits it.
 *   · `Tabs` / `TabItem` — consumed from Docusaurus as-is, zero swizzle.
 *     They are not this repo's to publish.
 *   · `Table` and the subtitle — registered as ELEMENT keys (`table`, `h1`),
 *     so a page gets them without writing a tag. `Table` is still exported
 *     here: it has an anatomy of its own worth showing.
 */

export {default as Accordion, AccordionGroup} from '../src/components/Accordion';
export {default as Callout} from '../src/components/Callout';
export {default as Card, CardGroup} from '../src/components/Card';
export {default as Expandable} from '../src/components/Expandable';
export {ParamField, ResponseField} from '../src/components/Field';
export {default as Frame} from '../src/components/Frame';
export {default as Icon} from '../src/components/Icon';
export {default as Steps, Step} from '../src/components/Steps';
export {default as Table} from '../src/components/Table';
export {default as Update} from '../src/components/Update';

/* The one export here that isn't a catalog component. It restores the mode
   attribute Docusaurus writes before first paint — see the file itself for why
   the system can't render correctly without it. */
export {default as ThemeRoot} from './shims/theme-root';
