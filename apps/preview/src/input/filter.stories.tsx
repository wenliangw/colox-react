import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Input } from '@colox/react';

const meta: Meta<typeof Input> = {
  title: 'Components/Input/FilterPattern',
  component: Input,
  parameters: {
    docs: {
      description: {
        component:
          'The input-restriction channel: committed user transitions must stay inside the pattern language. `/^\\d*$/` allows an empty field and mid-way typing.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Input>;

const DigitsOnlyRender = () => {
  const [value, setValue] = useState('');
  return (
    <Input
      aria-label="Code"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      filterPattern={/^\d*$/}
      placeholder="Only digits accepted"
    />
  );
};

export const DigitsOnly: Story = { render: DigitsOnlyRender };

const UpperAlphaRender = () => {
  const [value, setValue] = useState('');
  return (
    <Input
      aria-label="Code"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      filterPattern={/^[A-Z]*$/}
      placeholder="Uppercase letters only"
    />
  );
};

export const UpperAlpha: Story = { render: UpperAlphaRender };

const FilterPlusClearRender = () => {
  const [value, setValue] = useState('0123');
  return (
    <Input
      aria-label="Code"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      filterPattern={/^\d+$/}
      clearable
      placeholder="Digits; the explicit clear always works"
    />
  );
};

export const FilterPlusClear: Story = { render: FilterPlusClearRender };
