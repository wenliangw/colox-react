/**
 * Colox dark theme generation (Style Dictionary v4).
 *
 * A theme is a COMPLETE assignment of the same variable names. dark.css
 * therefore outputs every semantic color token (colox.color.* — the 58
 * tokens from the role groups, color tiers and derived rules), scoped to
 * [data-colox-theme='dark']. Palette tokens are theme-independent and
 * stay in light.css only.
 *
 * The dark overrides (semantic-color.dark.tokens.json) come last in the
 * source list, so path collisions resolve to dark values; the collision
 * log is the build-time proof that every override maps to an existing
 * light variable (no orphan names). Tokens without a dark override fall
 * through with their light value, making the assignment complete.
 */
export default {
  source: [
    'src/styles/tokens/color.tokens.json',
    'src/styles/tokens/semantic-color.tokens.json',
    'src/styles/tokens/semantic.derived.tokens.json',
    'src/styles/tokens/typography.tokens.json',
    'src/styles/tokens/size.tokens.json',
    'src/styles/tokens/base.tokens.json',
    'src/styles/tokens/semantic-color.dark.tokens.json',
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
            outputReferences: false,
          },
        },
      ],
    },
  },
};
