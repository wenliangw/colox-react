/**
 * Colox dark theme generation (Style Dictionary v4).
 *
 * The dark theme is a delta: same variable names as light, only the ~40
 * tokens whose dark value differs, scoped to [data-colox-theme='dark'].
 * Palette tokens are theme-independent and stay in light.css.
 *
 * The light sources are loaded here on purpose: dark values collide with
 * them by path, and because the dark file comes last, dark wins. The
 * collision log is the build-time proof that every dark override maps to
 * an existing light variable (no orphan names). Output keeps only the
 * dark-file tokens via the filePath filter.
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
          filter: (token) => token.filePath.endsWith('semantic-color.dark.tokens.json'),
          options: {
            selector: "[data-colox-theme='dark']",
            outputReferences: false,
          },
        },
      ],
    },
  },
};
