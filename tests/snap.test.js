import { expect, test } from 'bun:test';

import { diff } from '../src/diff.js';
import { snap } from '../src/snap.js';

test('snap.text measures UTF-8 byte length', () => {
  expect(snap.text('abc').bytes.total).toBe(3);
  expect(snap.text('€').bytes.total).toBe(3); // 3-byte UTF-8 char, not 1
});

test('snap.path on a missing target is an empty snapshot', () => {
  const s = snap.path('./does-not-exist-xyz');
  expect(s.files).toBe(0);
  expect(s.bytes.total).toBe(0);
});

test('diff computes saved bytes and percent', () => {
  const report = diff(snap.text('1234567890'), snap.text('12345')).json();
  expect(report.beforeBytes).toBe(10);
  expect(report.afterBytes).toBe(5);
  expect(report.savedBytes).toBe(5);
  expect(report.savedPercent).toBe(50);
});

test('diff from an empty baseline does not divide by zero', () => {
  const report = diff(snap.text(''), snap.text('grew')).json();
  expect(report.savedPercent).toBe(0);
  expect(report.savedBytes).toBe(-4);
});
