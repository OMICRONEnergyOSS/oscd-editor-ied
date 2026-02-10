import { hmrPlugin, presets } from '@open-wc/dev-server-hmr';
import { esbuildPlugin } from '@web/dev-server-esbuild';
import { fileURLToPath } from 'url';

const tsConfigPath = fileURLToPath(new URL('./tsconfig.json', import.meta.url));

export default {
  rootDir: '.',
  open: '/demo/',
  watch: true,

  plugins: [
    esbuildPlugin({
      ts: true,
      target: 'es2022',
      tsconfig: tsConfigPath,
    }),

    hmrPlugin({
      include: ['src/**/*'],
      exclude: ['coverage/**/*', 'dist/**/*', '**/*/node_modules/**/*'],
      presets: [presets.lit],
    }),
  ],
};
