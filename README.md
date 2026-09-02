# panlabs-docs

Reference documentation site built with Docusaurus. The content is `panlabs`, a developer's personal learning collection; the product is its **structure** and **visual customization**.

## Run

```bash
npm ci
npm start                        # dev — doesn't check broken links or hosting
npm run build && npm run serve   # the whole CI is the build
```

`npm run build` is the only CI step, and what the `gate` check reports. It's also the only place a broken link fails: `onBrokenLinks: 'throw'` doesn't run under `docusaurus start`.

## Where things live

| Path | Role |
| --- | --- |
| [`CONTEXT.md`](CONTEXT.md) | The glossary. Start here. |
| [`DECISIONS.md`](DECISIONS.md) | Why each locked design decision stands. |
| [`docs/agents/`](docs/agents/) | How an agent works in this repo — tracker, domain, labels, workflow. |
| `content/` | The `panlabs` collection, the published content — `jornadas/`, `procedimentos/`, `ferramentas/`, `times/`. |
| `contracts/` | The `overpower` signature contracts. `prebuild` projects them into the generated reference. |
| `src/pages/` | The routes this project writes itself, outside the four tabs. Today that's the landing at `/`, and it carries published prose: the em dash rule and the voice rule both reach it. |
| `src/css/tokens.css` | **The single source of literal values.** The only file in the repo with a literal. |
| `src/css/custom.css` | Base rules. Zero literals, and never reads `--ifm-*`. |
| `src/css/chrome.css` | The doc page shell — proportions, navbar, sidebar, TOC, footer, narrow width. |
| `src/css/focus.css` | The entry-state contract. **The only file where `outline` can appear.** |
| `src/theme/` | The project's own theme components, registry, and swizzles. |
| `src/plugins/` | The three local plugins: search, the AI-era artifacts, and icons — reads the installed `lucide-static` to emit the sidebar's CSS masks and the generated `src/icons/registry.js` MDX registry. |
| `static/icons/` | Only `LICENSE.txt`, copied from the installed `lucide-static` on every build. |
| `scripts/` | The reference generator. |

## Locked constraints

- **Docusaurus is non-negotiable.**
- **The skin is swappable** — the product is the token architecture; the palette is a demonstration.
- **Light + dark**, with dark canonical.
- Content in **pt-BR**.
- **A new npm dependency lands only for new capability** — never to rewrite what already works.

The why behind each one is in [`CONTEXT.md`](CONTEXT.md) and [`DECISIONS.md`](DECISIONS.md).
