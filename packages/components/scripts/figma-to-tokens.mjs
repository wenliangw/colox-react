/**
 * Convert Figma variable exports (styles/meta/*.tokens.json) into the
 * engineering token source consumed by Style Dictionary (styles/tokens/).
 *
 * File -> namespace mapping (under top-level "colox"):
 * - color.tokens.json            -> colox.palette.<hue>.<step>
 * - semantic-color.tokens.json   -> colox.color.<group>.<tier>
 * - typography.tokens.json       -> colox.fontSize.<step>
 * - size.tokens.json             -> colox.radius.<step> / colox.spacing.<step>
 *
 * Value rules:
 * - colors: keep the readable hex, drop Figma's numeric component arrays
 * - dimensions: Figma exports unit-less numbers; append "px"
 * - keys: "_" -> "-" (e.g. spacing "0_5" -> "0-5")
 *
 * Traceability: each token keeps com.figma.variableId in $extensions.
 *
 * Run from the package root (e.g. pnpm --filter @colox/react run tokens:sync).
 */
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const META_DIR = 'src/styles/meta';
const OUT_DIR = 'src/styles/tokens';

// file basename (without .tokens.json) => converter spec
const SPECS = {
  color: {
    namespace: (group) => ['palette', group],
    type: 'color',
    value: (token) => token.$value.hex.toUpperCase(),
  },
  'semantic-color': {
    namespace: (group) => ['color', group],
    type: 'color',
    value: (token) => token.$value.hex.toUpperCase(),
  },
  typography: {
    namespace: () => ['fontSize'],
    type: 'dimension',
    value: (token) => `${token.$value}px`,
  },
  size: {
    namespace: (group) => ({ radii: ['radius'], spacing: ['spacing'] })[group],
    type: 'dimension',
    value: (token) => `${token.$value}px`,
  },
};

function cleanKey(key) {
  return key.replaceAll('_', '-');
}

function normalizeExtensions($extensions) {
  if (!$extensions || typeof $extensions !== 'object') return undefined;
  const rest = { ...$extensions };
  delete rest.modeName; // modes live on the mode layer, not the token itself
  return Object.keys(rest).length > 0 ? rest : undefined;
}

function convert(figmaJson, spec) {
  const out = { colox: {} };
  for (const [groupName, group] of Object.entries(figmaJson)) {
    if (groupName === '$extensions') continue;
    const namespace = spec.namespace(cleanKey(groupName));
    let cursor = out.colox;
    for (const part of namespace) cursor = cursor[part] ??= {};
    for (const [leafName, token] of Object.entries(group)) {
      const converted = {
        $value: spec.value(token),
        $type: spec.type,
      };
      const extensions = normalizeExtensions(token.$extensions);
      if (extensions) converted.$extensions = extensions;
      cursor[cleanKey(leafName)] = converted;
    }
  }
  return out;
}

const files = (await readdir(META_DIR)).filter((f) => f.endsWith('.tokens.json')).sort();

await mkdir(OUT_DIR, { recursive: true });

for (const file of files) {
  const basename = file.replace(/\.tokens\.json$/, '');
  if (!(basename in SPECS)) {
    console.warn(`[skip] ${file}: no spec for "${basename}"`);
    continue;
  }
  const raw = JSON.parse(await readFile(path.join(META_DIR, file), 'utf8'));
  const converted = convert(raw, SPECS[basename]);
  const dest = path.join(OUT_DIR, file);
  await writeFile(dest, JSON.stringify(converted, null, 2) + '\n');
  console.log(`[ok] ${file} -> styles/tokens/${file}`);
}
