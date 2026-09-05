/**
 * Colox light theme generation (Style Dictionary v4).
 *
 * Sources (src/styles/tokens/):
 * - generated from Figma exports via figma-to-tokens.mjs: color
 *   (palette, needed only so the semantic references resolve),
 *   semantic-colors.light, typography, size
 * - hand-maintained: semantic.derived + semantic.brand (hover/active
 *   rules and the brand group's palette references), semantic.shadow
 *   (light shadow assignment), base
 *
 * Output: dist/themes/light.css — the complete LIGHT assignment on
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

export default {
  source: [
    'src/styles/tokens/color.tokens.json',
    'src/styles/tokens/palette.brand.tokens.json',
    'src/styles/tokens/semantic-colors.light.tokens.json',
    'src/styles/tokens/semantic.brand.tokens.json',
    'src/styles/tokens/semantic.derived.tokens.json',
    'src/styles/tokens/semantic.shadow.tokens.json',
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
