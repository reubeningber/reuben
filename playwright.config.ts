import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:4321',
  },
  webServer: {
    // CI always builds fresh for a prod-accurate check; locally reuse the faster
    // dev server (and any already-running server) to keep iteration quick.
    command: process.env.CI
      ? 'npm run build && npm run preview -- --port 4321'
      : 'npm run dev -- --port 4321',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
