import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Container, Stack, Switch } from '@colox/react';
import { Section } from '../showcase/section';

const demoWidth = { maxWidth: 360 } as const;

// Controlled demo: the switch owns its state locally so the row
// reflects every toggle.
const Controlled = () => {
  const [checked, setChecked] = useState(true);
  return (
    <Switch checked={checked} onChange={(event) => setChecked(event.target.checked)}>
      Enable notifications
    </Switch>
  );
};

const meta: Meta<typeof Switch> = {
  title: 'Components/Switch',
  component: Switch,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Single boolean switch on the Checkbox row contract: a native checkbox input dressed as a brand track with a sliding thumb (role="switch"), children as the label, four size tiers and the invalid/disabled states.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Switch>;

export const Overview: Story = {
  render: () => (
    <Container size="md" gutter="4">
      <Stack direction="column" gap="8">
        <Section title="Sizes">
          <Stack direction="column" gap="2" style={demoWidth}>
            <Switch size="xs">Extra small</Switch>
            <Switch size="sm">Small</Switch>
            <Switch size="md">Medium (default)</Switch>
            <Switch size="lg">Large</Switch>
          </Stack>
        </Section>

        <Section title="States">
          <Stack direction="column" gap="2" style={demoWidth}>
            <Switch>Off</Switch>
            <Switch defaultChecked>On</Switch>
            <Switch invalid>Required consent missing</Switch>
            <Switch defaultChecked invalid>
              Invalid but on
            </Switch>
            <Switch disabled>Disabled off</Switch>
            <Switch defaultChecked disabled>
              Disabled on
            </Switch>
          </Stack>
        </Section>

        <Section title="Interaction">
          <Stack direction="column" gap="2" style={demoWidth}>
            <Controlled />
          </Stack>
        </Section>
      </Stack>
    </Container>
  ),
};
