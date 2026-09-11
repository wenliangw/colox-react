import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Container, Radio, Stack } from '@colox/react';
import { Section, Hint } from '../showcase/section';

const FruitSelectionDemo = () => {
  const [selected, setSelected] = useState<string>('');
  return (
    <Stack direction="column" gap="2">
      <Radio.Group value={selected} onChange={({ value }) => setSelected(value)}>
        <Radio value="apple">Apple</Radio>
        <Radio value="banana">Banana</Radio>
        <Radio value="orange">Orange</Radio>
      </Radio.Group>
      <Hint>
        {selected === '' ? 'Nothing selected yet — pick a fruit.' : `Selected: ${selected}`}
      </Hint>
    </Stack>
  );
};

const meta: Meta<typeof Radio> = {
  title: 'Components/Radio',
  component: Radio,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Single radio with the classic ring-and-dot selection model, single-select groups via Radio.Group and the shared xs/sm/md/lg size axis.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Radio>;

export const Overview: Story = {
  render: () => (
    <Container size="md" gutter="4">
      <Stack direction="column" gap="8">
        <Section title="States">
          <Stack direction="column" gap="2">
            <Radio>Unchecked</Radio>
            <Radio defaultChecked>Checked</Radio>
            <Radio invalid>Invalid</Radio>
            <Radio invalid defaultChecked>
              Invalid · checked
            </Radio>
            <Radio disabled>Disabled</Radio>
            <Radio disabled defaultChecked>
              Disabled · checked
            </Radio>
          </Stack>
        </Section>

        <Section title="Sizes">
          <Stack direction="column" gap="2">
            <Radio size="xs">extra small — 24px row</Radio>
            <Radio size="sm">small — 32px row</Radio>
            <Radio size="md">medium — 40px row (default)</Radio>
            <Radio size="lg">large — 48px row</Radio>
          </Stack>
        </Section>

        <Section title="Group">
          <FruitSelectionDemo />
          <Radio.Group disabled size="lg">
            <Radio value="pear">Disabled group · size lg inherited</Radio>
            <Radio value="plum">No member is interactive</Radio>
          </Radio.Group>
        </Section>
      </Stack>
    </Container>
  ),
};
