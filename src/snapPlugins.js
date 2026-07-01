import { spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';

import { diff } from './diff.js';
import { snap } from './snap.js';

// Env channel for the baseline child build: which instance to drop, where to write.
const OMIT = 'BYTE_SNAP_OMIT';
const OUTDIR = 'BYTE_SNAP_OUTDIR';

// Stable per-config instance id. Deterministic: the config module re-evaluates in the
// same order in the child, so parent id N === child id N.
let counter = 0;

function instantiate(factories) {
  return factories.flatMap((f) => {
    const p = f();
    return Array.isArray(p) ? p : [p];
  });
}

function names(instances, id) {
  const found = instances.map((p) => p && p.name).filter(Boolean);
  return found.length ? found.join(' + ') : `plugin#${id}`;
}

/**
 * Measure what a plugin (or group) actually changed in the final build, by rebuilding
 * WITHOUT it and diffing. `buildCmd` defaults to `npm run build` (which runs your
 * package.json `build` script, PM-agnostic, with local bins on PATH). Re-run in a child
 * process with the exact same config, so the baseline is byte-identical except for the plugin.
 *
 * Returns a plugin array — drop it into `plugins: [...]` in place of the plugin you measure.
 */
export function snapPlugins(factories, options = {}) {
  if (!Array.isArray(factories) || factories.length === 0) {
    throw new TypeError('snapPlugins: first argument must be a non-empty array of plugin factories');
  }

  const buildCmd = options.buildCmd?.trim() || 'npm run build';
  const id = String(counter++);
  const omit = process.env[OMIT];
  const instances = instantiate(factories);

  // Child baseline build: drop only the targeted instance, keep everyone else, never recurse.
  if (omit !== undefined) {
    if (omit === id) {
      // Redirect output so the baseline never clobbers the real dist.
      return [
        {
          name: 'byte-snap:omit',
          config: () => ({ build: { outDir: process.env[OUTDIR], emptyOutDir: true } }),
        },
      ];
    }
    return instances;
  }

  // Parent build: run the plugins, then rebuild-without and diff.
  let outDir = 'dist';
  return [
    ...instances,
    {
      name: 'byte-snap:measure',
      configResolved(c) {
        outDir = c.build.outDir;
      },
      closeBundle() {
        const after = snap.path(outDir); // with the plugin
        const baselineDir = `${outDir}-byte-snap-baseline`;
        const [cmd, ...args] = buildCmd.split(' ');
        const r = spawnSync(cmd, args, {
          stdio: 'inherit',
          env: { ...process.env, [OMIT]: id, [OUTDIR]: baselineDir },
        });
        if (r.status !== 0) {
          console.error(`byte-snap: baseline build failed (\`${buildCmd}\` exited ${r.status})`);
          return;
        }
        const before = snap.path(baselineDir); // without the plugin
        rmSync(baselineDir, { recursive: true, force: true });

        diff(before, after).print(`size: plugin ${names(instances, id)}`);
      },
    },
  ];
}
