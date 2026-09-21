import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;

/**
 * The page is served exactly as it is published: static files over HTTP, no build.
 * `python3 -m http.server` is the same command the README gives for a local
 * preview, so the test exercises the real delivery path.
 */
export default defineConfig({
  testDir: "./tests",
  // The page suite asserts on page-wide state; one worker keeps the console-error
  // checks honest.
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    {
      // What a pull request must pass.
      name: "page",
      testIgnore: "**/links.spec.js",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      // Outgoing links are checked against the live internet, so this project runs
      // on a schedule rather than in the pull-request gate: a host being briefly
      // down should not block a documentation fix.
      name: "links",
      testMatch: "**/links.spec.js",
    },
  ],
  webServer: {
    command: `python3 -m http.server ${PORT}`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env.CI,
    stdout: "ignore",
  },
});
