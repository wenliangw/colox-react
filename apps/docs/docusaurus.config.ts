import type { Config } from '@docusaurus/types';
import { themes as prismThemes } from 'prism-react-renderer';

const config: Config = {
  title: 'Colox React',
  tagline:
    'A component library governed by one design language — three axes name every visual choice.',
  favicon: 'img/favicon.svg',

  // Syncs the docs light/dark toggle onto the colox theme suites
  // (data-colox-theme), so components and tokens follow it verbatim.
  clientModules: ['./src/clientModules/colox-theme-sync'],

  // Set the production url of your site here.
  url: 'https://colox-react.dev',
  baseUrl: '/',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/wenliangw/colox-react/tree/master/apps/docs/',
        },
        blog: false,
        theme: {
          // The colox aggregate css (tokens + component styles) is
          // loaded through the client module instead: customCss
          // resolves fs paths only (path.resolve(siteDir, p)) and
          // cannot reach package exports.
          customCss: './src/css/custom.scss',
        },
      },
    ],
  ],

  // Docusaurus has no built-in SCSS support, so register an inline plugin that
  // wires up sass-loader through the official getStyleLoaders helper to compile
  // .scss / .module.scss files.
  plugins: [
    () => ({
      name: 'docusaurus-scss',
      configureWebpack: (_config, isServer, utils) => ({
        module: {
          rules: [
            {
              test: /\.s[ca]ss$/i,
              exclude: /\.module\.s[ca]ss$/i,
              use: [
                ...utils.getStyleLoaders(isServer, {
                  importLoaders: 2,
                  sourceMap: true,
                }),
                {
                  loader: 'sass-loader',
                  options: { sourceMap: true, api: 'modern' },
                },
              ],
            },
            {
              test: /\.module\.s[ca]ss$/i,
              use: [
                ...utils.getStyleLoaders(isServer, {
                  modules: {
                    localIdentName: '[local]_[contenthash:base64:4]',
                    exportOnlyLocals: isServer,
                  },
                  importLoaders: 2,
                  sourceMap: true,
                }),
                {
                  loader: 'sass-loader',
                  options: { sourceMap: true, api: 'modern' },
                },
              ],
            },
          ],
        },
      }),
    }),
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Colox React',
      logo: {
        src: 'img/colox-mark.svg',
        alt: 'Colox',
        width: 24,
        height: 24,
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docs',
          position: 'left',
          label: 'Docs',
        },
        {
          type: 'dropdown',
          position: 'left',
          label: 'Components',
          items: [
            { type: 'doc', docId: 'components/button', label: 'Button' },
            { type: 'doc', docId: 'components/icon-button', label: 'IconButton' },
            { type: 'doc', docId: 'components/input', label: 'Input' },
            { type: 'doc', docId: 'components/select', label: 'Select' },
            { type: 'doc', docId: 'components/checkbox', label: 'Checkbox' },
            { type: 'doc', docId: 'components/radio', label: 'Radio' },
            { type: 'doc', docId: 'components/container', label: 'Container' },
            { type: 'doc', docId: 'components/grid', label: 'Grid' },
            { type: 'doc', docId: 'components/stack', label: 'Stack' },
          ],
        },
        {
          type: 'dropdown',
          position: 'left',
          label: 'Toolchain',
          items: [
            {
              label: '@colox/wiki — the AI doctrine',
              href: 'https://github.com/wenliangw/colox-react/tree/master/packages/wiki',
            },
            {
              label: '@colox/mcp — the MCP server',
              href: 'https://github.com/wenliangw/colox-react/tree/master/packages/mcp',
            },
            {
              label: '@colox/theme-builder — the CLI',
              href: 'https://github.com/wenliangw/colox-react/tree/master/packages/theme-builder',
            },
            {
              label: '@colox/theme — the runtime',
              href: 'https://github.com/wenliangw/colox-react/tree/master/packages/theme',
            },
          ],
        },
        {
          href: 'https://github.com/wenliangw/colox-react',
          position: 'right',
          className: 'colox-github-link',
          'aria-label': 'GitHub repository',
        },
      ],
    },
    footer: {
      style: 'dark',
      copyright: `Copyright © ${new Date().getFullYear()} Colox React. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  },
};

export default config;
