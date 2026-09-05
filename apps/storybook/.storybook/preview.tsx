import type { Preview } from '@storybook/react';
import { ColoxTheme, type ColoxThemeName } from '@colox/theme';
import '../../../packages/components/src/styles/index.scss';
import '../../../packages/theme/dist/themes/palette.css';
import '../../../packages/theme/dist/themes/light.css';
import '../../../packages/theme/dist/themes/dark.css';
// Demo of the user-side theme pipeline (apps/storybook/colox.theme.json,
// compiled with `colox theme build -c colox.theme.json`):
// a complete-assignment palette axis and a config-extended theme.
import './demo-themes/demo.css';
import './demo-themes/deep.css';

const preview: Preview = {
  globalTypes: {
    theme: {
      name: 'Colox Theme',
      description: 'Toggle the data-colox-theme axis via <ColoxTheme.Theme>',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'system', title: 'System', icon: 'mirror' },
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
          { value: 'deep', title: 'Deep', icon: 'star' },
        ],
        dynamicTitle: true,
        showName: true,
      },
    },
    palette: {
      name: 'Colox Palette',
      description: 'Toggle the data-colox-palette axis via <ColoxTheme.Palette>',
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: 'default', title: 'Default', icon: 'batchaccept' },
          { value: 'demo', title: 'Custom', icon: 'batchdeny' },
        ],
        dynamicTitle: true,
        showName: true,
      },
    },
  },
  initialGlobals: {
    theme: 'system',
    palette: 'default',
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
        { name: 'deep', value: '#0b0d12' },
      ],
    },
  },
  decorators: [
    // Dogfood: the parts write the three axes; toolbar choices map straight to declarations.
    (Story, context) => (
      <ColoxTheme>
        <ColoxTheme.Theme name={context.globals.theme as ColoxThemeName} />
        <ColoxTheme.Palette name={context.globals.palette === 'demo' ? 'demo' : undefined} />
        <Story />
      </ColoxTheme>
    ),
  ],
};

export default preview;
