import type { Meta, StoryObj } from '@storybook/react';
import { Anchor, Avatar, Badge, Container, IconButton, Positioner, Stack } from '@colox/react';
import { Hint, Section } from '../showcase/section';

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The pure-display badge family: a standalone capsule (`Badge`, the children carry the label/pill form), a status point (`Badge.Dot`), a count capsule (`Badge.Count`, truncated at `overflowCount` with "99+") and the seamless multi-segment badge (`Badge.Group` of `Badge.Item`s — shields.io style, each segment paints its own palette). Anchoring is not built in — compose `Anchor` (inline) with `Positioner` to pin a badge to a corner of a host element. `palette` (six design-language families, default gray), `size` (sm/md/lg) and, where the surface has a strength, `variant` (solid/subtle/outline/plain — default solid).',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Badge>;

export const Overview: Story = {
  render: () => (
    <Container size="md" gutter="4">
      <Stack direction="column" gap="8">
        <Section title="Badge">
          <Stack direction="row" gap="4" align="center">
            <Badge>New</Badge>
            <Badge palette="primary">Primary</Badge>
            <Badge palette="info" variant="subtle">
              Info
            </Badge>
            <Badge palette="success">Done</Badge>
            <Badge palette="warning" variant="outline">
              Pending
            </Badge>
            <Badge palette="error">Failed</Badge>
            <Hint>solid (default) · palette · subtle/outline</Hint>
          </Stack>
        </Section>

        <Section title="Dot">
          <Stack direction="row" gap="4" align="center">
            <Badge.Dot />
            <Badge.Dot palette="primary" />
            <Badge.Dot palette="info" />
            <Badge.Dot palette="success" />
            <Badge.Dot palette="warning" />
            <Badge.Dot palette="error" />
            <Hint>status point · palette</Hint>
          </Stack>
        </Section>

        <Section title="Count">
          <Stack direction="row" gap="4" align="center">
            <Badge.Count count={5} />
            <Badge.Count count={128} />
            <Badge.Count count={128} overflowCount={9} />
            <Badge.Count count={0} showZero />
            <Badge.Count count={3} palette="error" />
            <Hint>count · 99+ · custom overflow · showZero</Hint>
          </Stack>
        </Section>

        <Section title="Group (multi-segment)">
          <Stack direction="column" gap="6" align="start">
            <Stack direction="row" gap="4" align="center">
              <Badge.Group>
                <Badge.Item>build</Badge.Item>
                <Badge.Item palette="success">passing</Badge.Item>
              </Badge.Group>
              <Badge.Group>
                <Badge.Item>npm</Badge.Item>
                <Badge.Item palette="info">1.0.0</Badge.Item>
                <Badge.Item palette="warning">MIT</Badge.Item>
              </Badge.Group>
              <Hint>seamless capsule · each item paints freely</Hint>
            </Stack>
            <Badge.Group>
              <Badge.Item>coverage</Badge.Item>
              <Badge.Item palette="success">92%</Badge.Item>
              <Badge.Item>build</Badge.Item>
              <Badge.Item palette="info">v2.4.1</Badge.Item>
              <Badge.Item>license</Badge.Item>
              <Badge.Item palette="warning" variant="outline">
                MIT
              </Badge.Item>
            </Badge.Group>
            <Badge.Group rounded>
              <Badge.Item>build</Badge.Item>
              <Badge.Item palette="success">passing</Badge.Item>
            </Badge.Group>
            <Hint>default light corners · rounded full capsule</Hint>
          </Stack>
        </Section>

        <Section title="Sizes">
          <Stack direction="row" gap="4" align="center">
            <Badge size="sm">sm</Badge>
            <Badge size="md">md</Badge>
            <Badge size="lg">lg</Badge>
            <Badge.Dot size="sm" palette="success" />
            <Badge.Dot size="md" palette="success" />
            <Badge.Dot size="lg" palette="success" />
            <Badge.Count count={8} size="sm" />
            <Badge.Count count={8} size="lg" />
            <Hint>capsule + dot + count tiers</Hint>
          </Stack>
        </Section>

        <Section title="Anchoring">
          <Stack direction="row" gap="8" align="center">
            <Anchor inline>
              <Avatar name="张伟" size="lg" />
              <Positioner placement="bottom-end" offset={{ bottom: -4, end: -4 }}>
                <Badge.Dot palette="success" size="sm" />
              </Positioner>
            </Anchor>
            <Anchor inline>
              <IconButton aria-label="通知" variant="muted" />
              <Positioner placement="top-end" offset={{ top: -4, end: -4 }}>
                <Badge.Count count={3} palette="error" size="sm" />
              </Positioner>
            </Anchor>
            <Anchor inline>
              <IconButton aria-label="消息" variant="muted" />
              <Positioner placement="top-end" offset={{ top: -4, end: -4 }}>
                <Badge.Group size="sm">
                  <Badge.Item palette="error">5</Badge.Item>
                  <Badge.Item>new</Badge.Item>
                </Badge.Group>
              </Positioner>
            </Anchor>
            <Hint>Anchor (inline) + Positioner · negative px offset overhangs the corner</Hint>
          </Stack>
        </Section>
      </Stack>
    </Container>
  ),
};
