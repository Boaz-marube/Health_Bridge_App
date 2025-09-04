import { defineConfig } from '@playwright/test';

// Minimal Playwright configuration
export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:3000',
  },
  // Only test in Chromium for now
  projects: [
    {
      name: 'chromium',
      use: { channel: 'chrome' },
    },
  ],
});