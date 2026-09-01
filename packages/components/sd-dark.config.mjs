/**
 * Colox dark theme generation (Style Dictionary v4).
 *
 * Figma owns both theme assignments now: semantic-colors.light/dark are
 * complete Figma exports (each holds all 52 semantic color tokens, with
 * values resolved per mode). The dark pipeline therefore consumes ONLY
 * the dark export plus the hand-maintained dark derived rules
 * (semantic.derived.dark — hover/active color-mix toward white; Figma
 * does not export these). A theme is a COMPLETE assignment of the same
 * variable names, so dark.css must output exactly the same 58 tokens as
 * the light theme's color section (parity is verified after build).
 */
export default {
  source: [
    'src/styles/tokens/semantic-colors.dark.tokens.json',
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
            outputReferences: false,
          },
        },
      ],
    },
  },
};
