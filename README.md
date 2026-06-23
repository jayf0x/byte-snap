# byte-snap

> **Size matters.** Snapshot file sizes, run your build step, diff the bytes — in any bundler.

[![npm version](https://img.shields.io/npm/v/byte-snap?color=cb3837&logo=npm)](https://www.npmjs.com/package/byte-snap)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/byte-snap?color=success)](https://bundlephobia.com/package/byte-snap)
[![npm downloads](https://img.shields.io/npm/dm/byte-snap?color=success)](https://www.npmjs.com/package/byte-snap)
[![license](https://img.shields.io/npm/l/byte-snap?color=blue)](./LICENSE)

A tiny byte meter. `snap` a file, directory, string or buffer; `diff` two snapshots; get an honest before/after of what your build actually saved. Wire it into any bundler as a plugin and it prints the delta automatically when the build closes.

Zero runtime deps beyond [unplugin](https://github.com/unjs/unplugin), so the plugin runs in **Vite, Rollup, webpack, esbuild, Rspack, Rolldown & Farm** from one package.

## Install

```sh
npm i -D byte-snap
# or: bun add -d byte-snap
```

## Plugin

Drop it in last and it measures your output dir across the build:

```js
import { measureSize } from 'byte-snap';

// Vite        vite.config.js
export default { plugins: [measureSize.vite({ dir: 'dist' })] };

// Rollup      rollup.config.js   →  measureSize.rollup({ ... })
// webpack     webpack.config.js  →  measureSize.webpack({ ... })
// esbuild     build script       →  measureSize.esbuild({ ... })
// Rspack / Rolldown / Farm       →  .rspack() / .rolldown() / .farm()
```

It snaps `dir` at `buildStart` and again at `closeBundle`, then prints:

```
byte-snap
────────────
264.36 KB → 86.21 KB
saved: 178.15 KB (67.39% smaller)
files: 12 → 12
```

| Option | Default  | Description          |
| ------ | -------- | -------------------- |
| `dir`  | `'dist'` | Directory to measure |

## API

Use the engine directly — no bundler required:

```js
import { diff, snap } from 'byte-snap';

const before = snap.path('./dist'); // directory (recursive) or single file
// ... run your build / compression / codemod ...
const after = snap.path('./dist');

const report = diff(before, after);
report.print(); // logs the summary above
report.json(); // { beforeBytes, afterBytes, savedBytes, savedPercent, beforeFiles, afterFiles, fileDelta }
```

### `snap`

| Method              | Input                                   |
| ------------------- | --------------------------------------- |
| `snap.path(target)` | File path or directory (recursive)      |
| `snap.text(str)`    | Raw string (measures UTF-8 byte length) |
| `snap.buffer(buf)`  | `Buffer` or `ArrayBuffer`               |

Each snapshot carries `{ files, bytes: { total, average, largest, smallest }, entries }`. Missing paths snapshot as empty (zero bytes, zero files) instead of throwing.

## Real-world stats

byte-snap is a measurement tool, so we measure with it. Below: the bytes the [`compress-shader-literals`](https://www.npmjs.com/package/compress-shader-literals) build step strips out of real shipped packages, diffed by byte-snap's own engine ([`tests/e2e.js`](tests/e2e.js)):

<!-- STATS:START -->

| Package | Files | Before | After | Saved |
| --- | ---: | ---: | ---: | ---: |
| `@jayf0x/fluidity-js` | 1 | 90,807 B | 88,416 B | **2.6%** |
| **Total** | 1 | 90,807 B | 88,416 B | **2.6%** |

_Measured by byte-snap across 1 package(s), running the `compress-shader-literals` build step._

<!-- STATS:END -->

The table regenerates itself: `npm run test:e2e` re-runs the measurement and rewrites everything between the `STATS` markers. Add packages to [`tests/package.json`](tests/package.json) and they show up here. Swap in your own build step and you're benchmarking that instead.

## How it works

1. `snap` walks a path (or reads a string/buffer) and records each file's byte size.
2. `diff` subtracts two snapshots into a report — saved bytes, percent, file delta.
3. The plugin does both around your build via unplugin's `buildStart` / `closeBundle` hooks, so it works the same in every bundler.

No parsing, no sourcemaps, no magic — it just counts bytes, honestly.

## License

[MIT](./LICENSE) © jayF0x
