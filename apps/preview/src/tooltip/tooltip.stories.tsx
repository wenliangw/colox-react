import type { Meta, StoryObj } from '@storybook/react';
import { Button, Container, Stack, Tooltip } from '@colox/react';

import { Section } from '../showcase/section';

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The hint layer on the cdk popup: a zero-container component that clones its trigger in place — no wrapper element, the authored DOM stays intact — and mounts the panel out of a portal. Two channels: the props form (`content` plus a single trigger child — falsy content renders no tooltip) and the composed `Tooltip.Trigger` + `Tooltip.Content` form for custom DOM; giving both is a compile error. hover rides delay.in/out (default 300/0) with an instant focus channel, click toggles instantly, manual is the controlled visible word. The panel is click-through, flipped by the opposite-side fallback chain. The surface is the design-language palette — seven families (gray/primary/info/error/warning/success/white, gray default), every one translucent at the 0.9 alpha tier (the pure-black ladder rung for the neutral, the family solid mixed at 90% for the colors, the white-900 rung with dark ink for white) and borderless, with no backdrop blur — the frost machinery earned more problems than the look. The arrow is a rotated translucent diamond, half buried behind the bubble — no clip-path anywhere — with only the protruding tip corner rounded (radius-xs; the base corners stay sharp). The depth is ONE union drop-shadow cast on the panel itself — the bubble and the visible diamond half silhouette together in a single pass, the offset following the arrow direction, colored by the design language master shadow alpha (rgba(25, 25, 25, 0.10)). The sm tier sizes the arrow one ladder step down. The diamond pins to the resolved placement while staying aimed at the trigger, clamped inside the panel when a boundary collision shifts it. sm/md/lg tiers shift the hint ladder; the entrance is a fade+scale held by the motion tokens.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Tooltip>;

export const Overview: Story = {
  render: () => (
    <Container size="md" gutter="4">
      <Stack direction="column" gap="8">
        <Section title="Channels">
          <Stack direction="row" gap="4" align="center">
            <Tooltip content="The props channel — plain text bodies.">
              <Button>Props</Button>
            </Tooltip>
            <Tooltip>
              <Tooltip.Trigger>
                <Button>Composed</Button>
              </Tooltip.Trigger>
              <Tooltip.Content>
                <Stack direction="column" gap="1">
                  <span>Composed channel</span>
                  <span>custom DOM body</span>
                </Stack>
              </Tooltip.Content>
            </Tooltip>
          </Stack>
        </Section>

        <Section title="Palettes">
          <Stack direction="row" gap="3" align="center">
            <Tooltip content="The neutral default — the design language black-900 tier.">
              <Button>Gray</Button>
            </Tooltip>
            <Tooltip content="Brand-blue glass." palette="primary">
              <Button>Primary</Button>
            </Tooltip>
            <Tooltip content="Info blue." palette="info">
              <Button>Info</Button>
            </Tooltip>
            <Tooltip content="Error red." palette="error">
              <Button>Error</Button>
            </Tooltip>
            <Tooltip content="Warning orange." palette="warning">
              <Button>Warning</Button>
            </Tooltip>
            <Tooltip content="Success green." palette="success">
              <Button>Success</Button>
            </Tooltip>
            <Tooltip content="The light inverse — the white-900 tier, dark ink." palette="white">
              <Button>White</Button>
            </Tooltip>
          </Stack>
        </Section>

        <Section title="Sizes">
          <Stack direction="row" gap="4" align="center">
            <Tooltip content="Small tier." size="sm">
              <Button>sm</Button>
            </Tooltip>
            <Tooltip content="Medium tier — the base.">
              <Button>md</Button>
            </Tooltip>
            <Tooltip content="Large tier." size="lg">
              <Button>lg</Button>
            </Tooltip>
          </Stack>
        </Section>

        <Section title="Arrow & placement">
          <Stack direction="row" gap="4" align="center">
            <Tooltip content="No arrow — the gap tightens." showArrow={false}>
              <Button>Arrowless</Button>
            </Tooltip>
            <Tooltip content="Below the trigger." placement="bottom">
              <Button>Bottom</Button>
            </Tooltip>
          </Stack>
        </Section>

        <Section title="Channels of interaction">
          <Stack direction="row" gap="4" align="center">
            <Tooltip content="Hover + focus, 300ms in / 0ms out.">
              <Button>Hover</Button>
            </Tooltip>
            <Tooltip content="Click: instant toggle, Escape/outside close." visibleOn="click">
              <Button>Click</Button>
            </Tooltip>
            <Tooltip content="Closes on any scroll." closeOnScroll>
              <Button>closeOnScroll</Button>
            </Tooltip>
          </Stack>
        </Section>

        <Section title="Manual channel">
          <Tooltip
            content="Controlled open — visible drives, no surfaces, no auto close."
            visibleOn="manual"
            visible
            palette="primary"
          >
            <Button>Manual</Button>
          </Tooltip>
        </Section>
      </Stack>
    </Container>
  ),
};
