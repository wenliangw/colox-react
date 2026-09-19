import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import {
  Button,
  Checkbox,
  Container,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Slider,
  Stack,
  Switch,
  Textarea,
  useForm,
  type FormStore,
} from '@colox/react';
import { Section, Hint } from '../showcase/section';

const demoWidth = { maxWidth: 480 } as const;

// The submitted values, rendered as the form's receipt: the store hands
// over one object keyed by field name.
const Receipt = ({ label, payload }: { label: string; payload: unknown }) => (
  <Hint>
    {label}: {payload === null ? '—' : JSON.stringify(payload)}
  </Hint>
);

const BasicDemo = () => {
  const [submitted, setSubmitted] = useState<unknown>(null);
  const [invalid, setInvalid] = useState<unknown>(null);
  return (
    <Stack direction="column" gap="3" style={demoWidth}>
      <Form
        onSubmit={({ values }) => {
          setSubmitted(values);
          setInvalid(null);
        }}
        onInvalid={({ errors }) => {
          setInvalid(errors);
          setSubmitted(null);
        }}
      >
        <Form.Field name="name">
          <Form.Label>Name</Form.Label>
          <Input placeholder="Ada Lovelace" />
          <Form.Validate required />
        </Form.Field>
        <Form.Field name="email">
          <Form.Label>Email</Form.Label>
          <Input placeholder="ada@colox.dev" />
          <Form.Hint>We only use it to reach you.</Form.Hint>
          <Form.Validate required />
          <Form.Validate pattern={/^[^\s@]+@[^\s@]+\.[^\s@]+$/} message="Enter a valid address" />
        </Form.Field>
        <Form.Field name="bio">
          <Form.Label>Bio</Form.Label>
          <Textarea rows={2} placeholder="A line or two" />
          <Form.Validate maxLength={40} />
        </Form.Field>
        <Button type="submit" variant="solid">
          Submit
        </Button>
      </Form>
      <Receipt label="onSubmit" payload={submitted} />
      <Receipt label="onInvalid" payload={invalid} />
    </Stack>
  );
};

// Every form leaf reports the same { event, value } payload, so the
// field reads them all with one rule — checkbox and switch included.
const LeavesDemo = () => {
  const [submitted, setSubmitted] = useState<unknown>(null);
  return (
    <Stack direction="column" gap="3" style={demoWidth}>
      <Form
        onSubmit={({ values }) => setSubmitted(values)}
        validateOn={['submit', 'blur', 'change']}
      >
        <Form.Field name="seats">
          <Form.Label>Seats</Form.Label>
          <InputNumber min={1} max={12} defaultValue={2} />
          <Form.Validate required />
        </Form.Field>
        <Form.Field name="budget">
          <Form.Label>Budget</Form.Label>
          <Slider min={0} max={100} step={10} defaultValue={40} />
        </Form.Field>
        <Form.Field name="fruit">
          <Form.Label>Fruit</Form.Label>
          <Select placeholder="Pick one">
            <Select.Option value="apple" text="Apple" />
            <Select.Option value="banana" text="Banana" />
          </Select>
          <Form.Validate required />
        </Form.Field>
        <Form.Field name="size">
          <Form.Label>Size</Form.Label>
          <Radio.Group>
            <Radio value="sm">Small</Radio>
            <Radio value="lg">Large</Radio>
          </Radio.Group>
          <Form.Validate required />
        </Form.Field>
        <Form.Field name="extras">
          <Form.Label>Extras</Form.Label>
          <Checkbox.Group>
            <Checkbox value="insurance">Insurance</Checkbox>
            <Checkbox value="gift">Gift wrap</Checkbox>
          </Checkbox.Group>
        </Form.Field>
        <Form.Field name="agree">
          <Form.Label>Terms</Form.Label>
          <Switch>I accept the terms</Switch>
          <Form.Validate required />
        </Form.Field>
        <Button type="submit" variant="solid">
          Submit
        </Button>
      </Form>
      <Receipt label="onSubmit" payload={submitted} />
    </Stack>
  );
};

const StartPlacementDemo = () => (
  <Stack direction="column" gap="3" style={demoWidth}>
    <Form labelPlacement="start" labelWidth="20" gap="4">
      <Form.Field name="first">
        <Form.Label>First name</Form.Label>
        <Input placeholder="Ada" />
      </Form.Field>
      <Form.Field name="notes" labelWidth="28">
        <Form.Label>Notes</Form.Label>
        <Input placeholder="Wider label column" />
      </Form.Field>
      <Form.Field name="plain" labelPlacement="top">
        <Form.Label>Back to top</Form.Label>
        <Input placeholder="Overridden per field" />
      </Form.Field>
    </Form>
  </Stack>
);

// The store handed in from outside: imperative validate/reset from a
// toolbar, values read on demand.
const ExternalStoreDemo = () => {
  const form: FormStore = useForm({ name: '', city: 'Lisbon' });
  const [log, setLog] = useState('—');
  return (
    <Stack direction="column" gap="3" style={demoWidth}>
      <Stack direction="row" gap="2">
        <Button
          type="button"
          size="sm"
          onClick={() => {
            void form.validate().then(() => setLog(JSON.stringify(form.getErrors())));
          }}
        >
          Validate
        </Button>
        <Button type="button" size="sm" onClick={() => setLog(JSON.stringify(form.getValues()))}>
          Read values
        </Button>
        <Button type="button" size="sm" onClick={() => form.reset({ name: '', city: 'Porto' })}>
          Reset
        </Button>
      </Stack>
      <Form form={form}>
        <Form.Field name="name">
          <Form.Label>Name</Form.Label>
          <Input />
          <Form.Validate required />
        </Form.Field>
        <Form.Field name="city">
          <Form.Label>City</Form.Label>
          <Input />
          <Form.Hint>Reset restores Porto.</Form.Hint>
        </Form.Field>
      </Form>
      <Hint>{log}</Hint>
    </Stack>
  );
};

const meta: Meta<typeof Form> = {
  title: 'Components/Form',
  component: Form,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The form layer: a native <form> owning the values, the validation policy and the submit lifecycle. Form.Field renders the field container (a Stack — the family layout skeleton), wires the label to its control, injects the controlled value plus the family { event, value } change channel, and registers the rules its Form.Validate leaves declare. Controls keep their own identity: boolean leaves (Checkbox / Switch / Radio) take checked, every other domain takes value, and a group control is labelled through aria-labelledby instead of htmlFor.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Form>;

export const Overview: Story = {
  render: () => (
    <Container size="md" gutter="4">
      <Stack direction="column" gap="8">
        <Section title="Basic — rules, hint, error line">
          <BasicDemo />
        </Section>
        <Section title="Every leaf reports the same payload">
          <LeavesDemo />
        </Section>
        <Section title="Label placement — top (default) and start with a token width">
          <StartPlacementDemo />
        </Section>
        <Section title="An externally held store">
          <ExternalStoreDemo />
        </Section>
      </Stack>
    </Container>
  ),
};
