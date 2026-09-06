/**
 * Stock design-language compile — the `meta` (mode B) half of
 * `colox theme build`.
 *
 * Pipeline: Figma meta sources -> engineering token workspace ->
 * Style Dictionary css suite (palette/light/dark) -> aggregate
 * index.css (+ standalone motion gate). The output is a complete
 * design-language css suite in outDir: load index.css (or the granular
 * files) instead of @colox/theme/index.css to consume a custom design
 * language.
 *
 * Token workspace rules:
 * - meta === 'stock' compiles the builder's shipped design language;
 *   the builder's own src/styles/tokens doubles as the workspace
 *   (generated subset + hand-maintained overlays share one directory).
 * - a custom meta path gets a throwaway workspace under
 *   outDir/.colox-tokens: the generated subset comes from the user's
 *   Figma exports, the hand-maintained overlays (base/palette.brand/
 *   semantic.brand/derived/shadow) are copied from the builder so the
 *   meta directory alone is a sufficient contract.
 */
import { spawnSync } from 'node:child_process';
import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const builderRoot = fileURLToPath(new URL('../', import.meta.url));

// Hand-maintained token overlays living in the builder package, merged
// into a custom-meta workspace next to the generated subset. Keep in
// sync with sd*.config.mjs source lists.
const HAND_MAINTAINED = [
  'base.tokens.json',
  'palette.brand.tokens.json',
  'semantic.brand.tokens.json',
  'semantic.brand.dark.tokens.json',
  'semantic.derived.tokens.json',
  'semantic.derived.dark.tokens.json',
  'semantic.shadow.tokens.json',
  'semantic.shadow.dark.tokens.json',
];

function run(cmd, args, env) {
  const result = spawnSync(cmd, args, {
    stdio: 'inherit',
    env: { ...process.env, ...env },
  });
  if (result.status !== 0) {
    throw new Error(`command failed (${result.status}): ${cmd} ${args.join(' ')}`);
  }
}

/**
 * @param {{meta: string, outDir: string}} input
 *   meta   'stock' or an absolute path to a Figma export directory
 *          conforming to the Colox design language
 *   outDir absolute css output directory
 */
export async function buildDesignLanguage({ meta, outDir }) {
  const stockMeta = path.join(builderRoot, 'src/styles/meta');
  const stockTokens = path.join(builderRoot, 'src/styles/tokens');
  const metaDir = meta === 'stock' ? stockMeta : meta;
  const isStock = metaDir === stockMeta;
  const workspace = isStock ? stockTokens : path.join(outDir, '.colox-tokens');

  try {
    // 1. figma -> engineering tokens (generated subset)
    run(process.execPath, [path.join(builderRoot, 'scripts/figma-to-tokens.mjs')], {
      COLox_META_DIR: metaDir,
      COLox_TOKENS_DIR: workspace,
    });

    // 2. merge the hand-maintained overlays for custom metalanguages
    if (!isStock) {
      await mkdir(workspace, { recursive: true });
      for (const file of HAND_MAINTAINED) {
        await cp(path.join(stockTokens, file), path.join(workspace, file), { force: true });
      }
    }

    // 3. Style Dictionary css suite; palette first so references resolve
    const sdBin = path.join(builderRoot, 'node_modules/.bin/style-dictionary');
    // SD asserts the build path ends with a trailing separator
    const themesOut = path.join(outDir, 'themes') + path.sep;
    for (const configFile of ['sd-palette.config.mjs', 'sd.config.mjs', 'sd-dark.config.mjs']) {
      run(sdBin, ['build', '--config', path.join(builderRoot, configFile)], {
        COLox_TOKENS_DIR: workspace,
        COLox_THEMES_OUT: themesOut,
      });
    }

    // 4. aggregate index.css + standalone motion gate
    run(process.execPath, [path.join(builderRoot, 'scripts/emit-index-css.mjs')], {
      COLox_CSS_OUT: outDir,
    });

    console.log(`[ok] design-language css suite -> ${outDir}`);
  } finally {
    if (!isStock) {
      await rm(workspace, { recursive: true, force: true });
    }
  }
}
