import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;

/**
 * The page is served as it is published: static files over HTTP, no build.
 * `python3 -m http.server` is the same command the README gives for a preview, so the
 * tests exercise the real delivery path.
 */
export default defineConfig({
  testDir: "./tests",
  // The tests assert on page-wide state; one worker keeps the console-error checks honest.
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: "retain-on-failure",
    ...devices["Desktop Chrome"],
  },
  webServer: {
    command: `python3 -m http.server ${PORT}`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env.CI,
    stdout: "ignore",
  },
});
