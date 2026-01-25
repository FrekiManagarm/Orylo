import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E Test Configuration
 * 
 * Story 3.7 AC1: Playwright setup with screenshots, mobile viewport
 * Story 3.7 AC7: Screenshots on failure
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "html",

  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    screenshot: "only-on-failure", // AC7: Screenshots on failure
    video: "retain-on-failure", // AC7: Video on failure
    trace: "retain-on-failure", // AC7: Trace on failure
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "mobile",
      use: {
        ...devices["iPhone SE"], // AC5: 375px viewport
        isMobile: true,
      },
    },
  ],

  webServer: {
    command: "bun run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
