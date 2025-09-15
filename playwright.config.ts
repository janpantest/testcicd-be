import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    baseURL: 'https://demoqa.com',
    trace: 'on-first-retry',  // optional, keeps trace for failed tests
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  // Optional: set global timeout, retries, etc.
  timeout: 30_000,
  retries: 1,
  // reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }]],

  reporter: [
      ['list'],                  // Console output
      ['allure-playwright'],     // Allure reporter
  ],
});
