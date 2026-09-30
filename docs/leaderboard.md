# Leaderboard

The leaderboard ranks policy–tracker pairs on the benchmark's in-GMT evaluation: success rate over
60 episodes (3 seeds × 20 trials), trained and evaluated with the same tracker. Entries come from
the benchmark's own paper and from papers that evaluate on it; each one names its source through
its model's `paper` link. Adding an entry is a data edit — no markup, no build.

Four modules, by what each is for:

| File | Holds |
| --- | --- |
| `js/leaderboard/data.js` | The numbers, what a view is, the filter options, and how a value becomes a cell. Nothing here touches the document |
| `js/leaderboard/panels.js` | Painting: the panel skeleton, the chart bars, the table rows, the selection highlight, the motion |
| `js/leaderboard/control.js` | The segmented control that both the view switcher and the filter are built from |
| `js/leaderboard/index.js` | The two choices a reader makes, the announcements they produce, and the entry point |

`index.html` provides the heading, two empty containers (`#lb-tabs`, `#lb-filters`) and the table
legend. Everything else is rendered.

## The DOM contract

```
#lb-panels                       one .lb-panel per view
  .lb-panel#lb-panel-overall     .lb-caption on the suite views only
    .lb-chart-card
      .lb-chart-head             scale row: Model · 0 · 50 · 100 · SR (%)
      .lb-chart#lb-chart-overall
    .lb-scroll > table.lb-table
      thead                      one <th> per entry in the view's `columns`
      tbody#lb-body-overall      rows rendered here
```

| Element | Id / selector |
| --- | --- |
| Controls | `lb-tabs` (views), `lb-filters` (GMT) |
| View tabs | `lb-tab-overall`, `lb-tab-hoi`, `lb-tab-hsi` |
| Filter options | `[data-gmt="all" \| "twist2" \| "sonic"]` |
| Panels / charts / table bodies | `lb-panel-<view>`, `lb-chart-<view>`, `lb-body-<view>` |
| Rows | `lb-row-<view>-<model>-<gmt>`, e.g. `lb-row-overall-dp-sonic` |
| Live region, date | `lb-live`, `lb-updated` |

Ids are derived as `lb-<kind>-<view key>`, so a new view needs no id bookkeeping.

## The data

`LB_UPDATED` is the date above the controls and the only copy of it. Both tables below live in
`data.js`; `VIEWS` and `FILTERS` there are read by the controls, the panels and the tables, so a
label is declared once.

`LB_MODELS` — one object per policy family:

| Field | Meaning |
| --- | --- |
| `name` | Display name (`ACT`, `DP`, `FM`, `π0.5`) |
| `cite` | Full title, shown as the hover tooltip on the name |
| `logo`, `logoTitle` | Optional. Institution mark in `assets/images/orgs/`, following the first author, and the name in its tooltip. An entry without one renders without a tile |
| `paper` | Link for the model name |
| `repo` | Optional repository link, rendered as a small `code` pill |

`LB_ENTRIES` — one object per evaluated policy–tracker pair:

| Field | Meaning |
| --- | --- |
| `model` | Key into `LB_MODELS` |
| `gmt` | `TWIST2` or `SONIC` |
| `afr` | Optional. Average fall rate in % (lower is better) |
| `hoiAvg`, `hsiAvg` | Optional. The paper's printed suite averages; when present they are what the table shows |
| `tasks` | All seven, `[mean, std]` in % SR |

Task keys group into two suites: `football`, `doubledesk`, `ppbox` are HOI; `opendoor`,
`sitsofa`, `boxing`, `visnavi` are HSI. `SUITES` holds those lists and `TASK_NAMES` the display
name of each key, so a column and its cells come from one place.

## Display rules

| Value | Rule |
| --- | --- |
| HOI AVG / HSI AVG | Mean of that suite's task means, unless `hoiAvg` / `hsiAvg` is given |
| Overall | `(3 × HOI AVG + 4 × HSI AVG) / 7` — the mean success rate across all seven tasks |
| Ranks | Recomputed per view *and* per filter, so a TWIST2-only table ranks 1–4 among TWIST2 entries. Ties break on the recomputed (unrounded) average, keeping order deterministic |
| Medals | Ranks 1–3 show 🥇🥈🥉 |
| Precision | Task cells one decimal with `±` standard deviation; suite averages, Overall and AFR two decimals |
| Bar length | The view's own metric on a fixed 0–100 SR scale, with a 50 % tick, coloured by GMT |
| Not reported | A number the source paper does not report renders as a dash. The page never fills a gap with a guess |

Storing `hoiAvg` / `hsiAvg` is what keeps a displayed average identical to the paper's printed one;
the recomputed average orders entries that print the same number.

## Tracker colours

`GMT_CLASSES` maps a tracker to the three class names it wears — its table row, its chart bar and
its GMT chip — written out rather than built from the tracker name, so searching `components.css`
for a rule also finds the code that applies it. A tracker missing from that table renders without
its colour instead of guessing one.

## Behaviour

**The two controls** are the same segmented control, distinguished only by the colour of the
thumb: the view switcher is an ARIA tablist showing one panel at a time, the filter an ARIA
radiogroup. Selection lives in the ARIA state alone — `aria-selected`, `aria-checked` — so the
styles, the thumb and the keyboard handling read one source. The thumb slides between segments;
the arrow keys and Home/End step through them.

**The filter is global**: it applies to every view at once, so switching views never changes which
entries are on screen. Changing it re-renders every view, re-ranks inside the filtered set and
redraws the charts.

**Charts.** Bars grow in sequence the first time a chart scrolls into view, and whenever a view
switch or filter change redraws it. Each bar is a button: choosing one scrolls its table row into
view, moves focus there, and leaves both tinted with the entry's GMT colour until another bar in
that view is chosen. A row selected before a filter hid it is remembered and re-highlighted when
it returns.

**Motion.** A redraw rises the panel in while its bars grow back, on a critically damped curve
with no bounce. Under `prefers-reduced-motion` the growth, the thumb slide and the rise are
dropped; under `prefers-reduced-transparency` the chart card and logo tiles become solid.

**Announcements.** Every view switch and filter change writes a sentence such as "Overall view —
4 entries, TWIST2." into the `aria-live` region, because a client-rendered redraw is otherwise
invisible to screen readers.

## Adding or changing an entry

1. **New policy family** — an object in `LB_MODELS`: `name`, `cite`, `paper`, an optional `repo`,
   and an optional `logo` / `logoTitle` once a cleared mark exists in `assets/images/orgs/`
   (square tile, see [assets.md](assets.md)).
2. **New result** — an object in `LB_ENTRIES`: the model key, the GMT, `afr` if the paper reports
   one, the seven `tasks` as `[mean, std]`, and `hoiAvg` / `hsiAvg` if it prints suite averages.
   All three are optional; WB-WAM reports none of them, so its suites and its Overall come from
   the task cells.
3. **Changed numbers** — edit them in place. Suite averages, Overall, ranks, medals and bar
   lengths are recomputed on load.
4. **Set `LB_UPDATED`** to the date of the change.
5. **New view or column** — a `VIEWS` entry. `columns` is the header and `cells` the body, so both
   change together; a suite view gets the pair from `suiteView()`, driven by `SUITES`.
6. **New tracker** — three edits: `FILTERS`, `GMT_CLASSES`, and its `--<tracker>` rules in
   `css/components.css`.

Reported numbers must come from the same protocol as the rest of the table (in-GMT, 60 episodes
per entry), otherwise the column is not comparable.
