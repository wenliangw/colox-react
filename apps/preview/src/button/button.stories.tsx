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
        component: 'Action trigger on the variant/palette/size triple axis.',
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
            <Button variant="subtle">Subtle</Button>
            <Button variant="surface">Surface</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
          </Stack>
        </Section>

        <Section title="Palettes">
          <Stack gap="3" wrap>
            <Button palette="primary">Primary</Button>
            <Button palette="gray">Gray</Button>
            <Button palette="info">Info</Button>
            <Button palette="error">Error</Button>
            <Button palette="warning">Warning</Button>
            <Button palette="success">Success</Button>
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
