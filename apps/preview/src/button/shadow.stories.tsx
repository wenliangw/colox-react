import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@colox/react';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Shadow: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <Button>No shadow</Button>
      <Button shadow>Shadow</Button>
      <Button variant="outline" shadow>
        Outline shadow
      </Button>
      <Button variant="ghost" shadow>
        Ghost shadow
      </Button>
    </div>
  ),
};
