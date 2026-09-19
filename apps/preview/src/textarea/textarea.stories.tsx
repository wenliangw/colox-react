import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Container, Stack, Textarea } from '@colox/react';
import { Section } from '../showcase/section';

const demoWidth = { maxWidth: 360 } as const;

// Controlled demo: the footer clear control mutates state, so the
// interactive row owns its state locally.
const Clearable = () => {
  const [value, setValue] = useState('colox');
  return (
    <Textarea
      aria-label="Editable with clear"
      rows={3}
      clearable
      value={value}
      onChange={({ value: next }) => setValue(next)}
      placeholder="type something — the footer clear resets it"
    />
  );
};

const AutoGrow = () => {
  const [value, setValue] = useState('');
  return (
    <Textarea
      aria-label="Auto-growing"
      rows={2}
      value={value}
      onChange={({ value: next }) => setValue(next)}
      placeholder="the default world — grows with the content, drag the handle for more room"
    />
  );
};

const MinRows = () => {
  const [value, setValue] = useState('');
  return (
    <Textarea
      aria-label="Min rows raised"
      rows={2}
      autoSize={{ minRows: 4 }}
      value={value}
      onChange={({ value: next }) => setValue(next)}
      placeholder="starts at four rows, grows from there"
    />
  );
};

const ClampedGrow = () => {
  const [value, setValue] = useState('');
  return (
    <Textarea
      aria-label="Clamped"
      rows={2}
      autoSize={{ maxRows: 5 }}
      value={value}
      onChange={({ value: next }) => setValue(next)}
      placeholder="grows up to five rows, then scrolls inside — no drag handle here"
    />
  );
};

const FixedRows = () => {
  const [value, setValue] = useState('');
  return (
    <Textarea
      aria-label="Fixed rows"
      rows={3}
      autoSize={false}
      value={value}
      onChange={({ value: next }) => setValue(next)}
      placeholder="fixed rows with native scrolling — no autosize, no drag handle"
    />
  );
};

const CountAndClear = () => {
  const [value, setValue] = useState('colox');
  return (
    <Textarea
      aria-label="Count and clear"
      rows={3}
      showCount
      maxLength={80}
      clearable
      value={value}
      onChange={({ value: next }) => setValue(next)}
      placeholder="footer pill: count | 清除 on the left, drag handle at the end"
    />
  );
};

const meta: Meta<typeof Textarea> = {
  title: 'Components/Textarea',
  component: Textarea,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Multi-line text input on a shell: content-driven height (autosize + native-corner drag handle), a footer pill packing the character count and 清除 clear text control, and a themed scrollbar when growth is capped.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Textarea>;

export const Overview: Story = {
  render: () => (
    <Container size="md" gutter="4">
      <Stack direction="column" gap="8">
        <Section title="Sizes">
          <Stack direction="column" gap="2" style={demoWidth}>
            <Textarea aria-label="Extra small" size="xs" rows={2} placeholder="xs — 12px font" />
            <Textarea aria-label="Small" size="sm" rows={2} placeholder="sm — 14px font" />
            <Textarea
              aria-label="Medium"
              size="md"
              rows={2}
              placeholder="md — 16px font (default)"
            />
            <Textarea aria-label="Large" size="lg" rows={2} placeholder="lg — 18px font" />
          </Stack>
        </Section>

        <Section title="Autosize">
          <Stack direction="column" gap="2" style={demoWidth}>
            <AutoGrow />
            <MinRows />
            <ClampedGrow />
            <FixedRows />
          </Stack>
        </Section>

        <Section title="Footer bar">
          <Stack direction="column" gap="2" style={demoWidth}>
            <CountAndClear />
            <Clearable />
            <Textarea
              aria-label="Count only"
              rows={3}
              showCount
              maxLength={80}
              defaultValue="count rides the footer's leading cluster"
              placeholder="count only"
            />
          </Stack>
        </Section>

        <Section title="States">
          <Stack direction="column" gap="2" style={demoWidth}>
            <Textarea aria-label="Default" rows={3} placeholder="default" />
            <Textarea aria-label="Invalid" rows={3} invalid placeholder="invalid — red border" />
            <Textarea aria-label="Disabled" rows={3} disabled placeholder="disabled" />
          </Stack>
        </Section>
      </Stack>
    </Container>
  ),
};
