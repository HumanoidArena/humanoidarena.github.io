# HumanoidArena — Project Page

The source of <https://humanoidarena.github.io>: one static page presenting the benchmark, its
seven leg-critical HOI/HSI tasks, the pipeline, the evaluation protocols and the leaderboard.

No build step. `index.html` holds the shell, the section frames and the prose that appears once;
the repeated blocks — task rows, protocol cards, result scenarios, resource cards, the contents —
are tables in `js/` rendered into the page on load. Styles are in `css/`.

- [`docs/page.md`](docs/page.md) — the sections, the content tables, and the rendering contract
- [`docs/leaderboard.md`](docs/leaderboard.md) — the leaderboard's data and views
- [`docs/assets.md`](docs/assets.md) — the media inventory and its conventions
- [`docs/design.md`](docs/design.md) — the design intent and the constraints the page holds to

## Local preview

The scripts are ES modules, so the page needs to be served over HTTP. Opening `index.html` from
the filesystem will not work.

```sh
npm run serve     # python3 -m http.server 4173, then open http://127.0.0.1:4173
```

## Tooling

Nothing in `package.json` ships; the published site is plain files served from the repository.

```sh
npm ci            # once
npm run check     # lint + markup validation + the rendered-page suite
npm test          # just the rendered-page and accessibility suites
npm run lint      # eslint over js/
npm run validate  # html-validate over index.html
```

| Check | Where | Catches |
| --- | --- | --- |
| ESLint | `eslint.config.js` | A typo'd import or a bug in `js/`, which would otherwise surface only in the browser console |
| html-validate | `.htmlvalidate.json` | Malformed markup in `index.html` |
| Rendered page | `tests/render.spec.js` | A section that failed to render, a broken contents anchor, a console error from the leaderboard controls, a layout change beyond tolerance at any breakpoint, an asset over the weight budget |
| Accessibility | `tests/accessibility.spec.js` | Serious or critical axe violations |
| Links | `.github/workflows/link-check.yml` | A dataset or paper link that has started 404ing |

`tests/baseline.json` records what the page must contain and how tall it should be. A change that
legitimately alters those numbers updates that file in the same commit.

## Automation

| Workflow | Runs on | Does |
| --- | --- | --- |
| `checks.yml` | every pull request, and pushes to `main`/`dev` | lint, markup validation, the rendered-page suite, axe |
| `static.yml` | pushes to `main`/`dev` | publishes the site |
| `link-check.yml` | weekly, and on demand | checks every outgoing link |

`main` requires the two `checks.yml` jobs, linear history and no force-push, so publishing goes
through a pull request. Dependabot (`.github/dependabot.yml`) moves the action versions and the
development dependencies monthly.

## Deploy

Both branches are published by one workflow, which always rebuilds them together:

| Branch | URL | |
| --- | --- | --- |
| `main` | <https://humanoidarena.github.io> | the live page |
| `dev` | <https://humanoidarena.github.io/dev/> | preview, marked with a corner badge |

Because GitHub Pages allows a single site per repository, the `dev` preview is a subdirectory of
the same site rather than a second deployment. Work on the page on `dev`, check the preview, then
publish by opening a pull request from `dev` to `main` and **rebase-merging** it — `main` requires
linear history, and a rebase keeps `main` a fast-forward of `dev`.

The deploy strips the development files, so `package.json`, `tests/`, `.github/` and the tooling
configs are never published.

## Links

- Page — <https://humanoidarena.github.io>
- Code — <https://github.com/William-wAng618/HumanoidArena>
