export function fmt(bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let v = bytes,
    u = 0;
  while (v >= 1024 && u < units.length - 1) {
    v /= 1024;
    u++;
  }
  return `${v.toFixed(2)} ${units[u]}`;
}

export function diff(before, after) {
  const beforeBytes = before.bytes.total;
  const afterBytes = after.bytes.total;
  const savedBytes = beforeBytes - afterBytes;
  const savedPercent = beforeBytes === 0 ? 0 : (savedBytes / beforeBytes) * 100;

  const stats = {
    beforeBytes,
    afterBytes,
    savedBytes,
    savedPercent,
    beforeFiles: before.files,
    afterFiles: after.files,
    fileDelta: after.files - before.files,
  };

  return {
    json: () => stats,
    print() {
      console.log('\nbyte-snap');
      console.log('────────────');
      console.log(`${fmt(beforeBytes)} → ${fmt(afterBytes)}`);
      console.log(`saved: ${fmt(savedBytes)} (${savedPercent.toFixed(2)}% smaller)`);
      console.log(`files: ${before.files} → ${after.files}\n`);
    },
  };
}
