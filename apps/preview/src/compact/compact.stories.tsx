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
  <Compact style={{ width: 280 }}>
    <Input aria-label="segment 1" />
    <Input aria-label="segment 2" />
    <Input aria-label="segment 3" />
    <Input aria-label="segment 4" />
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
          Four inputs, four values: the group halves the borders, keeps radii only at the two ends.
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

      <Section title="States — the member in a state paints the seam">
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
          The invalid member rises above the junction — its red border reaches the seam. Focus rings
          the whole unit from outside (try tabbing between members); a member draws no second layer
          — its own ring and the input family's focus border change stay quiet inside the group.
        </div>
      </Section>
    </div>
  ),
};
