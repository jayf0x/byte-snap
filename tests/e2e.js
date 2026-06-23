/**
 * E2E: run a real Vite build with our `measureSize` plugin and a local plugin that
 * does async work (a timeout). Proves the plugin's lifecycle timing holds — it snaps
 * the output dir at buildStart and again at closeBundle, after async build work — and
 * prints a byte diff.
 *
 *   node e2e.js
 */
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build } from 'vite';

import { measureSize } from '../src/index.js';

const root = mkdtempSync(join(tmpdir(), 'byte-snap-'));
const outDir = join(root, 'dist');
writeFileSync(join(root, 'main.js'), `export const hi = ${JSON.stringify('hello '.repeat(50))};\n`);

const SLEEP = 150;
let slowRan = false;

// Local plugin that uses our package's host (Vite) and does a timeout — the "build work".
const slowStep = {
  name: 'slow-step',
  async buildStart() {
    await new Promise((r) => setTimeout(r, SLEEP));
    slowRan = true;
  },
};

// Capture what measureSize prints.
const logged = [];
const orig = console.log;
console.log = (...a) => logged.push(a.join(' '));

const start = Date.now();
try {
  await build({
    root,
    logLevel: 'silent',
    build: { outDir, emptyOutDir: true, lib: { entry: 'main.js', formats: ['es'], fileName: 'main' } },
    plugins: [slowStep, measureSize.vite({ dir: outDir })],
  });
} finally {
  console.log = orig;
  rmSync(root, { recursive: true, force: true });
}
const elapsed = Date.now() - start;

const out = logged.join('\n');
console.log(out);

// Timing held: async build work finished before measureSize closed the bundle.
assert.ok(slowRan, 'slow plugin step did not run');
assert.ok(elapsed >= SLEEP, `build finished too fast (${elapsed}ms) — timeout skipped`);
// measureSize actually measured the output.
assert.match(out, /byte-snap/, 'measureSize did not print');
assert.match(out, /files: 0 → [1-9]/, 'measureSize did not detect built files');

console.log(`\n✓ e2e passed in ${elapsed}ms`);
