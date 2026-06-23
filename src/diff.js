import { createReport } from './report.js';

export function diff(before, after) {
  return createReport(before, after);
}
