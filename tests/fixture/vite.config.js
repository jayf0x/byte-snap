import replace from '@rollup/plugin-replace';
import { defineConfig } from 'vite';

import { measurePlugins } from '../../src/index.js';

// Real third-party plugin (@rollup/plugin-replace) measured by measurePlugins.
// buildCmd re-runs this very build to produce the without-plugin baseline.
export default defineConfig({
  logLevel: 'silent',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: false,
    lib: { entry: 'src.js', formats: ['es'], fileName: 'out' },
  },
  plugins: [
    measurePlugins([() => replace({ preventAssignment: true, values: { __VERBOSE_BUILD_TIME_CONST__: '0' } })], {
      buildCmd: 'node build.js',
    }),
  ],
});
