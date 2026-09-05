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

const meta: Meta<typeof HStack> = {
  title: 'Components/HStack',
  component: HStack,
  args: { gap: '2' },
};

export default meta;

type Story = StoryObj<typeof HStack>;

export const Default: Story = {
  render: (args) => (
    <HStack {...args}>
      <Demo label="Alpha" />
      <Demo label="Beta" />
      <Demo label="Gamma" />
    </HStack>
  ),
};

export const GapScale: Story = {
  render: () => (
    <VStack gap="4" align="start">
      {(['1', '2', '4', '8', '16'] as const).map((gap) => (
        <HStack key={gap} gap={gap}>
          <Demo label={`gap ${gap}`} />
          <Demo label="x" />
        </HStack>
      ))}
    </VStack>
  ),
};

export const Alignment: Story = {
  render: () => (
    <VStack gap="4" align="start">
      <HStack
        align="start"
        style={{
          border: '1px dashed var(--colox-color-border-muted)',
          padding: 'var(--colox-spacing-2)',
        }}
      >
        <Demo label="start" />
        <Demo label="taller" />
      </HStack>
      <HStack
        align="center"
        style={{
          border: '1px dashed var(--colox-color-border-muted)',
          padding: 'var(--colox-spacing-2)',
        }}
      >
        <Demo label="center" />
        <Demo label="taller" />
      </HStack>
      <HStack
        align="stretch"
        style={{
          border: '1px dashed var(--colox-color-border-muted)',
          padding: 'var(--colox-spacing-2)',
        }}
      >
        <Demo label="stretch" />
        <Demo label="taller" />
      </HStack>
    </VStack>
  ),
};

export const Wrap: Story = {
  render: () => (
    <HStack gap="2" wrap style={{ maxWidth: 260 }}>
      {['1', '2', '3', '4', '5', '6', '7', '8'].map((label) => (
        <Demo key={label} label={label} />
      ))}
    </HStack>
  ),
};
