import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Container, Select, Stack } from '@colox/react';
import type { SelectTagTemplateProps } from '@colox/react';
import { Section, Hint } from '../showcase/section';

const fruits = [
  { value: 'apple', text: 'Apple' },
  { value: 'banana', text: 'Banana' },
  { value: 'cherry', text: 'Cherry', disabled: true },
  { value: 'date', text: 'Date' },
  { value: 'elderberry', text: 'Elderberry' },
  { value: 'fig', text: 'Fig' },
  { value: 'grapefruit', text: 'Grapefruit' },
];

// A mapped member block: the select walks arrays/fragments/children,
// so shared member groups stay an element here (a component creating
// members internally would not be visible).
const FruitOptions = (
  <>
    {fruits.map((fruit) => (
      <Select.Option
        key={fruit.value}
        value={fruit.value}
        text={fruit.text}
        disabled={fruit.disabled}
      />
    ))}
  </>
);

const SingleDemo = () => {
  const [value, setValue] = useState('');
  return (
    <Stack direction="column" gap="2">
      <Select
        placeholder="Pick a fruit"
        clearable
        value={value}
        onChange={({ value: next }) => setValue(String(next))}
      >
        {FruitOptions}
      </Select>
      <Hint>{value === '' ? 'Nothing selected yet.' : `Selected: ${value}`}</Hint>
    </Stack>
  );
};

const SingleSearchDemo = () => {
  const [value, setValue] = useState('banana');
  return (
    <Stack direction="column" gap="2">
      <Select
        showSearch
        placeholder="Type to search fruit"
        value={value}
        onChange={({ value: next }) => setValue(String(next))}
      >
        {FruitOptions}
      </Select>
      <Hint>
        Searchable single: the control shows the selected text while closed and flips to the query
        stream while open. Arrows walk, Enter picks — focus never leaves the control.
      </Hint>
    </Stack>
  );
};

const MultipleDemo = () => {
  const [value, setValue] = useState<string[]>(['apple', 'date']);
  return (
    <Stack direction="column" gap="2">
      <Select
        mode="multiple"
        placeholder="Pick several fruits"
        value={value}
        onChange={({ value: next }) => setValue(next as string[])}
      >
        {FruitOptions}
      </Select>
      <Hint>
        Multiple keeps the panel open after each pick; Backspace on an empty query removes the last
        chip, each chip has its own remove button.
      </Hint>
    </Stack>
  );
};

// The chip row stays single-line: in a narrow shell the clipped tail
// folds into a +M badge (click it — or anywhere in the shell — to
// open the panel and manage the selection).
const MultipleFoldDemo = () => (
  <Select
    mode="multiple"
    placeholder="Fold overflow"
    defaultValue={fruits.map((fruit) => fruit.value)}
    style={{ width: 340 }}
  >
    {FruitOptions}
  </Select>
);

// The tag template channel: Select.Template('tag') wraps a single
// component; the library clones it per chip and injects the slot
// contract — `props` (the required-attribute bag, spread first),
// `option` (the member's record) and `onRemove` (the internal
// removal channel). The component owns all chip visuals.
const TagTemplateDemo = () => {
  const [value, setValue] = useState<string[]>(['apple', 'date']);
  return (
    <Stack direction="column" gap="2">
      <Select
        mode="multiple"
        placeholder="Custom chips"
        value={value}
        onChange={({ value: next }) => setValue(next as string[])}
      >
        {FruitOptions}
        <Select.Template name="tag">
          <EmojiTag />
        </Select.Template>
      </Select>
      <Hint>
        The template replaces the whole chip: an emoji avatar, the member <code>text</code> and a
        custom remove button wired to the injected <code>onRemove</code> (the standard{' '}
        <code>onChange</code> payload).
      </Hint>
    </Stack>
  );
};

const EMOJI: Record<string, string> = {
  apple: '🍎',
  banana: '🍌',
  cherry: '🍒',
  date: '🌴',
  elderberry: '🫐',
  fig: '🍈',
  grapefruit: '🍊',
};

// The template is a plain component typed with SelectTagTemplateProps:
// `props` (the required-attribute bag) spreads onto the root first —
// when the chip folds, the bag carries the hidden style and wins —
// `option` is the member record and `onRemove` the removal channel.
const EmojiTag = ({ props = {}, option, onRemove }: SelectTagTemplateProps) => (
  <span
    {...props}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--colox-spacing-0-5)',
      height: 'var(--colox-size-5)',
      paddingInline: 'var(--colox-spacing-1-5)',
      borderRadius: 'var(--colox-radius-full)',
      background: 'var(--colox-color-bg-muted)',
      whiteSpace: 'nowrap',
      flexShrink: 0,
      ...props.style,
    }}
  >
    <span aria-hidden="true">{EMOJI[option?.value ?? ''] ?? '🍇'}</span>
    <span>{option?.text}</span>
    <button
      type="button"
      className="colox-select__tag-remove"
      aria-label={`Remove ${option?.text ?? ''}`}
      onClick={onRemove}
    >
      ×
    </button>
  </span>
);

const RichOptionsDemo = () => {
  const [value, setValue] = useState('apple');
  return (
    <Stack direction="column" gap="2">
      <Select
        placeholder="Pick a fruit"
        value={value}
        onChange={({ value: next }) => setValue(String(next))}
      >
        <Select.Option value="apple" text="Apple">
          <strong>🍎 Apple</strong> — crisp
        </Select.Option>
        <Select.Option value="banana" text="Banana">
          <strong>🍌 Banana</strong> — soft
        </Select.Option>
        <Select.Option value="cherry" text="Cherry">
          🍒 Cherry, small and red
        </Select.Option>
      </Select>
      <Hint>
        Option children are the rich row render; <code>text</code> stays the plain-text surface — it
        drives the search filter, the trigger display and the chips.
      </Hint>
    </Stack>
  );
};

const SizeDemo = () => {
  const [value, setValue] = useState('apple');
  return (
    <Stack direction="column" gap="2">
      <Select
        defaultOpen
        placeholder="Pick a fruit"
        size="lg"
        value={value}
        onChange={({ value: next }) => setValue(String(next))}
      >
        <Select.Option value="apple" text="Apple" size="xs">
          I stay xs
        </Select.Option>
        <Select.Option value="banana" text="Banana" />
        <Select.Option value="cherry" text="Cherry" />
      </Select>
      <Hint>
        Option rows inherit the parent <code>size</code>; a member may override its own tier. The
        Apple row runs at xs while the trigger and its siblings sit at lg.
      </Hint>
    </Stack>
  );
};

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Leaf-declared single/multiple select on the shared form-family shell: Select.Option members carry their value + text, the panel is a portal listbox modeled as an ARIA 1.2 editable combobox, the search control is the cdk InputControl, and FormData flows through hidden native inputs. Option rows inherit the parent size tier per member.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Select>;

export const Overview: Story = {
  render: () => (
    <Container size="md" gutter="4">
      <Stack direction="column" gap="8">
        <Section title="States">
          <Stack direction="column" gap="2">
            <Select placeholder="Picker placeholder">{FruitOptions}</Select>
            <Select value="banana">{FruitOptions}</Select>
            {/* defaultValue (uncontrolled) so the clear action works without wiring. */}
            <Select defaultValue="banana" clearable>
              {FruitOptions}
            </Select>
            <Select value="banana" invalid>
              {FruitOptions}
            </Select>
            <Select value="banana" disabled>
              {FruitOptions}
            </Select>
          </Stack>
        </Section>

        <Section title="Sizes">
          <Stack direction="column" gap="2">
            <Select value="apple" size="xs">
              {FruitOptions}
            </Select>
            <Select value="apple" size="sm">
              {FruitOptions}
            </Select>
            <Select value="apple" size="md">
              {FruitOptions}
            </Select>
            <Select value="apple" size="lg">
              {FruitOptions}
            </Select>
          </Stack>
        </Section>

        <Section title="Single selection">
          <SingleDemo />
        </Section>

        <Section title="Searchable single">
          <SingleSearchDemo />
        </Section>

        <Section title="Multiple selection">
          <MultipleDemo />
          <MultipleFoldDemo />
        </Section>

        <Section title="Tag template">
          <TagTemplateDemo />
        </Section>

        <Section title="Rich option content">
          <RichOptionsDemo />
        </Section>

        <Section title="Row sizes (member inheritance)">
          <SizeDemo />
        </Section>
      </Stack>
    </Container>
  ),
};
