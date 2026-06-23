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
  /** Pretty-print the diff to the console. */
  print(): void;
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

export interface MeasureSizeOptions {
  /** Directory to snapshot before and after the build. Default: `'dist'`. */
  dir?: string;
}

/** Universal plugin: snaps `dir` at buildStart and closeBundle, then prints the diff. */
export declare const measureSize: UnpluginInstance<MeasureSizeOptions | undefined>;
