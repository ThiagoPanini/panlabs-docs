# panlabs-docs

Reference documentation site built with Docusaurus. Read [`CONTEXT.md`](CONTEXT.md) for vocabulary and [`DECISIONS.md`](DECISIONS.md) for the why behind each locked design decision.

## What the machine charges

Run `npm run build` before every push. It's the only CI step, and the only place a broken link fails: `onBrokenLinks: 'throw'` doesn't run under `docusaurus start`, which returns 200 with the SPA shell for any route.

`prebuild` regenerates the reference from `contracts/*.json`. Edit a contract, and the build rewrites the page from it.

## Rules nothing charges

No gate, no lint rule, no commit hook checks these. Hold them by reading.

| Rule | What it catches |
| --- | --- |
| Color and dimension come from `src/css/tokens.css`, the single source of literals. | A new hex, a loose px, or a bare `cubic-bezier` in component CSS. |
| Zero em dash in `content/` and `contracts/`, except when quoting a tool's own output. | Machine-written prose in the published site. |
| Content voice is `you` plus imperative, zero first person. | A sentence that slips into first person or passive description. |
| Content components are a closed catalog of sixteen, registered in `@theme/MDXComponents`. There's no escape hatch. | A content file importing its own component instead of changing the page. |

## Where things live

| Path | Role |
| --- | --- |
| `content/` | The published site. |
| `contracts/` | Signature contracts the reference generates from. |
| `src/css/tokens.css` | The only file with a literal color, length, duration, or curve. |
| `src/icons/manifest.js` | The icon contract. |
| `src/theme/` | Theme components, registry, swizzles. |
| `scripts/` | The reference generator and the icon vendorizer. |

## What not to do

- Don't add an npm dependency to rewrite what already works. A new dependency lands only for new capability.
- Don't hand-edit a generated page. Edit the contract it comes from and let the build regenerate it.
- Don't write `outline` outside `src/css/focus.css`. It's the only file that owns the entry-state contract.
