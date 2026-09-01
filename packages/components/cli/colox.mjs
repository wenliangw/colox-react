#!/usr/bin/env node
/**
 * colox — Colox theme compiler CLI.
 *
 *   colox theme build -c ./colox.theme.json
 *
 * Compiles the user's colox.theme.json into complete-assignment CSS:
 * a palette-axis file ([data-colox-palette='<name>']) and, when the
 * config declares themes, one semantic file per theme
 * ([data-colox-theme='<name>']).
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { validateConfig, buildPaletteCss, buildThemeCss } from './theme.mjs';

function usage() {
  console.error('usage: colox theme build -c <config>');
  process.exit(2);
}

function argValue(args, name) {
  const i = args.indexOf(name);
  if (i === -1 || i === args.length - 1) return null;
  return args[i + 1];
}

const args = process.argv.slice(2);
if (args[0] !== 'theme' && args[0] !== 'build') usage();
const configFlag = argValue(args, '-c') ?? argValue(args, '--config');
if (!configFlag) usage();

const dataUrl = new URL('../dist/cli-data.json', import.meta.url);
let data;
try {
  data = JSON.parse(await readFile(dataUrl, 'utf8'));
} catch {
  console.error('colox: dist/cli-data.json not found — run "pnpm build" in @colox/react first.');
  process.exit(1);
}

const { palette: defaults, stepLists, semantics } = data;

let config;
try {
  config = JSON.parse(await readFile(path.resolve(configFlag), 'utf8'));
} catch (err) {
  console.error(`colox: cannot read config "${configFlag}": ${err.message}`);
  process.exit(1);
}

const errors = validateConfig(config, stepLists);
if (errors.length > 0) {
  console.error(`colox: ${errors.length} config error(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

const output = config.output ?? {};
const axisName = output.name ?? 'custom';
// output paths are relative to the config file, not the cwd
const outDir = path.resolve(path.dirname(path.resolve(configFlag)), output.dir ?? './colox');

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
