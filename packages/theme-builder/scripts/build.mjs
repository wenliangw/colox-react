/**
 * Design-language compile — the `tokens` (full design-language) half of
 * `colox theme build`, driven by cli/colox.mjs.
 *
 * Pipeline: token sources (Figma exports) -> engineering token workspace
 * -> Style Dictionary css suite (palette/light/dark) -> aggregate
 * index.css (+ standalone motion gate) -> optional runtime token
 * artifacts (e.g. breakpoints.ts) when the build contract declares
 * `runtime`. The css output is a complete design-language suite in
 * outDir: load index.css (or the granular files) instead of
 * @colox/theme/index.css to consume a custom design language.
 *
 * Token workspace rules:
 * - the builder's own shipped sources (src/styles/meta) are the builtin
 *   design language; the committed src/styles/tokens directory is used
 *   as-is (generated subset + hand-maintained overlays share one
 *   directory).
 * - a custom token dir gets a throwaway workspace under
 *   outDir/.colox-tokens: the generated subset comes from the user's
 *   Figma exports, the hand-maintained overlays (base/palette.brand/
 *   semantic.brand/derived/shadow) are copied from the builtin
 *   language so the token directory alone is a sufficient contract.
 */
import { spawnSync } from 'node:child_process';
import { cp, mkdir, rm } from 'node:fs/promises';
import { realpathSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const builderRoot = fileURLToPath(new URL('../', import.meta.url));

// The design language shipped with this package: token sources (Figma
// exports) and the engineering-token workspace (input to Style
// Dictionary and overlay source for custom design languages).
const builtinTokens = path.join(builderRoot, 'src/styles/tokens');
const builtinSources = path.join(builderRoot, 'src/styles/meta');

// Hand-maintained token overlays living in the builder package, merged
// into a custom token workspace next to the generated subset. Keep in
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

function runScript(script, env) {
  run(process.execPath, [path.join(builderRoot, 'scripts', script)], env);
}

/**
 * @param {{tokens: string, outDir: string, runtime?: {type: string, output: string}}} input
 *   tokens   absolute path to the token source directory (Figma exports
 *            conforming to the Colox design language)
 *   outDir   absolute css output directory
 *   runtime  optional runtime-token emission target: type 'ts' writes
 *            TS constants (breakpoints today, extensible) to `output`
 */
export async function buildDesignLanguage({ tokens, outDir, runtime }) {
  const isBuiltin = realpathSync(tokens) === realpathSync(builtinSources);
  const workspace = isBuiltin ? builtinTokens : path.join(outDir, '.colox-tokens');

  try {
    // 1. token sources -> engineering tokens (generated subset)
    runScript('figma-to-tokens.mjs', {
      COLox_TOKENS_SRC: tokens,
      COLox_TOKENS_DIR: workspace,
    });

    // 2. merge the hand-maintained overlays for custom design languages
    if (!isBuiltin) {
      await mkdir(workspace, { recursive: true });
      for (const file of HAND_MAINTAINED) {
        await cp(path.join(builtinTokens, file), path.join(workspace, file), { force: true });
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
    runScript('emit-index-css.mjs', { COLox_CSS_OUT: outDir });

    // 5. runtime token artifacts (values the runtime consumes in JS)
    if (runtime) {
      if (runtime.type !== 'ts') {
        throw new Error(`runtime.type "${runtime.type}" is not supported (only "ts")`);
      }
      runScript('emit-runtime.mjs', {
        COLox_TOKENS_DIR: workspace,
        COLox_RUNTIME_OUT: runtime.output,
      });
    }

    console.log(`[ok] design-language css suite -> ${outDir}`);
  } finally {
    if (!isBuiltin) {
      await rm(workspace, { recursive: true, force: true });
    }
  }
}
