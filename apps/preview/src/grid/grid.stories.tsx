import type { Meta, StoryObj } from '@storybook/react';
import { Grid } from '@colox/react';

const demoBox = {
  background: 'var(--colox-color-bg-muted)',
  border: '1px solid var(--colox-color-border-muted)',
  borderRadius: 'var(--colox-radius-sm)',
  padding: 'var(--colox-spacing-3) var(--colox-spacing-4)',
} as const;

const Demo = ({ label }: { label: string }) => (
  <Grid.Item style={demoBox}>
    <span>{label}</span>
  </Grid.Item>
);

const meta: Meta<typeof Grid> = {
  title: 'Components/Grid',
  component: Grid,
};

export default meta;

type Story = StoryObj<typeof Grid>;

export const Default: Story = {
  args: { columns: 3, gap: '4' },
  render: (args) => (
    <Grid {...args}>
      <Demo label="Alpha" />
      <Demo label="Beta" />
      <Demo label="Gamma" />
      <Demo label="Delta" />
      <Demo label="Epsilon" />
      <Demo label="Zeta" />
    </Grid>
  ),
};

export const ResponsiveColumns: Story = {
  render: () => (
    <Grid columns={{ sm: 1, md: 2, lg: 4 }} gap="4">
      <Demo label="Resize the viewport" />
      <Demo label="1 column on sm" />
      <Demo label="2 from md" />
      <Demo label="4 from lg on" />
    </Grid>
  ),
};

export const PerAxisGap: Story = {
  render: () => (
    <Grid columns={2} gap={{ row: '4', column: '8' }}>
      <Demo label="row 4" />
      <Demo label="column 8" />
      <Demo label="row 4" />
      <Demo label="column 8" />
    </Grid>
  ),
};

export const SpannedItem: Story = {
  render: () => (
    <Grid columns={4} gap="4">
      <Grid.Item span={2} style={demoBox}>
        <span>featured (span 2)</span>
      </Grid.Item>
      <Demo label="aside" />
      <Demo label="aside" />
      <Demo label="footer a" />
      <Demo label="footer b" />
      <Demo label="footer c" />
    </Grid>
  ),
};
