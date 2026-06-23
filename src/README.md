# byte-snap

Local utility to snapshot and diff file sizes — useful for measuring what a build step saves.

## API

```js
import { diff, snap } from './byte-snap/index.js';

const before = snap.path('./dist'); // directory or single file
// ... run your build/compression ...
const after = snap.path('./dist');

const report = diff(before, after);
report.print(); // logs a summary to console
report.json(); // returns { beforeBytes, afterBytes, savedBytes, savedPercent, beforeFiles, afterFiles, fileDelta }
```

### `snap`

| Method              | Input                                   |
| ------------------- | --------------------------------------- |
| `snap.path(target)` | File path or directory (recursive)      |
| `snap.text(str)`    | Raw string (measures UTF-8 byte length) |
| `snap.buffer(buf)`  | `Buffer` or `ArrayBuffer`               |

Missing paths return an empty snapshot (zero bytes, zero files).

## Vite plugin

```js
// vite.config.js
import { measureSize } from './byte-snap/plugin.js';

export default {
  plugins: [measureSize.vite({ dir: 'dist' })],
};
```

Snaps `dir` at `buildStart` and again at `closeBundle`, then prints the diff.

| Option | Default  | Description          |
| ------ | -------- | -------------------- |
| `dir`  | `'dist'` | Directory to measure |
