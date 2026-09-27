import { useState } from 'react';
import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button, Container, Drawer, Input, Stack } from '@colox/react';

import { Section } from '../showcase/section';

const meta: Meta<typeof Drawer> = {
  title: 'Components/Drawer',
  component: Drawer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The drawer — an edge-anchored sliding panel, purely composed: `<Drawer visible>` holds the overlay and the body lives in `<Drawer.Content>` with the optional `<Drawer.Title>` / `<Drawer.Footer>` around it (plain children are a compile error). Controlled only — there is no defaultVisible; the corner close button, Escape and a backdrop click all speak through `onVisibleChange(false)`. The panel slides in from an edge (`direction` — left / right / top / bottom, default right), sized by `size`: the content space, meaning the width for `left`/`right` panels and the height for `top`/`bottom` ones (sm / md / lg → the design-language 320 / 384 / 448px tokens, symmetric across directions), with `width`/`height` escape hatches. The strict focus trap keeps the keyboard inside (aria-modal), the initial focus lands on the first focusable element (or the panel), and closing hands the focus back to whatever had it before. Opening locks the body scroll. Positioning is pure CSS — the panel anchors flush to the screen edge, no floating math. The surface is an opaque `bg-default` card with a union drop-shadow, radius on the free edges only (the anchored edge is square), no border, no backdrop blur; the entrance slides in from the anchored edge, the exit slides back out.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Drawer>;

const ControlledDrawer = ({
  direction = 'right',
  size,
  width,
  height,
  showClose = true,
  showMask = true,
  title = 'Edit profile',
  children,
}: {
  direction?: 'left' | 'right' | 'top' | 'bottom';
  size?: 'sm' | 'md' | 'lg';
  width?: number | string;
  height?: number | string;
  showClose?: boolean;
  showMask?: boolean;
  title?: string;
  children: ReactNode;
}) => {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <Button onClick={() => setVisible(true)}>Open</Button>
      <Drawer
        visible={visible}
        onVisibleChange={setVisible}
        direction={direction}
        size={size}
        width={width}
        height={height}
        showClose={showClose}
        showMask={showMask}
      >
        <Drawer.Title>{title}</Drawer.Title>
        <Drawer.Content>{children}</Drawer.Content>
        <Drawer.Footer>
          <Button variant="subtle" onClick={() => setVisible(false)}>
            Cancel
          </Button>
          <Button onClick={() => setVisible(false)}>Save</Button>
        </Drawer.Footer>
      </Drawer>
    </>
  );
};

export const Overview: Story = {
  render: () => (
    <Container size="md" gutter="4">
      <Stack direction="column" gap="8">
        <Section title="Directions (the edge the panel slides from)">
          <Stack direction="row" gap="4" align="center">
            <ControlledDrawer direction="left" title="From the left">
              The `left` panel anchors to the left screen edge and slides in from it.
            </ControlledDrawer>
            <ControlledDrawer direction="right" title="From the right">
              The `right` panel (default) anchors to the right screen edge.
            </ControlledDrawer>
            <ControlledDrawer direction="top" title="From the top">
              The `top` panel is a horizontal strip anchored to the top edge.
            </ControlledDrawer>
            <ControlledDrawer direction="bottom" title="From the bottom">
              The `bottom` panel is a horizontal strip anchored to the bottom edge.
            </ControlledDrawer>
          </Stack>
        </Section>

        <Section title="Sizes (the content space — width for left/right, height for top/bottom)">
          <Stack direction="row" gap="4" align="center">
            <ControlledDrawer size="sm" title="Small">
              A 320px panel — the `sm` tier pins the design-language size-80 token.
            </ControlledDrawer>
            <ControlledDrawer size="md" title="Medium">
              A 384px panel — the `md` tier (default), the design-language size-96 token.
            </ControlledDrawer>
            <ControlledDrawer size="lg" title="Large">
              A 448px panel — the `lg` tier, the design-language size-112 token.
            </ControlledDrawer>
          </Stack>
        </Section>

        <Section title="Escape hatches (width for vertical, height for horizontal)">
          <Stack direction="row" gap="4" align="center">
            <ControlledDrawer width={420} title="Explicit width">
              The `width` prop overrides the tier for left/right panels — a number is treated as px.
            </ControlledDrawer>
            <ControlledDrawer direction="top" height={240} title="Explicit height">
              The `height` prop overrides the tier for top/bottom panels — a number is treated as
              px.
            </ControlledDrawer>
          </Stack>
        </Section>

        <Section title="Chrome toggles">
          <Stack direction="row" gap="4" align="center">
            <ControlledDrawer showClose={false} title="No corner close">
              `showClose={false}` hides the corner button — Escape and the mask still close.
            </ControlledDrawer>
            <ControlledDrawer showMask={false} title="No backdrop">
              `showMask={false}` drops the dim layer — the trap and Escape stay.
            </ControlledDrawer>
          </Stack>
        </Section>

        <Section title="Rich body">
          <ControlledDrawer title="A form inside">
            <Stack direction="column" gap="4">
              <span>
                Form controls live in the body — the panel scrolls if the content grows past the
                viewport.
              </span>
              <Input placeholder="Name" />
              <Input placeholder="Email" />
            </Stack>
          </ControlledDrawer>
        </Section>

        <Section title="Long content (the body scrolls inside)">
          <ControlledDrawer title="A long read">
            <Stack direction="column" gap="4">
              {Array.from({ length: 24 }, (_, index) => (
                <span key={index}>
                  Paragraph {index + 1} — the body scrolls internally, the title and footer stay
                  fixed, the backdrop stays still.
                </span>
              ))}
            </Stack>
          </ControlledDrawer>
        </Section>
      </Stack>
    </Container>
  ),
};
