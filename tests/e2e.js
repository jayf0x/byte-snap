import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
