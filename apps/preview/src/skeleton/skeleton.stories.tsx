import type { Meta, StoryObj } from '@storybook/react';
import { Container, Grid, Skeleton, Stack } from '@colox/react';
import { Hint, Section } from '../showcase/section';

const meta: Meta<typeof Skeleton> = {
  title: 'Components/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The loading-placeholder family: neutral fabric shapes that reserve a slot\u2019s real estate until the content arrives, so the page does not jump when it does. The root is the rect block (`Skeleton`); `Skeleton.Text` (line), `Skeleton.Circle` (round) and `Skeleton.Button` (control silhouette) are its companions. `animation` (pulse/wave/none, pulse by default) picks the placeholder motion; every shape is decorative and `aria-hidden` by default. Pure display: no events, no state — the `loading ? <Skeleton /> : <Content />` switch belongs to the caller.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Skeleton>;

export const Overview: Story = {
  render: () => (
    <Container size="md" gutter="4">
      <Stack direction="column" gap="8">
        <Section title="Rect blocks (the layout draws the box)">
          <Hint>
            无尺寸参数——fill their cell: Grid/Stack stretch them; `width`/`height` px escapes pin
            exact sizes.
          </Hint>
          <Grid columns={2} gap="4">
            <Skeleton height={120} />
            <Skeleton height={120} />
            <Skeleton height={72} />
            <Skeleton height={72} />
          </Grid>
        </Section>

        <Section title="Shapes">
          <Hint>
            `Skeleton.Text` line / `Skeleton.Circle` round / `Skeleton.Button` silhouette.
          </Hint>
          <Stack direction="column" gap="6">
            <Stack direction="row" gap="3" align="center">
              <Skeleton.Circle size="lg" />
              <Stack.Item grow>
                <Stack direction="column" gap="2" align="stretch">
                  <Skeleton.Text />
                  <Skeleton.Text width={220} />
                </Stack>
              </Stack.Item>
            </Stack>
            <Stack direction="row" gap="3">
              <Skeleton.Button />
              <Skeleton.Button width={120} size="sm" />
            </Stack>
          </Stack>
        </Section>

        <Section title="Animation">
          <Hint>pulse 呼吸（默认）/ wave 流光 / none 静止——三条等分并排。</Hint>
          <Stack direction="row" gap="4" align="stretch">
            <Stack.Item grow>
              <Skeleton height={64} animation="pulse" />
            </Stack.Item>
            <Stack.Item grow>
              <Skeleton height={64} animation="wave" />
            </Stack.Item>
            <Stack.Item grow>
              <Skeleton height={64} animation="none" />
            </Stack.Item>
          </Stack>
        </Section>

        <Section title="Sizes">
          <Hint>
            Circle 档位镜像 Avatar（xs 24 / sm 32 / md 40 / lg 48）+ 裸 token 键（`size="7"` →
            28px）；Button 高度镜像 Button 四档；Text 行高走字号梯。
          </Hint>
          <Stack direction="column" gap="4">
            <Stack direction="row" gap="4" align="center">
              <Skeleton.Circle size="xs" />
              <Skeleton.Circle size="sm" />
              <Skeleton.Circle size="md" />
              <Skeleton.Circle size="lg" />
              <Skeleton.Circle size="7" />
            </Stack>
            <Stack direction="row" gap="3" align="center">
              <Skeleton.Button size="xs" />
              <Skeleton.Button size="sm" />
              <Skeleton.Button size="md" />
              <Skeleton.Button size="lg" />
            </Stack>
            <Stack direction="column" gap="2" align="stretch">
              <Skeleton.Text size="sm" />
              <Skeleton.Text size="md" />
              <Skeleton.Text size="lg" />
            </Stack>
          </Stack>
        </Section>
      </Stack>
    </Container>
  ),
};
