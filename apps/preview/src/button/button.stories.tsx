import type { Meta, StoryObj } from '@storybook/react';
import { Button, Container, Stack } from '@colox/react';
import { Section } from '../showcase/section';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Action trigger on the variant/intent/size triple axis.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Overview: Story = {
  render: () => (
    <Container size="md" gutter="4">
      <Stack direction="column" gap="8">
        <Section title="Sizes">
          <Stack gap="3">
            <Button size="xs">Tiny</Button>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </Stack>
        </Section>

        <Section title="Variants">
          <Stack gap="3">
            <Button variant="solid">Solid</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
          </Stack>
        </Section>

        <Section title="Intents">
          <Stack gap="3" wrap>
            <Button intent="primary">Primary</Button>
            <Button intent="neutral">Neutral</Button>
            <Button intent="danger">Danger</Button>
            <Button intent="warning">Warning</Button>
            <Button intent="success">Success</Button>
          </Stack>
        </Section>

        <Section title="Shadow">
          <Stack gap="3">
            <Button>None</Button>
            <Button shadow>Shadow</Button>
            <Button variant="outline" shadow>
              Outline
            </Button>
            <Button variant="ghost" shadow>
              Ghost
            </Button>
          </Stack>
        </Section>

        <Section title="States">
          <Stack gap="3">
            <Button>Enabled</Button>
            <Button disabled>Disabled</Button>
            <Button variant="outline" disabled>
              Outline disabled
            </Button>
          </Stack>
        </Section>
      </Stack>
    </Container>
  ),
};
