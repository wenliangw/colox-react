/**
 * Colox palette generation (Style Dictionary v4).
 *
 * The palette is theme-INDEPENDENT: a single flat assignment of every
 * colox.palette.* var (color.tokens.json hues + white/black alpha
 * ramps + the default brand ramp) on :root. Theme files (light/dark)
 * reference these vars through the variable chain; both semantics are
 * complete assignments on top of this shared baseline.
 *
 * Output: <outDir>/themes/palette.css — always load this file wherever a
 * theme file is loaded. Order is irrelevant: plain :root declarations
 * are overwritten by the :root[data-colox-palette='…'] axis files
 * (0,2,0) from the colox CLI regardless of stylesheet order.
 */

import path from 'node:path';

// Paths are driven by scripts/stock-build.mjs through env; defaults keep
// the builder package self-hosted (running from the package root).
const tokens = (file) =>
  path.join(process.env.COLox_TOKENS_DIR ?? path.join(process.cwd(), 'src/styles/tokens'), file);

export default {
  source: [tokens('color.tokens.json'), tokens('palette.brand.tokens.json')],
  platforms: {
    cssPalette: {
      transforms: ['name/kebab'],
      buildPath: process.env.COLox_THEMES_OUT ?? 'dist/themes/',
      files: [
        {
          destination: 'palette.css',
          format: 'css/variables',
          filter: (token) => token.path[1] === 'palette',
          options: {
            selector: ':root',
            outputReferences: false,
          },
        },
      ],
    },
  },
};
