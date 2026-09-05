import type { Meta, StoryObj } from '@storybook/react';
import { HStack, VStack } from '@colox/react';

const demoBox = {
  background: 'var(--colox-color-bg-muted)',
  border: '1px solid var(--colox-color-border-muted)',
  borderRadius: 'var(--colox-radius-sm)',
  padding: 'var(--colox-spacing-3) var(--colox-spacing-4)',
} as const;

const Demo = ({ label }: { label: string }) => (
  <div style={demoBox}>
    <span>{label}</span>
  </div>
);

const meta: Meta<typeof VStack> = {
  title: 'Components/VStack',
  component: VStack,
  args: { gap: '4' },
};

export default meta;

type Story = StoryObj<typeof VStack>;

export const Default: Story = {
  render: (args) => (
    <VStack {...args}>
      <Demo label="Section one" />
      <Demo label="Section two" />
      <Demo label="Section three" />
    </VStack>
  ),
};

export const GapScale: Story = {
  render: () => (
    <HStack gap="8" align="start">
      {(['1', '2', '4', '8', '16'] as const).map((gap) => (
        <VStack key={gap} gap={gap}>
          <Demo label={`gap ${gap}`} />
          <Demo label="x" />
        </VStack>
      ))}
    </HStack>
  ),
};

export const FormFeel: Story = {
  render: () => (
    <VStack gap="4" align="stretch" style={{ width: 320 }}>
      <Demo label="label" />
      <Demo label="field" />
      <Demo label="field" />
      <Demo label="actions" />
    </VStack>
  ),
};
