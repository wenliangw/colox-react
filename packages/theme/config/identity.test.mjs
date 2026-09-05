/**
 * Identity regression: compiling the standard theme config
 * (config/theme.default.json) must reproduce the shipped palette
 * baseline exactly — the CLI and the SD pipeline digest the same
 * token source and must stay in lockstep. This pins the compiler to
 * the official stock output.
 */
import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { buildPaletteCss, validateConfig } from '../cli/theme.mjs';

const [data, paletteCss, defaultsConfig] = await Promise.all([
  readFile(new URL('../dist/cli-data.json', import.meta.url), 'utf8').then(JSON.parse),
  readFile(new URL('../dist/themes/palette.css', import.meta.url), 'utf8'),
  readFile(new URL('./theme.default.json', import.meta.url), 'utf8').then(JSON.parse),
]);

function parseVars(css) {
  return new Map([...css.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2]]));
}

describe('standard theme config identity', () => {
  it('passes validation', () => {
    expect(validateConfig(defaultsConfig, data.stepLists)).toEqual([]);
  });

  it('compiles to a palette axis identical to the shipped baseline', () => {
    const axis = buildPaletteCss(
      defaultsConfig.palette,
      data.stepLists,
      data.palette,
      defaultsConfig.output.name,
    );
    const baseline = parseVars(paletteCss);
    const compiled = parseVars(axis);
    expect(compiled.size).toBe(104);
    expect([...compiled]).toEqual([...baseline]);
  });
});
