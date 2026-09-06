/**
 * Concatenate the aggregate stylesheet dist/index.css:
 * base reset + palette baseline + light + dark + motion gate.
 *
 * The granular files stay the single source of truth; this is only
 * the one-import convenience surface. Concatenation is structurally
 * safe: the reset and the motion gate declare no variables, the
 * palette/semantic variable names are disjoint, and the attribute axes
 * (:root[data-colox-theme='…'] / :root[data-colox-palette='…'] /
 * [data-colox-motion='…']) beat the :root baselines by specificity, so
 * the order of sections is irrelevant.
 *
 * @colox/react pulls this aggregate into its own style entry, restoring
 * the single-import surface for component consumers. Component styles
 * themselves live in @colox/react, not here.
 *
 * Target directory comes from COLox_CSS_OUT (set by scripts/build.mjs);
 * defaults to the builder's own dist so the package stays self-hosted.
 */
import { copyFile, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const builderRoot = fileURLToPath(new URL('../', import.meta.url));
const OUT = process.env.COLox_CSS_OUT ?? path.join(builderRoot, 'dist');
const base = path.join(builderRoot, 'src/styles/base/reset.css');
const baseLabel = 'src/styles/base/reset.css';
const motion = path.join(builderRoot, 'src/styles/base/motion.css');
const motionLabel = 'src/styles/base/motion.css';
// [absolute source, stable display label] — labels stay relative so the
// emitted block headers are placement-independent.
const parts = [
  [path.join(OUT, 'themes/palette.css'), 'dist/themes/palette.css'],
  [path.join(OUT, 'themes/light.css'), 'dist/themes/light.css'],
  [path.join(OUT, 'themes/dark.css'), 'dist/themes/dark.css'],
];

const banner = `/**
 * Colox theme aggregate stylesheet — generated, do not edit.
 *
 * One-import surface for @colox/theme:
 *   1. base layer (box-sizing reset)
 *   2. palette baseline (always loaded)
 *   3. light + dark theme assignments (complete, disjoint names)
 *   4. motion gate (global micro-motion kill switch)
 *
 * Order within this file does not matter: the attribute axes beat the
 * :root baselines by specificity. Custom files compiled from
 * colox.theme.json may be loaded after this one; same selector + same
 * variable names simply override by source order.
 */
`;

let out = banner;
out += `/* ---- ${baseLabel} ---- */\n`;
out += await readFile(base, 'utf8');
out += '\n';
for (const [part, label] of parts) {
  out += `/* ---- ${label} ---- */\n`;
  out += await readFile(part, 'utf8');
  out += '\n';
}
out += `/* ---- ${motionLabel} ---- */\n`;
out += await readFile(motion, 'utf8');
out += '\n';
await writeFile(path.join(OUT, 'index.css'), out);
// Ship the motion gate standalone too: CSS-only consumers loading the
// granular palette/light/dark files must not miss the accessibility gate.
await copyFile(motion, path.join(OUT, 'themes/motion.css'));
console.log(`[ok] index.css (${(out.length / 1024).toFixed(1)} KB, ${parts.length + 2} sections)`);
