# byte-snap — agent guide

A byte meter. Snapshot file sizes, diff two snapshots, see what a build step saved.
Ships as universal bundler plugins (`snapSize`, `snapPlugins`) + a standalone `snap`/`diff` engine.
(`measureSize` is a deprecated alias of `snapSize`.)

## Layout

```
src/
  index.js     public exports: snap, diff, snapSize (+ measureSize alias), snapPlugins
  snap.js      snap.path / snap.text / snap.buffer → Snapshot
  diff.js      diff(before, after) → { print(title?), json() }
  snapSize.js  snapSize: unplugin wrapper, snaps `dir` at buildStart + closeBundle
  snapPlugins.js  snapPlugins: rebuild-without-a-plugin, diff the delta
  index.d.ts   hand-written types (source of truth, copied to dist on build)
tests/
  snap.test.js unit tests, run by `bun test` from root
  e2e.js       real Vite build + a local timeout plugin, asserts the plugin lifecycle works
scripts/
  publish-npm.sh    release flow (bump + build + test + commit + tag)
```

No build step needed to work on the engine — `src/*.js` is plain ESM, import it directly.

## Commands

```sh
bun test            # unit tests
bun run test:e2e    # vite e2e (installs vite in tests/, runs e2e.js)
bun run build       # bundle src/index.js → dist/, copy types, gzip/brotli
bun run typecheck   # tsc against index.d.ts
bun run format      # prettier write
```

Always `bun run build && bun test && bun run test:e2e && bun run format:check` before calling a change done.

## Conventions

- Plain ESM, Node built-ins only in `src/`. The single runtime dep is `unplugin`. Keep it that way — new deps need a real reason.
- Types are hand-written in `src/index.d.ts`. Change the API → change the types.
- `diff` output shape is the public contract: `{ beforeBytes, afterBytes, savedBytes, savedPercent, beforeFiles, afterFiles, fileDelta }`. Don't rename fields without bumping major.
- This is a measurement tool. It counts bytes — it does not minify, parse, or transform. Keep that boundary.

## Non-goals

Bundle analyzer, flamegraphs, dashboards, sourcemap inspection. If a feature needs to parse code, it probably belongs in a different package.
