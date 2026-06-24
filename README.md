# byte-snap

> **Did that optimization actually help?** byte-snap answers in one line, in any bundler.

[![npm version](https://img.shields.io/npm/v/byte-snap?color=cb3837&logo=npm)](https://www.npmjs.com/package/byte-snap)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/byte-snap?color=success)](https://bundlephobia.com/package/byte-snap)
[![npm downloads](https://img.shields.io/npm/dm/byte-snap?color=success)](https://www.npmjs.com/package/byte-snap)
[![license](https://img.shields.io/npm/l/byte-snap?color=blue)](./LICENSE)

⭐ **Star this repository to support development and help others discover it.**

[![Star History Chart](https://api.star-history.com/svg?repos=jayf0x/byte-snap&type=Date)](https://star-history.com/#jayf0x/byte-snap&Date)

![Alt Preview](./assets/preview.png)

You add a minifier, swap a dependency, tweak a config — and _hope_ the bundle got smaller. Stop hoping. byte-snap snapshots your output and prints exactly how many bytes moved:

```
byte-snap
────────────
264.36 KB → 86.21 KB
saved: 178.15 KB (67.39% smaller)
files: 12 → 12
```

That's it. One plugin, every bundler, zero config.

## Why byte-snap

- ⚡️ **One job, done well** — it counts bytes. No bundle analyzer to host, no flamegraph to read, no dashboard to log into.
- 🔌 **Works everywhere** — one plugin for Vite, Rollup, webpack, esbuild, Rspack, Rolldown & Farm, via [unplugin](https://github.com/unjs/unplugin).
- 🪶 **Basically weightless** — zero runtime deps beyond unplugin.
- 🧩 **Or skip the plugin** — the `snap` / `diff` engine measures any file, directory, string or buffer.

## Install

```sh
npm i -D byte-snap
# or
bun add -d byte-snap
```

## Quick start

Add the plugin **last** so it sees the final output, then build like normal:

```js
// vite.config.js
import { measureSize } from 'byte-snap';

export default {
  plugins: [
    // ...your other plugins
    measureSize.vite({ dir: 'dist' }),
  ],
};
```

```sh
$ vite build
✓ built in 1.24s

byte-snap
────────────
512.00 KB → 188.40 KB
saved: 323.60 KB (63.20% smaller)
files: 8 → 8
```

Same call for every other bundler — pick your adapter:

```js
measureSize.rollup({ dir: 'dist' });
measureSize.webpack({ dir: 'dist' });
measureSize.esbuild({ dir: 'dist' });
measureSize.rspack({ dir: 'dist' }); // .rolldown() / .farm() too
```

| Option | Default  | Description          |
| ------ | -------- | -------------------- |
| `dir`  | `'dist'` | Directory to measure |

## Without a bundler

The engine is just two functions. Snapshot, do the work, diff:

```js
import { diff, snap } from 'byte-snap';

const before = snap.path('./dist'); // file or directory (recursive)
await runYourMinifier(); // ...or codemod, or image squash, or anything
const after = snap.path('./dist');

diff(before, after).print();
```

```
byte-snap
────────────
1.21 MB → 947.30 KB
saved: 293.50 KB (23.68% smaller)
files: 34 → 34
```

Want the numbers instead of a printout? `.json()`:

```js
const stats = diff(before, after).json();
// {
//   beforeBytes: 1268776, afterBytes: 968496,
//   savedBytes: 300280, savedPercent: 23.67,
//   beforeFiles: 34, afterFiles: 34, fileDelta: 0
// }
```

## Recipes

**Compare gzip vs brotli on a single file**

```js
import { diff, snap } from 'byte-snap';
import { readFileSync } from 'node:fs';
import { brotliCompressSync, gzipSync } from 'node:zlib';

const raw = readFileSync('dist/index.js');
diff(snap.buffer(raw), snap.buffer(gzipSync(raw))).print(); // gzip win
diff(snap.buffer(raw), snap.buffer(brotliCompressSync(raw))).print(); // brotli win
```

**Fail CI if the bundle grows**

```js
import { diff, snap } from 'byte-snap';

const stats = diff(baseline, snap.path('./dist')).json();
if (stats.savedBytes < 0) {
  console.error(`Bundle grew by ${-stats.savedBytes} bytes 🚨`);
  process.exit(1);
}
```

**Measure a raw string transform**

```js
diff(snap.text(source), snap.text(minify(source))).print();
```

## API

| Call                 | Returns / does                                                  |
| -------------------- | --------------------------------------------------------------- |
| `snap.path(target)`  | Snapshot a file or directory (recursive). Missing path → empty. |
| `snap.text(str)`     | Snapshot a string's UTF-8 byte length.                          |
| `snap.buffer(buf)`   | Snapshot a `Buffer` or `ArrayBuffer`.                           |
| `diff(a, b)`         | Compare two snapshots → `{ print(), json() }`.                  |
| `measureSize.vite()` | Plugin (and `.rollup`, `.webpack`, `.esbuild`, `.rspack`, …).   |

Every snapshot also exposes per-file detail: `{ files, bytes: { total, average, largest, smallest }, entries }`.

## How it works

`snap` records each file's byte size. `diff` subtracts two snapshots. The plugin does both around your build via unplugin's `buildStart` / `closeBundle` hooks — identical behavior in every bundler. No parsing, no sourcemaps, no magic. It counts bytes, honestly.

## License

[MIT](./LICENSE) © jayF0x
