/**
 * Colox dark theme generation (Style Dictionary v4).
 *
 * Figma owns both theme assignments: semantic-colors.light/dark are
 * complete Figma exports (52 tokens each, values resolved per mode and
 * emitted as palette references). The dark pipeline consumes the dark
 * export plus hand-maintained files: semantic.brand.dark (brand group
 * references), semantic.derived.dark (hover/active color-mix rules) and
 * semantic.shadow.dark (dark shadow assignment).
 *
 * Output: <outDir>/themes/dark.css — a COMPLETE assignment of the same
 * variable names as the light theme's color section (58 + 4 brand tokens).
 */

import path from 'node:path';

// Paths are driven by scripts/build.mjs through env; defaults keep
// the builder package self-hosted (running from the package root).
const tokens = (file) =>
  path.join(process.env.COLox_TOKENS_DIR ?? path.join(process.cwd(), 'src/styles/tokens'), file);

export default {
  source: [
    tokens('color.tokens.json'),
    tokens('palette.brand.tokens.json'),
    tokens('semantic-colors.dark.tokens.json'),
    tokens('semantic.brand.dark.tokens.json'),
    tokens('semantic.derived.dark.tokens.json'),
    tokens('semantic.shadow.dark.tokens.json'),
  ],
  platforms: {
    cssDark: {
      transforms: ['name/kebab'],
      buildPath: process.env.COLox_THEMES_OUT ?? 'dist/themes/',
      files: [
        {
          destination: 'dark.css',
          format: 'css/variables',
          filter: (token) => token.path[1] === 'color' || token.path[1] === 'shadow',
          options: {
            selector: ":root[data-colox-theme='dark']",
            outputReferences: true,
          },
        },
      ],
    },
  },
};
