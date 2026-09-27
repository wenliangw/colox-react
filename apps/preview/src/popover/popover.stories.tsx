import type { Meta, StoryObj } from '@storybook/react';
import { Button, Container, Input, Stack, Popover } from '@colox/react';

import { Section } from '../showcase/section';

const meta: Meta<typeof Popover> = {
  title: 'Components/Popover',
  component: Popover,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          "The interactive floating card on the cdk popup — the Tooltip's interactive sibling: a non-modal dialog panel that holds real controls (buttons, forms, lists), not a click-through hint. Zero container: the trigger is cloned in place, the panel mounts from a portal. Two channels: the props form (`title`/`content` plus a single trigger child — falsy content never opens) and the composed `Popover.Trigger` + `Popover.Title` + `Popover.Content` form; giving a word in both channels is a compile error. click (default) toggles instantly and focuses the panel — the Tab cycle stays inside, Escape closes and returns the focus to the trigger; hover rides delay in/out (300/100 — the out-delay is the pointer bridge into the panel) with an instant focus leg and never steals focus; manual is the controlled `visible` word. The surface is an OPAQUE card — `bg-default` (dark-mode-aware) + the shadow-lg tier as a union drop-shadow cast (the card plus the protruding arrow half silhouette together; the offset follows the arrow direction, the color is the design-language master shadow alpha) + `radius-lg`, borderless, NO backdrop blur — an interactive reading surface needs full contrast and the hint layer's translucency stays a Tooltip concern. The arrow is the same rotated diamond recipe (no clip-path anywhere, only the protruding tip corner rounded). Width = the content's own — no size axis; an upper bound is the consumer's CSS escape hatch. The entrance is a fade+scale, the exit a fade — both held by the motion tokens.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Popover>;

export const Overview: Story = {
  render: () => (
    <Container size="md" gutter="4">
      <Stack direction="column" gap="8">
        <Section title="Channels">
          <Stack direction="row" gap="4" align="center">
            <Popover title="Props channel" content="A titled card body from the props form.">
              <Button>Props</Button>
            </Popover>
            <Popover>
              <Popover.Trigger>
                <Button>Composed</Button>
              </Popover.Trigger>
              <Popover.Title>Composed channel</Popover.Title>
              <Popover.Content>
                <Stack direction="column" gap="2">
                  <span>Rich interactive body:</span>
                  <Input placeholder="Type something" />
                </Stack>
              </Popover.Content>
            </Popover>
          </Stack>
        </Section>

        <Section title="Channels of interaction">
          <Stack direction="row" gap="4" align="center">
            <Popover title="Click" content="Instant toggle — the focus lands in this panel.">
              <Button>Click</Button>
            </Popover>
            <Popover
              title="Hover"
              content="300ms in / 100ms out — the out-delay bridges your pointer over the gap and into the panel."
              visibleOn="hover"
            >
              <Button>Hover</Button>
            </Popover>
            <Popover title="Scroll" content="Closes on any scroll." closeOnScroll>
              <Button>closeOnScroll</Button>
            </Popover>
          </Stack>
        </Section>

        <Section title="Plane geometry">
          <Stack direction="row" gap="4" align="center">
            <Popover
              title="No arrow"
              content="The gap tightens without the pointer."
              showArrow={false}
            >
              <Button>Arrowless</Button>
            </Popover>
            <Popover title="Other side" content="Below the trigger." placement="bottom">
              <Button>Bottom</Button>
            </Popover>
            <Popover title="Right side" content="To the right." placement="left-start">
              <Button>Left</Button>
            </Popover>
          </Stack>
        </Section>

        <Section title="Long content (the card grows with it)">
          <Popover
            title="Own width"
            content="No size axis — the panel is exactly as wide as the author content, an upper bound is the consumer's CSS escape hatch. Long lines wrap by word."
          >
            <Button>Open</Button>
          </Popover>
        </Section>

        <Section title="Manual channel">
          <Popover
            title="Manual"
            content="Controlled open — visible drives, no surfaces."
            visibleOn="manual"
            visible
          >
            <Button>Manual</Button>
          </Popover>
        </Section>
      </Stack>
    </Container>
  ),
};
