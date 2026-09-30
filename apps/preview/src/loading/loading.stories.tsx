import type { Meta, StoryObj } from '@storybook/react';
import { Button, Container, Loading, Stack } from '@colox/react';
import { Hint, Section } from '../showcase/section';

const meta: Meta<typeof Loading> = {
  title: 'Components/Loading',
  component: Loading,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The inline busy indicator: a decorative motion figure (spinner / dots / pulse) that says "work in progress" without painting a value or a layout — determinism belongs to Progress, placeholding to Skeleton. The figure inherits currentColor (drop it into a Button and it follows the tint); the size axis (sm 16 / md 24 / lg 32 or a px number) moves the indicator footprint only; the optional label rides beside it and doubles as the accessible name (default "Loading"). Announced with role="status"; children are never wrapped or masked.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Loading>;

const ANIMATIONS = ['spinner', 'dots', 'pulse'] as const;
const COLORS = [
  { name: 'brand', token: 'var(--colox-color-brand-solid)' },
  { name: 'info', token: 'var(--colox-color-blue-solid)' },
  { name: 'success', token: 'var(--colox-color-green-solid)' },
  { name: 'warning', token: 'var(--colox-color-orange-solid)' },
  { name: 'error', token: 'var(--colox-color-red-solid)' },
];

export const Overview: Story = {
  render: () => (
    <Container size="md" gutter="4">
      <Stack direction="column" gap="8">
        <Section title="Animations">
          <Hint>animation 三形态：spinner 弧线转圈 / dots 三点波 / pulse 波纹呼吸点。</Hint>
          <Stack direction="row" gap="6" align="center">
            <Loading animation="spinner" label="spinner" />
            <Loading animation="dots" label="dots" />
            <Loading animation="pulse" label="pulse" />
          </Stack>
        </Section>

        <Section title="Sizes">
          <Hint>size 三档 16 / 24 / 32（4px 格 token）+ 数字 px 逃生舱。</Hint>
          <Stack direction="row" gap="6" align="center">
            <Loading size="sm" />
            <Loading size="md" />
            <Loading size="lg" />
            <Loading size={40} />
          </Stack>
        </Section>

        <Section title="Label">
          <Hint>label 槽旁置并充当无障碍名；无 label 时默认名「Loading」。</Hint>
          <Loading label="加载中…" />
        </Section>

        <Section title="In a Button">
          <Hint>指示器继承 currentColor——塞进按钮自动随按钮色，无需调色。</Hint>
          <Stack direction="row" gap="4" align="center">
            <Button>提交中</Button>
            <Button variant="subtle">
              加载中 <Loading size="sm" />
            </Button>
          </Stack>
        </Section>

        <Section title="Colors">
          <Hint>
            无 palette 轴——给 style 设 color（或包一层彩色文本）即换色，三种 animation 都继承
            currentColor。
          </Hint>
          <Stack direction="column" gap="4">
            {ANIMATIONS.map((animation) => (
              <Stack key={animation} direction="row" gap="4" align="center">
                {COLORS.map(({ name, token }) => (
                  <Loading key={name} animation={animation} label={name} style={{ color: token }} />
                ))}
              </Stack>
            ))}
          </Stack>
        </Section>
      </Stack>
    </Container>
  ),
};
