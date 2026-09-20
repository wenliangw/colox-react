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
  useFormWatch,
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

// The label text alignment inside the start-placement column: `end`
// plasters the label against the control, `justify` spreads the
// characters across the fixed width — the two-to-four character
// Chinese label trick for a tidy column, `start` leads (the default).
const LabelAlignDemo = () => (
  <Stack direction="column" gap="3" style={demoWidth}>
    <Form labelPlacement="start" labelWidth="16" labelAlign="end" gap="4">
      <Form.Field name="name">
        <Form.Label>姓名</Form.Label>
        <Input placeholder="Ada" />
      </Form.Field>
      <Form.Field name="email" labelAlign="justify">
        <Form.Label>邮箱</Form.Label>
        <Input placeholder="ada@colox.dev" />
      </Form.Field>
      <Form.Field name="note" labelAlign="start">
        <Form.Label>备注</Form.Label>
        <Input placeholder="Leads (left)" />
      </Form.Field>
    </Form>
  </Stack>
);

// The required mark: derived from the `required` rules — the star
// renders while some Form.Validate leaf declares it, leading the text
// by default (`requiredMarkPosition` on the form, overridable per
// field; a label hides its own with `showRequiredMark={false}`). The
// star travels with the text under every labelAlign word: end keeps
// the whole label — star and text — against the control, justify
// spreads the text alone.
const RequiredMarkDemo = () => (
  <Stack direction="column" gap="3" style={demoWidth}>
    <Form labelPlacement="start" labelWidth="16" labelAlign="end" gap="4">
      <Form.Field name="name">
        <Form.Label>姓名</Form.Label>
        <Input placeholder="Ada" />
        <Form.Validate required />
      </Form.Field>
      <Form.Field name="mail" requiredMarkPosition="end">
        <Form.Label>邮箱</Form.Label>
        <Input placeholder="ada@colox.dev" />
        <Form.Validate required />
      </Form.Field>
      <Form.Field name="address" labelAlign="justify">
        <Form.Label>地址</Form.Label>
        <Input placeholder="Spread label text" />
        <Form.Validate required />
      </Form.Field>
      <Form.Field name="note">
        <Form.Label showRequiredMark={false}>备注</Form.Label>
        <Input placeholder="Required but unmarked" />
        <Form.Validate required />
      </Form.Field>
    </Form>
  </Stack>
);

// The form-wide lock: `disabled` cascades into every control with no
// per-field exit (the sticky grammar of the groups' disabled). A
// field-level `validateOn` overrides the form policy — the classic
// login mix of the name checked on blur and the password on change.
const LockAndPolicyDemo = () => (
  <Stack direction="column" gap="6" style={demoWidth}>
    <Form disabled gap="4">
      <Form.Field name="locked-name">
        <Form.Label>Locked</Form.Label>
        <Input />
      </Form.Field>
      <Form.Field name="locked-extra">
        <Form.Label>Extra</Form.Label>
        <Checkbox>Also disabled</Checkbox>
      </Form.Field>
    </Form>
    <Form validateOn="change" gap="4">
      <Form.Field name="login-name" validateOn="blur">
        <Form.Label>Login</Form.Label>
        <Input autoComplete="username" />
        <Form.Hint>Checked on blur…</Form.Hint>
        <Form.Validate required message="Login checked on blur" />
      </Form.Field>
      <Form.Field name="login-pass">
        <Form.Label>Password</Form.Label>
        <Input type="password" autoComplete="current-password" />
        <Form.Hint>…strength on change.</Form.Hint>
        <Form.Validate required message="Password checked on change" />
      </Form.Field>
    </Form>
  </Stack>
);

// useFormWatch: the one-line read-only subscription behind dependent
// fields, live summaries and auto-save. The receipts re-render straight
// from the store, without touching the rules.
const WatchValue = ({ store, name, label }: { store: FormStore; name: string; label: string }) => {
  const value = useFormWatch(store, name) as string;
  return (
    <Hint>
      {label}: {value || '—'}
    </Hint>
  );
};

const WatchDemo = () => {
  const form: FormStore = useForm();
  const all = useFormWatch(form);
  return (
    <Stack direction="column" gap="3" style={demoWidth}>
      <Form form={form}>
        <Form.Field name="note">
          <Form.Label>Note</Form.Label>
          <Input placeholder="Type and watch the receipts" />
        </Form.Field>
      </Form>
      <WatchValue store={form} name="note" label="useFormWatch(form, 'note')" />
      <Hint>useFormWatch(form): {JSON.stringify(all)}</Hint>
    </Stack>
  );
};

// The edit-form loop: setValues backfills a fetched record without
// touching the rules, and onValuesChange reports only the user's own
// edits with the post-change snapshot — loads and resets stay silent.
const EditFormDemo = () => {
  const form: FormStore = useForm();
  const [log, setLog] = useState<string[]>([]);
  return (
    <Stack direction="column" gap="3" style={demoWidth}>
      <Stack direction="row" gap="2">
        <Button
          type="button"
          variant="outline"
          onClick={() => form.setValues({ name: 'Ada', email: 'ada@colox.dev' })}
        >
          setValues
        </Button>
        <Button type="button" variant="outline" onClick={() => form.reset()}>
          reset
        </Button>
      </Stack>
      <Form
        form={form}
        onValuesChange={({ name, value }) =>
          setLog((lines) => [...lines.slice(-1), `${name}=${String(value)}`])
        }
      >
        <Form.Field name="name">
          <Form.Label>Name</Form.Label>
          <Input />
          <Form.Validate required />
        </Form.Field>
        <Form.Field name="email">
          <Form.Label>Email</Form.Label>
          <Input />
          <Form.Validate required />
        </Form.Field>
      </Form>
      <Hint>onValuesChange: {log.join(' · ') || '—'}</Hint>
    </Stack>
  );
};

// The form-wide size cascades like a state class: a control's own
// word wins over the form's. The colon rides as CSS paint outside the
// text — queries stay clean, the star stays glued to its words, and a
// field can opt out.
const SizeAndColonDemo = () => (
  <Form size="sm" colon gap="4" style={demoWidth}>
    <Form.Field name="org">
      <Form.Label>组织</Form.Label>
      <Input placeholder="组织名称" />
      <Form.Validate required />
    </Form.Field>
    <Form.Field name="city">
      <Form.Label>城市</Form.Label>
      <Input size="lg" />
    </Form.Field>
    <Form.Field name="note" colon={false}>
      <Form.Label>备注</Form.Label>
      <Input />
    </Form.Field>
  </Form>
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
        <Section title="Label alignment — start / end / justify inside the column">
          <LabelAlignDemo />
        </Section>
        <Section title="Required mark — from the rules, start / end, per-label hide">
          <RequiredMarkDemo />
        </Section>
        <Section title="Form-wide lock and a per-field validation policy">
          <LockAndPolicyDemo />
        </Section>
        <Section title="useFormWatch — live read-only subscriptions">
          <WatchDemo />
        </Section>
        <Section title="Edit form — setValues backfill and onValuesChange">
          <EditFormDemo />
        </Section>
        <Section title="Form-wide size and the label colon">
          <SizeAndColonDemo />
        </Section>
        <Section title="An externally held store">
          <ExternalStoreDemo />
        </Section>
      </Stack>
    </Container>
  ),
};
