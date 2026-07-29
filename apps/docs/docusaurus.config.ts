import type { Config } from '@docusaurus/types';
import { themes as prismThemes } from 'prism-react-renderer';

const config: Config = {
  title: 'Colox React',
  tagline: 'A modern React component library',
  favicon: 'img/favicon.svg',

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
          editUrl: 'https://github.com/colox/colox-react/tree/master/apps/docs/',
        },
        blog: false,
        theme: {
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
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docs',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://github.com/colox/colox-react',
          label: 'GitHub',
          position: 'right',
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
