import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Container, Input, Stack } from '@colox/react';
import { Section } from '../showcase/section';

const demoWidth = { maxWidth: 360 } as const;

// Controlled demos: the built-ins and the filter channel mutate state,
// so each interactive row owns its state locally.
const SearchClearable = () => {
  const [value, setValue] = useState('colox');
  return (
    <Input
      aria-label="Search and clear"
      type="search"
      clearable
      value={value}
      onChange={(event) => setValue(event.target.value)}
      placeholder="search — automatic icon + clear button"
    />
  );
};

const DigitsOnly = () => {
  const [value, setValue] = useState('');
  return (
    <Input
      aria-label="Digits"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      filterPattern={/^\d*$/}
      placeholder="only digits accepted — letters are rejected"
    />
  );
};

const UpperAlpha = () => {
  const [value, setValue] = useState('ABC');
  return (
    <Input
      aria-label="Uppercase"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      filterPattern={/^[A-Z]*$/}
      placeholder="uppercase letters only"
    />
  );
};

const DigitsPlusClear = () => {
  const [value, setValue] = useState('0123');
  return (
    <Input
      aria-label="Code"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      filterPattern={/^\d+$/}
      clearable
      placeholder="digits; the explicit clear bypasses the filter"
    />
  );
};

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Single-line text input on a shell: leading/trailing slots, built-in controls and a filterPattern input-restriction channel.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Input>;

export const Overview: Story = {
  render: () => (
    <Container size="md" gutter="4">
      <Stack direction="column" gap="8">
        <Section title="Sizes">
          <Stack direction="column" gap="2" style={demoWidth}>
            <Input aria-label="Extra small" size="xs" placeholder="xs — 24px" />
            <Input aria-label="Small" size="sm" placeholder="sm — 32px" />
            <Input aria-label="Medium" size="md" placeholder="md — 40px (default)" />
            <Input aria-label="Large" size="lg" placeholder="lg — 48px" />
          </Stack>
        </Section>

        <Section title="Slots">
          <Stack direction="column" gap="2" style={demoWidth}>
            <Input
              aria-label="Search"
              type="search"
              placeholder="search — automatic leading icon"
            />
            <Input aria-label="Amount" leading="¥" placeholder="leading — ¥" />
            <Input aria-label="Weight" trailing="kg" placeholder="trailing — kg" />
            <Input
              aria-label="Domain"
              leading="https://"
              trailing=".com"
              placeholder="leading and trailing"
            />
          </Stack>
        </Section>

        <Section title="Built-ins">
          <Stack direction="column" gap="2" style={demoWidth}>
            <SearchClearable />
            <Input
              aria-label="Password"
              type="password"
              allowTogglePassword
              placeholder="password — visibility toggle"
            />
          </Stack>
        </Section>

        <Section title="Filter pattern">
          <Stack direction="column" gap="2" style={demoWidth}>
            <DigitsOnly />
            <UpperAlpha />
            <DigitsPlusClear />
          </Stack>
        </Section>

        <Section title="States">
          <Stack direction="column" gap="2" style={demoWidth}>
            <Input aria-label="Default" placeholder="default" />
            <Input aria-label="Invalid" invalid placeholder="invalid — red border" />
            <Input aria-label="Disabled" disabled placeholder="disabled" />
          </Stack>
        </Section>
      </Stack>
    </Container>
  ),
};
