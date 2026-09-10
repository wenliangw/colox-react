import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '@colox/react';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    docs: {
      description: {
        component:
          'Single-line text input on a group shell: slots, built-in controls and a pattern-filter channel.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Input>;

export const Size: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--colox-spacing-4)' }}>
      <Input aria-label="Small" size="sm" placeholder="sm — 26px" />
      <Input aria-label="Medium" size="md" placeholder="md — 36px" />
      <Input aria-label="Large" size="lg" placeholder="lg — 48px" />
    </div>
  ),
};

export const LeadingTrailing: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--colox-spacing-4)' }}>
      <Input aria-label="Search" type="search" placeholder="Search (automatic leading icon)" />
      <Input aria-label="Amount" leading="¥" placeholder="Explicit leading text" />
      <Input aria-label="Weight" trailing="kg" placeholder="Explicit trailing text" />
      <Input
        aria-label="Domain"
        leading="https://"
        trailing=".com"
        placeholder="Leading and trailing"
      />
    </div>
  ),
};

export const InvalidAndDisabled: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--colox-spacing-4)' }}>
      <Input aria-label="Invalid" invalid defaultValue="wrong value" placeholder="invalid" />
      <Input aria-label="Disabled" disabled defaultValue="disabled value" placeholder="disabled" />
    </div>
  ),
};
