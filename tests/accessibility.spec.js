import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * The page makes real ARIA promises — a tablist, a radiogroup with a roving tab
 * index, a live region, focus moved to the row a chart bar jumps to. This checks
 * them mechanically instead of by hand.
 *
 * Only serious and critical findings fail the build: the page's remaining
 * best-practice notes (heading order, landmark naming) are judgement calls, and a
 * gate that cries wolf gets ignored.
 */
test("has no serious or critical accessibility violations", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector("#lb-body-overall tr");
  await page.evaluate(() => document.fonts.ready);

  const { violations } = await new AxeBuilder({ page }).analyze();
  const blocking = violations
    .filter((violation) => violation.impact === "serious" || violation.impact === "critical")
    .map((violation) => `${violation.id} (${violation.impact}): ${violation.help} — ${violation.nodes.length} node(s)`);

  expect(blocking).toEqual([]);
});
