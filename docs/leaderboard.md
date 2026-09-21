# Leaderboard

The leaderboard ranks policy–tracker pairs on the paper's in-GMT evaluation. It lives in the
`#leaderboard` section of `index.html` and is rendered in the browser from two data arrays in
the same file, so adding an entry is a data edit — no markup, no build.

Data provenance: every entry is an in-GMT baseline reported in the paper, measured as success
rate over 60 episodes (3 seeds × 20 trials) under matched training and inference GMTs. The
numbers are the paper's; treat the paper draft as the source of truth.

## On the page

```
#leaderboard
  .lb-meta                     "Updated <date>"
  .lb-controls
    .lb-tabs                   views:      Overall | HOI | HSI
    .lb-filter                 GMT filter: All | TWIST2 | SONIC
  .lb-live                     screen-reader announcements (visually hidden)
  .lb-panels
    .lb-panel#lb-panel-overall
      .lb-caption              (HOI and HSI panels only)
      .lb-chart-card
        .lb-chart-head         scale row: Model · 0 · 50 · 100 · SR (%)
        .lb-chart#lb-chart-overall
      .lb-scroll > table.lb-table
        tbody#lb-body-overall   rows rendered here
```

| Element | Id |
| --- | --- |
| View tabs | `lb-tab-overall`, `lb-tab-hoi`, `lb-tab-hsi` |
| Panels | `lb-panel-overall`, `lb-panel-hoi`, `lb-panel-hsi` |
| Charts | `lb-chart-overall`, `lb-chart-hoi`, `lb-chart-hsi` |
| Table bodies | `lb-body-overall`, `lb-body-hoi`, `lb-body-hsi` |
| Rows | `lb-row-<view>-<model>-<gmt>`, e.g. `lb-row-overall-dp-sonic` |
| GMT filter buttons | `[data-gmt="all" \| "twist2" \| "sonic"]` |
| Live region, date | `lb-live`, `lb-updated` |

## Data

`LB_UPDATED` is the date printed above the controls — set it when the numbers change.

`LB_MODELS` — one object per policy family:

| Field | Meaning |
| --- | --- |
| `name` | Display name (`ACT`, `DP`, `FM`, `π0.5`) |
| `cite` | Full title, shown as the hover tooltip on the name |
| `logo`, `logoTitle` | Institution mark in `assets/images/orgs/` and the name shown in its tooltip. Marks follow the first author's institution |
| `paper` | Link for the model name |
| `repo` | Optional repository link, rendered as a small `code` pill |

`LB_ENTRIES` — one object per evaluated policy–tracker pair:

| Field | Meaning |
| --- | --- |
| `model` | Key into `LB_MODELS` |
| `gmt` | `TWIST2` or `SONIC` |
| `afr` | Average fall rate in % (lower is better) |
| `hoiAvg`, `hsiAvg` | Optional. The paper's printed suite averages; when present they are what the table shows |
| `tasks` | One entry per task, `[mean, std]` in % SR |

Task keys group into two suites: `football`, `doubledesk`, `ppbox` are HOI; `opendoor`,
`sitsofa`, `boxing`, `visnavi` are HSI. All seven must be present in every entry.

## Derived values and display rules

| Value | Rule |
| --- | --- |
| HOI AVG / HSI AVG | Mean of that suite's task means, unless `hoiAvg` / `hsiAvg` is given |
| Overall | `(3 × HOI AVG + 4 × HSI AVG) / 7` — the mean success rate across all seven tasks |
| Ranks | Recomputed per view *and* per filter, so a TWIST2-only table ranks 1–4 among TWIST2 entries. Ties break on the recomputed (unrounded) average, keeping order deterministic |
| Medals | Ranks 1–3 show 🥇🥈🥉 |
| Precision | Task cells one decimal with `±` standard deviation; suite averages, Overall and AFR two decimals |
| Bar length | The view's own metric on a fixed 0–100 SR scale, with a 50 % tick, coloured by GMT |

Storing `hoiAvg` / `hsiAvg` is what keeps a displayed average identical to the paper's printed
one; the recomputed average orders entries that print the same number.

## Behaviour

**Views.** `Overall`, `HOI` and `HSI` are an ARIA tablist: click or arrow-key, one panel
visible at a time, inactive tabs removed from the tab order.

**GMT filter.** `All`, `TWIST2`, `SONIC` are an ARIA radiogroup; the selection is carried by a
thumb that slides between segments (positioned without animating on first paint, on resize, and
once the web font has loaded). The filter is global — it applies to every view at once, so
switching views never changes which entries are on screen. Changing it re-renders every view,
re-ranks inside the filtered set and redraws the charts.

**Charts.** Bars grow in sequence the first time a chart scrolls into view, and whenever a view
switch or filter change redraws it. Each bar is a button: choosing one scrolls its table row
into view, moves focus there, and leaves both the bar and the row tinted with the entry's GMT
colour until another bar in that view is chosen. A row selected before a filter hid it is
remembered and re-highlighted when it becomes visible again.

**Motion.** Redraws share one vocabulary — the panel rises in while its bars grow back, on a
critically damped curve with no bounce. Under `prefers-reduced-motion` the growth, the thumb
slide and the rise are dropped for an instant state or a short cross-fade; under
`prefers-reduced-transparency` the chart card and logo tiles become solid.

**Announcements.** Every view switch and filter change writes a sentence such as
"Overall view — 4 entries, TWIST2." into the `aria-live` region, because a client-rendered
redraw is otherwise invisible to screen readers.

## Adding or changing an entry

1. **New policy family** — add an object to `LB_MODELS` with `name`, `cite`, `logo`,
   `logoTitle`, `paper` and an optional `repo`. Put the mark in `assets/images/orgs/` (square
   tile, see [assets.md](assets.md)).
2. **New result** — add an object to `LB_ENTRIES`: the model key, the GMT, `afr`, the seven
   `tasks` as `[mean, std]`, and `hoiAvg` / `hsiAvg` if the paper prints suite averages for it.
3. **Changed numbers** — edit them in place; suite averages, Overall, ranks, medals and bar
   lengths are all recomputed on load, so nothing else needs updating.
4. **Set `LB_UPDATED`** to the date of the change.

Reported numbers must come from the same protocol as the rest of the table (in-GMT, 60
episodes per entry), otherwise the column is not comparable.
