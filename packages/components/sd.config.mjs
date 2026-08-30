/**
 * Colox theme generation (Style Dictionary v4).
 *
 * Sources:
 * - color.tokens.json     基元色板（由 figma-to-tokens.mjs 从 Figma 导出生成）
 * - semantic.tokens.json  语义层（稳定公共契约，人工维护）
 *
 * Output: dist/themes/light.css — 运行时单层展平（outputReferences: false），
 * 仅输出语义变量（filter 排除 palette），主题 = 同名语义变量的多组赋值。
 */
export default {
  source: ['src/styles/tokens/color.tokens.json', 'src/styles/tokens/semantic.tokens.json'],
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
