import type { Meta, StoryObj } from '@storybook/react';
import { Button, Compact, Input, Select } from '@colox/react';
import { Section, track } from '../showcase/section';

const meta: Meta<typeof Compact> = {
  title: 'Components/Compact',
  component: Compact,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A visual joining base: members seam into one unit, radii live only at the ends, and a state member paints the seam it sits on.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Compact>;

const Code = () => (
  <Compact>
    <Input aria-label="segment 1" placeholder="seg 1" />
    <Input aria-label="segment 2" placeholder="seg 2" />
    <Input aria-label="segment 3" placeholder="seg 3" />
    <Input aria-label="segment 4" placeholder="seg 4" />
  </Compact>
);

export const Overview: Story = {
  render: () => (
    <div style={{ padding: 'var(--colox-spacing-8)' }}>
      <Section title="Segments — one unit, one seam">
        <div style={track}>
          <Code />
        </div>
        <div style={{ color: 'var(--colox-color-text-muted)' }}>
          Four inputs, four values: the group hugs its contents (no width). Give it a width and the
          inputs split it evenly.
        </div>
      </Section>

      <Section title="Action member — search / captcha recipes">
        <div style={track}>
          <Compact>
            <Input aria-label="query" placeholder="Search…" style={{ width: 220 }} />
            <Button>Search</Button>
          </Compact>
        </div>
        <div
          style={{ color: 'var(--colox-color-text-muted)', marginTop: 'var(--colox-spacing-2)' }}
        >
          The button does not produce a value — it joins visually and keeps its own click.
        </div>
      </Section>

      <Section title="Addons — prefix / suffix members">
        <div style={track}>
          <Compact>
            <span className="colox-compact__addon">¥</span>
            <Input aria-label="price" placeholder="0.00" style={{ width: 160 }} />
            <span className="colox-compact__addon">/件</span>
          </Compact>
        </div>
        <div
          style={{ color: 'var(--colox-color-text-muted)', marginTop: 'var(--colox-spacing-2)' }}
        >
          <code>colox-compact__addon</code> styles a non-control member as a segment: it produces no
          value.
        </div>
      </Section>

      <Section title="Mixed controls — a Select prefix still owns its value">
        <div style={track}>
          <Compact>
            <Select aria-label="country" style={{ width: 96 }}>
              <Select.Option value="86" text="+86" />
              <Select.Option value="1" text="+1" />
            </Select>
            <Input aria-label="number" placeholder="号码" style={{ width: 200 }} />
          </Compact>
        </div>
      </Section>

      <Section title="States — one invalid member, one invalid unit">
        <div style={track}>
          <Compact>
            <Input
              aria-label="invalid member"
              invalid
              placeholder="invalid"
              style={{ width: 140 }}
            />
            <Input aria-label="normal member" placeholder="normal" style={{ width: 140 }} />
          </Compact>
        </div>
        <div
          style={{ color: 'var(--colox-color-text-muted)', marginTop: 'var(--colox-spacing-2)' }}
        >
          An invalid member invalidates the unit: the whole outline reddens, and any focus inside
          rings red — Compact reads as one control, never as loose members.
        </div>
      </Section>
    </div>
  ),
};
