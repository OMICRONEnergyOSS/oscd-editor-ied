import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/oscd-editor-ied/' : '/',
  plugins: [tsconfigPaths()],

  server: {
    open: '/demo/',
  },

  optimizeDeps: {
    exclude: ['@openscd/scl-lib'],
    esbuildOptions: {
      target: 'es2022',
      sourcemap: false,
    },
  },

  build: {
    target: 'es2022',
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        demo: 'demo/index.html',
      },
    },
  },
}));
