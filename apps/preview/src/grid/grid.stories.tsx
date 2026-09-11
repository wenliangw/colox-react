import type { Meta, StoryObj } from '@storybook/react';
import { Container, Grid, Stack } from '@colox/react';
import { Section } from '../showcase/section';

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
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A column grid with responsive columns, per-axis gap and item spans.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Grid>;

export const Overview: Story = {
  render: () => (
    <Container size="md" gutter="4">
      <Stack direction="column" gap="8">
        <Section title="Columns">
          <Grid columns={3} gap="4">
            <Demo label="Alpha" />
            <Demo label="Beta" />
            <Demo label="Gamma" />
            <Demo label="Delta" />
            <Demo label="Epsilon" />
            <Demo label="Zeta" />
          </Grid>
        </Section>

        <Section title="Responsive columns">
          <Grid columns={{ sm: 1, md: 2, lg: 4 }} gap="4">
            <Demo label="Resize the viewport" />
            <Demo label="1 column on sm" />
            <Demo label="2 from md" />
            <Demo label="4 from lg on" />
          </Grid>
        </Section>

        <Section title="Per-axis gap">
          <Grid columns={2} gap={{ row: '4', column: '8' }}>
            <Demo label="row 4" />
            <Demo label="column 8" />
            <Demo label="row 4" />
            <Demo label="column 8" />
          </Grid>
        </Section>

        <Section title="Spanned items">
          <Grid columns={4} gap="4">
            <Grid.Item span={2} style={demoBox}>
              <span>featured (span 2)</span>
            </Grid.Item>
            <Demo label="aside" />
            <Demo label="aside" />
            <Demo label="footer a" />
            <Demo label="footer b" />
          </Grid>
        </Section>
      </Stack>
    </Container>
  ),
};
