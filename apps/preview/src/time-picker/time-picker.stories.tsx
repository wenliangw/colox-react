import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Container, Stack, TimePicker } from '@colox/react';
import { Section } from '../showcase/section';

const demoWidth = { maxWidth: 360 } as const;

// Controlled demo: the payload hands over the canonical HH:mm:ss word,
// the readout renders it next to the field.
const Controlled = () => {
  const [value, setValue] = useState<string | null>('08:30:15');
  return (
    <Stack direction="row" gap="2" align="start">
      <TimePicker
        aria-label="Controlled time"
        value={value}
        onChange={(payload) => setValue(payload.value)}
      />
      <span>{value === null ? 'empty' : value}</span>
    </Stack>
  );
};

const meta: Meta<typeof TimePicker> = {
  title: 'Components/TimePicker',
  component: TimePicker,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          "Single-line time editor: a bare text input in the Input family shell (typing takes the canonical HH:mm:ss grammar and the configured valueFormat) plus a self-drawn panel riding the cdk popup. The panel holds three pure-number cyclic columns — hours 00–23, minutes 00–59, seconds 00–59 — each an 8-option wheel on a natively scrolling column (the scrollbar is hidden): the mouse wheel and the trackpad scroll the column FREELY (fractional rest positions are fine — the wheel selects nothing), hovering a cell pre-selects it visually (a neutral gray wash — never the palette, so the preselection can't be mistaken for the selection — restored on leave; while the wheel rolls the column suppresses pointer events, so cells racing under the cursor never flash), and a click is the selection — the picked option becomes the pending word and glides back onto the focus slot (a rAF direct-write ride re-aligns it over 240ms — the SAME scrollTop write channel as the wheel, so the offset and the rendered window can never disagree for a painted frame — instant under the motion gate). The up/down chevrons ride the same direct-write ±7-option step, and the glide keeps the clicked direction across the cycle seam — the down arrow scrolls DOWN through 23 → 00: the ±one-lap wrap is folded into every frame-write so each write stays inside the middle band and the seam crossing is a content-identical reset inside the ride (no pre-shift, no post-settle — nothing to flash). The chevrons are throttled by the ride's own duration — clicks during the glide are dropped and the steppers wear the family's disabled-text gray while the gate stands, the next one lands only after the ride ends — while the wheel may always take over and cancel the ride; under the motion gate there is no ride, so the steps jump straight through (no gate, no gray). The selection wash rides the value, so it scrolls with its cell. Picks preview into the field in gray placeholder styling; the panel's confirm button (确定 by default, text via `confirmText`) commits the pending word, closes and refocuses the field — Escape or outside clicks discard it. An empty value opens the panel pre-selecting the system clock — the subtle wash rides it and the confirm button commits it straight away. The commit payload is { event, value } with the canonical HH:mm:ss word; `null` is the empty state. Partial drafts roll back on blur, min/max disable out-of-bounds options and block the Confirm button while pending sits outside them, and clearable follows the Select interaction (the trailing glyph swaps into the ✕ control).",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof TimePicker>;

export const Overview: Story = {
  render: () => (
    <Container size="md" gutter="4">
      <Stack direction="column" gap="8">
        <Section title="Confirm flow">
          <Stack direction="column" gap="4" style={demoWidth}>
            <TimePicker aria-label="Picking previews, Confirm commits" defaultValue="08:30:15" />
            <TimePicker aria-label="Empty field" />
          </Stack>
        </Section>

        <Section title="Sizes">
          <Stack direction="column" gap="4" style={demoWidth}>
            <TimePicker size="xs" aria-label="Extra small" defaultValue="08:30:15" />
            <TimePicker size="sm" aria-label="Small" defaultValue="08:30:15" />
            <TimePicker size="md" aria-label="Medium" defaultValue="08:30:15" />
            <TimePicker size="lg" aria-label="Large" defaultValue="08:30:15" />
          </Stack>
        </Section>

        <Section title="Value formats">
          <Stack direction="column" gap="4" style={demoWidth}>
            <TimePicker aria-label="Zero-padded 24-hour" defaultValue="08:30:15" />
            <TimePicker
              aria-label="Single-digit clock"
              valueFormat="H:m:s"
              defaultValue="08:30:15"
            />
            <TimePicker
              aria-label="Twelve-hour clock"
              valueFormat="h:mm:ss"
              defaultValue="13:30:15"
            />
            <TimePicker
              aria-label="Dotted separators"
              valueFormat="H.mm.ss"
              defaultValue="08:30:15"
            />
          </Stack>
        </Section>

        <Section title="Palettes">
          <Stack direction="column" gap="4" style={demoWidth}>
            <TimePicker aria-label="Primary palette" defaultValue="08:30:15" />
            <TimePicker aria-label="Gray palette" palette="gray" defaultValue="08:30:15" />
            <TimePicker aria-label="Info palette" palette="info" defaultValue="08:30:15" />
            <TimePicker aria-label="Error palette" palette="error" defaultValue="08:30:15" />
            <TimePicker aria-label="Warning palette" palette="warning" defaultValue="08:30:15" />
            <TimePicker aria-label="Success palette" palette="success" defaultValue="08:30:15" />
          </Stack>
        </Section>

        <Section title="Bounds">
          <Stack direction="column" gap="4" style={demoWidth}>
            <TimePicker
              aria-label="Working hours"
              min="09:00:00"
              max="18:00:00"
              defaultValue="13:30:15"
            />
          </Stack>
        </Section>

        <Section title="Clearable">
          <Stack direction="column" gap="4" style={demoWidth}>
            <TimePicker aria-label="Clearable with value" clearable defaultValue="08:30:15" />
            <TimePicker aria-label="Clearable empty" clearable />
          </Stack>
        </Section>

        <Section title="Interaction">
          <Stack direction="column" gap="4" style={demoWidth}>
            <Controlled />
          </Stack>
        </Section>

        <Section title="States">
          <Stack direction="column" gap="4" style={demoWidth}>
            <TimePicker aria-label="Empty" />
            <TimePicker aria-label="Invalid" invalid defaultValue="08:30:15" />
            <TimePicker aria-label="Disabled" disabled defaultValue="08:30:15" />
            <TimePicker aria-label="Read only" readOnly defaultValue="08:30:15" />
          </Stack>
        </Section>
      </Stack>
    </Container>
  ),
};
