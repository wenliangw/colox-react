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
          'The hint layer on the cdk popup: a zero-container component that clones its trigger in place — no wrapper element, the authored DOM stays intact — and mounts the panel out of a portal. Two channels: the props form (`content` plus a single trigger child — falsy content renders no tooltip) and the composed `Tooltip.Trigger` + `Tooltip.Content` form for custom DOM; giving both is a compile error. hover rides delay.in/out (default 300/0) with an instant focus channel, click toggles instantly, manual is the controlled visible word. The panel is click-through, flipped by the opposite-side fallback chain, and its arrow + directional shadow pin to the resolved placement. dark is the inverse canvas, light rides the default surface; sm/md/lg tiers shift the hint ladder; the entrance is a fade+scale held by the motion tokens.',
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

        <Section title="Surfaces">
          <Stack direction="row" gap="4" align="center">
            <Tooltip content="The inverse canvas.">
              <Button>Dark</Button>
            </Tooltip>
            <Tooltip content="The default surface, border and seam." variant="light">
              <Button>Light</Button>
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
      </Stack>
    </Container>
  ),
};
