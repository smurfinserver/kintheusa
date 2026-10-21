const { defineConfig, devices } = require("@playwright/test");
module.exports = defineConfig({
  testDir: "tests",
  timeout: 60000,
  expect: { timeout: 10000 },
  fullyParallel: true,
  workers: 2,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: "list",
  outputDir: ".local-qa/results",
  use: {
    baseURL: process.env.BASE_URL || "http://127.0.0.1:4173/kintheusa/",
    trace: "off",
    screenshot: "off",
    video: "off",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    {
      name: "mobile",
      use: { ...devices["Pixel 5"], viewport: { width: 375, height: 812 } },
    },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: "npm run build && node scripts/serve.cjs",
        url: "http://127.0.0.1:4173/kintheusa/",
        reuseExistingServer: !process.env.CI,
      },
});
