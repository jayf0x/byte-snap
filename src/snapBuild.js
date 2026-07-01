import { createUnplugin } from 'unplugin';

import { diff } from './diff.js';
import { snap } from './snap.js';

export const snapBuild = createUnplugin((options = {}) => {
  const dir = options.dir ?? 'dist';
  let before;

  return {
    name: 'byte-snap',
    buildStart() {
      before = snap.path(dir);
    },
    closeBundle() {
      diff(before, snap.path(dir)).print();
    },
  };
});
