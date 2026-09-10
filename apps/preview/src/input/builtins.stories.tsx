import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Input } from '@colox/react';

const meta: Meta<typeof Input> = {
  title: 'Components/Input/Builtins',
  component: Input,
};

export default meta;

type Story = StoryObj<typeof Input>;

const ClearableRender = () => {
  const [value, setValue] = useState('editable text');
  return (
    <Input
      aria-label="Clearable"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      clearable
      placeholder="Type then clear"
    />
  );
};

export const Clearable: Story = { render: ClearableRender };

export const PasswordToggle: Story = {
  render: () => (
    <Input
      aria-label="Password"
      type="password"
      allowTogglePassword
      placeholder="Password with visibility toggle"
    />
  ),
};

const AllRender = () => {
  const [value, setValue] = useState('colox');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--colox-spacing-4)' }}>
      <Input
        aria-label="Search"
        type="search"
        clearable
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search + clear"
      />
      <Input
        aria-label="Password"
        type="password"
        allowTogglePassword
        placeholder="Password + toggle"
      />
    </div>
  );
};

export const All: Story = { render: AllRender };
