# Decisions

## CSS in Three Layers, One Source of Literals

**Rule.** Keep every literal color and dimension in `tokens.css`; nothing outside that file introduces a new literal. Derive semantic color from root tokens through relative syntax, `color-mix()`, or `calc()` — never write a new hex value. Treat dark as the canonical root and light as the override at `:root[data-theme='light']`; never write a dark-mode selector anywhere else. Bridge to the underlying framework in one direction only: assign its variables from the project's own tokens, and never read one of its variables back into project code. Keep `@layer` out of the project's CSS entirely.

**Why it binds.** The framework's own dark-mode selector carries higher specificity than the override selector its documentation recommends, so following that documentation loses silently. Treating dark as canonical sidesteps the need to ever beat that selector. Wrapping project rules in a cascade layer would make them lose to any of the framework's unlayered defaults, regardless of specificity.

**Refused, and why.**
- The documented `[data-theme='dark']` override pattern — loses silently to the framework's higher-specificity dark selector.
- Light as canonical, dark as the override — fights how the framework ships its own defaults instead of working with them.
- `@layer` to organize the cascade — unlayered CSS always beats layered CSS, so wrapping project rules in a layer hands the win to the framework.
- Building the semantic layer directly on the framework's own variables — inherits values resolved at the framework's build time, not values this project controls.
- A two-way bridge that reads framework variables back into project code — couples the design system to an upstream package this project doesn't maintain.
- `!important` to win against the framework — wins one rule at a time with no way back; deliberate specificity keeps every step reversible.

## The Swizzle Ladder, and a Zero-Unsafe Budget

**Rule.** Reach for the cheapest tool first when changing how the theme behaves: override a framework CSS variable, then a stable class hook, then a public config option, then a hand-written registry entry, then a wrapped component, then an ejected component. Never write an unsafe swizzle. Step down the ladder only when the step above demonstrably cannot reach the goal, and record that reasoning in the swizzle ledger. Treat the zero-unsafe budget as fixed; reopening it takes a new decision recorded here, not a judgment call on a single change.

**Why it binds.** Each step down the ladder raises the cost of the next framework upgrade: a wrapped component fails the build the moment an upstream prop changes, and an ejected component drifts from upstream silently, with nothing checking it against the original again. An unsafe swizzle carries no compatibility contract at all.

**Refused, and why.**
- Wrapping by default and ejecting only as the exception — some of the cheapest available changes require an eject and forbid a wrap, so the verb isn't the axis that matters; the amount of upstream code entering the repository is.
- A numeric ceiling on unsafe swizzles instead of zero — a ceiling invites spending up to it; zero has no room to slide.
- Treating a component authored entirely by this project as a swizzle — would make the least-coupled technique look like debt instead of the preferred outcome.
- Ejecting a component without requesting typed output — copies the framework's already-transpiled build artifact instead of its maintained source.

## Movement Lives in the Token Layer

**Rule.** Express every transition and animation as a named movement token — a duration and an easing curve paired together in the token layer — and never write a literal duration or curve in component CSS. Handle reduced motion in exactly one place: collapse the duration tokens to a near-zero value inside a single query in the token file. Shorten a movement that ends on its own under reduced motion; remove a movement that doesn't end on its own, such as a scroll-driven or infinite one.

**Why it binds.** Collapsing to a near-zero duration instead of true zero keeps transition-end events firing, which code that waits on them — a collapsing section, for instance — depends on; zero would leave that code stuck waiting. Because every component sources its timing from the token layer, the single reduced-motion query in that layer reaches every consumer without any component needing its own copy.

**Refused, and why.**
- Disabling all animation outright under reduced motion — breaks code that depends on a transition completing and firing its end event.
- Letting each component own its own reduced-motion query — turns every new transition into a classification decision, and a wrong classification is invisible until someone notices.
- Setting the reduced duration to exactly zero — stops transition-end events from firing, breaking code that waits on them.
- Shortening an infinite or scroll-driven loop instead of removing it — produces a rapid strobe, the opposite of what reduced motion is meant to prevent.

## The Entry-State Contract

**Rule.** Show the focus indicator as an `outline`, only under `:focus-visible`, declared only inside the project's dedicated focus stylesheet; never combine it with plain `:focus`, and never build it as a box-shadow layer. Offset the outline so it always lands on the surface behind the element, never on the element's own fill. Give `:active` the same tokens as hover, regardless of pointer type — hover previews a state, active confirms it. Keep heading anchors and copy affordances visible under a coarse pointer, and give every interactive target a fixed minimum size, with a closed list of exceptions. Neutralize any hover behavior the project doesn't author itself through the token bridge, not through selector-by-selector overrides.

**Why it binds.** Pairing `:focus-visible` with plain `:focus` puts a ring on every mouse click, which is the exact behavior that pushes teams toward disabling outlines altogether; using `:focus-visible` alone avoids ever needing that escape hatch. An offset ring reduces the contrast check to a small, closed set of background surfaces instead of every possible element fill. A box-shadow ring would need the entire shadow stack redeclared to add one more layer on top of an existing shadow.

**Refused, and why.**
- Adding the ring as another layer of an existing box-shadow stack — the whole stack must be redeclared to add one layer, unlike an independent outline.
- Enumerating a closed list of focusable selectors — misses new interactive elements silently, and only a keyboard user would ever notice.
- Combining `:focus` with `:focus-visible` — rings every mouse click, the behavior that leads teams to disable outlines entirely.
- Gating `:active` behind a coarse-pointer check — touch still needs a confirmed state independent of what hover does on that pointer type.
- Detecting touch capability in JavaScript instead of a pointer media query — the media query re-evaluates itself declaratively; a JavaScript check doesn't.

## No Trailing Slash

**Rule.** Set the site's trailing-slash behavior to false: every route resolves without a trailing slash, and the emitted file carries an `.html` extension. Produce each page's Markdown companion by appending `.md` directly to that same permalink string, not through any router-level slash normalization.

**Why it binds.** With a trailing slash in place, that same string concatenation would produce a path ending in `/.md`, which resolves to nothing; without one, appending `.md` to a permalink always yields a working path. Turning the slash off also collapses the permalink and the emitted route into a single string, since removing a trailing slash that isn't there is a no-op.

**Refused, and why.**
- Leaving the setting unspecified — an unset value is treated as legacy passthrough by the router's own normalization step, so links are emitted without any normalization applied.
- Setting it to true — breaks the Markdown-companion convention outright, and no hosting compatibility gained by that choice offsets losing it.
- Emitting an `index.html` fallback alongside every `.html` file — trades one visible failure mode, a route failing on a host that needs an extension, for a silent one: a doubled, unaudited output nobody notices drifting.

## A Sidebar Category Is Not a Destination

**Rule.** Give every top-level sidebar entry the shape of a separator: no page, no link, no arrow, no icon, permanently expanded. From the second level down, give every entry a collapsible, clickable node with an icon, collapsed by default, and let the branch holding the current page open itself. Let a category's contents surface through the sidebar tree itself; never add a page whose only purpose is to list its own children. Increase indentation by a fixed step per level below the first two ranks, which sit flush with each other. Cap nesting at a fixed depth, confined to a single branch. Resolve each top-level section's bare route to its first real leaf page.

**Why it binds.** Making every category clickable and arrowed regardless of depth erases the distinction between "this groups things" and "this is a page," so a reader can't tell a section header from a real destination without clicking it first. A page whose only content is a list of its own children duplicates what the sidebar tree already shows, in a second place that can drift from the first.

**Refused, and why.**
- Applying the same collapsible, clickable treatment to the top level — removes the one fixed, always-open anchor at the top of the tree.
- Keeping a listing page for every category, turned into a leaf — most such pages add nothing beyond what the sidebar tree already displays.
- Removing every category-listing page without exception — a few hold real content beyond a child listing, and removing those loses that content along with the redundant ones.
- Leaving every category collapsed by default with no visual distinction from a separator — under a deep tree, nothing tells a reader which branch holds the page they're already on.

## Reference Is Generated From Contract

**Rule.** Generate the reference documentation for anything with a machine-checkable surface — a command-line tool, a library, an API — from a JSON contract file; never hand-author it. Keep the contract plain JSON, parseable without any dependency beyond the language's own parser. Run the generator outside the build, by hand, and commit its output like any other authored page; never let the build itself run the generator. Mark generated pages as generated through a front-matter marker and a distinct file extension, and never hand-edit one. Reject a malformed contract loudly, pointing at the offending node's exact location, rather than dropping or ignoring it. Cap nesting inside a contract entry at a fixed depth, and link to another named entry instead of nesting further. Give generated pages their own sidebar fragment, a list of ids imported into the hand-authored sidebar tree, rather than letting them own the whole tree.

**Why it binds.** Running the generator inside the build means a bug in the generator can fail a build that has nothing to do with the page someone is actually editing; running it outside the build and committing the output puts every reference change in the diff like any authored change, visible to review. A JSON-only contract needs no parser dependency beyond what every runtime already ships. This scopes the rule to the reference generator specifically, not to every build-time source of generated output: `src/plugins/sidebar-icons` resolves an icon slug against the installed `lucide-static` package inside the build, on purpose, and there the failure mode inverts — a missing icon is the page the person is editing, not an unrelated one.

**Refused, and why.**
- YAML instead of JSON for the contract — needs a parser dependency the project would otherwise never carry.
- A third-party documentation-generation plugin — pulls in a dependency tree to replace a generator small enough to read in one sitting.
- Running the generator during the build instead of committing its output — turns a generator bug into a build failure unrelated to the page someone is actually touching.
- Letting the generator own the entire sidebar tree — takes ownership of hand-authored leaf pages the generator has no knowledge of.
- Leaving nesting inside a contract entry uncapped — a self-referencing or deeply nested contract renders a page with no natural stopping point.
- Dropping a malformed contract entry silently — hides a broken contract behind a reference page that quietly has one less entry than it should.

## Search Is a Local Index, No External Service

**Rule.** Build the search index at compile time and ship it as data inside the site's own bundle; never issue a network request to answer a search query. Build that index from the authored source content, not from rendered HTML. Enforce a fixed size ceiling on the index at build time, and fail the build outright if it's exceeded; never degrade silently. Match queries by normalized substring, case- and diacritic-insensitive, never by statistical relevance ranking, stemming, or fuzzy matching.

**Why it binds.** Shipping the index as bundled data instead of a fetched file means a missing or broken index shows up as a build failure, not as a runtime error a user hits without anyone noticing; a single-page app also keeps returning a success status for a missing route, which would otherwise hide a broken fetch behind what looks like success. Indexing the authored source instead of rendered HTML avoids adding an HTML-parsing dependency, and it reaches generated reference pages through the same path as hand-authored ones automatically.

**Refused, and why.**
- A third-party local-search plugin that indexes rendered HTML — pulls in an HTML-parsing dependency and a ranking library the project's page count doesn't need.
- Serving the index as a fetched JSON file instead of bundled data — a missing route under a single-page app still returns a success status, turning a broken fetch into a silent parse error instead of a clear failure.
- Statistical relevance ranking instead of substring matching — needs to be explainable in prose and checkable by reading a diff; a statistical score is neither.
- A second keyboard shortcut for opening search — needs a guard against firing while focus is already inside a text field, which is its own silent failure mode.

## The Diagram Lightbox

**Rule.** Let every diagram frame open into a full-window `<dialog>`, opened with `showModal()`, with continuous zoom and panning. Keep the component itself free of behavior: it declares the button, the dialog, and the parts that address them, and a client module registered through the framework's public client-module key supplies every listener. Address those parts through the published parts contract, never through a CSS Module class. Clone the drawing into the dialog rather than moving it or re-rendering it, and give the clone a fresh id when the exporter wrote one. Compute zoom as `anchor × k`, where the anchor is the smaller of the fit and 1, and let `k` run continuously between two counts; never offer a ladder of absolute percentages. Pan through the scroll container's own overflow, adding only the one gesture the substrate lacks — dragging with a pointer. Keep a gutter of backdrop showing on every side of the panel.

**Why it binds.** A drawing scaled into the prose column is unreadable by arithmetic, not by impression: the specimen measures 1904px inside a 699px stage, which renders at 36.7% and puts its 12px labels at 4.4px. No React seam reaches this: `Root`, `Layout`, and `DocItem/Layout` are all absent from the theme's swizzle ledger, so each falls through to the `unsafe` default, and that budget is fixed at zero — the client-module key is a public configuration option, one rung up, and it spends nothing. The parts contract is the only stable address a separately-compiled file has, since a module class is hashed at build time. Anchoring zoom on the fit is what makes the size of the drawing stop mattering: at 6000px wide, a ladder's "fit" is 12% and its 50% is still 3000px, so half the ladder is unreachable. Capping the anchor at 1 is what stops a drawing smaller than the window from opening stretched. The gutter is load-bearing rather than decorative: a click on the backdrop is dispatched to the dialog element itself, so it is the one surface where closing costs no code, and edge to edge it would have no area.

**Refused, and why.**
- A pan-and-zoom dependency from the package registry — the scroll container already delivers panning with the wheel, the trackpad, a finger, and the keyboard; the dependency would replace what the substrate ships.
- The vendor's own diagram viewer over a CDN — this project loads nothing from a CDN, and a third-party viewer rots on its own schedule.
- Rendering the enlarged drawing as an `<img>` — half the repainting matches the exporter's *attribute* layer (`stroke='#000000'`, `fill='#000000'`), and an attribute selector doesn't cross the image boundary, so the enlarged copy would be a different drawing from the one on the page.
- `:target` and no script at all — buys the open and the close, and loses Escape, the focus trap, dragging, and the zoom itself.
- A ladder of absolute zoom stops — measured against a 6000px drawing, half the stops land outside anything a reader would ask for.
- Animating the drawing's size without holding the focal point per frame — a size transition animates the scroll container's own extent, so a scroll position written once is clamped against a range that hasn't grown yet, and the point the reader aimed at drifts for the whole duration.
- Opening only on a corner button, or only on a click — the click is what a reader tries first and the button is what a keyboard can reach; each alone leaves one of the two out.
- Moving the drawing into the dialog instead of cloning it — the node belongs to a React tree, and the page's own copy would be gone the moment anything threw in between.

## A Diagram Tab Is Selected in the Import

**Rule.** Let one multi-tab `.drawio.svg` answer to several imports, each naming its tab through a `?aba=<slug>` query, and resolve that query to a generated sibling `.svg` — one drawing per tab an MDX file actually asks for, committed to the repository. Render those drawings with the draw.io the editor extension already ships on disk, driven over the debugging protocol with no driver dependency, and hold one browser open across saves. Render under the dev server only; let the build verify instead, comparing a hash stamped into each generated file against the tab it came from. Keep the diagram component free of any of it. Leave an import with no query resolving to the master, exactly as before. Watch each directory holding a master plainly, never recursively.

**Why it binds.** The format cannot render two tabs: the file carries one `viewBox` and one drawing while its `content` attribute names every tab, so the drawing is whichever tab was open at save time. Nothing downstream can recover the others — SVGO strips that attribute, measured as zero occurrences of `mxfile` in the built chunk — which puts tab selection before webpack and rules out a component prop. Only draw.io can turn a tab back into a drawing, and the copy inside the editor extension is the same engine that drew the file in the first place: re-rendering this project's own diagrams through it reproduces them element for element, `light-dark()` included, which is what carries both color modes in one file. That engine cannot be a build dependency, because the single CI step must run anywhere, so the drawings are committed and the build only checks them. Holding the browser open is what keeps the authoring loop intact: booting costs 3.3 s and a warm render costs a median of 281 ms. The watch is plain because a recursive one goes deaf at the first rename-based save and never recovers, measured over six saves alternating both styles.

**Refused, and why.**
- A tab prop on the diagram component — by the time it renders, SVGR has handed React one drawing and SVGO has dropped the other tabs.
- Selecting the tab in the browser — the source never arrives there, and the vendor's viewer would have to come over a CDN this project does not use.
- One file saved per tab, by hand — every copy carries the whole source, so there is no master, and editing a tab in the wrong copy leaves another one's picture stale with nothing to catch it.
- Importing the generated sibling directly, with no query — costs no webpack hook, and makes the markdown name a file no author wrote.
- A generated registry keyed by slug, the way icons resolve — an icon is a kilobyte and a diagram is over a hundred, so either every diagram ships on every page or a static page grows a loading state.
- Rendering at import time through a loader — puts a browser in the one CI step.
- The vendor's hosted export endpoint — the same engine sits on disk, and a network call in the authoring loop fails the day the network does.
- Vendoring draw.io into the repository — 102 MB, against a project that just deleted its vendorizer.
- Generating every tab of every master — leaves files in the tree that nothing imports.
