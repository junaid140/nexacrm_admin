import { defineConfig } from "@playwright/test";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
const cache = path.join(process.env.LOCALAPPDATA || "", "ms-playwright");
const cached = existsSync(cache)
  ? readdirSync(cache)
      .filter((name) => /^chromium-/.test(name))
      .sort()
      .reverse()
      .map((name) => path.join(cache, name, "chrome-win64", "chrome.exe"))
      .find(existsSync)
  : undefined;
export default defineConfig({
  testDir: "./e2e",
  workers: 1,
  timeout: 30000,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3401",
    headless: true,
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || cached,
    },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 3401",
    url: "http://127.0.0.1:3401",
    reuseExistingServer: false,
    timeout: 60000,
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 1000 } } },
    {
      name: "mobile",
      use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
    },
  ],
});
