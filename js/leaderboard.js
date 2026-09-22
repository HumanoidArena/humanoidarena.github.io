/**
 * Leaderboard: the paper's in-GMT evaluation, its three views, and the GMT filter.
 *
 * `VIEWS` carries each view's label, columns and cells, so the tabs, the panel markup and
 * the rows cannot disagree about what a column is. Everything else derives from it.
 * See `docs/leaderboard.md`.
 */

import { cls, esc } from "./dom.js";

// ── Data ─────────────────────────────────────────────────────────────────────

// Source: paper Table 1 (in-GMT evaluation, success rate in %, 60 episodes =
// 3 seeds x 20 trials). Task values are [mean, standard deviation]; hoiAvg /
// hsiAvg are the paper's printed suite averages — optional, and recomputed from
// the task values when omitted. Overall is always computed here.
const LB_UPDATED = "2026-09-21";

// One object per policy family. `logo` is the cited paper's first author's institution.
const LB_MODELS = {
  act: {
    name: "ACT",
    cite: "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware",
    logo: "./assets/images/orgs/stanford.svg",
    logoTitle: "Stanford University",
    paper: "https://arxiv.org/abs/2304.13705",
    repo: "https://github.com/tonyzhaozh/aloha",
  },
  dp: {
    name: "DP",
    cite: "Diffusion Policy: Visuomotor Policy Learning via Action Diffusion",
    logo: "./assets/images/orgs/columbia.svg",
    logoTitle: "Columbia University (first author)",
    paper: "https://arxiv.org/abs/2303.04137",
    repo: "https://github.com/real-stanford/diffusion_policy",
  },
  fm: {
    name: "FM",
    cite: "Large Behavior Models and Atlas Find New Footing",
    logo: "./assets/images/orgs/boston-dynamics.svg",
    logoTitle: "Boston Dynamics",
    paper: "https://bostondynamics.com/blog/large-behavior-models-atlas-find-new-footing/",
    repo: "",
  },
  pi05: {
    name: "π0.5",
    cite: "π0.5: a vision-language-action model with open-world generalization",
    logo: "./assets/images/orgs/physical-intelligence.png",
    logoTitle: "Physical Intelligence",
    paper: "https://arxiv.org/abs/2504.16054",
    repo: "",
  },
};

const LB_ENTRIES = [
  {
    model: "act", gmt: "TWIST2", afr: 6.43, hoiAvg: 28.33, hsiAvg: 47.08,
    tasks: {
      football: [26.7, 6.2], doubledesk: [15.0, 8.2], ppbox: [43.3, 8.5],
      opendoor: [50.0, 4.1], sitsofa: [66.7, 10.3], boxing: [58.3, 10.3], visnavi: [13.3, 4.7],
    },
  },
  {
    model: "dp", gmt: "TWIST2", afr: 10.48, hoiAvg: 35.56, hsiAvg: 55.83,
    tasks: {
      football: [46.7, 6.2], doubledesk: [10.0, 4.1], ppbox: [50.0, 0.0],
      opendoor: [68.3, 6.2], sitsofa: [73.3, 6.2], boxing: [51.7, 11.8], visnavi: [30.0, 4.1],
    },
  },
  {
    model: "fm", gmt: "TWIST2", afr: 7.38, hoiAvg: 36.11, hsiAvg: 58.75,
    tasks: {
      football: [53.3, 8.5], doubledesk: [16.7, 8.5], ppbox: [38.3, 8.5],
      opendoor: [76.7, 2.4], sitsofa: [68.3, 6.2], boxing: [63.3, 9.4], visnavi: [26.7, 20.9],
    },
  },
  {
    model: "pi05", gmt: "TWIST2", afr: 3.33, hoiAvg: 25.0, hsiAvg: 38.33,
    tasks: {
      football: [26.7, 4.7], doubledesk: [1.7, 2.4], ppbox: [46.7, 8.5],
      opendoor: [28.3, 9.4], sitsofa: [60.0, 4.1], boxing: [51.7, 8.5], visnavi: [13.3, 8.5],
    },
  },
  {
    model: "act", gmt: "SONIC", afr: 8.57, hoiAvg: 30.56, hsiAvg: 60.42,
    tasks: {
      football: [16.7, 6.2], doubledesk: [18.3, 4.7], ppbox: [56.7, 6.2],
      opendoor: [78.3, 9.4], sitsofa: [73.3, 8.5], boxing: [56.7, 6.2], visnavi: [33.3, 2.4],
    },
  },
  {
    model: "dp", gmt: "SONIC", afr: 8.33, hoiAvg: 52.22, hsiAvg: 65.83,
    tasks: {
      football: [45.0, 10.8], doubledesk: [36.7, 4.7], ppbox: [75.0, 4.1],
      opendoor: [85.0, 10.8], sitsofa: [78.3, 14.3], boxing: [76.7, 2.4], visnavi: [23.3, 6.2],
    },
  },
  {
    model: "fm", gmt: "SONIC", afr: 5.71, hoiAvg: 41.67, hsiAvg: 48.33,
    tasks: {
      football: [13.3, 2.4], doubledesk: [38.3, 4.7], ppbox: [73.3, 6.2],
      opendoor: [70.0, 4.1], sitsofa: [15.0, 7.1], boxing: [70.0, 8.2], visnavi: [38.3, 14.3],
    },
  },
  {
    model: "pi05", gmt: "SONIC", afr: 5.24, hoiAvg: 41.67, hsiAvg: 58.33,
    tasks: {
      football: [10.0, 4.1], doubledesk: [43.3, 6.2], ppbox: [71.7, 11.8],
      opendoor: [66.7, 6.2], sitsofa: [73.3, 2.4], boxing: [70.0, 0.0], visnavi: [23.3, 6.2],
    },
  },
];

/** The task keys behind each suite average, in column order. */
const SUITES = {
  hoi: ["football", "doubledesk", "ppbox"],
  hsi: ["opendoor", "sitsofa", "boxing", "visnavi"],
};

const TASK_LABELS = {
  football: "Football",
  doubledesk: "DoubleDesk",
  ppbox: "P&PBox",
  opendoor: "OpenDoor",
  sitsofa: "SitSofa",
  boxing: "Boxing",
  visnavi: "VisNavi",
};

// Tracker-specific class names, written out so searching components.css for a rule also
// finds the code that applies it. A tracker missing here renders without its colour.
const GMT_CLASSES = {
  TWIST2: { row: "lb-row--twist2", bar: "lb-chart-row--twist2", chip: "lb-gmt--twist2" },
  SONIC: { row: "lb-row--sonic", bar: "lb-chart-row--sonic", chip: "lb-gmt--sonic" },
};

function gmtClasses(gmt) {
  return GMT_CLASSES[gmt] || { row: "", bar: "", chip: "" };
}

// ── Formatting helpers ───────────────────────────────────────────────────────

const MEDALS = ["🥇", "🥈", "🥉"];

function meanOf(tasks, keys) {
  return keys.reduce((sum, key) => sum + tasks[key][0], 0) / keys.length;
}

function fmt(value, decimals) {
  return value.toFixed(decimals);
}

function slug(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function rankCell(rank) {
  const medal = MEDALS[rank - 1];
  if (medal) return `<td class="lb-rank lb-rank-top">${medal}</td>`;
  return `<td class="lb-rank">${rank}</td>`;
}

function logoImg(meta, extraClass) {
  if (!meta.logo) return "";
  return `<img class="${cls("lb-logo", extraClass)}" src="${esc(meta.logo)}" alt="" title="${esc(meta.logoTitle)}">`;
}

function modelCell(entry) {
  const meta = LB_MODELS[entry.model];
  const name = meta.paper
    ? `<a class="lb-model-link" href="${esc(meta.paper)}" target="_blank" rel="noopener noreferrer" ` +
      `title="${esc(meta.cite)}">${esc(meta.name)}</a>`
    : `<span class="lb-model-name">${esc(meta.name)}</span>`;
  const repo = meta.repo
    ? `<a class="lb-repo" href="${esc(meta.repo)}" target="_blank" rel="noopener noreferrer">code</a>`
    : "";
  return `<td class="lb-model-col"><div class="lb-model-cell">${logoImg(meta)}<div class="lb-model-line">${name}${repo}</div></div></td>`;
}

function gmtCell(entry) {
  return `<td class="lb-gmt-col"><span class="${cls("lb-gmt", gmtClasses(entry.gmt).chip)}">${esc(entry.gmt)}</span></td>`;
}

function numberCell(value, decimals, std, extraClass) {
  let html = `<span class="lb-value">${fmt(value, decimals)}</span>`;
  if (typeof std === "number") {
    html += `<span class="lb-std">&plusmn;${fmt(std, 1)}</span>`;
  }
  return `<td class="${cls("lb-num", extraClass)}">${html}</td>`;
}

function taskCell(entry, key) {
  return numberCell(entry.tasks[key][0], 1, entry.tasks[key][1]);
}

function rowId(viewKey, entry) {
  return `lb-row-${viewKey}-${slug(entry.model)}-${slug(entry.gmt)}`;
}

// ── Derived rows ─────────────────────────────────────────────────────────────

// A displayed average prefers the paper's printed value, so the page matches Table 1;
// the recomputed ("precise") one breaks ties between entries showing the same number.
const rows = LB_ENTRIES.map((entry) => {
  const hoiPrecise = meanOf(entry.tasks, SUITES.hoi);
  const hsiPrecise = meanOf(entry.tasks, SUITES.hsi);
  const hoi = typeof entry.hoiAvg === "number" ? entry.hoiAvg : hoiPrecise;
  const hsi = typeof entry.hsiAvg === "number" ? entry.hsiAvg : hsiPrecise;
  const total = SUITES.hoi.length + SUITES.hsi.length;
  return {
    entry,
    hoi,
    hsi,
    hoiPrecise,
    hsiPrecise,
    overall: (hoi * SUITES.hoi.length + hsi * SUITES.hsi.length) / total,
    overallPrecise: (hoiPrecise * SUITES.hoi.length + hsiPrecise * SUITES.hsi.length) / total,
  };
});

// ── Views ────────────────────────────────────────────────────────────────────
// One entry per view. `metric` is what the bars show and the table sorts by; its
// unrounded twin (`<metric>Precise`) breaks ties.

const RANK_COLUMN = { label: "Rank", cls: "lb-rank-col" };
const MODEL_COLUMN = { label: "Model", cls: "lb-model-col" };
const GMT_COLUMN = { label: "GMT", cls: "lb-gmt-col" };

/** A view for one task suite: a column per task, then the suite average. */
function suiteView({ key, label, suite, metric, averageLabel, caption }) {
  return {
    key,
    label,
    caption,
    chartAria: `${label} success rate comparison by policy and tracker`,
    columns: [RANK_COLUMN, MODEL_COLUMN, GMT_COLUMN]
      .concat(suite.map((taskKey) => ({ label: TASK_LABELS[taskKey], cls: "lb-num" })))
      .concat([{ label: averageLabel, cls: "lb-num" }]),
    metric: (row) => row[metric],
    tiebreak: (row) => row[`${metric}Precise`],
    cells: (row) =>
      suite.map((taskKey) => taskCell(row.entry, taskKey)).join("") +
      numberCell(row[metric], 2, undefined, "lb-emph"),
  };
}

const VIEWS = [
  {
    key: "overall",
    label: "Overall",
    chartAria: "Overall success rate comparison by policy and tracker",
    columns: [
      RANK_COLUMN,
      MODEL_COLUMN,
      GMT_COLUMN,
      { label: "HOI AVG", cls: "lb-num" },
      { label: "HSI AVG", cls: "lb-num" },
      { label: "Overall", cls: "lb-num" },
      { label: "AFR", cls: "lb-num" },
    ],
    metric: (row) => row.overall,
    tiebreak: (row) => row.overallPrecise,
    cells: (row) =>
      numberCell(row.hoi, 2) +
      numberCell(row.hsi, 2) +
      numberCell(row.overall, 2, undefined, "lb-emph") +
      numberCell(row.entry.afr, 2),
  },
  suiteView({
    key: "hoi",
    label: "HOI",
    suite: SUITES.hoi,
    metric: "hoi",
    averageLabel: "AVG",
    caption: "Human-Object Interaction (HOI) tasks — Football, DoubleDesk, P&PBox.",
  }),
  suiteView({
    key: "hsi",
    label: "HSI",
    suite: SUITES.hsi,
    metric: "hsi",
    averageLabel: "AVG",
    caption: "Human-Scene Interaction (HSI) tasks — OpenDoor, SitSofa, Boxing, VisNavi.",
  }),
];

// The GMT filter's options, in the same shape as VIEWS. `value` is the tracker slug the
// rows are matched on; the label is only what the reader sees. The first is the default.
const FILTERS = [
  { value: "all", label: "All" },
  { value: "twist2", label: "TWIST2" },
  { value: "sonic", label: "SONIC" },
];

// ── State ────────────────────────────────────────────────────────────────────

// Which bar is selected in each view. Remembered even while a filter hides it.
const selectedBar = {};

// The view on screen, so a filter change knows what to animate.
let activeViewKey = VIEWS[0].key;

// The GMT filter is global: it applies to every view, so switching views never changes
// which entries are on screen. Ranks are recomputed inside the filtered set.
let activeFilter = FILTERS[0].value;

function visibleRows() {
  if (activeFilter === "all") return rows;
  return rows.filter((row) => slug(row.entry.gmt) === activeFilter);
}

function prefersReducedMotion() {
  return Boolean(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
}

// ── Markup built once from VIEWS ─────────────────────────────────────────────

/**
 * Both controls are the same segmented control, so they share this: a track, a thumb,
 * and one button per option carrying its own ARIA state. Selection lives in that ARIA
 * state alone — `aria-selected` for the tablist, `aria-checked` for the radiogroup —
 * so the styles, the thumb and the keyboard handling all read the same source.
 */
function segmentMarkup(items, optionAttributes) {
  const thumb = `<span class="lb-seg-thumb" aria-hidden="true"></span>`;
  return (
    thumb +
    items
      .map((item, index) => {
        const selected = index === 0;
        return `<button class="lb-seg-item" type="button" ${optionAttributes(item, selected)}` +
          `${selected ? "" : ' tabindex="-1"'}>${esc(item.label)}</button>`;
      })
      .join("")
  );
}

const tabAttributes = (view, selected) =>
  `id="lb-tab-${view.key}" role="tab" aria-selected="${selected}" aria-controls="lb-panel-${view.key}"`;

const filterAttributes = (filter, selected) =>
  `role="radio" aria-checked="${selected}" data-gmt="${filter.value}"`;

function panelMarkup() {
  const columns = (view) =>
    view.columns.map((column) => `<th class="${column.cls}" scope="col">${esc(column.label)}</th>`).join("");

  return VIEWS.map((view, index) => `<div class="lb-panel" id="lb-panel-${view.key}" role="tabpanel" ` +
    `aria-labelledby="lb-tab-${view.key}"${index === 0 ? "" : " hidden"}>
        ${view.caption ? `<p class="lb-caption">${esc(view.caption)}</p>` : ""}
        <div class="lb-chart-card">
          <div class="lb-chart-head">
            <span class="lb-chart-head-label">Model</span>
            <span class="lb-chart-head-scale" aria-hidden="true"><i>0</i><i>50</i><i>100</i></span>
            <span class="lb-chart-head-label lb-chart-head-label--right">SR (%)</span>
          </div>
          <div class="lb-chart" id="lb-chart-${view.key}" role="group" aria-label="${esc(view.chartAria)}"></div>
        </div>
        <div class="lb-scroll">
          <table class="lb-table">
            <thead>
              <tr>${columns(view)}</tr>
            </thead>
            <tbody id="lb-body-${view.key}"></tbody>
          </table>
        </div>
      </div>`).join("");
}

// ── Row rendering ────────────────────────────────────────────────────────────

// One bar per entry on a fixed 0-100 SR scale, so the views stay comparable. Each bar is
// a button that jumps to its table row; `--lb-w` is the width and `--lb-i` the reveal
// stagger, so the bars grow in sequence when the chart first comes into view.
function chartRow(view, row, index) {
  const meta = LB_MODELS[row.entry.model];
  const score = view.metric(row);
  return `<button class="${cls("lb-chart-row", gmtClasses(row.entry.gmt).bar)}" type="button" ` +
    `data-target="${rowId(view.key, row.entry)}" style="--lb-w:${fmt(score, 2)}%;--lb-i:${index}" ` +
    `aria-label="${esc(meta.name)} (${esc(row.entry.gmt)}), ${fmt(score, 2)} percent. Jump to the table row.">` +
    `<span class="lb-chart-label">${logoImg(meta, "lb-logo--chart")}${esc(meta.name)}` +
    `<span class="lb-chart-gmt">${esc(row.entry.gmt)}</span></span>` +
    `<span class="lb-chart-track"><span class="lb-chart-fill"></span></span>` +
    `<span class="lb-chart-value">${fmt(score, 2)}</span>` +
    `</button>`;
}

function renderPanel(view) {
  // Ties break on the recomputed (unrounded) value, so the order is deterministic.
  const sorted = visibleRows()
    .slice()
    .sort((a, b) => {
      const diff = view.metric(b) - view.metric(a);
      return diff !== 0 ? diff : view.tiebreak(b) - view.tiebreak(a);
    });

  const chart = document.getElementById(`lb-chart-${view.key}`);
  if (chart) {
    chart.innerHTML = sorted.map((row, index) => chartRow(view, row, index)).join("");
  }

  const body = document.getElementById(`lb-body-${view.key}`);
  if (body) {
    body.innerHTML = sorted
      .map(
        (row, index) =>
          `<tr class="${cls("lb-row", gmtClasses(row.entry.gmt).row)}" id="${rowId(view.key, row.entry)}" tabindex="-1">` +
          rankCell(index + 1) +
          modelCell(row.entry) +
          gmtCell(row.entry) +
          view.cells(row) +
          `</tr>`
      )
      .join("");
  }

  restoreSelection(view);
}

/** Re-applies a view's selection after a redraw. */
function restoreSelection(view) {
  const id = selectedBar[view.key];
  if (!id) return;

  const row = document.getElementById(id);
  if (!row) return; // hidden by the current filter — remembered, not drawn

  row.classList.add("is-selected");
  const bar = document.querySelector(`#lb-chart-${view.key} [data-target="${id}"]`);
  if (bar) {
    bar.classList.add("is-selected");
    bar.setAttribute("aria-current", "true");
  }
}

function renderAllPanels() {
  VIEWS.forEach(renderPanel);
}

// ── Motion ───────────────────────────────────────────────────────────────────

// A redraw — a tab switch or a filter change — rises the view into place while its bars
// grow back, so a re-rank is visible rather than a silent swap. Skipped under reduced motion.
function redrawMotion(viewKey) {
  if (prefersReducedMotion()) return;

  const chart = document.getElementById(`lb-chart-${viewKey}`);
  if (chart) {
    chart.classList.remove("is-revealed");
    chart.classList.add("is-resetting");
    void chart.offsetWidth; // settle the bars at zero, unanimated
    chart.classList.remove("is-resetting");
    chart.classList.add("is-revealed"); // then let them grow back
  }

  const panel = document.getElementById(`lb-panel-${viewKey}`);
  if (panel) {
    panel.classList.remove("is-entering");
    void panel.offsetWidth;
    panel.classList.add("is-entering");
  }
}

// Grow the bars once, the first time a chart comes into view. A panel that starts hidden
// reveals when its tab is opened.
function revealChartsOnScroll() {
  const charts = Array.from(document.querySelectorAll(".lb-chart"));
  const reveal = (chart) => chart.classList.add("is-revealed");

  if (!("IntersectionObserver" in window)) {
    charts.forEach(reveal);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.25 }
  );

  charts.forEach((chart) => observer.observe(chart));
}

// ── Selection ────────────────────────────────────────────────────────────────

// Selecting a bar highlights its row and the bar, tinted with that entry's GMT colour,
// until another bar in the same panel is chosen or a filter drops the entry.
function selectRow(button, id, viewKey) {
  const target = document.getElementById(id);
  if (!target) return;

  const panel = target.closest ? target.closest(".lb-panel") : null;
  if (panel) {
    panel.querySelectorAll(".lb-row.is-selected, .lb-chart-row.is-selected").forEach((node) => {
      node.classList.remove("is-selected");
      node.removeAttribute("aria-current");
    });
  }

  if (viewKey) selectedBar[viewKey] = id;
  target.classList.add("is-selected");
  if (button) {
    button.classList.add("is-selected");
    button.setAttribute("aria-current", "true");
  }

  target.focus({ preventScroll: true });
  target.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "center" });
}

// ── Announcements ────────────────────────────────────────────────────────────

// The tables are drawn client-side, so a redraw is otherwise invisible to a screen reader.
function announce(prefix) {
  const live = document.getElementById("lb-live");
  if (!live) return;
  const tracker = activeFilter === "all" ? "both trackers" : activeFilter.toUpperCase();
  live.textContent = `${prefix} — ${visibleRows().length} entries, ${tracker}.`;
}

function activeViewName() {
  const view = VIEWS.find((candidate) => candidate.key === activeViewKey);
  return view ? `${view.label} view` : "View";
}

// ── The two segmented controls ───────────────────────────────────────────────

/**
 * Position a control's thumb under its selected item. Called without animation on first
 * paint, on resize and once the web font has settled the item widths; with animation when
 * the selection moves, so a change reads as one object moving rather than two
 * backgrounds swapping.
 */
function positionThumb(control, animate) {
  const thumb = control.querySelector(".lb-seg-thumb");
  const selected = control.querySelector('[aria-selected="true"], [aria-checked="true"]');
  if (!thumb || !selected) return;

  const apply = () => {
    thumb.style.width = `${selected.offsetWidth}px`;
    thumb.style.transform = `translateX(${selected.offsetLeft}px)`;
  };

  if (animate) {
    apply();
    return;
  }
  thumb.style.transition = "none";
  apply();
  void thumb.offsetWidth; // flush the jump before re-enabling movement
  thumb.style.transition = "";
}

/**
 * Make a segmented control behave: one item selected and in the tab order, the arrow keys
 * stepping through the rest, and `onSelect` told which index was chosen.
 */
function wireSegments(control, onSelect) {
  const items = Array.from(control.querySelectorAll(".lb-seg-item"));
  const stateAttribute = control.getAttribute("role") === "tablist" ? "aria-selected" : "aria-checked";

  const select = (index, focus) => {
    items.forEach((item, i) => {
      item.setAttribute(stateAttribute, i === index ? "true" : "false");
      item.tabIndex = i === index ? 0 : -1;
    });

    onSelect(index);
    positionThumb(control, !prefersReducedMotion());
    if (focus && items[index]) items[index].focus();
  };

  items.forEach((item, index) => {
    item.addEventListener("click", () => select(index, false));

    item.addEventListener("keydown", (event) => {
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
      let next = null;
      if (step) next = (index + step + items.length) % items.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = items.length - 1;

      if (next !== null) {
        event.preventDefault();
        select(next, true);
      }
    });
  });
}

function startControls(tabControl, filterControl) {
  tabControl.innerHTML = segmentMarkup(VIEWS, tabAttributes);
  filterControl.innerHTML = segmentMarkup(FILTERS, filterAttributes);

  const panels = VIEWS.map((view) => document.getElementById(`lb-panel-${view.key}`));

  wireSegments(tabControl, (index) => {
    panels.forEach((panel, i) => {
      if (panel) panel.hidden = i !== index;
    });
    activeViewKey = VIEWS[index].key;
    redrawMotion(activeViewKey);
    announce(activeViewName());
  });

  wireSegments(filterControl, (index) => {
    activeFilter = FILTERS[index].value;
    renderAllPanels();
    redrawMotion(activeViewKey);
    announce(activeViewName());
  });

  const reposition = () => {
    positionThumb(tabControl, false);
    positionThumb(filterControl, false);
  };

  reposition();
  window.addEventListener("resize", reposition);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(reposition);
  }
}

// ── Entry point ──────────────────────────────────────────────────────────────

export function startLeaderboard() {
  const panels = document.getElementById("lb-panels");
  const tabControl = document.getElementById("lb-tabs");
  const filterControl = document.getElementById("lb-filters");
  if (!panels || !tabControl || !filterControl) return;

  panels.innerHTML = panelMarkup();
  startControls(tabControl, filterControl);

  const updated = document.getElementById("lb-updated");
  if (updated) updated.textContent = LB_UPDATED;

  document.querySelectorAll(".lb-chart").forEach((chart) => {
    chart.addEventListener("click", (event) => {
      const button = event.target.closest ? event.target.closest(".lb-chart-row") : null;
      if (!button || !chart.contains(button)) return;
      selectRow(button, button.getAttribute("data-target"), chart.id.replace("lb-chart-", ""));
    });
  });

  renderAllPanels();
  revealChartsOnScroll();
}
