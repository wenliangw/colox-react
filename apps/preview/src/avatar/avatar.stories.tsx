import type { Meta, StoryObj } from '@storybook/react';
import { Avatar, Container, Stack } from '@colox/react';
import { Hint, Section } from '../showcase/section';

// Local inline data-URI avatars — no network dependency, so the demo
// pictures always load.
const AVATAR_ZW =
  'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2280%22%20height%3D%2280%22%3E%3Crect%20width%3D%2280%22%20height%3D%2280%22%20rx%3D%2240%22%20fill%3D%22%235B5FC7%22%2F%3E%3Ctext%20x%3D%2240%22%20y%3D%2252%22%20font-size%3D%2234%22%20text-anchor%3D%22middle%22%20fill%3D%22white%22%20font-family%3D%22sans-serif%22%3E%E5%BC%A0%3C%2Ftext%3E%3C%2Fsvg%3E';

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The portrait primitive — a round footprint carrying one of three content forms in priority order: `children` (a rich slot, always wins), `src` (the picture avatar, falling back on failure), `name` (a person name automatically reduced to its initials). Circle is the default shape — an avatar reads as a round portrait; `rounded` and `square` are explicit alternatives. `size` takes the form-family preset tiers (xs/sm/md/lg, same-name same-block as Button/Input) or any theme size-token key. `variant` (plain/subtle/solid/outline) sets the surface strength of the text avatar, `palette` the semantic color family of the colored variants. On an image failure the content falls back to the `fallback` escape hatch, then to the `name` initials, then to the `alt` initials — `fallback` is consulted only on an image failure, a missing `src` never shows it.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Avatar>;

export const Overview: Story = {
  render: () => (
    <Container size="md" gutter="4">
      <Stack direction="column" gap="8">
        <Section title="Content">
          <Stack direction="row" gap="4" align="center">
            <Avatar name="张伟" />
            <Avatar src={AVATAR_ZW} alt="张伟" />
            <Avatar>
              <span role="img" aria-label="User">
                👤
              </span>
            </Avatar>
            <Hint>name · picture · children</Hint>
          </Stack>
        </Section>

        <Section title="Shapes">
          <Stack direction="row" gap="4" align="center">
            <Avatar name="张伟" shape="circle" />
            <Avatar name="张伟" shape="rounded" />
            <Avatar name="张伟" shape="square" />
            <Hint>circle (default) · rounded · square</Hint>
          </Stack>
        </Section>

        <Section title="Sizes">
          <Stack direction="row" gap="4" align="center">
            <Avatar name="张伟" size="xs" />
            <Avatar name="张伟" size="sm" />
            <Avatar name="张伟" size="md" />
            <Avatar name="张伟" size="lg" />
            <Avatar name="张伟" size="4" />
            <Hint>xs · sm · md · lg · raw key</Hint>
          </Stack>
        </Section>

        <Section title="Variants">
          <Stack direction="row" gap="4" align="center">
            <Avatar name="张伟" />
            <Avatar name="张伟" variant="subtle" />
            <Avatar name="张伟" variant="solid" />
            <Avatar name="张伟" variant="outline" />
            <Hint>plain (default) · subtle · solid · outline</Hint>
          </Stack>
        </Section>

        <Section title="Palettes">
          <Stack direction="row" gap="4" align="center">
            <Avatar name="张伟" variant="solid" palette="primary" />
            <Avatar name="张伟" variant="solid" palette="info" />
            <Avatar name="张伟" variant="solid" palette="success" />
            <Avatar name="张伟" variant="solid" palette="warning" />
            <Avatar name="张伟" variant="solid" palette="error" />
            <Hint>solid · primary/info/success/warning/error</Hint>
          </Stack>
        </Section>

        <Section title="Failure fallback">
          <Stack direction="row" gap="4" align="center">
            <Avatar src="https://example.invalid/avatar.png" alt="张伟" name="张伟" />
            <Avatar src="https://example.invalid/avatar.png" alt="张伟" fallback={<span>!</span>} />
            <Avatar
              src="https://example.invalid/avatar.png"
              alt="张伟"
              name="张伟"
              variant="solid"
              palette="error"
            />
            <Hint>broken image falls back to the initials · fallback node · colored</Hint>
          </Stack>
        </Section>
      </Stack>
    </Container>
  ),
};
