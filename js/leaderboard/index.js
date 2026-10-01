/**
 * Leaderboard wiring: the two choices a reader makes (which view, which tracker), the
 * announcements they produce, and the entry point that ties the data to the panels.
 */

import { mountControl, trackThumbPositions } from "./control.js";
import { FILTERS, LB_UPDATED, VIEWS, rowsFor } from "./data.js";
import { mountPanels, redrawMotion, renderPanels, revealChartsOnScroll, selectRow } from "./panels.js";

// The view on screen, so a filter change knows what to animate.
let activeViewKey = VIEWS[0].key;

// The GMT filter is global: it applies to every view, so switching views never changes which
// entries are on screen. Ranks are recomputed inside the filtered set.
let activeFilter = FILTERS[0].value;

const tabAttributes = (view, selected) =>
  `id="lb-tab-${view.key}" role="tab" aria-selected="${selected}" aria-controls="lb-panel-${view.key}"`;

const filterAttributes = (filter, selected) =>
  `role="radio" aria-checked="${selected}" data-gmt="${filter.value}"`;

function activeViewName() {
  const view = VIEWS.find((candidate) => candidate.key === activeViewKey);
  return view ? `${view.label} view` : "View";
}

// The tables are drawn client-side, so a redraw is otherwise invisible to a screen reader.
function announce(prefix) {
  const live = document.getElementById("lb-live");
  if (!live) return;
  const tracker = activeFilter === "all" ? "both trackers" : activeFilter.toUpperCase();
  live.textContent = `${prefix} — ${rowsFor(activeFilter).length} entries, ${tracker}.`;
}

function startControls(tabControl, filterControl) {
  const panels = VIEWS.map((view) => document.getElementById(`lb-panel-${view.key}`));

  mountControl(tabControl, VIEWS, tabAttributes, (index) => {
    panels.forEach((panel, i) => {
      if (panel) panel.hidden = i !== index;
    });
    activeViewKey = VIEWS[index].key;
    redrawMotion(activeViewKey);
    announce(activeViewName());
  });

  mountControl(filterControl, FILTERS, filterAttributes, (index) => {
    activeFilter = FILTERS[index].value;
    renderPanels(rowsFor(activeFilter));
    redrawMotion(activeViewKey);
    announce(activeViewName());
  });

  trackThumbPositions([tabControl, filterControl]);
}

export function startLeaderboard() {
  const panelHost = document.getElementById("lb-panels");
  const tabControl = document.getElementById("lb-tabs");
  const filterControl = document.getElementById("lb-filters");
  if (!panelHost || !tabControl || !filterControl) return;

  mountPanels(panelHost);
  startControls(tabControl, filterControl);

  const updated = document.getElementById("lb-updated");
  if (updated) updated.textContent = LB_UPDATED;

  document.querySelectorAll(".lb-chart").forEach((chart) => {
    chart.addEventListener("click", (event) => {
      const button = event.target.closest(".lb-chart-row");
      if (!button || !chart.contains(button)) return;
      selectRow(button, button.getAttribute("data-target"), chart.id.replace("lb-chart-", ""));
    });
  });

  renderPanels(rowsFor(activeFilter));
  revealChartsOnScroll();
}
