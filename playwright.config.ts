import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    baseURL: 'https://demoqa.com',
  },
  // Optional: set global timeout, retries, etc.
  timeout: 30_000,
  retries: 1,
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }]],
});
