# Design

Design intent and the system the page is built from. `docs/page.md` maps the sections
themselves, `docs/leaderboard.md` covers the leaderboard's behaviour, `docs/assets.md` the
media. `css/base.css` is the source of truth for token values.

## Brand

- Personality: technical, research-forward, grounded, legible.
- Trust signals: clear benchmark framing, real repo structure, concrete task media, direct
  links to paper, code and data.
- Avoid: a generic startup look, ornament for its own sake, claims that the benchmark does not
  evidence.

## Product goals

- Explain what HumanoidArena is within one screen.
- Show the benchmark's tasks and the diversity of embodied interaction quickly.
- Make the route from teleoperation to evaluation legible.
- Keep paper, dataset, results and code links prominent.
- Ship as a static page: publishable on GitHub Pages, no build step.

Non-goals: replacing full documentation, 3D or app-like interactivity.

Success signals: a visitor identifies benchmark scope, task types and repo entry points in
under two minutes; the page needs no build tooling to publish.

## Personas and jobs

| Persona | Wants |
| --- | --- |
| Robotics researcher judging relevance | Benchmark scope, novelty, representative tasks |
| Prospective user reproducing the benchmark | Pipeline, data collection, training and evaluation detail |
| Reviewer or reader orienting quickly | Fast scan of claims, tasks and entry points |

Typical context: desktop browsing from a paper or social link, scanning before reading the
repository.

## Information architecture

Hero, then seven sections: Abstract, Task gallery, Pipeline, Evaluation, Results, Leaderboard,
Resources. Hierarchy runs claim → task evidence → framework → protocol → results → rankings →
downloads and citation.

Navigation is a floating table of contents beside the page, one entry per section with
sub-items for the seven tasks, the pipeline stages, the evaluation example, the result
scenarios, resources and contact; the hero repeats the most-wanted destinations as quick links.
Anchors and sub-item targets are listed in [page.md](page.md).

## Design principles

1. **Benchmark identity before implementation detail.** The claim, the tasks and the evidence
   come first; plumbing comes later.
2. **Task media is proof, not decoration.** Every clip shows a real rollout, and comparisons
   are shown as pairs (SONIC vs TWIST2, success vs failure, base vs perturbed).
3. **Static and publication-friendly.** Plain HTML, CSS and ES modules, relative paths, no build
   and no dependencies.
4. **State what the benchmark measured.** Numbers come from the paper's protocol, or they are
   not shown.
5. **Write a repeated block once.** Anything that appears more than once — a task row, a clip
   card, a protocol card, a resource link — is a data entry rendered into the page, not markup
   copied out. Prose that appears once stays in `index.html`, where it reads as the HTML it is.

## Visual language

Warm off-white ground, ink text, a muted blue accent with a warm orange secondary; Instrument
Serif for section headlines, Manrope for dense text; medium-radius cards, hairline borders and
light shadows; motion that is restrained and state-driven.

### Design tokens

| Token | Value | Used for |
| --- | --- | --- |
| `--bg` | `#f4efe7` | Page ground |
| `--surface` | `#fffaf4` | Solid panels, logo tiles |
| `--bg-elevated` | `rgba(255, 255, 255, 0.72)` | Cards (table, protocol, resource) |
| `--line` | `rgba(31, 41, 55, 0.12)` | Hairline borders |
| `--ink` | `#16202a` | Primary text |
| `--muted` | `#4c5a66` | Secondary text |
| `--accent` | `#285f87` | Links, SONIC colour, active tab fill |
| `--accent-soft` | `#d9e8f1` | Accent tints |
| `--warm` | `#c46c38` | Highlight term, TWIST2 colour, focus ring |
| `--shadow` | `0 18px 50px rgba(25, 35, 45, 0.09)` | Card elevation |
| `--radius-lg` / `--radius-md` / `--radius-sm` | `28px` / `20px` / `999px` | Cards, inner blocks, pills |

Typography: body `Manrope` at `100%/1.5`; section headlines `Instrument Serif` with negative
tracking; micro-labels (table headers, eyebrows, control labels) uppercase, `0.62–0.72rem`,
`0.1em` letter-spacing, weight 800.

### Motion

| Interaction | Behaviour |
| --- | --- |
| Press on any control | `scale(0.97)` on pointer-down, 100 ms, no delay |
| Hover | Background/border tint, 0.14–0.22 s |
| Segmented GMT filter | Thumb slides between segments, 0.32 s |
| Chart bars | Grow from zero in sequence, 0.72 s with a 45 ms stagger per bar |
| View switch or filter change | The view rises 5 px and fades in, 0.34 s, while its bars regrow |

All of it uses the critically damped curve `cubic-bezier(0.32, 0.72, 0, 1)` with no overshoot,
and all of it is replaced by an instant state or a short cross-fade under
`prefers-reduced-motion`.

## Components

There is no component library: styles are plain classes in `css/components.css`, grouped as

| Family | Classes |
| --- | --- |
| Section frame | `.section`, `.section-heading`, `.eyebrow`, `.section-heading-compact`, `.footnote`, `.page-notice` |
| Hero | `.hero`, `.hero-copy`, `.author-block`, `.lede`, `.quick-links`, `.hero-metrics`, `.hero-media` |
| Media | `.media-card`, `.media-card-header`, `.media-frame`, `.media-loader`, `.task-media-pair`, `.example-video-pair` |
| Rows | `.task-row`, `.task-row-copy`, `.task-tag`, `.scenario-row`, `.scenario-copy` |
| Cards | `.paper-card`, `.stack-card`, `.pipeline-step-card`, `.protocol-card` (+ `-wide`), `.example-card` (+ `-wide`), `.resource-card` (+ `-inner`, `-copy`, `-actions`, `-wide`), `.bibtex-box` |
| Buttons and links | `.btn-pill`, `.btn-pill--ghost`, `.lb-repo`, `.lb-model-link` |
| Table of contents | `.content-toc`, `-title`, `-list`, `-item`, `-sub`, `-subitem` |
| Leaderboard | `.lb-*` — controls, tabs, filter, chart, table, note (see [leaderboard.md](leaderboard.md)) |

States and variants: link pills (primary and ghost), video vs image card, available vs
unavailable resource, SONIC vs TWIST2 colouring, selected leaderboard row.

## Responsive behaviour

- Two breakpoints: `1080px` (the floating table of contents is hidden, protocol grid drops to
  two columns) and `760px` (single-column layouts, smaller type and paddings, leaderboard chart
  logos and GMT labels dropped, control rows wrap).
- The page shell is `min(960px, 100% - 32px)`; wide tables scroll horizontally inside their own
  card rather than stretching the page. Below ~760px the page itself can scroll horizontally,
  because the Resources grid column and the Results footnote do not shrink below their content
  width.
- Hover is treated as polish: every interaction is also readable and operable without it.

## Accessibility

- Practical WCAG AA-minded baseline: dark text on light ground, no low-contrast overlays.
- Visible focus styles on all links and controls (`2px` warm outline, offset).
- Landmark sections, a labelled table-of-contents `nav`, `alt` text on figures, descriptive
  link labels.
- Leaderboard semantics: ARIA tablist for views, radiogroup for the GMT filter, roving tab
  index, a polite live region announcing each redraw, and focus moved to a row when a bar
  jumps to it.
- Motion and transparency respect `prefers-reduced-motion` and `prefers-reduced-transparency`.

## Interaction states

- **Loading** — video cards carry a shimmer placeholder until the first frame is ready.
- **Error** — a video that fails to load resolves the same placeholder, leaving the layout
  intact.
- **Success** — external links state their destination and open in a new tab.
- **Empty** — every GMT filter option matches entries in the shipped data, so the leaderboard
  tables never render an empty state.
- **No JavaScript** — the page keeps its headings and prose; the collections, media, downloads
  and leaderboard do not render, and a `.page-notice` in a `<noscript>` says so.

## Content voice

Concise, technical, research-lab tone. Terminology follows the paper draft: benchmark,
egocentric, HOI/HSI, GMT, teleoperation, perturbation-conditioned evaluation, in-GMT and
cross-GMT. Prefer short claim lines and concrete nouns; avoid hype adjectives.

## Implementation constraints

- Plain HTML and CSS with ES modules loaded straight from `js/`; no framework, no build step, no
  shipped dependencies.
- Static relative paths only, so the page can be served from any directory.
- Because the scripts are modules, the page must be served over HTTP — the local preview server
  in the [README](../README.md), not a `file://` path.
- Styling keeps to the tokens in `css/base.css`; component rules live in `css/components.css`,
  layout and grids in `css/layout.css`.
- The page is checked by a test suite rather than by eye: see [Verification](#verification).

## Where the content lives

`index.html` holds the shell, the section frames and the prose that appears once. Repeated
collections are tables in the JavaScript modules and are rendered into `[data-render]`
containers on load, so a repeated block is written once. The trade is explicit: **the page now
needs JavaScript** for its media, downloads and tables.

The division is deliberate rather than total. Long prose — the abstract, the four pipeline
stages — stays in markup, where it is legible as HTML and readable by anything that does not run
scripts. Only structure is generated. `docs/page.md` describes the contract and the content
tables.

## Media delivery

Clips are treated as footage rather than decoration, which means two rules that are easy to break
by accident:

- **Nothing is fetched until it is nearly on screen.** Every card renders with `preload="none"`
  and no `autoplay`; `js/media.js` starts a clip as it approaches the viewport and pauses it on
  the way out. Without this the page requests tens of megabytes of video while the reader is
  still looking at the hero.
- **A side-by-side group plays as one clip.** The pair waits for its longest member to finish,
  holding the finished one on its last frame, and only then restarts everything together. The
  durations differ a lot — the Football success/failure pair is 20.8 s against 64.0 s — so
  independent loops would leave the two sides showing different moments within one cycle, which
  is the one thing a comparison must never do.

Anything whose box is sized from the media itself has to state that size in CSS instead, because
a lazy clip has no intrinsic dimensions until it loads. `.inline-media-grid-recording` is the
place this applies.

## Verification

There is no manual checklist: `npm run check` runs lint, markup validation and the page suite,
and the same command is what CI runs on every pull request.

| Suite | Asserts |
| --- | --- |
| `tests/render.spec.js` | The exact contents of every collection; that each table-of-contents link resolves; that clips start lazy and no group keeps its own loop; that the leaderboard controls re-render with a clean console; layout within tolerance at 1280/1080/760; and the asset weight budget |
| `tests/accessibility.spec.js` | No serious or critical axe violations |
| `tests/links.spec.js` | Every outgoing link answers — scheduled rather than gating, since it needs the live internet |

`tests/baseline.json` holds the expected numbers. The counts are exact and platform-independent;
the layout figures are a band, because font metrics differ between machines. A change that
legitimately moves them updates that file in the same commit.

The asset budget is the cheap half of a Lighthouse run and the half that actually applies here:
`maxFileBytes` sits just above the current heaviest file, so it clears what ships today and still
fails an oversized newcomer — it was written for a 14 MB clip that was re-encoded to 3.9 MB. The
budget only moves in the direction of smaller assets.

## Deployment

GitHub Pages allows a repository one site, so `.github/workflows/static.yml` publishes both
branches as one artifact rather than as two deployments:

| Branch | Served at | URL |
| --- | --- | --- |
| `main` | `/` | <https://humanoidarena.github.io> |
| `dev` | `/dev/` | <https://humanoidarena.github.io/dev/> |

Each run checks out both branches and rebuilds the pair, so a push to either branch republishes
both halves: the preview can never blank the live page, and a live push can never drop the
preview. Serving the same files from `/` and from `/dev/` is what the relative-path constraint
above buys.

The `/dev/` copy carries a fixed corner badge, added by
`.github/scripts/mark-dev-preview.py` at deploy time rather than committed, so the preview is
never mistaken for the live page and the two branches' page sources stay identical.
