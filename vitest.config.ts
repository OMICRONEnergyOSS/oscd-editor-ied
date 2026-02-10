import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: 'playwright',
      name: 'chromium',
    },
    setupFiles: ['./vitest.setup.ts'],
  },

  optimizeDeps: {
    exclude: ['@openscd/scl-lib'],
    esbuildOptions: {
      target: 'es2022',
    },
  },

  esbuild: {
    target: 'es2022',
  },
});
