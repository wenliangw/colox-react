/**
 * Concatenate the aggregate stylesheet dist/index.css:
 * component styles + palette baseline + light + dark.
 *
 * The granular files stay the single source of truth; this is only
 * the one-import convenience surface. Concatenation is structurally
 * safe: the palette/semantic variable names are disjoint, and the
 * attribute axes (:root[data-colox-theme='…'] / :root[data-colox-
 * palette='…']) beat the :root baselines by specificity, so the order
 * of sections is irrelevant.
 *
 * Ran after `vite build` + `emit:themes` at the end of `pnpm build`.
 */
import { readFile, writeFile } from 'node:fs/promises';

const parts = [
  'dist/style.css',
  'dist/themes/palette.css',
  'dist/themes/light.css',
  'dist/themes/dark.css',
];

const banner = `/**
 * Colox aggregate stylesheet — generated, do not edit.
 *
 * One-import surface for @colox/react:
 *   1. component styles
 *   2. palette baseline (always loaded)
 *   3. light + dark theme assignments (complete, disjoint names)
 *
 * Order within this file does not matter: the attribute axes beat the
 * :root baselines by specificity. Custom files compiled from
 * colox.theme.json may be loaded after this one; same selector + same
 * variable names simply override by source order.
 */
`;

let out = banner;
for (const part of parts) {
  out += `/* ---- ${part} ---- */\n`;
  out += await readFile(part, 'utf8');
  out += '\n';
}
await writeFile('dist/index.css', out);
console.log(`[ok] index.css (${(out.length / 1024).toFixed(1)} KB, ${parts.length} sections)`);
