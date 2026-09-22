# The page, section by section

`index.html` holds the page's own markup: its shell, one frame per section, and the prose that
appears exactly once — the hero, the abstract, the four pipeline stages. The collections whose
blocks repeat (task rows, protocol cards, result scenarios, resource cards, the table of contents)
are tables in `js/content.js`, rendered into a `[data-render]` container on load. Styles are in
`css/base.css` (tokens, reset, typography), `css/layout.css` (shell, grids, breakpoints) and
`css/components.css` (every component).

There is no build step: the browser loads these files directly as ES modules.

The paper draft `HUMANOIDARENA- Benchmarking … .md` is the source of truth for copy, numbers
and terminology.

## Files

| File | Holds |
| --- | --- |
| `index.html` | Shell, section frames, single-occurrence prose, `[data-render]` containers |
| `js/main.js` | Entry point; imports the modules below and runs them in dependency order |
| `js/content.js` | The content tables (tasks, protocol, examples, scenarios, resources, contents) and their renderers |
| `js/dom.js` | `esc()`, `cls()` and the clip-card primitives every renderer builds on |
| `js/media.js` | Video loading: the shimmer, the lazy start on approach, and the lockstep of side-by-side clip groups |
| `js/nav.js` | Table of contents: smooth scrolling and the section-in-view highlight |
| `js/leaderboard.js` | Leaderboard data, views, rendering and controls — see [leaderboard.md](leaderboard.md) |

`index.html` loads only `js/main.js`, which runs its four entry points in source order:
`renderPage()`, then `startMedia()`, `startNavigation()` and `startLeaderboard()`. That order
matters — everything after the first binds to markup `renderPage()` creates.

Because they are modules, the page must be served over HTTP. Opening `index.html` from the
filesystem will not work; use the local server from the [README](../README.md).

## Page shell and navigation

```
.page-shell (max 960px)          wraps the whole document
  noscript > .page-notice        shown only without JavaScript
  main
    section.hero#hero            …
    section.section#paper        …
    …
.content-toc                     fixed table of contents, outside the shell
  ul.content-toc-list            rendered from the TOC table in content.js
```

The floating `.content-toc` lists one `.content-toc-item` per section and, under some of them,
`.content-toc-subitem` links. Both levels are rendered from `TOC` in `js/content.js`, where the
sub-items for the task gallery and the results section are derived from `TASKS` and `SCENARIOS`
— so a new task appears in the contents without a second edit. A sub-item's target is any
element carrying the matching `id`; ids that do not exist are ignored. The sub-list only expands
while its parent item is active (CSS `li:has(.content-toc-item.active)`), and the whole panel is
hidden below 1080px.

## Sections

| # | Section | Eyebrow / heading | Content | Rendered from |
| --- | --- | --- | --- | --- |
| 1 | `#hero` | *Simulation-first benchmark for humanoid control* | Title, author names with affiliation superscripts, affiliation list, lede paragraph, `.quick-links`, `.hero-metrics` (`Task suite` / `Evaluation axes` / `Core stack`), overview figure | `index.html` |
| 2 | `#paper` | *Abstract* — "Paper abstract." | `.paper-grid` of `.paper-card` articles holding the abstract text | `index.html` |
| 3 | `#tasks` | *Task gallery* — "Seven tasks across both GMTs." | Seven `.task-row`s, each tagged HOI or HSI and paired with a TWIST2 and a SONIC video | `TASKS` |
| 4 | `#pipeline` | *Pipeline* — "From teleop to benchmark." | Four `.stack-card` stages (prose in `index.html`; two hold a clip grid) then six `.pipeline-step-card`s | `PIPELINE_CLIPS` + `PIPELINE_STEPS` |
| 5 | `#evaluation` | *Evaluation protocol* — "Four tests plus cross-GMT." | Four `.protocol-card`s plus a full-width cross-GMT card; below it the `#eval-example` block | `PROTOCOLS` + `EXAMPLES` |
| 6 | `#results` | *Results* — "Success, failure, recovery." | Three `.scenario-row`s, each a success/failure video pair, and a section footnote | `SCENARIOS` |
| 7 | `#leaderboard` | *Leaderboard* — "How policy–tracker pairs compare." | Views, charts and tables | `js/leaderboard.js` — see [leaderboard.md](leaderboard.md) |
| 8 | `#resources` | *Resources* — "Paper, code, and more." | Eight `.resource-card`s: six with links, the BibTeX panel and the contact card | `RESOURCES` |

### Anchor ids

Ids in the first two groups come from the content tables; the rest are written in `index.html`.

| Scope | Ids |
| --- | --- |
| Sections | `hero`, `paper`, `tasks`, `pipeline`, `evaluation`, `results`, `leaderboard`, `resources` |
| Task rows | `task-football`, `task-doubledesk`, `task-ppbox`, `task-opendoor`, `task-sitsofa`, `task-boxing`, `task-visnavi` (from `TASKS[].id`) |
| Result scenarios | `results-ppbox`, `results-football`, `results-opendoor` (from `SCENARIOS[].id`) |
| Pipeline stages | `pipeline-capture`, `pipeline-action`, `pipeline-recording`, `pipeline-training` |
| Protocol cards | `eval-base`, `eval-semantic`, `eval-vision`, `eval-execution`, `eval-crossgmt` (from `PROTOCOLS[].id`) |
| Protocol grid | `eval-protocol` (the contents sub-item's target) |
| P&PBox example | `eval-example` |
| Resources | `contact` (`RESOURCES[]` with `kind: "contact"`) |
| Leaderboard | see [leaderboard.md](leaderboard.md) |

## Content tables (`js/content.js`)

| Table | One entry per | Notes |
| --- | --- | --- |
| `TASKS` | leg-critical task | `id`, `tag` (HOI/HSI), `title`, `blurb`, two `clips` |
| `PIPELINE_STEPS` | numbered step card | `number`, `title`, `blurb` |
| `PIPELINE_CLIPS` | clip grid inside a stage card | Keyed by the `data-clips` value the container carries |
| `PROTOCOLS` | evaluation protocol | `id`, `title`, `blurb`, optional `wide` |
| `EXAMPLES` | P&PBox comparison card | `title`, `clips` (two, or three for the vision test), `caption` |
| `SCENARIOS` | result scenario | `id`, `tag`, `title`, `blurb`, two `clips` |
| `RESOURCES` | resource card | `title`, `desc`, `links`; or `kind: "bibtex"` / `"contact"` |
| `TOC` | table-of-contents entry | `href`, `label`, optional `children` |

A **plain-text** field (`title`, `blurb`, `label`, `desc`, `tag`) is escaped on render, so write
`P&PBox` and `policy&tracker` as they should read. Two fields carry **intentional markup** and are
injected as written: `caption` on an example (the varied term is wrapped in `<strong>`) and `desc`
on the contact resource (the WeChat handles are wrapped in `.contact-id`). Both are marked in a
comment where they are declared.

## Rendering contract

A container in `index.html` declares what belongs in it:

```html
<div class="task-suite" data-render="tasks"></div>
<div class="inline-media-grid inline-media-grid-two"
     data-render="pipelineClips" data-clips="teleop"></div>
```

`renderPage()` looks up `data-render` in its `RENDERERS` map and fills the node with that
renderer's join of the matching table. The node itself is passed to the renderer so it can read
its own attributes — `pipelineClips` uses `data-clips` to pick which set of videos it holds. An
unknown `data-render` value warns to the console instead of failing silently.

## Published resources (`#resources`)

Six resource cards from `RESOURCES`: Paper (arXiv), Code (GitHub), Dataset and Models
(HuggingFace + ModelScope), Assets (Google Drive), Raw Data (ModelScope, complete set and a
P&PBox subset) — then the BibTeX panel (`wang2026humanoidarena`, lines from `BIBTEX_LINES`) and
the contact card with the two WeChat accounts. Buttons use `.btn-pill`, with `.btn-pill--ghost`
for the secondary mirror of a pair. The BibTeX panel and the contact card both carry
`.resource-card-wide` to span the grid.

## Shared patterns

- **Section header** — `.section-heading` with a `.eyebrow` label and an `<h2>`; variants are
  `.feature-split` and the compact `.section-heading-compact`.
- **Video** — `figure.media-card` with a `.media-card-header` label and a
  `<video src muted loop playsinline controls preload="none">`, built by `mediaCard()` in
  `js/dom.js` so every clip carries the same attributes. Note what is *not* there: no
  `autoplay`, and `preload="none"`, because `js/media.js` starts a clip only as it nears the
  viewport. Videos are H.264 MP4; see [assets.md](assets.md) for the conventions.
- **Clip groups** — clips that sit side by side play as a single unit. The groups are
  `.task-media-pair` (a task row or result scenario), `.example-video-pair` (base vs perturbed)
  and `.inline-media-grid` (the pipeline grids and the three-camera recording row). A group waits
  for its longest clip to finish, holding the finished ones on their last frame, and then starts
  every clip over together, so the two sides of a comparison never show different moments. A
  clip that keeps its own `loop` breaks that, so the grouping — not the `loop` attribute — is
  what decides when a clip restarts.
- **Row layout** — `.task-row` and `.scenario-row` are two-column grids: copy on the left
  (`.task-row-copy`, `.scenario-copy`), media on the right. `.task-tag` labels HOI/HSI.
- **Cards** — `.protocol-card` (`.protocol-card-wide` spans the grid), `.stack-card`,
  `.pipeline-step-card`, `.example-card` (`.example-card-wide`), `.resource-card`
  (`.resource-card-inner` / `-copy` / `-actions` with `.btn-pill` and `.btn-pill--ghost`).
- **Captions** — `.example-caption` explains a comparison; the term being varied is wrapped in
  `<strong>`, which styles it in the red highlight colour.
- **Footnotes** — `.footnote` with a `.footnote-marker`; used by the Results section to state
  that clips play at the rate they were captured while inference uses the native stream. It does
  not wrap, so keep footnote text short.
- **No-JavaScript notice** — `.page-notice` inside a `<noscript>` at the top of the shell.

## Running without JavaScript

The hero, the abstract, the pipeline prose and every section heading are in `index.html`, so they
render. The collections do not: no clips, no protocol cards, no resource links and no leaderboard.
The `<noscript>` notices say so.

## Adding content

- **A task** — add an entry to `TASKS`: `id`, `tag`, `title`, `blurb`, and the two clips at
  `assets/media/task_gallery/{twist2,sonic}/…`. The row and its table-of-contents sub-item both
  follow. Nothing else.
- **A pipeline stage or protocol card** — add an entry to `PIPELINE_STEPS` or `PROTOCOLS`. A
  pipeline stage whose prose is longer than a line belongs in `index.html` instead, like the four
  stage cards already there.
- **An evaluation example** — add an entry to `EXAMPLES`; three clips make it a triple.
- **A result scenario** — add an entry to `SCENARIOS`; its contents sub-item follows.
- **A resource card** — add an entry to `RESOURCES` with `title`, `desc` and `links`.
- **A section** — add `<section class="section" id="…">` with a `.section-heading` and a
  `[data-render]` container, an entry in `TOC`, and a `.quick-links` entry in the hero.
- **Leaderboard data** — do not touch markup; edit the arrays described in
  [leaderboard.md](leaderboard.md).
