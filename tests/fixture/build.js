// The fixture's buildCmd target. Run directly (parent build) and re-run by measurePlugins
// as the baseline child. vite auto-loads vite.config.js from `root`.
import { build } from 'vite';

await build({ root: import.meta.dirname });
