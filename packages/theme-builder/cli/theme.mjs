/**
 * The colox.theme.json compiler.
 *
 * Inputs: a user config (see schemas/theme.schema.json) and the
 * pre-digested library defaults (dist/cli-data.json).
 *
 * Outputs (all COMPLETE assignments — never runtime delta files):
 * - a palette-axis file scoped to :root[data-colox-palette='<name>']
 *   with every colox.palette.* var (brand ramp generated from the seed
 *   when given, other ramps merged over defaults)
 * - one file per configured theme scoped to
 *   :root[data-colox-theme='<name>'] with every colox.color.* var plus
 *   the colox.shadow.* triple, splicing in the configured color
 *   semantic overrides
 *
 * The :root prefix raises each axis to (0,2,0) so it beats the light.css
 * baseline without depending on stylesheet order. The runtime stays
 * var()-chained: theme vars reference palette vars, so a palette-axis
 * swap re-derives every theme without recompiling.
 */

const HEX_RE = /^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/;

/* ---------------------------------------------------------------- */
/* brand ramp generation                                             */
/* ---------------------------------------------------------------- */

/**
 * v1 generator: constant hue, hand-tuned per-step lightness ladder and
 * a saturation curve that thins toward both ends. Generating ten steps
 * from a single seed cannot reproduce Figma's crafted ladders; when a
 * design-spec ramp exists, pass the full object instead.
 */
const BRAND_L = {
  50: 0.955,
  100: 0.925,
  200: 0.87,
  300: 0.79,
  400: 0.68,
  500: 0.58,
  600: 0.5,
  700: 0.4,
  800: 0.3,
  900: 0.21,
};
const BRAND_S = {
  50: 0.9,
  100: 0.86,
  200: 0.8,
  300: 0.74,
  400: 0.68,
  500: 0.66,
  600: 0.7,
  700: 0.74,
  800: 0.78,
  900: 0.82,
};

function hueToRgb(p, q, t) {
  if (t < 0) {
    t += 1;
  }
  if (t > 1) {
    t -= 1;
  }
  if (t < 1 / 6) {
    return p + (q - p) * 6 * t;
  }
  if (t < 1 / 2) {
    return q;
  }
  if (t < 2 / 3) {
    return p + (q - p) * (2 / 3 - t) * 6;
  }
  return p;
}

function hslToHex(h, s, l) {
  if (s === 0) {
    const v = Math.round(l * 255)
      .toString(16)
      .padStart(2, '0');
    return `#${v}${v}${v}`.toUpperCase();
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const channel = (t) =>
    Math.round(hueToRgb(p, q, t) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${channel(h + 1 / 3)}${channel(h)}${channel(h - 1 / 3)}`.toUpperCase();
}

function hexToHsl(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) {
    return { h: 0, s: 0, l };
  }
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) {
    h = (g - b) / d + (g < b ? 6 : 0);
  } else if (max === g) {
    h = (b - r) / d + 2;
  } else {
    h = (r - g) / d + 4;
  }
  return { h: h / 6, s, l };
}

export function generateBrandRamp(seedHex, steps) {
  const { h, s } = hexToHsl(seedHex);
  const ramp = {};
  for (const step of steps) {
    const l = BRAND_L[step] ?? BRAND_L[500];
    const sat = (BRAND_S[step] ?? BRAND_S[500]) * (s > 0.05 ? 1 : 0);
    ramp[String(step)] = hslToHex(h, sat, l);
  }
  return ramp;
}

/* ---------------------------------------------------------------- */
/* validation                                                        */
/* ---------------------------------------------------------------- */

export function validateConfig(config, stepLists) {
  const errors = [];
  if (typeof config !== 'object' || config === null || Array.isArray(config)) {
    return ['config: must be an object'];
  }
  for (const key of Object.keys(config)) {
    if (!['$schema', 'palette', 'themes', 'output'].includes(key)) {
      errors.push(`unknown root key "${key}"`);
    }
  }
  const output = config.output;
  if (output !== undefined) {
    if (typeof output !== 'object' || output === null || Array.isArray(output)) {
      errors.push('output: must be an object');
    } else {
      for (const key of Object.keys(output)) {
        if (!['name', 'dir'].includes(key)) {
          errors.push(`output.${key}: unknown key`);
        }
      }
      if (
        output.name !== undefined &&
        (typeof output.name !== 'string' || !/^[a-z][a-z0-9-]*$/.test(output.name))
      ) {
        errors.push('output.name: must match ^[a-z][a-z0-9-]*$');
      }
      if (output.dir !== undefined && typeof output.dir !== 'string') {
        errors.push('output.dir: must be a string');
      }
    }
  }
  const palette = config.palette ?? {};

  for (const [hue, value] of Object.entries(palette)) {
    if (!(hue in stepLists)) {
      errors.push(
        `palette.${hue}: unknown ramp (expected one of ${Object.keys(stepLists).join(', ')})`,
      );
      continue;
    }
    if (typeof value === 'string') {
      if (hue !== 'brand') {
        errors.push(`palette.${hue}: only "brand" accepts a seed string; use a full object`);
      } else if (!HEX_RE.test(value)) {
        errors.push(`palette.brand: seed must be a #RRGGBB hex, got "${value}"`);
      }
      continue;
    }
    if (typeof value !== 'object' || value === null) {
      errors.push(`palette.${hue}: must be an object of steps or a seed string (brand only)`);
      continue;
    }
    for (const step of stepLists[hue]) {
      if (!(step in value)) {
        errors.push(`palette.${hue}: missing step "${step}" (full ladder required)`);
      } else if (!HEX_RE.test(value[step])) {
        errors.push(`palette.${hue}.${step}: must be a #RRGGBB hex, got "${value[step]}"`);
      }
    }
    for (const step of Object.keys(value)) {
      if (!stepLists[hue].includes(step)) {
        errors.push(`palette.${hue}.${step}: unknown step (expected ${stepLists[hue].join('/')})`);
      }
    }
  }

  const themes = config.themes ?? {};
  if (typeof themes !== 'object' || themes === null || Array.isArray(themes)) {
    errors.push('themes: must be an object keyed by theme name');
  } else {
    for (const [name, theme] of Object.entries(themes)) {
      if (typeof theme !== 'object' || theme === null) {
        errors.push(`themes.${name}: must be an object`);
        continue;
      }
      for (const key of Object.keys(theme)) {
        if (!['enabled', 'extends', 'semantic'].includes(key)) {
          errors.push(`themes.${name}.${key}: unknown key`);
        }
      }
      if (theme.enabled !== undefined && typeof theme.enabled !== 'boolean') {
        errors.push(`themes.${name}.enabled: must be a boolean`);
      }
      if (theme.extends !== undefined && typeof theme.extends !== 'string') {
        errors.push(`themes.${name}.extends: must be a theme name`);
      }
      if (theme.semantic !== undefined) {
        const sem = theme.semantic;
        if (typeof sem !== 'object' || sem === null) {
          errors.push(`themes.${name}.semantic: must be an object of groups`);
        } else {
          for (const [group, slots] of Object.entries(sem)) {
            for (const [slot, spec] of Object.entries(slots ?? {})) {
              const semanticName = `themes.${name}.semantic.${group}.${slot}`;
              if (typeof spec === 'string' && HEX_RE.test(spec)) {
                continue;
              }
              if (typeof spec === 'object' && spec !== null && typeof spec.palette === 'string') {
                const [hue, step] = spec.palette.split('/');
                if (!(hue in stepLists) || !stepLists[hue].includes(step)) {
                  errors.push(`${semanticName}: palette "${spec.palette}" does not exist`);
                }
                continue;
              }
              errors.push(`${semanticName}: must be a #RRGGBB hex or {"palette": "hue/step"}`);
            }
          }
        }
      }
    }
  }

  return errors;
}

/* ---------------------------------------------------------------- */
/* assembly                                                          */
/* ---------------------------------------------------------------- */

function cssBlock(selector, declarations) {
  const lines = declarations.map(([name, value]) => `  --${name}: ${value};`).join('\n');
  return `${selector} {\n${lines}\n}\n`;
}

/**
 * Complete palette assignment. Overrides merge over defaults; the brand
 * ramp is generated from the seed (or taken from the full object) and
 * defaults to the library brand values when absent.
 */
export function buildPaletteCss(overrides, stepLists, defaults, scopeName) {
  const declarations = [];
  for (const [hue, steps] of Object.entries(stepLists)) {
    const override = overrides[hue];
    let values;
    if (hue === 'brand') {
      if (typeof override === 'string') {
        values = generateBrandRamp(override, steps);
      } else {
        values = override ?? Object.fromEntries(steps.map((s) => [s, defaults[`brand.${s}`]]));
      }
    } else if (override) {
      values = override;
    }
    for (const step of steps) {
      declarations.push([
        `colox-palette-${hue}-${step}`,
        (values?.[step] ?? defaults[`${hue}.${step}`])?.toUpperCase?.(),
      ]);
    }
  }
  return cssBlock(`:root[data-colox-palette='${scopeName}']`, declarations);
}

/**
 * Complete semantic assignment for one theme: the stock assignments
 * (var()-chained or literals) with the configured overrides spliced in.
 * Order follows cli-data (sorted by group-leaf).
 */
export function buildThemeCss(themeName, baseSemantics, overrides) {
  const byName = new Map(baseSemantics.map((t) => [`${t.group}-${t.leaf}`, t]));
  for (const [group, slots] of Object.entries(overrides ?? {})) {
    for (const [leaf, spec] of Object.entries(slots)) {
      const key = `${group}-${leaf}`;
      const entry = byName.get(key);
      if (!entry) {
        throw new Error(`themes.${themeName}.semantic.${key}: not a semantic token`);
      }
      entry.value =
        typeof spec === 'string' ? spec : `var(--colox-palette-${spec.palette.replace('/', '-')})`;
    }
  }
  const declarations = Array.from(byName, ([, entry]) => {
    const prefix = entry.group === 'shadow' ? 'colox-shadow' : `colox-color-${entry.group}`;
    return [`${prefix}-${entry.leaf}`, entry.value];
  });
  return cssBlock(`:root[data-colox-theme='${themeName}']`, declarations);
}
