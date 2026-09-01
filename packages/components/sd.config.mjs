/**
 * Colox light theme generation (Style Dictionary v4).
 *
 * Sources (src/styles/tokens/):
 * - generated from Figma exports via figma-to-tokens.mjs: color
 *   (palette), semantic-colors.light, typography, size
 * - hand-maintained: semantic.derived + semantic.brand (hover/active
 *   rules and the brand group's palette references), palette.brand
 *   (default brand ramp = the indigo values), base
 *
 * Output: dist/themes/light.css — flat runtime variables on :root.
 * Palette vars are exported and the semantic layer references them
 * (outputReferences), so a palette-axis swap (data-colox-palette)
 * re-derives the theme at runtime without recompiling.
 *
 * The dark export must NOT be part of this pipeline: light.css carries
 * the complete light assignment (52 + 4 brand + 6 derived semantic
 * tokens) plus the theme-independent palette block.
 */
export default {
  source: [
    'src/styles/tokens/color.tokens.json',
    'src/styles/tokens/palette.brand.tokens.json',
    'src/styles/tokens/semantic-colors.light.tokens.json',
    'src/styles/tokens/semantic.brand.tokens.json',
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
          options: {
            selector: ':root',
            outputReferences: true,
          },
        },
      ],
    },
  },
};
