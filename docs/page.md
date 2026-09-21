# The page, section by section

`index.html` holds the entire page — markup, the data the leaderboard renders from, and the
three inline scripts — with styles in `css/base.css` (tokens, reset, typography),
`css/layout.css` (shell, grids, breakpoints) and `css/components.css` (every component).
There is no build step: the browser loads these files directly.

The paper draft `HUMANOIDARENA- Benchmarking … .md` is the source of truth for copy, numbers
and terminology.

## Page shell and navigation

```
.page-shell (max 960px)          wraps the whole document
  main
    section.hero#hero            …
    section.section#paper        …
    …
.content-toc                     fixed table of contents, outside the shell
```

The floating `.content-toc` lists one `.content-toc-item` per section and, under some of
them, `.content-toc-subitem` links. A sub-item's target is any element carrying the matching
`id` — a task row, a pipeline card, a plain `div` — and ids that do not exist are ignored. The
sub-list only expands while its parent item is active (CSS `li:has(.content-toc-item.active)`),
and the whole panel is hidden below 1080px.

## Sections

| # | Section | Eyebrow / heading | Content |
| --- | --- | --- | --- |
| 1 | `#hero` | *Simulation-first benchmark for humanoid control* | Title, author names with affiliation superscripts, affiliation list, lede paragraph, `.quick-links`, `.hero-metrics` (`Task suite` / `Evaluation axes` / `Core stack`), overview figure |
| 2 | `#paper` | *Abstract* — "Paper abstract." | `.paper-grid` of `.paper-card` articles holding the abstract text |
| 3 | `#tasks` | *Task gallery* — "Seven tasks across both GMTs." | Seven `.task-row`s, each tagged HOI or HSI and paired with a TWIST2 and a SONIC video |
| 4 | `#pipeline` | *Pipeline* — "From teleop to benchmark." | Four `.stack-card` stages, then six `.pipeline-step-card`s |
| 5 | `#evaluation` | *Evaluation protocol* — "Four tests plus cross-GMT." | Four `.protocol-card`s plus a full-width cross-GMT card; below it the `#eval-example` block |
| 6 | `#results` | *Results* — "Success, failure, recovery." | Three `.scenario-row`s, each a success/failure video pair, and a section footnote |
| 7 | `#leaderboard` | *Leaderboard* — "How policy–tracker pairs compare." | Views, charts and tables — see [leaderboard.md](leaderboard.md) |
| 8 | `#resources` | *Resources* — "Paper, code, and more." | Six `.resource-card`s, the BibTeX panel and the contact card |

### Anchor ids

| Scope | Ids |
| --- | --- |
| Sections | `hero`, `paper`, `tasks`, `pipeline`, `evaluation`, `results`, `leaderboard`, `resources` |
| Task rows | `task-football`, `task-doubledesk`, `task-ppbox`, `task-opendoor`, `task-sitsofa`, `task-boxing`, `task-visnavi` |
| Pipeline stages | `pipeline-capture`, `pipeline-action`, `pipeline-recording`, `pipeline-training` |
| Protocol cards | `eval-base`, `eval-semantic`, `eval-vision`, `eval-execution`, `eval-crossgmt` |
| P&PBox example | `eval-example` |
| Result scenarios | `results-ppbox`, `results-football`, `results-opendoor` |
| Resources | `contact` (also the BibTeX card's sibling) |
| Leaderboard | see [leaderboard.md](leaderboard.md) |

## Published resources (`#resources`)

Six resource cards: Paper (arXiv), Code (GitHub), Dataset and Models (HuggingFace +
ModelScope), Assets (Google Drive), Raw Data (ModelScope, complete set and a P&PBox subset),
then the BibTeX panel (`wang2026humanoidarena`) and the contact card with the two WeChat
accounts. Buttons use `.btn-pill`, with `.btn-pill--ghost` for the secondary mirror of a pair.

## Shared patterns

- **Section header** — `.section-heading` with a `.eyebrow` label and an `<h2>`; variants are
  `.paper-section`, `.feature-split` and the compact `.section-heading-compact`.
- **Video** — `figure.media-card` with a `.media-card-header` label and a
  `<video autoplay muted loop playsinline controls>`. Videos are H.264 MP4; see
  [assets.md](assets.md) for the conventions.
- **Paired videos** — `.task-media-pair` (two videos side by side) and `.example-video-pair`
  (base vs perturbed, whose playback the media script keeps in sync).
- **Row layout** — `.task-row` and `.scenario-row` are two-column grids: copy on the left
  (`.task-row-copy`, `.scenario-copy`), media on the right. `.task-tag` labels HOI/HSI.
- **Cards** — `.protocol-card` (`.protocol-card-wide` spans the grid), `.stack-card`,
  `.pipeline-step-card`, `.example-card` (`.example-card-wide`), `.resource-card`
  (`.resource-card-inner` / `-copy` / `-actions` with `.btn-pill` and `.btn-pill--ghost`).
- **Captions** — `.example-caption` explains a comparison; the term being varied is wrapped in
  `<strong>`, which styles it as the warm accent colour.
- **Footnotes** — `.footnote` with a `.footnote-marker`; used by the Results section to state
  that clips are sampled at 1 FPS while inference uses the native stream. It does not wrap, so
  keep footnote text short.

## The three inline scripts

1. **Media** — injects a shimmer `.media-loader` into every `.media-card` and marks it loaded
   on `loadeddata`, on `error`, or immediately when the video is already buffered; restarts a
   `.example-video-pair` once both clips have ended so the comparison loops in step.
2. **Navigation** — smooth-scrolls table-of-contents links and uses an `IntersectionObserver`
   to mark the entry for the section in view as `.active`.
3. **Leaderboard** — renders the rankings from data arrays in the same file. Everything it
   does is documented in [leaderboard.md](leaderboard.md).

## Adding content

- **A task** — copy a `.task-row`, give it `id="task-<slug>"`, point its two videos at
  `assets/media/task_gallery/{twist2,sonic}/…`, and add a matching `.content-toc-subitem`.
- **A pipeline stage or protocol card** — copy the existing card, keep the numbering used by
  the heading, and add a sub-item to the table of contents if it should be reachable.
- **A resource card** — copy a `.resource-card`, set the title, description and one or more
  `.btn-pill` links.
- **A section** — add `<section class="section" id="…">` with a `.section-heading`, a
  `.content-toc-item`, and a `.quick-links` entry in the hero if it should be reachable from
  the top of the page.
- **Leaderboard data** — do not touch markup; edit the arrays described in
  [leaderboard.md](leaderboard.md).
