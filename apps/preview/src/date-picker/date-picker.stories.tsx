import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Container, DatePicker, Stack } from '@colox/react';
import { Section } from '../showcase/section';

const demoWidth = { maxWidth: 360 } as const;

// Controlled demo: the payload hands over the canonical ISO date, the
// readout renders it next to the field.
const Controlled = () => {
  const [value, setValue] = useState<string | null>('2026-03-02');
  return (
    <Stack direction="row" gap="2" align="center">
      <DatePicker
        aria-label="Controlled date"
        value={value}
        onChange={(payload) => setValue(payload.value)}
      />
      <span>{value === null ? 'empty' : value}</span>
    </Stack>
  );
};

const meta: Meta<typeof DatePicker> = {
  title: 'Components/DatePicker',
  component: DatePicker,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Single-line date editor: a bare text input in the Input family shell (typing accepts the canonical grammar and the configured valueFormat) plus a self-drawn panel riding the cdk popup. The picker chooses the granularity — a Monday-first month grid, a 12-month grid or a 12-year decade window — and the canonical value shape follows it (YYYY-MM-DD / YYYY-MM / YYYY). The panel header drills through its split title segments (the month segment climbs to the month grid, the year segment jumps to the decade grid; cell picks descend back down) and its single/double chevrons step the level or its parent granularity. The commit payload is { event, value }; `null` is the empty state. Partial drafts roll back on blur, min/max disable out-of-range cells and roll typed values back, and clearable follows the Select interaction (the trailing glyph swaps into the ✕ control).',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof DatePicker>;

export const Overview: Story = {
  render: () => (
    <Container size="md" gutter="4">
      <Stack direction="column" gap="8">
        <Section title="Sizes">
          <Stack direction="column" gap="4" style={demoWidth}>
            <DatePicker size="xs" aria-label="Extra small" defaultValue="2026-03-02" />
            <DatePicker size="sm" aria-label="Small" defaultValue="2026-03-02" />
            <DatePicker size="md" aria-label="Medium" defaultValue="2026-03-02" />
            <DatePicker size="lg" aria-label="Large" defaultValue="2026-03-02" />
          </Stack>
        </Section>

        <Section title="Value formats">
          <Stack direction="column" gap="4" style={demoWidth}>
            <DatePicker aria-label="ISO format" defaultValue="2026-03-02" />
            <DatePicker
              aria-label="Slash format"
              valueFormat="yyyy/M/d"
              defaultValue="2026-03-02"
            />
            <DatePicker
              aria-label="Dotted format"
              valueFormat="dd.MM.yyyy"
              defaultValue="2026-03-02"
            />
            <DatePicker
              aria-label="Weekday short"
              valueFormat="yyyy-MM-dd EEE"
              defaultValue="2026-03-02"
            />
            <DatePicker
              aria-label="Weekday full"
              valueFormat="EEEE d/M/yyyy"
              defaultValue="2026-03-02"
            />
          </Stack>
        </Section>

        <Section title="Palettes">
          <Stack direction="column" gap="4" style={demoWidth}>
            <DatePicker aria-label="Primary palette" defaultValue="2026-03-02" />
            <DatePicker aria-label="Gray palette" palette="gray" defaultValue="2026-03-02" />
            <DatePicker aria-label="Info palette" palette="info" defaultValue="2026-03-02" />
            <DatePicker aria-label="Error palette" palette="error" defaultValue="2026-03-02" />
            <DatePicker aria-label="Warning palette" palette="warning" defaultValue="2026-03-02" />
            <DatePicker aria-label="Success palette" palette="success" defaultValue="2026-03-02" />
          </Stack>
        </Section>

        <Section title="Picker granularity">
          <Stack direction="column" gap="4" style={demoWidth}>
            <DatePicker aria-label="Day picker" defaultValue="2026-03-02" />
            <DatePicker aria-label="Month picker" picker="month" defaultValue="2026-03" />
            <DatePicker aria-label="Year picker" picker="year" defaultValue="2026" />
          </Stack>
        </Section>

        <Section title="Level drilling">
          <Stack direction="column" gap="4" style={demoWidth}>
            <DatePicker aria-label="Day drilling" defaultValue="2026-03-02" />
            <DatePicker aria-label="Month drilling" picker="month" defaultValue="2026-03" />
          </Stack>
        </Section>

        <Section title="Bounds">
          <Stack direction="column" gap="4" style={demoWidth}>
            <DatePicker
              aria-label="Bounded span"
              min="2026-03-01"
              max="2026-03-20"
              defaultValue="2026-03-10"
            />
          </Stack>
        </Section>

        <Section title="Clearable">
          <Stack direction="column" gap="4" style={demoWidth}>
            <DatePicker aria-label="Clearable with value" clearable defaultValue="2026-03-02" />
            <DatePicker aria-label="Clearable empty" clearable />
          </Stack>
        </Section>

        <Section title="Locale">
          <Stack direction="column" gap="4" style={demoWidth}>
            <DatePicker aria-label="Chinese panel (default)" defaultValue="2026-03-02" />
            <DatePicker
              aria-label="English panel"
              defaultValue="2026-03-02"
              locale={{
                months: [
                  'January',
                  'February',
                  'March',
                  'April',
                  'May',
                  'June',
                  'July',
                  'August',
                  'September',
                  'October',
                  'November',
                  'December',
                ],
                weekdays: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
                yearMonthFormat: '{month} {year}',
                yearFormat: '{year}',
                decadeFormat: '{start}–{end}',
              }}
            />
          </Stack>
        </Section>

        <Section title="Interaction">
          <Stack direction="column" gap="4" style={demoWidth}>
            <Controlled />
          </Stack>
        </Section>

        <Section title="States">
          <Stack direction="column" gap="4" style={demoWidth}>
            <DatePicker aria-label="Empty" />
            <DatePicker aria-label="Invalid" invalid defaultValue="2026-03-02" />
            <DatePicker aria-label="Disabled" disabled defaultValue="2026-03-02" />
            <DatePicker aria-label="Read only" readOnly defaultValue="2026-03-02" />
          </Stack>
        </Section>
      </Stack>
    </Container>
  ),
};
