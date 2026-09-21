import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const here = fileURLToPath(new URL(".", import.meta.url));
const root = join(here, "..");
const baseline = JSON.parse(readFileSync(join(here, "baseline.json"), "utf8"));

const WIDTHS = [1280, 1080, 760];

/**
 * The collections are rendered client-side, so the page is not ready until the last
 * of them exists — the leaderboard table is the last thing drawn.
 */
async function openPage(page) {
  await page.goto("/");
  await page.waitForSelector("#lb-body-overall tr");
  await page.evaluate(() => document.fonts.ready);
}

test("renders every collection the content tables declare", async ({ page }) => {
  await openPage(page);

  const counts = await page.evaluate(() => {
    const n = (selector) => document.querySelectorAll(selector).length;
    return {
      clipGroups: n(".task-media-pair, .example-video-pair, .inline-media-grid"),
      mediaCards: n(".media-card"),
      videos: n("video"),
      taskRows: n(".task-row"),
      scenarioRows: n(".scenario-row"),
      protocolCards: n(".protocol-card"),
      exampleCards: n(".example-card"),
      pipelineStepCards: n(".pipeline-step-card"),
      resourceCards: n(".resource-card"),
      resourceWide: n(".resource-card-wide"),
      tocItems: n(".content-toc-item"),
      tocSubItems: n(".content-toc-subitem"),
      leaderboardTabs: n(".lb-tab"),
      leaderboardPanels: n(".lb-panel"),
      leaderboardTableRows: n(".lb-table tbody tr"),
      leaderboardChartRows: n(".lb-chart-row"),
      bibtexLines: n(".bibtex-box span"),
    };
  });

  expect(counts).toEqual(baseline.contract);
});

test("every table-of-contents link has a target on the page", async ({ page }) => {
  await openPage(page);

  const unresolved = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".content-toc-item, .content-toc-subitem"))
      .map((link) => link.getAttribute("href"))
      .filter((href) => !document.querySelector(href))
  );

  expect(unresolved).toEqual([]);
});

test("clips start lazy and side-by-side groups keep one loop", async ({ page }) => {
  await openPage(page);

  // Nothing should be fetched, and nothing should be playing, above the fold.
  const atTop = await page.evaluate(() => ({
    playing: Array.from(document.querySelectorAll("video")).filter((video) => !video.paused).length,
    clipped: Array.from(document.querySelectorAll("video")).filter(
      (video) => !video.hasAttribute("preload") || video.getAttribute("preload") !== "none"
    ).length,
    autoplaying: Array.from(document.querySelectorAll("video")).filter((video) =>
      video.hasAttribute("autoplay")
    ).length,
  }));
  expect(atTop).toEqual({ playing: 0, clipped: 0, autoplaying: 0 });

  // Every group decides its own restart, so no clip may keep its own loop.
  await page.locator("#tasks").scrollIntoViewIfNeeded();
  const groupLoops = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".task-media-pair, .example-video-pair, .inline-media-grid")).map(
      (group) => Array.from(group.querySelectorAll("video")).filter((video) => video.loop).length
    )
  );
  expect(groupLoops).not.toHaveLength(0);
  expect(Math.max(...groupLoops)).toBe(0);

  // Scrolling to a group starts it.
  await expect
    .poll(async () => page.evaluate(() => Array.from(document.querySelectorAll("video")).filter((v) => !v.paused).length))
    .toBeGreaterThan(0);
});

test("the leaderboard controls re-render without console errors", async ({ page }) => {
  const problems = [];
  page.on("console", (message) => {
    if (message.type() === "error") problems.push(message.text());
  });
  page.on("pageerror", (error) => problems.push(String(error)));

  await openPage(page);

  // Three views x eight entries.
  await expect(page.locator(".lb-table tbody tr")).toHaveCount(24);

  // The GMT filter narrows every view at once.
  await page.locator('[data-gmt="sonic"]').click();
  await expect(page.locator(".lb-table tbody tr")).toHaveCount(12);
  await expect(page.locator('[data-gmt="sonic"]')).toHaveAttribute("aria-checked", "true");

  // One view at a time.
  await page.locator(".lb-tab").nth(1).click();
  await expect(page.locator("#lb-panel-hoi")).toBeVisible();
  await expect(page.locator("#lb-panel-overall")).toBeHidden();

  // Back to the unfiltered overall view, then jump from a bar to its row.
  await page.locator(".lb-tab").nth(0).click();
  await page.locator('[data-gmt="all"]').click();
  await expect(page.locator(".lb-table tbody tr")).toHaveCount(24);

  await page.locator("#lb-chart-overall .lb-chart-row").first().click();
  await expect(page.locator("#lb-body-overall tr.is-selected")).toHaveCount(1);

  expect(problems).toEqual([]);
});

for (const width of WIDTHS) {
  test(`layout holds at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await openPage(page);

    const measured = await page.evaluate(() => ({
      bodyHeight: document.body.scrollHeight,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    const expected = baseline.layout[String(width)];

    // Heights follow font metrics, which differ slightly between machines, so this
    // is a band rather than an equality — wide enough for another platform, tight
    // enough that a section failing to render falls outside it.
    expect(measured.bodyHeight).toBeGreaterThan(expected.bodyHeight * (1 - baseline.bodyHeightTolerance));
    expect(measured.bodyHeight).toBeLessThan(expected.bodyHeight * (1 + baseline.bodyHeightTolerance));

    // 760px overflows horizontally by design (see docs/design.md); the point is
    // that no width gets worse than the recorded one.
    expect(measured.scrollWidth).toBeLessThanOrEqual(expected.scrollWidth + baseline.scrollWidthSlack);
  });
}

test("shipped assets stay within the weight budget", () => {
  const files = [];
  (function walk(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const full = join(directory, entry.name);
      if (entry.isDirectory()) walk(full);
      else files.push({ path: full, bytes: statSync(full).size });
    }
  })(join(root, "assets"));

  const mb = (bytes) => `${(bytes / 1048576).toFixed(1)} MB`;
  const overBudget = files
    .filter((file) => file.bytes > baseline.assetBudget.maxFileBytes)
    .map((file) => `${file.path.replace(`${root}/`, "")} (${mb(file.bytes)})`);
  expect(overBudget, "single asset over the per-file budget").toEqual([]);

  const total = files.reduce((sum, file) => sum + file.bytes, 0);
  expect(total, `assets total ${mb(total)}`).toBeLessThanOrEqual(baseline.assetBudget.maxTotalBytes);
});
