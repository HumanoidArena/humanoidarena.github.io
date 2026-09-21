# HumanoidArena — Project Page

The source of <https://humanoidarena.github.io>: one static page presenting the benchmark, its
seven leg-critical HOI/HSI tasks, the pipeline, the evaluation protocols and the leaderboard.

No build step. `index.html` holds the shell, the section frames and the prose that appears once;
the repeated blocks — task rows, protocol cards, result scenarios, resource cards, the contents —
are tables in `js/` rendered into the page on load. Styles are in `css/`. See
[`docs/page.md`](docs/page.md) for the layout and the content tables, and
[`docs/leaderboard.md`](docs/leaderboard.md) for the leaderboard's data and views.

## Local preview

The scripts are ES modules, so the page needs to be served over HTTP — opening `index.html`
directly from the filesystem will not work.

```sh
npm run serve                  # python3 -m http.server 4173
# then open http://127.0.0.1:4173
```

## Tooling

Nothing in `package.json` ships. It exists so the page can be checked and tested, and the
published site is still plain files served straight from the repository.

```sh
npm ci          # once
npm run check   # lint + markup validation + the rendered-page suite
npm test        # just the rendered-page and accessibility suites
npm run lint    # eslint over js/
npm run validate  # html-validate over index.html
npm run test:links  # every outgoing link, against the live internet
```

| What | Where | Catches |
| --- | --- | --- |
| ESLint | `eslint.config.js` | A typo'd import or an unused binding in `js/`, which would otherwise only show in the browser console |
| html-validate | `.htmlvalidate.json` | Malformed markup in `index.html` |
| Render contract | `tests/render.spec.js` | A section that failed to render, a broken table-of-contents anchor, a console error from the leaderboard controls, a layout change beyond tolerance at any breakpoint, an asset over the weight budget |
| Accessibility | `tests/accessibility.spec.js` | Serious or critical axe violations |
| Link check | `tests/links.spec.js` | A dataset or paper link that has started 404ing |

`tests/baseline.json` records what the page must contain and how tall it should be. When a change
legitimately alters the page's own size or contents, update that file in the same commit and say
so in the pull request.

The link check is the one suite that talks to the internet, so it runs on a weekly schedule
(`.github/workflows/link-check.yml`) rather than gating pull requests. Some networks block
Hugging Face and Google Drive outright; expect those links to be reported as unreachable if you
run it from one of them.

## Continuous integration

| Workflow | Runs on | Does |
| --- | --- | --- |
| `checks.yml` | every pull request, and pushes to `main`/`dev` | lint, markup validation, the rendered-page suite, axe, and a dry run of the deploy's artifact assembly |
| `static.yml` | pushes to `main`/`dev` | publishes the site |
| `link-check.yml` | weekly, and on demand | checks the outgoing links and opens an issue if one rots |

Actions are pinned to commit SHAs; Dependabot (`.github/dependabot.yml`) keeps those SHAs and the
development dependencies current, monthly and grouped.

## Deploy

Both branches are published by one workflow, which always rebuilds them together:

| Branch | URL | |
| --- | --- | --- |
| `main` | <https://humanoidarena.github.io> | the live page |
| `dev` | <https://humanoidarena.github.io/dev/> | preview, marked with a corner badge |

Because GitHub Pages allows a single site per repository, the `dev` preview is a
subdirectory of the same site rather than a second deployment. Work on the page on `dev`,
check it at the preview URL, then merge `main` to publish. The deploy strips the development
files — `package.json`, `tests/`, `.github/` and the tooling configs — so none of them is
published.

## Links

- Page — <https://humanoidarena.github.io>
- Code — <https://github.com/William-wAng618/HumanoidArena>

Working notes on the page itself are in [`docs/`](docs/).
