import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Container, Select, Stack } from '@colox/react';
import type { SelectOption } from '@colox/react';
import { Section, Hint } from '../showcase/section';

const fruitOptions: SelectOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry', disabled: true },
  { value: 'date', label: 'Date' },
  { value: 'elderberry', label: 'Elderberry' },
  { value: 'fig', label: 'Fig' },
  { value: 'grapefruit', label: 'Grapefruit' },
];

const SingleDemo = () => {
  const [value, setValue] = useState('');
  return (
    <Stack direction="column" gap="2">
      <Select
        options={fruitOptions}
        placeholder="Pick a fruit"
        clearable
        value={value}
        onChange={({ value: next }) => setValue(next as string)}
      />
      <Hint>{value === '' ? 'Nothing selected yet.' : `Selected: ${value}`}</Hint>
    </Stack>
  );
};

const SingleSearchDemo = () => {
  const [value, setValue] = useState('banana');
  return (
    <Stack direction="column" gap="2">
      <Select
        showSearch
        options={fruitOptions}
        placeholder="Type to search fruit"
        value={value}
        onChange={({ value: next }) => setValue(next as string)}
      />
      <Hint>
        Searchable single: the organ shows the label while closed and flips to the query stream
        while open. Arrows walk, Enter picks — focus never leaves the organ.
      </Hint>
    </Stack>
  );
};

const MultipleDemo = () => {
  const [value, setValue] = useState<string[]>(['apple', 'date']);
  return (
    <Stack direction="column" gap="2">
      <Select
        mode="multiple"
        options={fruitOptions}
        placeholder="Pick several fruits"
        value={value}
        onChange={({ value: next }) => setValue(next as string[])}
      />
      <Hint>
        Multiple keeps the panel open after each pick; Backspace on an empty query removes the last
        chip, each chip has its own remove button.
      </Hint>
    </Stack>
  );
};

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Data-driven single/multiple select on the shared form-family shell: a portal listbox modeled as an ARIA 1.2 editable combobox, searchable organ built from the Input control, hidden native inputs for FormData, and an optionSize axis decoupled from the trigger size.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Select>;

export const Overview: Story = {
  render: () => (
    <Container size="md" gutter="4">
      <Stack direction="column" gap="8">
        <Section title="States">
          <Stack direction="column" gap="2">
            <Select options={fruitOptions} placeholder="Picker placeholder" />
            <Select options={fruitOptions} value="banana" />
            <Select options={fruitOptions} value="banana" clearable />
            <Select options={fruitOptions} value="banana" invalid />
            <Select options={fruitOptions} value="banana" disabled />
          </Stack>
        </Section>

        <Section title="Sizes">
          <Stack direction="column" gap="2">
            <Select options={fruitOptions} value="apple" size="xs" />
            <Select options={fruitOptions} value="apple" size="sm" />
            <Select options={fruitOptions} value="apple" size="md" />
            <Select options={fruitOptions} value="apple" size="lg" />
          </Stack>
        </Section>

        <Section title="Single selection">
          <SingleDemo />
        </Section>

        <Section title="Searchable single">
          <SingleSearchDemo />
        </Section>

        <Section title="Multiple selection">
          <MultipleDemo />
        </Section>

        <Section title="Popup rows (optionSize)">
          <Stack direction="column" gap="2">
            <Select defaultOpen options={fruitOptions} value="apple" size="lg" optionSize="xs" />
            <Hint>
              The panel is its own layout context: the trigger runs at lg while the rows stay xs.{' '}
              <code>optionSize</code> drives the panel typography, independent of <code>size</code>.
            </Hint>
          </Stack>
        </Section>
      </Stack>
    </Container>
  ),
};
