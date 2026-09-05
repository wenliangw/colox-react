import { resolve } from 'node:path';
import type { StorybookConfig } from '@storybook/react-vite';

// Story globs are resolved relative to this config directory.
// Component examples live in apps/preview/src/<Component>/ (the preview
// app owns its content); the legacy patterns under packages/components
// stay active only until Button/Input are rewritten.
const config: StorybookConfig = {
  stories: [
    '../src/**/*.stories.@(ts|tsx)',
    '../../../packages/components/src/**/*.stories.@(ts|tsx)',
  ],
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
    };
    return config;
  },
};

export default config;
