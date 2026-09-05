/**
 * Emit dist/cli-data.json — the compiled defaults consumed by the
 * `colox` CLI (cli/theme.mjs). The CLI must not depend on the source
 * tokens being present in the consuming project, so the published
 * package ships this pre-digested snapshot instead.
 *
 * Contents:
 * - palette: colox.palette.* resolved values (hex, may be 8-digit for
 *   the white/black alpha ramps), plus the default brand ramp
 * - stepLists: the exact step names expected per ramp (validation)
 * - semantics: light/dark complete semantic assignments as
 *   [{group, leaf, value}] — values already in CSS form
 *   (var(--colox-palette-*-) / color-mix() / #hex)
 *
 * Run after tokens:sync inside the emit:themes chain.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const TOKENS = 'src/styles/tokens';

async function readJson(file) {
  return JSON.parse(await readFile(path.join(TOKENS, file), 'utf8'));
}

const kebab = (s) => s.replaceAll('_', '-');

/** "{colox.palette.gray.600}" -> "var(--colox-palette-gray-600)" */
function toCssValue(value) {
  if (typeof value !== 'string') {
    return value;
  }
  const m = value.match(/^\{colox\.palette\.([a-z-]+)\.([a-z0-9-]+)\}$/i);
  if (m) {
    return `var(--colox-palette-${kebab(m[1])}-${kebab(m[2])})`;
  }
  return value;
}

function flattenColor(file) {
  const data = file.colox?.color ?? {};
  const out = [];
  for (const [group, tokens] of Object.entries(data)) {
    for (const [leaf, token] of Object.entries(tokens)) {
      out.push({ group: kebab(group), leaf: kebab(leaf), value: toCssValue(token.$value) });
    }
  }
  out.sort((a, b) => `${a.group}-${a.leaf}`.localeCompare(`${b.group}-${b.leaf}`));
  return out;
}

const paletteSrc = await readJson('color.tokens.json');
const brandSrc = await readJson('palette.brand.tokens.json');

const palette = {};
const stepLists = {};
for (const [hue, tokens] of Object.entries(paletteSrc.colox.palette)) {
  const steps = Object.keys(tokens).sort((a, b) => Number(a) - Number(b));
  stepLists[kebab(hue)] = steps.map(kebab);
  for (const [step, token] of Object.entries(tokens)) {
    palette[`${kebab(hue)}.${kebab(step)}`] = token.$value;
  }
}
for (const [step, token] of Object.entries(brandSrc.colox.palette.brand)) {
  palette[`brand.${kebab(step)}`] = token.$value;
}
stepLists.brand = Object.keys(brandSrc.colox.palette.brand)
  .sort((a, b) => Number(a) - Number(b))
  .map(kebab);

const semantics = {
  light: [
    ...flattenColor(await readJson('semantic-colors.light.tokens.json')),
    ...flattenColor(await readJson('semantic.brand.tokens.json')),
    ...flattenColor(await readJson('semantic.derived.tokens.json')),
  ],
  dark: [
    ...flattenColor(await readJson('semantic-colors.dark.tokens.json')),
    ...flattenColor(await readJson('semantic.brand.dark.tokens.json')),
    ...flattenColor(await readJson('semantic.derived.dark.tokens.json')),
  ],
};

const out = { palette, stepLists, semantics };
await mkdir('dist', { recursive: true });
await writeFile(path.join('dist', 'cli-data.json'), JSON.stringify(out, null, 2) + '\n');
console.log(
  `[ok] cli-data.json (${Object.keys(palette).length} palette vars, ` +
    `light ${semantics.light.length} / dark ${semantics.dark.length} semantic vars)`,
);
