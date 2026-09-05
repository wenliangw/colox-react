/**
 * @colox/react ships dist/style.css (vite lib build, already contains
 * the @colox/theme cascade). Mirror it as dist/index.css so the
 * one-import surface keeps its name of record.
 */
import { copyFile } from 'node:fs/promises';

await copyFile('dist/style.css', 'dist/index.css');
console.log('[ok] index.css (copy of style.css)');
