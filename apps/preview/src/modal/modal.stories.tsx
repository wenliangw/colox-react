import { useState } from 'react';
import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button, Container, Input, Modal, Stack } from '@colox/react';

import { Section } from '../showcase/section';

const meta: Meta<typeof Modal> = {
  title: 'Components/Modal',
  component: Modal,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The modal dialog — a centered panel over a dim backdrop, purely composed: `<Modal visible>` holds the overlay and the body lives in `<Modal.Content>` with the optional `<Modal.Title>` / `<Modal.Footer>` around it (plain children are a compile error). Controlled only — there is no defaultVisible; the corner close button, Escape and a backdrop click all speak through `onVisibleChange(false)`. The strict focus trap keeps the keyboard inside (aria-modal) and the Tab cycle wraps within the panel; the initial focus lands on the first focusable element (or the panel), and closing hands the focus back to whatever had it before. Opening locks the body scroll. Positioning is pure CSS — the overlay centers the panel, no floating math. The width tier is `size` (sm / md / lg → the design-language 448 / 640 / 768px tokens) with a `width` escape hatch. The surface is an opaque `bg-default` card with a union drop-shadow, radius-lg, no border, no backdrop blur; the entrance is a fade+scale, the exit a fade.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Modal>;

const ControlledModal = ({
  size,
  width,
  showClose = true,
  showMask = true,
  title = 'Edit profile',
  children,
}: {
  size?: 'sm' | 'md' | 'lg';
  width?: number | string;
  showClose?: boolean;
  showMask?: boolean;
  title?: string;
  children: ReactNode;
}) => {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <Button onClick={() => setVisible(true)}>Open</Button>
      <Modal
        visible={visible}
        onVisibleChange={setVisible}
        size={size}
        width={width}
        showClose={showClose}
        showMask={showMask}
      >
        <Modal.Title>{title}</Modal.Title>
        <Modal.Content>{children}</Modal.Content>
        <Modal.Footer>
          <Button variant="subtle" onClick={() => setVisible(false)}>
            Cancel
          </Button>
          <Button onClick={() => setVisible(false)}>Save</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export const Overview: Story = {
  render: () => (
    <Container size="md" gutter="4">
      <Stack direction="column" gap="8">
        <Section title="Sizes (semantic tiers on the design-language width tokens)">
          <Stack direction="row" gap="4" align="center">
            <ControlledModal size="sm" title="Small">
              A 448px panel — the `sm` tier pins the design-language size-112 token.
            </ControlledModal>
            <ControlledModal size="md" title="Medium">
              A 640px panel — the `md` tier (default), the design-language size-160 token.
            </ControlledModal>
            <ControlledModal size="lg" title="Large">
              A 768px panel — the `lg` tier, the design-language size-192 token.
            </ControlledModal>
          </Stack>
        </Section>

        <Section title="Width escape hatch">
          <ControlledModal width={420} title="Explicit width">
            The `width` prop overrides the tier — a number is treated as px.
          </ControlledModal>
        </Section>

        <Section title="Chrome toggles">
          <Stack direction="row" gap="4" align="center">
            <ControlledModal showClose={false} title="No corner close">
              `showClose={false}` hides the corner button — Escape and the mask still close.
            </ControlledModal>
            <ControlledModal showMask={false} title="No backdrop">
              `showMask={false}` drops the dim layer — the trap and Escape stay.
            </ControlledModal>
          </Stack>
        </Section>

        <Section title="Rich body">
          <ControlledModal title="A form inside">
            <Stack direction="column" gap="4">
              <span>
                Form controls live in the body — the panel scrolls if it grows past the viewport.
              </span>
              <Input placeholder="Name" />
              <Input placeholder="Email" />
            </Stack>
          </ControlledModal>
        </Section>

        <Section title="Long content (the panel scrolls inside)">
          <ControlledModal title="A long read">
            <Stack direction="column" gap="4">
              {Array.from({ length: 24 }, (_, index) => (
                <span key={index}>
                  Paragraph {index + 1} — the panel caps at the viewport minus the gutter and
                  scrolls internally, the backdrop stays still.
                </span>
              ))}
            </Stack>
          </ControlledModal>
        </Section>
      </Stack>
    </Container>
  ),
};
