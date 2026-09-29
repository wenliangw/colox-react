import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Alert, Button, Container, Stack } from '@colox/react';
import { Hint, Section } from '../showcase/section';

/** The controlled close + fade-out, wired end to end. */
function CloseableDemo() {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <Alert
      type="warning"
      message="可关闭的提示"
      description="点击 ✕ 先淡出，动画结束后 onClose 才触发，父级此刻卸载。"
      closeable
      onClose={() => setOpen(false)}
    />
  );
}

const meta: Meta<typeof Alert> = {
  title: 'Components/Alert',
  component: Alert,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The inline status message — a persistent, in-flow, declarative status block (the flow-in sibling of the transient Toast/Notify message system: it lives in the page, the parent decides whether it shows, and the words are JSX, not a call). `type` (info/success/warning/error, default info) picks the semantic icon and the default palette family; `palette` (six families, defaulting to the type family) picks the color; `variant` (plain/subtle/solid/outline, default subtle) picks the surface strength. `message` is the primary line, `description` the optional secondary line — both ReactNode, so rich content fits directly. `showIcon` gates the semantic icon (default on), `action` is the trailing CTA slot, `closeable` + `onClose` is the controlled close.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Alert>;

export const Overview: Story = {
  render: () => (
    <Container size="md" gutter="4">
      <Stack direction="column" gap="8">
        <Section title="Types">
          <Stack direction="column" gap="4" align="stretch">
            <Alert type="info" message="这是一条信息提示" description="更多详情可以放在这里。" />
            <Alert type="success" message="保存成功" description="已写入本地缓存。" />
            <Alert type="warning" message="磁盘空间不足" description="请清理后重试。" />
            <Alert type="error" message="连接失败" description="请检查网络后重试。" />
            <Hint>type drives the icon + the default palette family</Hint>
          </Stack>
        </Section>

        <Section title="Variants">
          <Stack direction="column" gap="4" align="stretch">
            <Alert type="success" variant="subtle" message="Subtle（默认）" />
            <Alert type="success" variant="solid" message="Solid" />
            <Alert type="success" variant="outline" message="Outline" />
            <Alert type="success" variant="plain" message="Plain" />
            <Hint>subtle (default) · solid · outline · plain</Hint>
          </Stack>
        </Section>

        <Section title="Palette">
          <Stack direction="column" gap="4" align="stretch">
            <Alert type="info" palette="primary" message="Primary" />
            <Alert type="info" palette="gray" message="Gray" />
            <Alert type="info" palette="info" message="Info" />
            <Alert type="info" palette="success" message="Success" />
            <Alert type="info" palette="warning" message="Warning" />
            <Alert type="info" palette="error" message="Error" />
            <Hint>palette overrides the type-derived family</Hint>
          </Stack>
        </Section>

        <Section title="Content">
          <Stack direction="column" gap="4" align="stretch">
            <Alert type="info" message="只有主行" />
            <Alert
              type="info"
              message={
                <span>
                  富内容 <b>主行</b>
                </span>
              }
              description="message / description 都是 ReactNode，任意 JSX 直接放。"
            />
            <Alert type="info" message="没有图标" showIcon={false} />
            <Hint>message (ReactNode) · description · showIcon</Hint>
          </Stack>
        </Section>

        <Section title="Action">
          <Stack direction="column" gap="4" align="stretch">
            <Alert
              type="error"
              message="上传失败"
              description="请检查文件后重试。"
              action={
                <Button size="sm" variant="solid">
                  重试
                </Button>
              }
            />
            <Hint>persistent inline block = the proper host for a status + CTA</Hint>
          </Stack>
        </Section>

        <Section title="Closeable">
          <Stack direction="column" gap="4" align="stretch">
            <CloseableDemo />
            <Hint>controlled close + exit fade — the parent unmounts on onClose</Hint>
          </Stack>
        </Section>
      </Stack>
    </Container>
  ),
};
