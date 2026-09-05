import type { Meta, StoryObj } from '@storybook/react';
import { Stack } from '@colox/react';

const demoBox = {
  background: 'var(--colox-color-bg-muted)',
  border: '1px solid var(--colox-color-border-muted)',
  borderRadius: 'var(--colox-radius-sm)',
  padding: 'var(--colox-spacing-3) var(--colox-spacing-4)',
} as const;

const Demo = ({ label }: { label: string }) => (
  <Stack.Item style={demoBox}>
    <span>{label}</span>
  </Stack.Item>
);

const meta: Meta<typeof Stack> = {
  title: 'Components/Stack',
  component: Stack,
};

export default meta;

type Story = StoryObj<typeof Stack>;

export const Default: Story = {
  args: { gap: '2' },
  render: (args) => (
    <Stack {...args}>
      <Demo label="Alpha" />
      <Demo label="Beta" />
      <Demo label="Gamma" />
    </Stack>
  ),
};

export const Direction: Story = {
  render: () => (
    <Stack direction="column" gap="4" align="start">
      <Stack direction="row" gap="2">
        <Demo label="row" />
        <Demo label="default" />
      </Stack>
      <Stack direction="row-reverse" gap="2">
        <Demo label="row-reverse" />
        <Demo label="end first" />
      </Stack>
      <Stack direction="column" gap="2">
        <Demo label="column" />
        <Demo label="top first" />
      </Stack>
      <Stack direction="column-reverse" gap="2">
        <Demo label="column-reverse" />
        <Demo label="bottom first" />
      </Stack>
    </Stack>
  ),
};

export const GapScale: Story = {
  render: () => (
    <Stack direction="column" gap="4" align="start">
      {(['1', '2', '4', '8', '16'] as const).map((gap) => (
        <Stack key={gap} gap={gap}>
          <Demo label={`gap ${gap}`} />
          <Demo label="x" />
        </Stack>
      ))}
    </Stack>
  ),
};

export const Alignment: Story = {
  render: () => (
    <Stack direction="column" gap="4" align="start">
      {(['start', 'center', 'stretch'] as const).map((align) => (
        <Stack
          key={align}
          align={align}
          style={{
            border: '1px dashed var(--colox-color-border-muted)',
            padding: 'var(--colox-spacing-2)',
          }}
        >
          <Demo label={align} />
          <Demo label="taller" />
        </Stack>
      ))}
    </Stack>
  ),
};

export const Spacer: Story = {
  render: () => (
    <Stack gap="2" style={{ maxWidth: 480 }}>
      <Demo label="Logo" />
      <Stack.Item grow />
      <Demo label="Settings" />
      <Demo label="Avatar" />
    </Stack>
  ),
};

export const Responsive: Story = {
  render: () => (
    <Stack gap="4">
      <Stack.Responsive gap={{ base: '2', md: '4', lg: '8' }} />
      <Demo label="Resize the viewport" />
      <Demo label="gap follows the band" />
      <Demo label="base 2 / md 4 / lg 8" />
    </Stack>
  ),
};
