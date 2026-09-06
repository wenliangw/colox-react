#!/usr/bin/env node
/**
 * colox — Colox theme compiler CLI (ships with @colox/theme-builder).
 *
 *   colox theme build [-c ./colox.theme.json]
 *
 * Compilation is driven by an optional project contract,
 * colox.theme.build.json, discovered by walking up from the cwd:
 *
 *   {
 *     "theme": "./colox.theme.json",  // mode A: brand/custom-theme
 *                                     //   config compiled over the
 *                                     //   Colox design language
 *     "meta": "stock" | "./figma-meta", // mode B: full design-language
 *                                     //   compile (Figma sources; "stock"
 *                                     //   = the shipped design language)
 *     "outDir": "./dist"              // REQUIRED — css output directory
 *   }
 *
 * Resolution order for the custom-theme config: the `-c` flag beats the
 * build config's "theme" field; without either the builder's default
 * config (config/theme.default.json) is compiled. Without any build
 * config file the legacy behavior applies: `-c` controls the compile
 * (output paths stay config-relative, ./colox by default), and a bare
 * `colox theme build` compiles the default config into ./colox.
 *
 * Both modes emit COMPLETE assignments:
 * - mode B: palette/light/dark css suite + index.css aggregate — replaces
 *   the @colox/theme/index.css import wholesale
 * - mode A: a palette-axis file (:root[data-colox-palette='<name>']) and
 *   one file per configured theme (:root[data-colox-theme='<name>']),
 *   loaded after the shipped aggregate so same name + same selector
 *   overrides by source order
 */
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDesignLanguage } from '../scripts/stock-build.mjs';
import { validateConfig, buildPaletteCss, buildThemeCss } from './theme.mjs';

const BUILDER_ROOT = fileURLToPath(new URL('../', import.meta.url));
const BUILD_CONFIG_NAME = 'colox.theme.build.json';
const DEFAULT_CONFIG = path.join(BUILDER_ROOT, 'config/theme.default.json');

function usage() {
  console.error('usage: colox theme build [-c <colox.theme.json>]');
  process.exit(2);
}

function argValue(args, name) {
  const i = args.indexOf(name);
  if (i === -1 || i === args.length - 1) return null;
  return args[i + 1];
}

/** Walk up from `from` looking for colox.theme.build.json. */
async function findBuildConfig(from) {
  let dir = from;
  for (;;) {
    const candidate = path.join(dir, BUILD_CONFIG_NAME);
    try {
      const info = await stat(candidate);
      if (info.isFile()) return candidate;
    } catch {
      /* not here */
    }
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

async function readJson(file, what) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch (err) {
    console.error(`colox: cannot read ${what} "${file}": ${err.message}`);
    process.exit(1);
  }
}

/**
 * Mode A: compile a colox.theme.json into palette-axis + theme css.
 * Returns the files written.
 */
async function compileThemeConfig(configPath, outDir) {
  const dataPath = path.join(BUILDER_ROOT, 'dist/cli-data.json');
  let data;
  try {
    data = JSON.parse(await readFile(dataPath, 'utf8'));
  } catch {
    console.error(
      'colox: dist/cli-data.json not found — run "pnpm build" in @colox/theme-builder first.',
    );
    process.exit(1);
  }
  const { palette: defaults, stepLists, semantics } = data;

  const config = await readJson(path.resolve(configPath), 'theme config');
  const errors = validateConfig(config, stepLists);
  if (errors.length > 0) {
    console.error(`colox: ${errors.length} config error(s):`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }

  const output = config.output ?? {};
  const axisName = output.name ?? 'custom';
  await mkdir(outDir, { recursive: true });

  const paletteCss = buildPaletteCss(config.palette ?? {}, stepLists, defaults, axisName);
  await writeFile(path.join(outDir, `${axisName}.css`), paletteCss);
  console.log(`[ok] ${path.join(outDir, `${axisName}.css`)} (palette axis, complete assignment)`);

  const themes = config.themes ?? {};
  for (const [name, theme] of Object.entries(themes)) {
    if (theme.enabled === false) {
      console.log(`[skip] themes.${name} (enabled: false)`);
      continue;
    }
    const baseName = theme.extends ?? name;
    const base = semantics[baseName];
    if (!base) {
      console.error(
        `colox: themes.${name}: unknown base theme "${baseName}" (only light/dark ship by default)`,
      );
      process.exit(1);
    }
    let css;
    try {
      css = buildThemeCss(name, base, theme.semantic);
    } catch (err) {
      console.error(`colox: ${err.message}`);
      process.exit(1);
    }
    await writeFile(path.join(outDir, `${name}.css`), css);
    console.log(`[ok] ${path.join(outDir, `${name}.css`)} (theme "${name}", complete assignment)`);
  }
}

const args = process.argv.slice(2);
if (args[0] !== 'theme' || args[1] !== 'build') usage();
const configFlag = argValue(args, '-c') ?? argValue(args, '--config');

const buildConfigPath = await findBuildConfig(process.cwd());

if (!buildConfigPath) {
  // Legacy/no-contract path: -c drives everything; a bare invocation
  // compiles the default config into ./colox (current behavior).
  const themeConfig = configFlag ?? DEFAULT_CONFIG;
  const config = await readJson(path.resolve(themeConfig), 'theme config');
  const output = config.output ?? {};
  const base = configFlag ? path.dirname(path.resolve(configFlag)) : process.cwd();
  const outDir = path.resolve(base, output.dir ?? './colox');
  await compileThemeConfig(themeConfig, outDir);
  process.exit(0);
}

// Contract path: colox.theme.build.json drives outDir + modes.
const buildConfigDir = path.dirname(buildConfigPath);
const buildConfig = await readJson(buildConfigPath, 'build config');

if (typeof buildConfig.outDir !== 'string' || buildConfig.outDir.length === 0) {
  console.error(`colox: ${buildConfigPath}: "outDir" is required (css output directory).`);
  process.exit(1);
}
const outDir = path.resolve(buildConfigDir, buildConfig.outDir);

if (buildConfig.meta) {
  let meta;
  if (buildConfig.meta === 'stock') {
    meta = 'stock';
  } else {
    meta = path.resolve(buildConfigDir, buildConfig.meta);
    let info;
    try {
      info = await stat(meta);
    } catch {
      console.error(`colox: ${buildConfigPath}: meta directory "${buildConfig.meta}" not found.`);
      process.exit(1);
    }
    if (!info.isDirectory()) {
      console.error(`colox: ${buildConfigPath}: meta "${buildConfig.meta}" is not a directory.`);
      process.exit(1);
    }
  }
  try {
    await buildDesignLanguage({ meta, outDir });
  } catch (err) {
    console.error(`colox: design-language compile failed: ${err.message}`);
    process.exit(1);
  }
}

// Mode A runs alongside mode B when the contract or the flag names a
// theme config; an outDir-only contract compiles the default config.
if (configFlag || buildConfig.theme || !buildConfig.meta) {
  const themeConfig = configFlag
    ? path.resolve(configFlag)
    : buildConfig.theme
      ? path.resolve(buildConfigDir, buildConfig.theme)
      : DEFAULT_CONFIG;
  await compileThemeConfig(themeConfig, outDir);
}
