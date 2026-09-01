/**
 * Colox dark theme generation (Style Dictionary v4).
 *
 * Figma owns both theme assignments: semantic-colors.light/dark are
 * complete Figma exports (52 tokens each, values resolved per mode and
 * emitted as palette references). The dark pipeline consumes the dark
 * export plus hand-maintained files: semantic.brand.dark (brand group
 * references) and semantic.derived.dark (hover/active color-mix rules).
 *
 * Palette tokens are in the dictionary so references resolve, but are
 * filtered out of dark.css — the theme-independent palette block lives
 * in light.css only (dark.css must therefore load after light.css).
 * The output is a COMPLETE assignment of the same variable names as
 * the light theme's color section (58 + 4 brand tokens).
 */
export default {
  source: [
    'src/styles/tokens/color.tokens.json',
    'src/styles/tokens/palette.brand.tokens.json',
    'src/styles/tokens/semantic-colors.dark.tokens.json',
    'src/styles/tokens/semantic.brand.dark.tokens.json',
    'src/styles/tokens/semantic.derived.dark.tokens.json',
  ],
  platforms: {
    cssDark: {
      transforms: ['name/kebab'],
      buildPath: 'dist/themes/',
      files: [
        {
          destination: 'dark.css',
          format: 'css/variables',
          filter: (token) => token.path[1] === 'color',
          options: {
            selector: "[data-colox-theme='dark']",
            outputReferences: true,
          },
        },
      ],
    },
  },
};
