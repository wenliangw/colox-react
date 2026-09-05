import { describe, expect, it } from 'vitest';
import { buildPaletteCss, buildThemeCss, generateBrandRamp, validateConfig } from './theme.mjs';

const STEP_LISTS = {
  white: ['0', '50', '100'],
  black: ['0', '50', '100'],
  indigo: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
  gray: ['50', '100', '200', '300', '400', '500', '600', '700', '750', '800', '850', '900'],
  brand: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
};

const DEFAULTS = {
  'white.0': '#FFFFFF',
  'white.50': '#FFFFFF0D',
  'white.100': '#FFFFFF1A',
  'black.0': '#000000',
  'black.50': '#0000000D',
  'black.100': '#0000001A',
  'indigo.50': '#E8E7FC',
  'indigo.500': '#4F46E5',
  'indigo.900': '#15124E',
  'gray.50': '#F8F8F8',
  'gray.750': '#5E5E5E',
  'gray.850': '#262626',
  'gray.900': '#191919',
  'brand.50': '#E8E7FC',
  'brand.500': '#4F46E5',
  'brand.900': '#15124E',
};

describe('generateBrandRamp', () => {
  it('is deterministic and produces the full ladder', () => {
    const a = generateBrandRamp('#FF6B35', STEP_LISTS.brand);
    const b = generateBrandRamp('#FF6B35', STEP_LISTS.brand);
    expect(a).toEqual(b);
    expect(Object.keys(a).map(Number)).toEqual(STEP_LISTS.brand.map(Number));
    for (const v of Object.values(a)) expect(v).toMatch(/^#[0-9A-F]{6}$/);
  });

  it('keeps the seed hue across the ladder', () => {
    // reddish seed -> every step must stay in the red family (r > g > b)
    const ramp = generateBrandRamp('#FF0000', STEP_LISTS.brand);
    for (const hex of Object.values(ramp)) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      expect(r).toBeGreaterThan(g);
      expect(g).toBeGreaterThanOrEqual(b);
    }
  });
});

describe('validateConfig', () => {
  it('accepts a valid config', () => {
    expect(
      validateConfig(
        {
          palette: { brand: '#FF6B35' },
          themes: {
            dark: { semantic: { text: { disabled: { palette: 'gray/750' } } } },
          },
        },
        STEP_LISTS,
      ),
    ).toEqual([]);
  });

  it('rejects unknown ramps, bad seeds and partial ladders', () => {
    const errors = validateConfig(
      { palette: { brand: 'nope', nope: {}, gray: { 50: '#FAFAFA' } } },
      STEP_LISTS,
    );
    expect(errors.join('\n')).toMatch(/brand: seed must be a #RRGGBB hex/);
    expect(errors.join('\n')).toMatch(/palette\.nope: unknown ramp/);
    expect(errors.join('\n')).toMatch(/palette\.gray: missing step "100"/);
  });

  it('rejects unknown palette references in semantic overrides', () => {
    const errors = validateConfig(
      { themes: { dark: { semantic: { text: { disabled: { palette: 'gray/999' } } } } } },
      STEP_LISTS,
    );
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/gray\/999/);
  });

  it('rejects unknown root keys but tolerates $schema', () => {
    expect(validateConfig({ palete: {} }, STEP_LISTS).join('\n')).toMatch(
      /unknown root key "palete"/,
    );
    expect(validateConfig({ $schema: 'x', output: {} }, STEP_LISTS)).toEqual([]);
  });

  it('validates the output block', () => {
    expect(validateConfig({ output: { name: 'My Axis' } }, STEP_LISTS).join('\n')).toMatch(
      /output.name/,
    );
    expect(validateConfig({ output: { nope: 1 } }, STEP_LISTS).join('\n')).toMatch(
      /output.nope: unknown key/,
    );
  });
});

describe('buildPaletteCss', () => {
  it('emits a complete assignment scoped to the axis', () => {
    const css = buildPaletteCss({ brand: '#FF0000' }, STEP_LISTS, DEFAULTS, 'demo');
    expect(css).toMatch(/^:root\[data-colox-palette='demo'\] \{/);
    expect(css).toContain('--colox-palette-brand-500: ');
    expect(css).toContain('--colox-palette-gray-850: #262626');
    expect(css).toContain('--colox-palette-white-0: #FFFFFF');
  });
});

describe('buildThemeCss', () => {
  const base = [
    { group: 'text', leaf: 'muted', value: 'var(--colox-palette-gray-600)' },
    { group: 'bg', leaf: 'solid', value: 'var(--colox-palette-white-0)' },
  ];

  it('emits the complete semantic assignment', () => {
    const css = buildThemeCss('dark', base, {});
    expect(css).toMatch(/^:root\[data-colox-theme='dark'\] \{/);
    expect(css).toContain('--colox-color-text-muted: var(--colox-palette-gray-600)');
    expect(css).toContain('--colox-color-bg-solid: var(--colox-palette-white-0)');
  });

  it('splices hex and palette-reference overrides', () => {
    const css = buildThemeCss('dark', base, {
      bg: { solid: '#0A0A0A' },
      text: { muted: { palette: 'gray/750' } },
    });
    expect(css).toContain('--colox-color-bg-solid: #0A0A0A');
    expect(css).toContain('--colox-color-text-muted: var(--colox-palette-gray-750)');
  });

  it('throws on overrides that do not map to a semantic token', () => {
    expect(() => buildThemeCss('dark', base, { bg: { nope: '#FFFFFF' } })).toThrow(
      /not a semantic token/,
    );
  });
});
