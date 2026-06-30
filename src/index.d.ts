import type { UnpluginInstance } from 'unplugin';

export interface SnapEntry {
  path: string;
  bytes: number;
}

export interface Snapshot {
  timestamp: number;
  files: number;
  bytes: {
    total: number;
    average: number;
    largest: number;
    smallest: number;
  };
  entries: SnapEntry[];
}

export interface DiffStats {
  beforeBytes: number;
  afterBytes: number;
  savedBytes: number;
  savedPercent: number;
  beforeFiles: number;
  afterFiles: number;
  fileDelta: number;
}

export interface Report {
  /** Raw numbers, e.g. for asserting in tests or piping to JSON. */
  json(): DiffStats;
  /** Pretty-print the diff to the console. `title` is the header line (default `'byte-snap'`). */
  print(title?: string): void;
}

export declare const snap: {
  /** Snapshot a file or directory (recursive). Missing paths snapshot as empty. */
  path(target: string): Snapshot;
  /** Snapshot the UTF-8 byte length of a string. */
  text(str: string): Snapshot;
  /** Snapshot the byte length of a Buffer or ArrayBuffer. */
  buffer(buf: Buffer | ArrayBuffer): Snapshot;
};

/** Diff two snapshots into a printable report. */
export declare function diff(before: Snapshot, after: Snapshot): Report;

export interface SnapSizeOptions {
  /** Directory to snapshot before and after the build. Default: `'dist'`. */
  dir?: string;
}

/** Universal plugin: snaps `dir` at buildStart and closeBundle, then prints the diff. */
export declare const snapSize: UnpluginInstance<SnapSizeOptions | undefined>;

/** @deprecated Renamed to `snapSize`. Kept as an alias; will be removed in a future major. */
export declare const measureSize: UnpluginInstance<SnapSizeOptions | undefined>;

/** Minimal structural plugin shape — compatible with Vite/Rollup `Plugin` objects. */
export interface BundlerPlugin {
  name: string;
  [key: string]: unknown;
}

/** A plugin factory: the same call you'd put in `plugins: [...]`, e.g. `react`. */
export type PluginFactory = () => BundlerPlugin | BundlerPlugin[];

export interface SnapPluginsOptions {
  /**
   * Build command re-run as a child process to produce the baseline (without the measured
   * plugin). Must be the exact command that builds this config. Required — no default.
   */
  buildCmd: string;
}

/**
 * Measure what a plugin (or group) changed in the final build, by rebuilding without it and
 * diffing. Returns a plugin array to splice into `plugins: [...]` where the plugin would go.
 */
export declare function snapPlugins(factories: PluginFactory[], options: SnapPluginsOptions): BundlerPlugin[];
