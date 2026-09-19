import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { AutoComplete, Container, Input, Stack } from '@colox/react';
import { Section, Hint } from '../showcase/section';

const demoWidth = { maxWidth: 360 } as const;

const Fraternities = (
  <AutoComplete.Suggestions>
    <AutoComplete.Option value="ada" text="Ada" />
    <AutoComplete.Option value="bob" text="Bob" />
    <AutoComplete.Option value="cleo" text="Cleo" disabled />
    <AutoComplete.Option value="dora" text="Dora" />
    <AutoComplete.Option value="eve" text="Eve" />
    <AutoComplete.Option value="finn" text="Finn" />
  </AutoComplete.Suggestions>
);

// Controlled readout: the payload's value is the free text, the
// selection channel reports which suggestion row was picked.
const Controlled = () => {
  const [value, setValue] = useState('');
  const [lastPick, setLastPick] = useState('none');
  return (
    <Stack direction="column" gap="2">
      <AutoComplete
        aria-label="Controlled friend"
        value={value}
        onChange={(payload) => setValue(payload.value)}
        onSelect={(payload) => setLastPick(payload.option.text)}
      >
        <AutoComplete.Target>
          <Input placeholder="Type a name" />
        </AutoComplete.Target>
        {Fraternities}
      </AutoComplete>
      <span>
        value: {value === '' ? 'empty' : value} · last pick: {lastPick}
      </span>
    </Stack>
  );
};

const meta: Meta<typeof AutoComplete> = {
  title: 'Components/AutoComplete',
  component: AutoComplete,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The free-text combobox: a structural shell that injects the combobox contract into a single host (the Input family owns size/invalid/clearable, AutoComplete owns the value and the mechanism). Members are declared as AutoComplete.Option leaves inside AutoComplete.Suggestions; focus opens the full list, typing filters case-insensitively over the text and the value (filterOption overrides), zero matches close the popup, and Escape/blur close. The ARIA editable-combobox keyboard keeps focus in the host: arrows walk the rows via aria-activedescendant (disabled rows skipped, wraps both ways), Home/End jump, Enter picks. Every pick fills the free text — suggestions are a convenience, never a constraint — and fires the { event, value } change payload plus an onSelect { event, value, option } notification. The panel rows stay at the fixed md tier and carry no selection state: the fill is the selection.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof AutoComplete>;

export const Overview: Story = {
  render: () => (
    <Container size="md" gutter="4">
      <Stack direction="column" gap="8">
        <Section title="Sizes — the host owns the tier">
          <Stack direction="column" gap="4" style={demoWidth}>
            <AutoComplete aria-label="Extra small">
              <AutoComplete.Target>
                <Input size="xs" placeholder="xs host" />
              </AutoComplete.Target>
              {Fraternities}
            </AutoComplete>
            <AutoComplete aria-label="Small">
              <AutoComplete.Target>
                <Input size="sm" placeholder="sm host" />
              </AutoComplete.Target>
              {Fraternities}
            </AutoComplete>
            <AutoComplete aria-label="Medium">
              <AutoComplete.Target>
                <Input size="md" placeholder="md host" />
              </AutoComplete.Target>
              {Fraternities}
            </AutoComplete>
            <AutoComplete aria-label="Large">
              <AutoComplete.Target>
                <Input size="lg" placeholder="lg host" />
              </AutoComplete.Target>
              {Fraternities}
            </AutoComplete>
          </Stack>
        </Section>

        <Section title="Host states">
          <Stack direction="column" gap="4" style={demoWidth}>
            <AutoComplete aria-label="Invalid host">
              <AutoComplete.Target>
                <Input invalid placeholder="invalid host" />
              </AutoComplete.Target>
              {Fraternities}
            </AutoComplete>
            <AutoComplete aria-label="Disabled host" defaultValue="ada">
              <AutoComplete.Target>
                <Input disabled placeholder="disabled host" />
              </AutoComplete.Target>
              {Fraternities}
            </AutoComplete>
            <AutoComplete aria-label="Read-only host" defaultValue="bob">
              <AutoComplete.Target>
                <Input readOnly placeholder="readOnly host" />
              </AutoComplete.Target>
              {Fraternities}
            </AutoComplete>
          </Stack>
        </Section>

        <Section title="Field wiring — the root forwards the control words">
          <Stack direction="column" gap="4" style={demoWidth}>
            <AutoComplete
              id="root-wired"
              name="fraternity"
              invalid
              aria-describedby="root-wired-hint"
              aria-label="Root-wired host"
              defaultValue="ada"
            >
              <AutoComplete.Target>
                <Input placeholder="Static words stay on the host" />
              </AutoComplete.Target>
              {Fraternities}
            </AutoComplete>
            <Hint>
              id / name / invalid / disabled / readOnly and the aria channel land on the host input;
              size, placeholder and clearable stay here.
            </Hint>
          </Stack>
        </Section>

        <Section title="Values and picks">
          <Stack direction="column" gap="4" style={demoWidth}>
            <Controlled />
            <AutoComplete aria-label="Rich rows">
              <AutoComplete.Target>
                <Input placeholder="Rich option content" />
              </AutoComplete.Target>
              <AutoComplete.Suggestions>
                <AutoComplete.Option value="ada" text="Ada">
                  <strong>Ada</strong> · backend engineer
                </AutoComplete.Option>
                <AutoComplete.Option value="bob" text="Bob">
                  <strong>Bob</strong> · product designer
                </AutoComplete.Option>
              </AutoComplete.Suggestions>
            </AutoComplete>
          </Stack>
        </Section>
      </Stack>
    </Container>
  ),
};
