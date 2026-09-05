import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@colox/react';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
};

export default meta;

type Story = StoryObj<typeof Button>;

export const State: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Button>Default</Button>
      <Button disabled>Disabled</Button>
    </div>
  ),
};
