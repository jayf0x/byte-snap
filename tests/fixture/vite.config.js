import replace from '@rollup/plugin-replace';
import { defineConfig } from 'vite';

import { snapPlugins } from '../../src/index.js';

// Real third-party plugin (@rollup/plugin-replace) measured by snapPlugins.
// No `buildCmd` passed — snapPlugins auto-detects `npm run build` from package.json.
export default defineConfig({
  logLevel: 'silent',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: false,
    lib: { entry: 'src.js', formats: ['es'], fileName: 'out' },
  },
  plugins: [snapPlugins([() => replace({ preventAssignment: true, values: { __VERBOSE_BUILD_TIME_CONST__: '0' } })])],
});
