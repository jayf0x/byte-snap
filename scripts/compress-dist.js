/**
 * Post-build step: write gzip + brotli compressed copies of dist/index.js.
 * Run automatically via `bun build` if wired into the build script.
 *
 * Output:
 *   dist/index.js.gz   — for servers with gzip static-file serving
 *   dist/index.js.br   — for servers with brotli static-file serving
 */
import { createReadStream, createWriteStream, statSync } from 'fs';
import { dirname, resolve } from 'path';
import { pipeline } from 'stream/promises';
import { fileURLToPath } from 'url';
import { createBrotliCompress, createGzip, constants as zlibConst } from 'zlib';

const __dir = dirname(fileURLToPath(import.meta.url));
const src = resolve(__dir, '../dist/index.js');

async function compress(outPath, stream) {
  await pipeline(createReadStream(src), stream, createWriteStream(outPath));
  const inSize = statSync(src).size;
  const outSize = statSync(outPath).size;
  const pct = ((1 - outSize / inSize) * 100).toFixed(1);
  console.log(`  ${outPath.split('/').pop()}: ${(outSize / 1024).toFixed(2)} KB  (${pct}% smaller)`);
}

console.log('Compressing dist/index.js…');

await compress(`${src}.gz`, createGzip({ level: 9 }));
await compress(
  `${src}.br`,
  createBrotliCompress({
    params: {
      [zlibConst.BROTLI_PARAM_QUALITY]: 11,
      [zlibConst.BROTLI_PARAM_MODE]: zlibConst.BROTLI_MODE_TEXT,
    },
  })
);

// Smoke check: tree-shaking has silently emptied this bundle before (sideEffects:false
// + re-export-only entry → empty file that still "exports" undefined bindings). Fail the
// build loudly if any public export went missing, so a broken bundle never ships.
const mod = await import(src);
const missing = ['snap', 'diff', 'measureSize'].filter((k) => !mod[k]);
if (missing.length) {
  console.error(`\n✗ dist bundle is missing exports: ${missing.join(', ')} — build is broken.`);
  process.exit(1);
}
