/**
 * Colox theme generation (Style Dictionary v4).
 *
 * Sources (src/styles/tokens/):
 * - generated from Figma exports via figma-to-tokens.mjs: color,
 *   semantic-color, typography, size
 * - hand-maintained: semantic.derived (solid hover/active color-mix rules),
 *   base (font family / shadow / motion / breakpoints)
 *
 * Output: dist/themes/light.css — flat runtime variables (outputReferences:
 * false), palette filtered out. A theme is another assignment of the same
 * variable names.
 */
export default {
  source: [
    'src/styles/tokens/color.tokens.json',
    'src/styles/tokens/semantic-color.tokens.json',
    'src/styles/tokens/semantic.derived.tokens.json',
    'src/styles/tokens/typography.tokens.json',
    'src/styles/tokens/size.tokens.json',
    'src/styles/tokens/base.tokens.json',
  ],
  platforms: {
    css: {
      transforms: ['name/kebab'],
      buildPath: 'dist/themes/',
      files: [
        {
          destination: 'light.css',
          format: 'css/variables',
          filter: (token) => !token.path.includes('palette'),
          options: {
            selector: ':root',
            outputReferences: false,
          },
        },
      ],
    },
  },
};
