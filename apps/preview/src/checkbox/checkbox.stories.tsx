import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Checkbox, Container, Stack } from '@colox/react';
import { Section, Hint } from '../showcase/section';

const selectAllOptions = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
];

// The cascade lives in the consumer: the parent derives checked/
// indeterminate from the selection array — the library only visualizes
// the third state.
const SelectAllDemo = () => {
  const [selected, setSelected] = useState<string[]>(['apple']);
  const allChecked = selected.length === selectAllOptions.length;
  const someChecked = selected.length > 0 && !allChecked;

  return (
    <Stack direction="column" gap="2">
      <Checkbox
        checked={allChecked}
        indeterminate={someChecked}
        onChange={() => setSelected(allChecked ? [] : selectAllOptions.map((o) => o.value))}
      >
        Select all
      </Checkbox>
      <Checkbox.Group value={selected} onChange={setSelected}>
        {selectAllOptions.map((option) => (
          <Checkbox key={option.value} value={option.value}>
            {option.label}
          </Checkbox>
        ))}
      </Checkbox.Group>
    </Stack>
  );
};

const FruitSelectionDemo = () => {
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <Stack direction="column" gap="2">
      <Checkbox.Group value={selected} onChange={setSelected}>
        <Checkbox value="apple">Apple</Checkbox>
        <Checkbox value="banana">Banana</Checkbox>
        <Checkbox value="orange">Orange</Checkbox>
      </Checkbox.Group>
      <Hint>
        {selected.length === 0
          ? 'Nothing selected yet — tick a fruit.'
          : `Selected: ${selected.join(', ')}`}
      </Hint>
    </Stack>
  );
};

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Single checkbox with an indeterminate third state, group-based multi-select via Checkbox.Group and the shared xs/sm/md/lg size axis.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Checkbox>;

export const Overview: Story = {
  render: () => (
    <Container size="md" gutter="4">
      <Stack direction="column" gap="8">
        <Section title="States">
          <Stack direction="column" gap="2">
            <Checkbox>Unchecked</Checkbox>
            <Checkbox defaultChecked>Checked</Checkbox>
            <Checkbox invalid>Invalid</Checkbox>
            <Checkbox disabled>Disabled</Checkbox>
            <Checkbox disabled defaultChecked>
              Disabled · checked
            </Checkbox>
          </Stack>
        </Section>

        <Section title="Indeterminate">
          <SelectAllDemo />
        </Section>

        <Section title="Sizes">
          <Stack direction="column" gap="2">
            <Checkbox size="xs">extra small — 24px row</Checkbox>
            <Checkbox size="sm">small — 32px row</Checkbox>
            <Checkbox size="md">medium — 40px row (default)</Checkbox>
            <Checkbox size="lg">large — 48px row</Checkbox>
          </Stack>
        </Section>

        <Section title="Group">
          <FruitSelectionDemo />
          <Checkbox.Group disabled>
            <Checkbox value="pear">Disabled group</Checkbox>
            <Checkbox value="plum">No member is interactive</Checkbox>
          </Checkbox.Group>
        </Section>
      </Stack>
    </Container>
  ),
};
