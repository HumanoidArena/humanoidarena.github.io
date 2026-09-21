import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");

/**
 * Where the outgoing links live. Most of them are not in the markup: the resource
 * and citation URLs are entries in the content tables and the leaderboard data.
 */
const SOURCES = [
  "index.html",
  "README.md",
  ...readdirSync(join(root, "js")).map((name) => join("js", name)),
  ...readdirSync(join(root, "docs")).map((name) => join("docs", name)),
];

/**
 * Not pages, so a status code says nothing about them:
 * - `preconnect` hints name a bare origin, which answers 404 by design;
 * - the README's preview command is a local address.
 */
const NOT_A_PAGE = [
  /^https:\/\/fonts\.(googleapis|gstatic)\.com\/?$/,
  /^http:\/\/localhost(:\d+)?/,
  /^https:\/\/humanoidarena\.github\.io\/dev\/$/, // built by the deploy, absent on a PR
];

function outgoingLinks() {
  const found = new Set();
  for (const relative of SOURCES) {
    const text = readFileSync(join(root, relative), "utf8");
    for (const match of text.matchAll(/https?:\/\/[^\s"'`<>)\]]+/g)) {
      const url = match[0].replace(/[.,;]+$/, "");
      if (NOT_A_PAGE.some((pattern) => pattern.test(url))) continue;
      found.add(url);
    }
  }
  return [...found].sort();
}

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Follow redirects and report the final status; a rate limit is not a dead link. */
async function statusOf(url) {
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const response = await fetch(url, {
        redirect: "follow",
        headers: { "user-agent": "HumanoidArena-link-check (+https://humanoidarena.github.io/)" },
        signal: AbortSignal.timeout(20000),
      });
      // Only the status matters, and some of these are large PDFs.
      await response.body?.cancel();
      if (response.status === 429 && attempt < 2) {
        await pause(4000);
        continue;
      }
      return response.status;
    } catch (error) {
      // A network-level cause (DNS, TLS, timeout) says more than "TypeError".
      const reason = error.cause?.code ?? error.name;
      if (attempt === 2) return `unreachable (${reason})`;
      await pause(1000);
    }
  }
  return "unreachable";
}

/** Check the links a few at a time: sequentially this outruns any sane test timeout. */
async function checkAll(urls, limit = 6) {
  const results = new Map();
  let cursor = 0;

  await Promise.all(
    Array.from({ length: Math.min(limit, urls.length) }, async () => {
      while (cursor < urls.length) {
        const url = urls[cursor];
        cursor += 1;
        results.set(url, await statusOf(url));
      }
    })
  );

  return urls.map((url) => ({ url, status: results.get(url) }));
}

test("every outgoing link still answers", async () => {
  // The whole internet is the thing under test, so this is a slow test by nature.
  test.setTimeout(300000);

  const links = outgoingLinks();
  const results = await checkAll(links);

  const broken = results
    .filter(({ status }) => typeof status !== "number" || status >= 400)
    .map(({ url, status }) => `${status}  ${url}`);

  expect(links.length).toBeGreaterThan(10);
  expect(broken, `${results.length} links checked`).toEqual([]);
});
