# HumanoidArena — Project Page

The source of <https://humanoidarena.github.io>: one static page (plain HTML and CSS, no build
step) presenting the benchmark, its seven leg-critical HOI/HSI tasks, the pipeline, the
evaluation protocols and the leaderboard.

## Local preview

```sh
python3 -m http.server 8000    # then open http://localhost:8000
```

## Deploy

Both branches are published by one workflow, which always rebuilds them together:

| Branch | URL | |
| --- | --- | --- |
| `main` | <https://humanoidarena.github.io> | the live page |
| `dev` | <https://humanoidarena.github.io/dev/> | preview, marked with a corner badge |

Because GitHub Pages allows a single site per repository, the `dev` preview is a
subdirectory of the same site rather than a second deployment. Work on the page on `dev`,
check it at the preview URL, then fast-forward `main` to publish.

## Links

- Page — <https://humanoidarena.github.io>
- Code — <https://github.com/William-wAng618/HumanoidArena>

Working notes on the page itself are in [`docs/`](docs/).
