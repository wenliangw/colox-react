/**
 * Colox theme generation (Style Dictionary v4).
 *
 * Sources (all under src/styles/tokens/, generated or maintained as noted):
 * - color.tokens.json           基元色板（figma-to-tokens.mjs 从 Figma 导出生成）
 * - semantic-color.tokens.json  语义层（figma-to-tokens.mjs 从 Figma 导出生成）
 * - semantic.derived.tokens.json 实底交互态派生（人工维护的 color-mix 规则）
 * - typography.tokens.json      字号/字重/行高（figma-to-tokens.mjs 生成）
 * - size.tokens.json            圆角/间距（figma-to-tokens.mjs 生成）
 * - base.tokens.json            字体族/阴影/动效（人工维护：Figma variables 不便承载）
 *
 * Output: dist/themes/light.css — 运行时单层展平（outputReferences: false），
 * 仅输出语义与尺寸变量（filter 排除 palette），主题 = 同名变量的多组赋值。
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
