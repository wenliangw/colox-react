import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Container, InputNumber, Stack } from '@colox/react';
import { Section } from '../showcase/section';

const demoWidth = { maxWidth: 260 } as const;

// Controlled demo: the payload hands over the committed number, the
// readout renders next to the field.
const Controlled = () => {
  const [value, setValue] = useState<number | null>(42);
  return (
    <Stack direction="row" gap="2" align="center">
      <InputNumber
        aria-label="Controlled quantity"
        value={value}
        onChange={(payload) => setValue(payload.value)}
      />
      <span>{value === null ? 'empty' : value}</span>
    </Stack>
  );
};

const meta: Meta<typeof InputNumber> = {
  title: 'Components/InputNumber',
  component: InputNumber,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Single-line number editor on a text input (inputmode="decimal"): a bare native input with spinbutton semantics plus a built-in chevron stepper, step-derived decimal precision, blur rollback of partial drafts and min/max clamping, and a { event, value } commit payload with `null` as the empty state.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof InputNumber>;

export const Overview: Story = {
  render: () => (
    <Container size="md" gutter="4">
      <Stack direction="column" gap="8">
        <Section title="Sizes">
          <Stack direction="column" gap="4" style={demoWidth}>
            <InputNumber size="xs" aria-label="Extra small" defaultValue={42} />
            <InputNumber size="sm" aria-label="Small" defaultValue={42} />
            <InputNumber size="md" aria-label="Medium" defaultValue={42} />
            <InputNumber size="lg" aria-label="Large" defaultValue={42} />
          </Stack>
        </Section>

        <Section title="Steppers">
          <Stack direction="column" gap="4" style={demoWidth}>
            <InputNumber aria-label="Integer steps" defaultValue={0} />
            <InputNumber aria-label="Half steps" step={0.5} defaultValue={0} />
            <InputNumber aria-label="Tenth steps" step={0.1} min={-1} max={1} defaultValue={0} />
            <InputNumber aria-label="Bounded span" min={5} max={10} />
          </Stack>
        </Section>

        <Section title="Interaction">
          <Stack direction="column" gap="4" style={demoWidth}>
            <Controlled />
          </Stack>
        </Section>

        <Section title="States">
          <Stack direction="column" gap="4" style={demoWidth}>
            <InputNumber aria-label="Invalid" invalid defaultValue={-3} />
            <InputNumber aria-label="Disabled" disabled defaultValue={60} />
            <InputNumber aria-label="Read only" readOnly defaultValue={12} />
          </Stack>
        </Section>
      </Stack>
    </Container>
  ),
};
