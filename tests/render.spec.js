import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const here = fileURLToPath(new URL(".", import.meta.url));
const root = join(here, "..");
const baseline = JSON.parse(readFileSync(join(here, "baseline.json"), "utf8"));

const WIDTHS = [1280, 1080, 760];

/** The leaderboard table is the last thing the page draws, so it marks the page as ready. */
async function openPage(page) {
  await page.goto("/");
  await page.waitForSelector("#lb-body-overall tr");
  await page.evaluate(() => document.fonts.ready);
}

test("renders every collection the content tables declare", async ({ page }) => {
  await openPage(page);

  const counts = await page.evaluate((selectors) => {
    const count = (selector) => document.querySelectorAll(selector).length;
    return Object.fromEntries(selectors.map(([name, selector]) => [name, count(selector)]));
  }, [
    ["clipGroups", ".task-media-pair, .example-video-pair, .inline-media-grid"],
    ["mediaCards", ".media-card"],
    ["videos", "video"],
    ["taskRows", ".task-row"],
    ["scenarioRows", ".scenario-row"],
    ["protocolCards", ".protocol-card"],
    ["exampleCards", ".example-card"],
    ["pipelineStepCards", ".pipeline-step-card"],
    ["resourceCards", ".resource-card"],
    ["resourceWide", ".resource-card-wide"],
    ["tocItems", ".content-toc-item"],
    ["tocSubItems", ".content-toc-subitem"],
    ["leaderboardTabs", "#lb-tabs .lb-seg-item"],
    ["leaderboardPanels", ".lb-panel"],
    ["leaderboardTableRows", ".lb-table tbody tr"],
    ["leaderboardChartRows", ".lb-chart-row"],
    ["bibtexLines", ".bibtex-box span"],
  ]);

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

test("clips are fetched on approach, and a group loops as one", async ({ page }) => {
  await openPage(page);

  const atTop = await page.evaluate(() => {
    const videos = Array.from(document.querySelectorAll("video"));
    return {
      preload: [...new Set(videos.map((video) => video.getAttribute("preload")))],
      autoplay: videos.filter((video) => video.hasAttribute("autoplay")).length,
      playing: videos.filter((video) => !video.paused).length,
    };
  });
  expect(atTop).toEqual({ preload: ["none"], autoplay: 0, playing: 0 });

  // A grouped clip must not keep its own loop, or it drifts from its partner.
  await page.locator("#tasks").scrollIntoViewIfNeeded();
  await expect.poll(() => page.evaluate(() => document.querySelectorAll("video.loop").length)).toBe(0);
  await expect
    .poll(() => page.evaluate(() => Array.from(document.querySelectorAll("video")).filter((v) => !v.paused).length))
    .toBeGreaterThan(0);
});

test("the leaderboard controls re-render without console errors", async ({ page }) => {
  const problems = [];
  page.on("console", (message) => {
    if (message.type() === "error") problems.push(message.text());
  });
  page.on("pageerror", (error) => problems.push(String(error)));

  await openPage(page);

  // Both controls are the same segmented control: a thumb and one selected item each.
  const controls = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".lb-controls .lb-seg")).map((control) => ({
      items: control.querySelectorAll(".lb-seg-item").length,
      thumbs: control.querySelectorAll(".lb-seg-thumb").length,
      selected: control.querySelectorAll('[aria-selected="true"], [aria-checked="true"]').length,
    }))
  );
  expect(controls).toEqual([
    { items: 3, thumbs: 1, selected: 1 },
    { items: 3, thumbs: 1, selected: 1 },
  ]);

  // Three views x eight entries.
  await expect(page.locator(".lb-table tbody tr")).toHaveCount(24);

  // The GMT filter narrows every view at once.
  await page.locator('[data-gmt="sonic"]').click();
  await expect(page.locator(".lb-table tbody tr")).toHaveCount(12);
  await expect(page.locator('[data-gmt="sonic"]')).toHaveAttribute("aria-checked", "true");

  // One view at a time.
  await page.locator("#lb-tabs .lb-seg-item").nth(1).click();
  await expect(page.locator("#lb-panel-hoi")).toBeVisible();
  await expect(page.locator("#lb-panel-overall")).toBeHidden();

  // Back to the unfiltered overall view, then jump from a bar to its row.
  await page.locator("#lb-tabs .lb-seg-item").nth(0).click();
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

    // Height follows font metrics, which differ between machines, so this is a band:
    // wide enough for another platform, tight enough that a section failing to render
    // falls outside it.
    expect(measured.bodyHeight).toBeGreaterThan(expected.bodyHeight * (1 - baseline.bodyHeightTolerance));
    expect(measured.bodyHeight).toBeLessThan(expected.bodyHeight * (1 + baseline.bodyHeightTolerance));

    // 760px overflows horizontally by design (see docs/design.md); no width may get worse.
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
