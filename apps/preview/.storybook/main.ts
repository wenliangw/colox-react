import { resolve } from 'node:path';
import type { StorybookConfig } from '@storybook/react-vite';

// Story globs are resolved relative to this config directory.
// All component examples live in apps/preview/src/<Component>/ (the
// preview app owns its content) — packages/components carries no
// stories anymore.
const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-interactions'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  viteFinal: async (config) => {
    config.css = {
      ...config.css,
      preprocessorOptions: {
        scss: { api: 'modern' },
      },
    };
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...config.resolve.alias,
      // Examples write consumer-perspective imports (`@colox/react`)
      // while the dev server keeps them live against the source —
      // component changes hot-reload without rebuilding the package.
      '@colox/react': resolve(process.cwd(), '../../packages/components/src/index.ts'),
      // The components' internal cdk layer ships under this alias —
      // storybook consumes the source, so the alias must resolve here too.
      '@colox/cdk': resolve(process.cwd(), '../../packages/components/src/cdk'),
    };
    return config;
  },
};

export default config;
