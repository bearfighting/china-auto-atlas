import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3001",
    trace: "on-first-retry",
    launchOptions: process.env.CI ? undefined : { executablePath: "/usr/bin/google-chrome" },
  },
  webServer: {
    command: "pnpm exec next start -H 127.0.0.1 -p 3001",
    url: "http://127.0.0.1:3001",
    reuseExistingServer: true,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 }, isMobile: true },
    },
  ],
});
