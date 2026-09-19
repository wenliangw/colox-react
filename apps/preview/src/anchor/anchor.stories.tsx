import type { Meta, StoryObj } from '@storybook/react';
import { Anchor, Button, Container, Positioner, Stack } from '@colox/react';
import { Section } from '../showcase/section';

const frame = {
  inlineSize: '100%',
  blockSize: 96,
  border: '1px dashed var(--colox-color-border-muted)',
  borderRadius: 'var(--colox-radius-sm)',
  background: 'var(--colox-color-bg-muted)',
} as const;

const marker = {
  inlineSize: 12,
  blockSize: 12,
  borderRadius: 'var(--colox-radius-full)',
  background: 'var(--colox-color-brand-solid)',
} as const;

const caption = {
  fontSize: 'var(--colox-font-size-xs)',
  lineHeight: 'var(--colox-line-height-xs)',
  color: 'var(--colox-color-text-muted)',
} as const;

// The frame serves any absolutely positioned child — a hand-written one
// as well as a Positioner.
const ReferenceDemo = () => (
  <Anchor style={frame}>
    <div
      style={{
        position: 'absolute',
        insetBlockStart: 'var(--colox-spacing-2)',
        insetInlineStart: 'var(--colox-spacing-2)',
        ...caption,
      }}
    >
      hand-written absolute child
    </div>
    <Positioner placement="bottom-end" offset="2" style={marker} />
  </Anchor>
);

// `inline` hugs the content, so the frame's box is exactly the control's
// box — what an overlay needs to pin to a corner.
const HugDemo = () => (
  <Stack direction="column" gap="4">
    <Anchor inline>
      <Button>Inbox</Button>
      <Positioner
        placement="top-end"
        offset="1"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          inlineSize: 18,
          blockSize: 18,
          borderRadius: 'var(--colox-radius-full)',
          background: 'var(--colox-color-brand-solid)',
          color: 'var(--colox-color-brand-inverse)',
          fontSize: 'var(--colox-font-size-xs)',
          lineHeight: 1,
        }}
      >
        3
      </Positioner>
    </Anchor>
    <Stack direction="column" gap="1">
      <span style={caption}>without `inline`, the frame fills the block flow:</span>
      <Anchor style={{ border: '1px dashed var(--colox-color-border-muted)' }}>
        <Button>Inbox</Button>
      </Anchor>
    </Stack>
  </Stack>
);

const meta: Meta<typeof Anchor> = {
  title: 'Components/Anchor',
  component: Anchor,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The reference frame: a layout-neutral relative box whose own box is what absolutely positioned boxes resolve against — any absolute child, hand-written or a Positioner. `inline` hugs the content (the badge wrap shape). It is not a layout container: flexbox/grid flow belongs to Stack/Grid.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Anchor>;

export const Overview: Story = {
  render: () => (
    <Container size="md" gutter="4">
      <Stack direction="column" gap="8">
        <Section title="Reference box">
          <ReferenceDemo />
        </Section>

        <Section title="Hug">
          <HugDemo />
        </Section>
      </Stack>
    </Container>
  ),
};
