/**
 * The leaderboard's content: the numbers, what a view is, the filter options, and how a value
 * becomes a cell. Nothing here touches the document.
 *
 * `VIEWS` carries each view's columns, metric and cell builders, so the tabs, the panel markup
 * and the rows cannot disagree about what a column is. See `docs/leaderboard.md`.
 */

import { TASK_NAMES } from "../content.js";
import { cls, esc } from "../dom.js";

// Source: paper Table 1 (in-GMT evaluation, success rate in %, 60 episodes =
// 3 seeds x 20 trials). Task values are [mean, standard deviation]; hoiAvg /
// hsiAvg are the paper's printed suite averages — optional, and recomputed from
// the task values when omitted. Overall is always computed here.
export const LB_UPDATED = "2026-09-30";

// One object per policy family. `logo` is the cited paper's first author's institution.
export const LB_MODELS = {
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
    repo: "https://github.com/Physical-Intelligence/openpi",
  },
  wbwam: {
    name: "WB-WAM",
    cite: "WB-WAM: Heterogeneous Body-Hand Pre-training for Humanoid Loco-Manipulation",
    logo: "./assets/images/orgs/tsinghua.svg",
    logoTitle: "Tsinghua University (first author)",
    paper: "https://arxiv.org/abs/2609.34199",
    repo: "https://github.com/WB-WaM/WB-WAM-Official",
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
  // WB-WAM (arXiv:2609.34199) evaluates on the benchmark under the same in-GMT protocol, with
  // SONIC for both demonstration collection and execution. Its paper reports no fall rate and
  // prints no suite averages, so both come from the task cells.
  {
    model: "wbwam", gmt: "SONIC",
    tasks: {
      football: [70.0, 8.2], doubledesk: [65.0, 4.1], ppbox: [86.7, 2.4],
      opendoor: [98.3, 2.4], sitsofa: [95.0, 4.1], boxing: [81.7, 2.4], visnavi: [76.7, 4.7],
    },
  },
];

/** The task keys behind each suite average, in column order. */
const SUITES = {
  hoi: ["football", "doubledesk", "ppbox"],
  hsi: ["opendoor", "sitsofa", "boxing", "visnavi"],
};

// Tracker-specific class names, written out so searching components.css for a rule also finds
// the code that applies it. A tracker missing here renders without its colour.
const GMT_CLASSES = {
  TWIST2: { row: "lb-row--twist2", bar: "lb-chart-row--twist2", chip: "lb-gmt--twist2" },
  SONIC: { row: "lb-row--sonic", bar: "lb-chart-row--sonic", chip: "lb-gmt--sonic" },
};

export function gmtClasses(gmt) {
  return GMT_CLASSES[gmt] || { row: "", bar: "", chip: "" };
}

// ── Cell builders ────────────────────────────────────────────────────────────

const MEDALS = ["🥇", "🥈", "🥉"];

function fmt(value, decimals) {
  return value.toFixed(decimals);
}

export function slug(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function rankCell(rank) {
  const medal = MEDALS[rank - 1];
  if (medal) return `<td class="lb-rank lb-rank-top">${medal}</td>`;
  return `<td class="lb-rank">${rank}</td>`;
}

export function logoImg(meta, extraClass) {
  if (!meta.logo) return "";
  return `<img class="${cls("lb-logo", extraClass)}" src="${esc(meta.logo)}" alt="" title="${esc(meta.logoTitle)}">`;
}

export function modelCell(entry) {
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

export function gmtCell(entry) {
  return `<td><span class="${cls("lb-gmt", gmtClasses(entry.gmt).chip)}">${esc(entry.gmt)}</span></td>`;
}

export function numberCell(value, decimals, std, extraClass) {
  // A number the source does not report renders as a dash rather than a guess.
  if (typeof value !== "number") {
    return `<td class="${cls("lb-num", extraClass)}"><span class="lb-value">&mdash;</span></td>`;
  }
  let html = `<span class="lb-value">${fmt(value, decimals)}</span>`;
  if (typeof std === "number") {
    html += `<span class="lb-std">&plusmn;${fmt(std, 1)}</span>`;
  }
  return `<td class="${cls("lb-num", extraClass)}">${html}</td>`;
}

export function taskCell(entry, key) {
  return numberCell(entry.tasks[key][0], 1, entry.tasks[key][1]);
}

export function rowId(viewKey, entry) {
  return `lb-row-${viewKey}-${slug(entry.model)}-${slug(entry.gmt)}`;
}

// ── Derived rows ─────────────────────────────────────────────────────────────

function meanOf(tasks, keys) {
  return keys.reduce((sum, key) => sum + tasks[key][0], 0) / keys.length;
}

// A displayed average prefers the paper's printed value, so the page matches Table 1; the
// recomputed ("precise") one breaks ties between entries showing the same number.
export const rows = LB_ENTRIES.map((entry) => {
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

/** The rows a filter shows, in data order. `"all"` keeps every entry. */
export function rowsFor(filterValue) {
  if (filterValue === "all") return rows;
  return rows.filter((row) => slug(row.entry.gmt) === filterValue);
}

// ── Views and filters ────────────────────────────────────────────────────────
// One view per entry. `metric` is what the bars show and the table sorts by; its unrounded
// twin (`<metric>Precise`) breaks ties.

const RANK_COLUMN = { label: "Rank" };
const MODEL_COLUMN = { label: "Model", cls: "lb-model-col" };
const GMT_COLUMN = { label: "GMT" };

/** A view for one task suite: a column per task, then the suite average. */
function suiteView({ key, label, suite, metric, averageLabel, caption }) {
  return {
    key,
    label,
    caption,
    chartAria: `${label} success rate comparison by policy and tracker`,
    columns: [RANK_COLUMN, MODEL_COLUMN, GMT_COLUMN]
      .concat(suite.map((taskKey) => ({ label: TASK_NAMES[taskKey], cls: "lb-num" })))
      .concat([{ label: averageLabel, cls: "lb-num" }]),
    metric: (row) => row[metric],
    tiebreak: (row) => row[`${metric}Precise`],
    cells: (row) =>
      suite.map((taskKey) => taskCell(row.entry, taskKey)).join("") +
      numberCell(row[metric], 2, undefined, "lb-emph"),
  };
}

export const VIEWS = [
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

// The GMT filter's options, in the same shape as VIEWS. `value` is the tracker slug the rows
// are matched on; the label is only what the reader sees. The first is the default.
export const FILTERS = [
  { value: "all", label: "All" },
  { value: "twist2", label: "TWIST2" },
  { value: "sonic", label: "SONIC" },
];
