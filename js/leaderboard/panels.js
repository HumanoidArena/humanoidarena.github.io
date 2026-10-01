/**
 * Painting the leaderboard: the panel skeleton, the chart bars, the table rows, the selection
 * highlight, and the motion that makes a re-rank visible. Everything that writes to the
 * document lives here.
 */

import { cls, esc, prefersReducedMotion } from "../dom.js";
import {
  LB_MODELS,
  VIEWS,
  gmtClasses,
  gmtCell,
  logoImg,
  modelCell,
  rankCell,
  rowId,
} from "./data.js";

// Which bar is selected in each view. Remembered even while a filter hides it, so filtering
// away and back restores it.
const selectedBar = {};

/** The panel skeleton: a caption, a chart and a table, one set per view. */
export function mountPanels(container) {
  const columns = (view) =>
    view.columns
      .map((column) => `<th${column.cls ? ` class="${column.cls}"` : ""} scope="col">${esc(column.label)}</th>`)
      .join("");

  container.innerHTML = VIEWS.map((view, index) => `<div class="lb-panel" id="lb-panel-${view.key}" role="tabpanel" ` +
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

// One bar per entry on a fixed 0-100 SR scale, so the views stay comparable. Each bar is a
// button that jumps to its table row; `--lb-w` is the width and `--lb-i` the reveal stagger,
// so the bars grow in sequence when the chart first comes into view.
function chartRow(view, row, index) {
  const meta = LB_MODELS[row.entry.model];
  const score = view.metric(row);
  return `<button class="${cls("lb-chart-row", gmtClasses(row.entry.gmt).bar)}" type="button" ` +
    `data-target="${rowId(view.key, row.entry)}" style="--lb-w:${score.toFixed(2)}%;--lb-i:${index}" ` +
    `aria-label="${esc(meta.name)} (${esc(row.entry.gmt)}), ${score.toFixed(2)} percent. Jump to the table row.">` +
    `<span class="lb-chart-label">${logoImg(meta, "lb-logo--chart")}${esc(meta.name)}` +
    `<span class="lb-chart-gmt">${esc(row.entry.gmt)}</span></span>` +
    `<span class="lb-chart-track"><span class="lb-chart-fill"></span></span>` +
    `<span class="lb-chart-value">${score.toFixed(2)}</span>` +
    `</button>`;
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

function renderPanel(view, visibleRows) {
  // Ties break on the recomputed (unrounded) value, so the order is deterministic.
  const sorted = visibleRows
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

/** Redraw every view from the rows the current filter leaves visible. */
export function renderPanels(visibleRows) {
  VIEWS.forEach((view) => renderPanel(view, visibleRows));
}

// A redraw — a tab switch or a filter change — rises the view into place while its bars grow
// back, so a re-rank is visible rather than a silent swap. Skipped under reduced motion.
export function redrawMotion(viewKey) {
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
export function revealChartsOnScroll() {
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

// Selecting a bar highlights its row and the bar, tinted with that entry's GMT colour, until
// another bar in the same panel is chosen or a filter drops the entry.
export function selectRow(button, id, viewKey) {
  const target = document.getElementById(id);
  if (!target) return;

  const panel = target.closest(".lb-panel");
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
