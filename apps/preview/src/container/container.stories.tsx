import type { Meta, StoryObj } from '@storybook/react';
import { Container, Stack } from '@colox/react';
import { Section } from '../showcase/section';

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
            <Container size="sm">
              <div style={demoFill}>size sm — 640px cap</div>
            </Container>
            <Container size="md">
              <div style={demoFill}>size md — 768px cap</div>
            </Container>
            <Container size="lg">
              <div style={demoFill}>size lg — 1024px cap</div>
            </Container>
            <Container size="xl">
              <div style={demoFill}>size xl — 1280px cap</div>
            </Container>
            <Container>
              <div style={demoFill}>no size — no cap, fills the canvas</div>
            </Container>
          </Stack>
        </Section>

        <Section title="Gutters">
          <Stack direction="column" gap="2">
            <Container size="md" gutter="2">
              <div style={demoFill}>gutter 2 — 8px inline padding</div>
            </Container>
            <Container size="md">
              <div style={demoFill}>no gutter — the CSS default of 0</div>
            </Container>
          </Stack>
        </Section>

        <Section title="Alignment">
          <Stack direction="column" gap="2">
            <Container size="md">
              <div style={demoFill}>center — the default shell semantic</div>
            </Container>
            <Container size="md" align="start">
              <div style={demoFill}>align start — pinned to the inline start edge</div>
            </Container>
            <Container size="md" align="end">
              <div style={demoFill}>align end — pinned to the inline end edge</div>
            </Container>
          </Stack>
        </Section>
      </Stack>
    </Container>
  ),
};
