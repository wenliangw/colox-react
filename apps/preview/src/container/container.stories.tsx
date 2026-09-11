import type { Meta, StoryObj } from '@storybook/react';
import { Container, Stack } from '@colox/react';
import { Section, Hint, track } from '../showcase/section';

const demoFill = {
  backgroundColor: 'var(--colox-color-bg-muted)',
  border: '1px solid var(--colox-color-border-muted)',
  borderRadius: 'var(--colox-radius-sm)',
  padding: 'var(--colox-spacing-3) var(--colox-spacing-4)',
} as const;

const meta: Meta<typeof Container> = {
  title: 'Components/Container',
  component: Container,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A centered, size-capped page shell with an optional gutter and alignment.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Container>;

export const Overview: Story = {
  render: () => (
    <Container size="xl" gutter="4">
      <Stack direction="column" gap="8">
        <Section title="Sizes">
          <Stack direction="column" gap="2">
            <div style={track}>
              <Container size="sm">
                <div style={demoFill}>sm — 640px cap</div>
              </Container>
            </div>
            <div style={track}>
              <Container size="md">
                <div style={demoFill}>md — 768px cap</div>
              </Container>
            </div>
            <div style={track}>
              <Container>
                <div style={demoFill}>no size — fills the track</div>
              </Container>
            </div>
            <Hint>lg · xl ride the same cap scale (1024 · 1280px).</Hint>
          </Stack>
        </Section>

        <Section title="Alignment">
          <Stack direction="column" gap="2">
            <div style={track}>
              <Container size="sm">
                <div style={demoFill}>center — the default shell semantic</div>
              </Container>
            </div>
            <div style={track}>
              <Container size="sm" align="start">
                <div style={demoFill}>start — pinned to the inline start edge</div>
              </Container>
            </div>
            <div style={track}>
              <Container size="sm" align="end">
                <div style={demoFill}>end — pinned to the inline end edge</div>
              </Container>
            </div>
          </Stack>
        </Section>

        <Section title="Gutters">
          <Stack direction="column" gap="2">
            <div style={track}>
              <Container size="md" gutter="2">
                <div style={demoFill}>gutter 2 — 8px inline padding</div>
              </Container>
            </div>
            <div style={track}>
              <Container size="md">
                <div style={demoFill}>no gutter — flush to the track</div>
              </Container>
            </div>
          </Stack>
        </Section>
      </Stack>
    </Container>
  ),
};
