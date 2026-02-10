import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'test/visual',

  snapshotDir: 'test/visual/__screenshots__',

  use: {
    baseURL: 'http://localhost:6006',
  },

  webServer: {
    command: 'npm run storybook',
    port: 6006,
    reuseExistingServer: !process.env.CI,
  },
});
