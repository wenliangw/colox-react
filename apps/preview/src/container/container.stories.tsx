import type { Meta, StoryObj } from '@storybook/react';
import { Container, Stack } from '@colox/react';

const demoFill = {
  backgroundColor: 'var(--colox-color-bg-muted)',
  border: '1px solid var(--colox-color-border-muted)',
  borderRadius: 'var(--colox-radius-sm)',
  padding: 'var(--colox-spacing-3) var(--colox-spacing-4)',
} as const;

const meta: Meta<typeof Container> = {
  title: 'Components/Container',
  component: Container,
};

export default meta;

type Story = StoryObj<typeof Container>;

export const Default: Story = {
  args: { size: 'md', gutter: '4' },
  render: (args) => (
    <Container {...args}>
      <div style={{ ...demoFill, minHeight: 96 }}>size md with a 4-key gutter</div>
    </Container>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack direction="column" gap="4">
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
    </Stack>
  ),
};

export const NoSize: Story = {
  render: () => (
    <Container>
      <div style={demoFill}>no size — no cap, fills the canvas</div>
    </Container>
  ),
};

export const Gutters: Story = {
  render: () => (
    <Stack direction="column" gap="4">
      <Container size="md" gutter="2">
        <div style={demoFill}>gutter 2 — 8px inline padding</div>
      </Container>
      <Container size="md">
        <div style={demoFill}>no gutter — CSS default padding of 0</div>
      </Container>
    </Stack>
  ),
};

export const Alignment: Story = {
  render: () => (
    <Container size="md" align="start">
      <div style={demoFill}>align start — pinned to the inline start edge</div>
    </Container>
  ),
};
