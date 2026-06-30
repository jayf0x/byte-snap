import { afterEach, expect, test } from 'bun:test';

import { snapPlugins } from '../src/snapPlugins.js';

const OMIT = 'BYTE_SNAP_OMIT';
const fakePlugin = () => ({ name: 'fake-plugin', transform: () => null });

afterEach(() => {
  delete process.env[OMIT];
});

test('buildCmd is strictly required', () => {
  expect(() => snapPlugins([fakePlugin])).toThrow(/buildCmd/);
  expect(() => snapPlugins([fakePlugin], {})).toThrow(/buildCmd/);
  expect(() => snapPlugins([fakePlugin], { buildCmd: '   ' })).toThrow(/buildCmd/);
});

test('factories must be a non-empty array', () => {
  expect(() => snapPlugins([], { buildCmd: 'x' })).toThrow(/non-empty/);
  expect(() => snapPlugins('nope', { buildCmd: 'x' })).toThrow(/non-empty/);
});

test('parent mode returns the plugins plus a coordinator', () => {
  const out = snapPlugins([fakePlugin], { buildCmd: 'echo hi' });
  expect(out.map((p) => p.name)).toEqual(['fake-plugin', 'byte-snap:measure']);
});

test('child mode keeps non-targeted plugins (no coordinator → no recursion)', () => {
  process.env[OMIT] = '99999'; // never matches this instance's id
  const out = snapPlugins([fakePlugin], { buildCmd: 'echo hi' });
  expect(out.map((p) => p.name)).toEqual(['fake-plugin']);
});
