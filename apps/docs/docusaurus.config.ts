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
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docs',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://github.com/wenliangw/colox-react',
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
