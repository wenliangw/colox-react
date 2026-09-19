import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Container, Slider, Stack } from '@colox/react';
import { Section } from '../showcase/section';

const demoWidth = { maxWidth: 360 } as const;

// Controlled demo: the payload hands over the committed number, the
// readout renders next to the strip.
const Controlled = () => {
  const [value, setValue] = useState(55);
  return (
    <Stack direction="row" gap="2" align="center">
      <Slider
        aria-label="Controlled volume"
        value={value}
        onChange={(payload) => setValue(payload.value)}
      />
      <span>{value}</span>
    </Stack>
  );
};

// Marks demo: labels ride the ends with bare ticks in between — the
// marks span owns the full track width so the labels get room.
const Thermostat = () => (
  <Slider
    aria-label="Thermostat"
    min={16}
    max={30}
    defaultValue={26}
    marks={{
      16: '16°C',
      21: null,
      23: null,
      26: null,
      28: null,
      30: '30°C',
    }}
  />
);

const meta: Meta<typeof Slider> = {
  title: 'Components/Slider',
  component: Slider,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Single-thumb numeric range on a native range input: the palette-colored traveled stripe and the white-ring thumb ride the native control, tick marks with labels sit below the strip, and the change payload hands over the committed number ({ event, value }).',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Slider>;

export const Overview: Story = {
  render: () => (
    <Container size="md" gutter="4">
      <Stack direction="column" gap="8">
        <Section title="Sizes">
          <Stack direction="column" gap="4" style={demoWidth}>
            <Slider size="xs" aria-label="Extra small" defaultValue={40} />
            <Slider size="sm" aria-label="Small" defaultValue={40} />
            <Slider size="md" aria-label="Medium" defaultValue={40} />
            <Slider size="lg" aria-label="Large" defaultValue={40} />
          </Stack>
        </Section>

        <Section title="Palettes">
          <Stack direction="column" gap="4" style={demoWidth}>
            <Slider aria-label="Primary palette" defaultValue={40} />
            <Slider aria-label="Gray palette" palette="gray" defaultValue={40} />
            <Slider aria-label="Info palette" palette="info" defaultValue={40} />
            <Slider aria-label="Error palette" palette="error" defaultValue={40} />
            <Slider aria-label="Warning palette" palette="warning" defaultValue={40} />
            <Slider aria-label="Success palette" palette="success" defaultValue={40} />
          </Stack>
        </Section>

        <Section title="Marks">
          <Stack direction="column" gap="4" style={demoWidth}>
            <Thermostat />
          </Stack>
        </Section>

        <Section title="Interaction">
          <Stack direction="column" gap="4" style={demoWidth}>
            <Controlled />
          </Stack>
        </Section>

        <Section title="States">
          <Stack direction="column" gap="4" style={demoWidth}>
            <Slider aria-label="Custom span" min={0} max={10} step={2} defaultValue={4} />
            <Slider aria-label="Invalid" invalid defaultValue={65} />
            <Slider aria-label="Disabled" disabled defaultValue={60} />
          </Stack>
        </Section>
      </Stack>
    </Container>
  ),
};
