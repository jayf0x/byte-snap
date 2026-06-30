/**
 * E2E: real Vite build of tests/fixture using a real third-party plugin
 * (@rollup/plugin-replace) wrapped by snapPlugins. Proves the rebuild-without-it
 * mechanism end to end and that the printed before/after reflects the real delta.
 *
 *   node e2e.snapPlugins.js
 */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const fixture = join(dirname(fileURLToPath(import.meta.url)), 'fixture');
rmSync(join(fixture, 'dist'), { recursive: true, force: true });

// Run the parent build; its coordinator re-runs `node build.js` for the baseline.
const out = execFileSync('node', ['build.js'], { cwd: fixture, encoding: 'utf8' });
console.log(out);
rmSync(join(fixture, 'dist'), { recursive: true, force: true });

// Names the measured plugin (not a minified factory name).
assert.match(out, /size: plugin replace/, 'did not label the plugin by name');

// Shows a real before → after with a genuine shrink (replace removes ~29 bytes × 60).
const m = out.match(/([\d.]+) (B|KB) → ([\d.]+) (B|KB)/);
assert.ok(m, 'no before → after line printed');
const toB = (n, u) => Number(n) * (u === 'KB' ? 1024 : 1);
const before = toB(m[1], m[2]);
const after = toB(m[3], m[4]);
assert.ok(before > after, `expected shrink, got ${before} → ${after}`);

const saved = out.match(/saved: ([\d.]+) (B|KB)/);
assert.ok(saved, 'did not report "saved:"');
assert.ok(toB(saved[1], saved[2]) > 1000, `expected >1KB saved, got ${saved[1]} ${saved[2]}`);

console.log(`\n✓ snapPlugins e2e passed (real before/after: ${m[0]})`);
