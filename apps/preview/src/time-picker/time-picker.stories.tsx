import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Container, Stack, TimePicker } from '@colox/react';
import { Section } from '../showcase/section';

const demoWidth = { maxWidth: 360 } as const;

// Controlled demo: the payload hands over the canonical HH:mm word, the
// readout renders it next to the field.
const Controlled = () => {
  const [value, setValue] = useState<string | null>('08:30');
  return (
    <Stack direction="row" gap="2" align="center">
      <TimePicker
        aria-label="Controlled time"
        value={value}
        onChange={(payload) => setValue(payload.value)}
      />
      <span>{value === null ? 'empty' : value}</span>
    </Stack>
  );
};

const meta: Meta<typeof TimePicker> = {
  title: 'Components/TimePicker',
  component: TimePicker,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Single-line time editor: a bare text input in the Input family shell (typing accepts the canonical HH:mm grammar and the configured valueFormat) plus a self-drawn panel riding the cdk popup. The panel holds two pure-number cyclic columns — hours 00–23 and minutes 00–59 — each showing an 8-option window scrolled by up/down chevron buttons in 7-option steps (no scrollbar). Picking an option merges it into the value, commits and closes (the date-picker pick-and-commit family semantic); the committed option wears the palette solid, the window seats a committed value at slot 4 (3 above / 4 below) and the system clock when empty. The commit payload is { event, value }; `null` is the empty state. Partial drafts roll back on blur, min/max disable out-of-bounds options and roll typed values back, and clearable follows the Select interaction (the trailing glyph swaps into the ✕ control).',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof TimePicker>;

export const Overview: Story = {
  render: () => (
    <Container size="md" gutter="4">
      <Stack direction="column" gap="8">
        <Section title="Sizes">
          <Stack direction="column" gap="4" style={demoWidth}>
            <TimePicker size="xs" aria-label="Extra small" defaultValue="08:30" />
            <TimePicker size="sm" aria-label="Small" defaultValue="08:30" />
            <TimePicker size="md" aria-label="Medium" defaultValue="08:30" />
            <TimePicker size="lg" aria-label="Large" defaultValue="08:30" />
          </Stack>
        </Section>

        <Section title="Value formats">
          <Stack direction="column" gap="4" style={demoWidth}>
            <TimePicker aria-label="Zero-padded 24-hour" defaultValue="08:30" />
            <TimePicker aria-label="Single-digit hour" valueFormat="H:mm" defaultValue="08:30" />
            <TimePicker aria-label="Twelve-hour clock" valueFormat="h:mm" defaultValue="13:30" />
            <TimePicker aria-label="Dotted separators" valueFormat="H.mm" defaultValue="08:30" />
          </Stack>
        </Section>

        <Section title="Palettes">
          <Stack direction="column" gap="4" style={demoWidth}>
            <TimePicker aria-label="Primary palette" defaultValue="08:30" />
            <TimePicker aria-label="Gray palette" palette="gray" defaultValue="08:30" />
            <TimePicker aria-label="Info palette" palette="info" defaultValue="08:30" />
            <TimePicker aria-label="Error palette" palette="error" defaultValue="08:30" />
            <TimePicker aria-label="Warning palette" palette="warning" defaultValue="08:30" />
            <TimePicker aria-label="Success palette" palette="success" defaultValue="08:30" />
          </Stack>
        </Section>

        <Section title="Bounds">
          <Stack direction="column" gap="4" style={demoWidth}>
            <TimePicker aria-label="Working hours" min="09:00" max="18:00" defaultValue="13:30" />
          </Stack>
        </Section>

        <Section title="Clearable">
          <Stack direction="column" gap="4" style={demoWidth}>
            <TimePicker aria-label="Clearable with value" clearable defaultValue="08:30" />
            <TimePicker aria-label="Clearable empty" clearable />
          </Stack>
        </Section>

        <Section title="Interaction">
          <Stack direction="column" gap="4" style={demoWidth}>
            <Controlled />
          </Stack>
        </Section>

        <Section title="States">
          <Stack direction="column" gap="4" style={demoWidth}>
            <TimePicker aria-label="Empty" />
            <TimePicker aria-label="Invalid" invalid defaultValue="08:30" />
            <TimePicker aria-label="Disabled" disabled defaultValue="08:30" />
            <TimePicker aria-label="Read only" readOnly defaultValue="08:30" />
          </Stack>
        </Section>
      </Stack>
    </Container>
  ),
};
