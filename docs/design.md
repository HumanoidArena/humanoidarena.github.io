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

Hero, then eight sections: Abstract, Task gallery, Pipeline, Evaluation, Results, Leaderboard,
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
3. **Static and publication-friendly.** Plain HTML and CSS, relative paths, no build.
4. **State what the benchmark measured.** Numbers come from the paper's protocol, or they are
   not shown.

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
| Section frame | `.section`, `.section-heading`, `.eyebrow`, `.section-heading-compact`, `.footnote` |
| Hero | `.hero`, `.hero-copy`, `.author-block`, `.lede`, `.quick-links`, `.hero-metrics`, `.hero-media` |
| Media | `.media-card`, `.media-card-header`, `.media-frame`, `.media-loader`, `.task-media-pair`, `.example-video-pair` |
| Rows | `.task-row`, `.task-row-copy`, `.task-tag`, `.scenario-row`, `.scenario-copy` |
| Cards | `.paper-card`, `.stack-card`, `.pipeline-step-card`, `.protocol-card` (+ `-wide`), `.example-card` (+ `-wide`), `.resource-card` (+ `-inner`, `-copy`, `-actions`), `.bibtex-box` |
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
  intact; SVG figures and native video still work without JavaScript.
- **Success** — external links state their destination and open in a new tab.
- **Empty** — every GMT filter option matches entries in the shipped data, so the leaderboard
  tables never render an empty state.

## Content voice

Concise, technical, research-lab tone. Terminology follows the paper draft: benchmark,
egocentric, HOI/HSI, GMT, teleoperation, perturbation-conditioned evaluation, in-GMT and
cross-GMT. Prefer short claim lines and concrete nouns; avoid hype adjectives.

## Implementation constraints

- Plain HTML, CSS and three small inline scripts; no framework, no build, no dependencies.
- Static relative paths only, so the page can be served from any directory.
- Styling keeps to the tokens in `css/base.css`; component rules live in `css/components.css`,
  layout and grids in `css/layout.css`.
- Changes are verified by previewing over a local static server; there is no test suite.

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
