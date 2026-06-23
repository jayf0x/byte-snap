import fs from 'node:fs';
import path from 'node:path';

function collectFiles(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collectFiles(full, out);
    else out.push({ path: full, bytes: fs.statSync(full).size });
  }
}

function make(entries) {
  const total = entries.reduce((s, e) => s + e.bytes, 0);
  return {
    timestamp: Date.now(),
    files: entries.length,
    bytes: {
      total,
      average: entries.length ? total / entries.length : 0,
      largest: entries.length ? Math.max(...entries.map((e) => e.bytes)) : 0,
      smallest: entries.length ? Math.min(...entries.map((e) => e.bytes)) : 0,
    },
    entries,
  };
}

export const snap = {
  path(target) {
    if (!fs.existsSync(target)) return make([]);
    const stat = fs.statSync(target);
    if (stat.isFile()) return make([{ path: target, bytes: stat.size }]);
    const entries = [];
    collectFiles(target, entries);
    return make(entries);
  },
  text(str) {
    const bytes = Buffer.byteLength(str);
    return make([{ path: '<string>', bytes }]);
  },
  buffer(buf) {
    const bytes = buf.byteLength;
    return make([{ path: '<buffer>', bytes }]);
  },
};
