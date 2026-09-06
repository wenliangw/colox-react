/**
 * Colox light theme generation (Style Dictionary v4).
 *
 * Sources (token workspace, default src/styles/tokens/):
 * - generated from Figma exports via figma-to-tokens.mjs: color
 *   (palette, needed only so the semantic references resolve),
 *   semantic-colors.light, typography, size
 * - hand-maintained: semantic.derived + semantic.brand (hover/active
 *   rules and the brand group's palette references), semantic.shadow
 *   (light shadow assignment), base
 *
 * Output: <outDir>/themes/light.css — the complete LIGHT assignment on
 * :root: 80 semantic color vars + 3 shadow vars (var()-chained into the
 * palette where applicable) plus the theme-independent design tokens
 * (typography/size/base). Palette
 * declarations are NOT emitted here — they live in palette.css
 * (sd-palette.config.mjs), so light.css cannot be loaded as a
 * replacement for the palette baseline.
 *
 * The dark export must NOT be part of this pipeline: light.css carries
 * the complete light assignment (52 + 4 brand + 6 derived semantic
 * tokens), dark.css carries its own complete assignment.
 */

import path from 'node:path';

// Paths are driven by scripts/stock-build.mjs through env; defaults keep
// the builder package self-hosted (running from the package root).
const tokens = (file) =>
  path.join(process.env.COLox_TOKENS_DIR ?? path.join(process.cwd(), 'src/styles/tokens'), file);

export default {
  source: [
    tokens('color.tokens.json'),
    tokens('palette.brand.tokens.json'),
    tokens('semantic-colors.light.tokens.json'),
    tokens('semantic.brand.tokens.json'),
    tokens('semantic.derived.tokens.json'),
    tokens('semantic.shadow.tokens.json'),
    tokens('typography.tokens.json'),
    tokens('size.tokens.json'),
    tokens('base.tokens.json'),
  ],
  platforms: {
    css: {
      transforms: ['name/kebab'],
      buildPath: process.env.COLox_THEMES_OUT ?? 'dist/themes/',
      files: [
        {
          destination: 'light.css',
          format: 'css/variables',
          filter: (token) => token.path[1] !== 'palette',
          options: {
            selector: ':root',
            outputReferences: true,
          },
        },
      ],
    },
  },
};
