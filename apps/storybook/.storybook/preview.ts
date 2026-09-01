import type { Preview } from '@storybook/react';
import '../../../packages/components/src/styles/index.scss';
import '../../../packages/components/dist/themes/light.css';
import '../../../packages/components/dist/themes/dark.css';

const preview: Preview = {
  globalTypes: {
    theme: {
      name: 'Colox Theme',
      description: 'Toggle the data-colox-theme attribute (light/dark)',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
        showName: true,
      },
    },
  },
  initialGlobals: {
    theme: 'light',
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'centered',
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1a1a1a' },
      ],
    },
  },
  decorators: [
    (Story, context) => {
      document.documentElement.setAttribute('data-colox-theme', context.globals.theme ?? 'light');
      return Story();
    },
  ],
};

export default preview;
