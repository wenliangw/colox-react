/**
 * Convert Figma variable exports (styles/meta/*.tokens.json) into the
 * engineering token source consumed by Style Dictionary (styles/tokens/).
 *
 * File -> namespace mapping (under top-level "colox"):
 * - color.tokens.json                    -> colox.palette.<hue>.<step>
 * - semantic-colors.light.tokens.json    -> colox.color.<group>.<tier>
 * - semantic-colors.dark.tokens.json     -> colox.color.<group>.<tier>
 * - typography.tokens.json               -> colox.fontSize.<step> / colox.fontWeight.<step>
 *                                          / colox.lineHeight.<step>
 * - size.tokens.json             -> colox.radius.<step> / colox.spacing.<step>
 *
 * Value rules:
 * - colors: keep the readable hex, drop Figma's numeric component arrays
 * - dimensions: Figma exports unit-less numbers; append "px"
 * - fontWeight: plain number passthrough (400/500/600/700)
 * - keys: "_" -> "-" (e.g. spacing "0_5" -> "0-5")
 *
 * Traceability: each token keeps com.figma.variableId in $extensions.
 *
 * Run from the package root (e.g. pnpm --filter @colox/theme run tokens:sync).
 */
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const META_DIR = 'src/styles/meta';
const OUT_DIR = 'src/styles/tokens';

// file basename (without .tokens.json) => converter spec
const SPECS = {
  color: {
    namespace: (group) => ['palette', group],
    type: () => 'color',
    value: colorValue,
  },
  'semantic-colors.light': {
    namespace: (group) => ['color', group],
    type: () => 'color',
    value: semanticValue,
  },
  'semantic-colors.dark': {
    namespace: (group) => ['color', group],
    type: () => 'color',
    value: semanticValue,
  },
  typography: {
    namespace: (group) =>
      ({ fontSize: ['fontSize'], fontWeight: ['fontWeight'], lineHeight: ['lineHeight'] })[group],
    type: (group) => (group === 'fontWeight' ? 'fontWeight' : 'dimension'),
    value: (token, group) => (group === 'fontWeight' ? token.$value : `${token.$value}px`),
  },
  size: {
    namespace: (group) => ({ radii: ['radius'], spacing: ['spacing'] })[group],
    type: () => 'dimension',
    value: (token) => `${token.$value}px`,
  },
};

function cleanKey(key) {
  return key.replaceAll('_', '-');
}

/**
 * Figma resolves the RGB color into `$value.hex` and carries the opacity
 * separately in `$value.alpha`. Merge both into CSS hex notation so
 * translucent palette steps (white/50..900, black/50..900 — used for
 * masks and box-shadows) survive the conversion instead of silently
 * becoming opaque.
 */
function colorValue(token) {
  const { hex, alpha } = token.$value;
  const rgb = hex.toUpperCase();
  if (alpha === undefined || alpha >= 1) {
    return rgb;
  }
  const byte = Math.round(alpha * 255)
    .toString(16)
    .toUpperCase()
    .padStart(2, '0');
  return `${rgb}${byte}`;
}

/**
 * Semantics carry their palette lineage in com.figma.aliasData
 * (targetVariableName like "gray/700" or "white/0"). Emit it as an
 * SD reference so the theme CSS keeps the variable chain at runtime:
 * semantic vars reference palette vars, and a palette-axis swap
 * (data-colox-palette) re-derives both themes without recompiling.
 * Tokens without an alias (tier inverse, constant white) keep their
 * resolved hex.
 */
function semanticValue(token) {
  const alias = token.$extensions?.['com.figma.aliasData'];
  if (alias?.targetVariableName) {
    const [hue, step] = alias.targetVariableName.split('/');
    return `{colox.palette.${cleanKey(hue)}.${step}}`;
  }
  return colorValue(token);
}

function normalizeExtensions($extensions) {
  if (!$extensions || typeof $extensions !== 'object') {
    return undefined;
  }
  const rest = { ...$extensions };
  delete rest.modeName; // modes live on the mode layer, not the token itself
  return Object.keys(rest).length > 0 ? rest : undefined;
}

function convert(figmaJson, spec) {
  const out = { colox: {} };
  for (const [groupName, group] of Object.entries(figmaJson)) {
    if (groupName === '$extensions') {
      continue;
    }
    const namespace = spec.namespace(cleanKey(groupName));
    let cursor = out.colox;
    for (const part of namespace) cursor = cursor[part] ??= {};
    for (const [leafName, token] of Object.entries(group)) {
      const converted = {
        $value: spec.value(token, groupName),
        $type: spec.type(groupName),
      };
      const extensions = normalizeExtensions(token.$extensions);
      if (extensions) {
        converted.$extensions = extensions;
      }
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

// Breakpoints flow into a TS constants file (not CSS vars): media queries
// cannot read CSS custom properties, and the responsive runtime
// (ColoxThemeContext + head bootstrap + matchMedia observer) consumes the
// values in JS. Single source stays in base.tokens.json (hand-maintained).
const base = JSON.parse(await readFile(path.join(OUT_DIR, 'base.tokens.json'), 'utf8'));
const breakpoints = base.colox?.breakpoint ?? {};
const tsLines = [
  '// Generated by figma-to-tokens.mjs from base.tokens.json.',
  '// Default contract breakpoints for the responsive runtime (ColoxThemeContext',
  '// defaults + head bootstrap script + matchMedia observer). Do not edit by hand.',
  'export const defaultBreakpoints = {',
  ...Object.entries(breakpoints).map(([name, token]) => `  ${cleanKey(name)}: '${token.$value}',`),
  '} as const;',
];
await writeFile(path.join(OUT_DIR, 'breakpoints.ts'), tsLines.join('\n') + '\n');
console.log('[ok] base.tokens.json breakpoints -> styles/tokens/breakpoints.ts');
