# Pull request

## What changes

<!-- One or two lines. What does the page do differently after this? -->

## Checks

The toolchain runs in CI, but these are the things it cannot see — run the page and
look at it before merging:

- [ ] `npm run check` passes locally
- [ ] The page is previewed **over HTTP** (`npm run serve`), not opened as a file: the
      scripts are ES modules and a `file://` path will render nothing
- [ ] Checked at a wide window (≥1280px), the 1080px breakpoint and a narrow one (<760px)
- [ ] The browser console is clean — the collections are client-rendered, so a thrown
      error blanks a section silently
- [ ] **Side-by-side clips still play as a pair.** A group waits for its longest clip and
      then restarts together; a clip left with its own `loop` will drift apart from its
      partner.
- [ ] If a number changed, it still matches the paper draft
- [ ] Any content table edited is reflected in the docs that describe it

## Deployment

Merging to `dev` republishes the preview at <https://humanoidarena.github.io/dev/>.
Merging to `main` publishes the live page. Both branches are rebuilt on every run, so
either push republishes both halves.
