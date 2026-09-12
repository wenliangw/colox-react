import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Container, IconButton, Stack } from '@colox/react';
import { IconChevronDown, IconEye, IconEyeOff, IconX } from '@colox/icons';
import { Hint, Section } from '../showcase/section';

const VisibilityDemo = () => {
  const [revealed, setRevealed] = useState(false);
  return (
    <Stack direction="column" gap="2">
      <Stack direction="row" gap="2">
        <IconButton
          aria-label={revealed ? 'Hide password' : 'Show password'}
          onClick={() => setRevealed((value) => !value)}
        >
          {revealed ? <IconEye /> : <IconEyeOff />}
        </IconButton>
        <Hint>{revealed ? 'Revealed — eye open.' : 'Hidden — eye off.'}</Hint>
      </Stack>
    </Stack>
  );
};

const meta: Meta<typeof IconButton> = {
  title: 'Components/IconButton',
  component: IconButton,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The square bare-button primitive for icon-only controls. The reset, token-pinned hit shape, hover/active feedback, focus ring and disabled semantics live in one place. The size prop takes preset form tiers (xs/sm/md/lg) or any theme size-token key; text (default) is the pure icon — its box hugs the icon, size sizes the icon itself and the icon is painted in the intent color (neutral by default), darkening to the intent hover/active shade — while ghost/outline/solid carry intent-tinted chrome and `rounded` switches the footprint to a full circle. Icon-only buttons are nameless to assistive tech, so an aria-label is part of the contract.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof IconButton>;

export const Overview: Story = {
  render: () => (
    <Container size="md" gutter="4">
      <Stack direction="column" gap="8">
        <Section title="States">
          <Stack direction="row" gap="4">
            <IconButton aria-label="Close">
              <IconX />
            </IconButton>
            <IconButton aria-label="Close" disabled>
              <IconX />
            </IconButton>
            <IconButton aria-label="Open panel">
              <IconChevronDown />
            </IconButton>
            <IconButton aria-label="Search">
              <IconEye />
            </IconButton>
          </Stack>
        </Section>

        <Section title="Variants">
          <Stack direction="row" gap="4">
            <IconButton aria-label="Text">
              <IconX />
            </IconButton>
            <IconButton aria-label="Ghost" variant="ghost">
              <IconX />
            </IconButton>
            <IconButton aria-label="Outline" variant="outline">
              <IconX />
            </IconButton>
            <IconButton aria-label="Solid" variant="solid">
              <IconX />
            </IconButton>
          </Stack>
        </Section>

        <Section title="Intents — solid over the five-axis palette">
          <Stack direction="row" gap="4">
            <IconButton aria-label="Primary" variant="solid" intent="primary">
              <IconChevronDown />
            </IconButton>
            <IconButton aria-label="Neutral" variant="solid" intent="neutral">
              <IconChevronDown />
            </IconButton>
            <IconButton aria-label="Danger" variant="solid" intent="danger">
              <IconX />
            </IconButton>
            <IconButton aria-label="Warning" variant="solid" intent="warning">
              <IconX />
            </IconButton>
            <IconButton aria-label="Success" variant="solid" intent="success">
              <IconEye />
            </IconButton>
          </Stack>
        </Section>

        <Section title="Rounded">
          <Stack direction="row" gap="4">
            <IconButton aria-label="Rounded ghost" rounded>
              <IconX />
            </IconButton>
            <IconButton aria-label="Rounded outline" rounded variant="outline">
              <IconX />
            </IconButton>
            <IconButton aria-label="Rounded solid" rounded variant="solid">
              <IconX />
            </IconButton>
          </Stack>
        </Section>

        <Section title="Preset sizes — aligned with the form family">
          <Stack direction="row" gap="4">
            <IconButton aria-label="Extra small" size="xs">
              <IconX />
            </IconButton>
            <IconButton aria-label="Small" size="sm">
              <IconX />
            </IconButton>
            <IconButton aria-label="Medium" size="md">
              <IconX />
            </IconButton>
            <IconButton aria-label="Large" size="lg">
              <IconX />
            </IconButton>
          </Stack>
        </Section>

        <Section title="Raw size-token keys — any scale value">
          <Hint>
            size=&quot;0-5&quot; (2px) · size=&quot;4&quot; (16px) · size=&quot;6&quot; (24px) ·
            size=&quot;7&quot; (28px) · size=&quot;12&quot; (48px)
          </Hint>
          <Stack direction="row" gap="4">
            <IconButton aria-label="Tiny" size="0-5">
              <IconX />
            </IconButton>
            <IconButton aria-label="Field control" size="4">
              <IconX />
            </IconButton>
            <IconButton aria-label="Compact" size="6">
              <IconX />
            </IconButton>
            <IconButton aria-label="Between tiers" size="7">
              <IconX />
            </IconButton>
            <IconButton aria-label="Oversized" size="12">
              <IconX />
            </IconButton>
          </Stack>
        </Section>

        <Section title="Behaviour">
          <VisibilityDemo />
        </Section>
      </Stack>
    </Container>
  ),
};
