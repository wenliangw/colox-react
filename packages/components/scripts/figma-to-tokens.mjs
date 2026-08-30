/**
 * Convert Figma variable exports (styles/meta/*.tokens.json) into the
 * engineering token source consumed by Style Dictionary (styles/tokens/).
 *
 * - Namespace: top-level "colox", colors grouped under "palette"
 *   (figma "primary/gray/green/red" => "colox.palette.<name>")
 * - Values: keep the readable hex from Figma's color object; drop the
 *   numeric component arrays (unreadable, per project taste)
 * - Traceability: keep each token's com.figma.variableId in $extensions
 *
 * Run: node packages/components/scripts/figma-to-tokens.mjs
 */
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const META_DIR = 'packages/components/src/styles/meta';
const OUT_DIR = 'packages/components/src/styles/tokens';

// file basename (without .tokens.json) => token namespace under "colox"
// e.g. color.tokens.json => colox.palette.primary.*
const NAMESPACES = {
  color: 'palette',
};

function normalizeValue($value) {
  // Figma color export: { colorSpace, components, alpha, hex }
  if (typeof $value === 'object' && $value !== null && typeof $value.hex === 'string') {
    return $value.hex.toUpperCase();
  }
  return $value;
}

function normalizeExtensions($extensions) {
  if (!$extensions || typeof $extensions !== 'object') return undefined;
  const rest = { ...$extensions };
  delete rest.modeName; // mode belongs to the mode layer, not base palette
  return Object.keys(rest).length > 0 ? rest : undefined;
}

function convert(figmaJson, namespace) {
  const out = { colox: { [namespace]: {} } };
  for (const [scaleName, scale] of Object.entries(figmaJson)) {
    if (scaleName === '$extensions') continue;
    const target = (out.colox[namespace][scaleName] = {});
    for (const [step, token] of Object.entries(scale)) {
      const converted = {
        $value: normalizeValue(token.$value),
        $type: token.$type ?? 'color',
      };
      const extensions = normalizeExtensions(token.$extensions);
      if (extensions) converted.$extensions = extensions;
      target[step] = converted;
    }
  }
  return out;
}

const files = (await readdir(META_DIR)).filter((f) => f.endsWith('.tokens.json')).sort();

await mkdir(OUT_DIR, { recursive: true });

for (const file of files) {
  const basename = file.replace(/\.tokens\.json$/, '');
  if (!(basename in NAMESPACES)) {
    console.warn(`[skip] ${file}: no namespace mapping for "${basename}"`);
    continue;
  }
  const raw = JSON.parse(await readFile(path.join(META_DIR, file), 'utf8'));
  const converted = convert(raw, NAMESPACES[basename]);
  const dest = path.join(OUT_DIR, file);
  await writeFile(dest, JSON.stringify(converted, null, 2) + '\n');
  console.log(`[ok] ${file} -> styles/tokens/${file} (colox.${NAMESPACES[basename]}.*)`);
}
