---
paths:
  - "src/css/*.css"
---

# CSS, the token layer

Nothing enforces these files by machine. The rules below hold by reading, which is why they're written down.

## The scaffolding that already exists, clone it, don't invent it

| File | What lives in it |
| --- | --- |
| `src/css/tokens.css` | the three layers. **The only file in the project with a literal color, length, duration, or curve.** |
| `src/css/focus.css` | the entry-state contract. **The only file that writes `outline`.** |
| `src/css/chrome.css` | navbar, sidebar, TOC, footer, pagination |
| `src/css/components.css` | the authored MDX components |
| `src/css/custom.css` | the entry point; imports the rest |

## The reference rule

Three layers, one direction.

- **Layer 1, root.** Literals. The swap block (what gets rebranded) plus the base (scales and the ramp's shape).
- **Layer 2, semantic.** **Color only.** The roles, where the mode resolves, dark `:root` and light `:root[data-theme='light']`.
- **Layer 3, component.** Declared in the component's own scope, **never** at `:root`.

**Color always flows down through layer 2**, no component reads the ramp or the brand directly. **Dimension comes straight from layer 1.**

Missing the role in layer 2? Derive it, don't bake in a new literal: relative syntax (`oklch(from var(--x) …)`), `color-mix(in oklab, …)`, or `calc()` over the base.

## What DECISIONS.md already settles

Which values live in `tokens.css` and which don't, transition timing as named movement tokens, and where `outline` gets written, that's [Decisions § CSS in Three Layers, One Source of Literals](../../DECISIONS.md#css-in-three-layers-one-source-of-literals), [§ Movement Lives in the Token Layer](../../DECISIONS.md#movement-lives-in-the-token-layer), and [§ The Entry-State Contract](../../DECISIONS.md#the-entry-state-contract). Read them before writing a transition, a focus ring, or a new color.
