import type { Meta, StoryObj } from '@storybook/react';
import { Button, Container, Empty, Grid, Stack } from '@colox/react';
import { Hint, Section } from '../showcase/section';

const meta: Meta<typeof Empty> = {
  title: 'Components/Empty',
  component: Empty,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The empty-state block: a centered figure, a title and a description (plus an optional action) that tell the reader a region has nothing to show and what to do about it. `type` (empty/search/error, empty by default) picks the built-in scene figure — a multi-color atmospheric illustration with its own ambient palette per scene; `figure` overrides it with a custom illustration. Static display: no events, no state, not closable — the meaning lives in the prose and any action.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Empty>;

export const Overview: Story = {
  render: () => (
    <Container size="md" gutter="4">
      <Stack direction="column" gap="8">
        <Section title="Scenes">
          <Hint>
            type 三场景：empty 蓝橙文件夹+数据页 / search 绿蓝漂浮文档 / error
            红橙星球星系——各带一组场景氛围色系，语义色仍归文字与动作。
          </Hint>
          <Grid columns={3} gap="4">
            <Empty type="empty" title="暂无数据" description="这里还没有内容" />
            <Empty type="search" title="没有匹配结果" description="换个关键词试试" />
            <Empty type="error" title="加载失败" description="请稍后重试" />
          </Grid>
        </Section>

        <Section title="Content and action">
          <Hint>title / description / action 三个 ReactNode 槽，后两者可选。</Hint>
          <Empty
            type="search"
            title="没有找到「colox」"
            description="试试更换搜索词，或清空筛选条件。"
            action={<Button>清空筛选</Button>}
          />
        </Section>

        <Section title="Custom figure">
          <Hint>figure 槽覆盖内置图——传入自定义 SVG / 图片 / 任意 ReactNode。</Hint>
          <Empty
            figure={
              <svg viewBox="0 0 48 48" width={48} height={48} aria-hidden="true">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            }
            title="自定义插图"
            description="figure 完全替代内置图，语义由你自己控制"
          />
        </Section>
      </Stack>
    </Container>
  ),
};
