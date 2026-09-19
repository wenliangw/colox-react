import type { Meta, StoryObj } from '@storybook/react';
import { Anchor, Button, Container, Grid, Positioner, Stack } from '@colox/react';
import type { PositionerOffset, PositionerPlacement } from '@colox/react';
import { Section } from '../showcase/section';

// The demo frame is an Anchor: the box the nested Positioner resolves
// against — dashed so the reference box is visible, sized for every
// anchor.
const frame = {
  inlineSize: '100%',
  blockSize: 104,
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

const AnchorDemo = ({
  placement,
  offset,
}: {
  placement: PositionerPlacement;
  offset?: PositionerOffset;
}) => (
  <Stack direction="column" gap="1">
    <Anchor style={frame}>
      <Positioner placement={placement} offset={offset} style={marker} />
    </Anchor>
    <span style={caption}>{placement}</span>
  </Stack>
);

const ANCHORS: PositionerPlacement[] = [
  'top-start',
  'top',
  'top-end',
  'start',
  'center',
  'end',
  'bottom-start',
  'bottom',
  'bottom-end',
];

// The pinned-edge pair: an auto-sized box stretches between the edges it
// pins (a definite size would win instead — CSS over-constraint).
const StretchDemo = () => (
  <Stack direction="column" gap="1">
    <Anchor style={frame}>
      <Positioner
        placement="top-start"
        offset={{ top: '2', bottom: '2' }}
        style={{
          inlineSize: 12,
          borderRadius: 'var(--colox-radius-sm)',
          background: 'var(--colox-color-brand-solid)',
        }}
      />
    </Anchor>
    <span style={caption}>top-start · top + bottom 2</span>
  </Stack>
);

// The badge shape: the Anchor hugs the button, the Positioner rides its
// corner. Nothing extra in the DOM beyond the positioned box itself.
const BadgeDemo = () => (
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
);

// A positioned box is itself a reference, so frames compose without an
// extra Anchor — the inner box pins into the outer one, and the marker
// centres in the inner box.
const ComposedDemo = () => (
  <Anchor style={{ ...frame, blockSize: 160 }}>
    <Positioner
      placement="bottom-start"
      offset="3"
      style={{
        inlineSize: '45%',
        blockSize: 72,
        border: '1px solid var(--colox-color-brand-muted)',
        borderRadius: 'var(--colox-radius-sm)',
        background: 'var(--colox-color-bg-default)',
      }}
    >
      <Positioner placement="center" style={marker} />
    </Positioner>
  </Anchor>
);

// The cover layer: one box spanning its whole reference box.
const CoverDemo = () => (
  <Anchor style={{ ...frame, blockSize: 120, background: 'var(--colox-color-bg-default)' }}>
    <Stack direction="column" gap="2" style={{ padding: 'var(--colox-spacing-4)' }}>
      <span>Content stays in flow</span>
      <span style={caption}>The cover box sits above it, pinned to every edge.</span>
    </Stack>
    <Positioner
      fill
      style={{
        background: 'var(--colox-color-gray-wash-hover)',
        borderRadius: 'var(--colox-radius-sm)',
      }}
    />
  </Anchor>
);

// Page-level fixed: `position="fixed"` resolves against the viewport, so
// no Anchor is involved (scroll the story to see it).
const fab = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  inlineSize: 44,
  blockSize: 44,
  borderRadius: 'var(--colox-radius-full)',
  background: 'var(--colox-color-brand-solid)',
  color: 'var(--colox-color-brand-inverse)',
  fontSize: 'var(--colox-font-size-lg)',
  boxShadow: 'var(--colox-shadow-md)',
} as const;

const FixedDemo = () => (
  <Stack direction="column" gap="2">
    <span style={caption}>
      Page-level fixed: the boxes below pin to the viewport (bottom-end corner and top edge),
      independent of this container.
    </span>
    <Positioner position="fixed" placement="bottom-end" offset="5" style={fab}>
      ↑
    </Positioner>
    <Positioner
      position="fixed"
      placement="top"
      offset="2"
      style={{
        padding: 'var(--colox-spacing-1) var(--colox-spacing-3)',
        borderRadius: 'var(--colox-radius-full)',
        background: 'var(--colox-color-bg-overlay)',
        border: '1px solid var(--colox-color-border-muted)',
        boxShadow: 'var(--colox-shadow-sm)',
      }}
    >
      Fixed notice
    </Positioner>
  </Stack>
);

const meta: Meta<typeof Positioner> = {
  title: 'Components/Positioner',
  component: Positioner,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Two names for the positioning mechanism: `Anchor` is the reference frame (a relative box that hugs content on demand), `Positioner` is the positioned box that pins itself to an anchor of its reference box (the nearest positioned ancestor, or the viewport) at token-driven distances. A positioned box is itself a reference, so frames compose without extra wrappers — no measurement, no portal; following an anchor, flipping and collision handling belong to the floating layer.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Positioner>;

export const Overview: Story = {
  render: () => (
    <Container size="md" gutter="4">
      <Stack direction="column" gap="8">
        <Section title="Anchors">
          <Grid columns={3} gap="4">
            {ANCHORS.map((placement) => (
              <Grid.Item key={placement}>
                <AnchorDemo placement={placement} />
              </Grid.Item>
            ))}
          </Grid>
        </Section>

        <Section title="Offset">
          <Grid columns={3} gap="4">
            <Grid.Item>
              <AnchorDemo placement="top-end" offset="2" />
            </Grid.Item>
            <Grid.Item>
              <AnchorDemo placement="top-end" offset={{ top: '1', end: '4' }} />
            </Grid.Item>
            <Grid.Item>
              <StretchDemo />
            </Grid.Item>
          </Grid>
          <span
            style={{ ...caption, display: 'block', marginBlockStart: 'var(--colox-spacing-4)' }}
          >
            A bare key spaces the pinned edges (`top-end` → top + end). An object states each edge —
            and pins the edges it names, so two edges of one axis stretch an auto-sized box.
          </span>
        </Section>

        <Section title="Anchoring on content">
          <Stack direction="column" gap="4">
            <BadgeDemo />
            <CoverDemo />
            <ComposedDemo />
          </Stack>
        </Section>

        <Section title="Page-level fixed">
          <FixedDemo />
        </Section>
      </Stack>
    </Container>
  ),
};
