import type { ReactNode } from 'react';
import type { Meta } from '@storybook/react';
import { Button, Container, MessageViewport, Notify, Stack, Toast } from '@colox/react';

import { Section } from '../showcase/section';

const meta: Meta = {
  title: 'Components/Toast',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The message system — a shared scope-registry base (cdk/message) with two imperative faces. You mount one `<MessageViewport scope="…">` per container (default `root`, screen-wide `fixed`); `Toast.…` is the lightweight hint face (a slim single-line pill, default `top-center`), `Notify.…` is the titled card face (title + content + one action, default `top-right`). Both faces route into the SAME scope table, so one container holds toast and notify entries side by side — `Toast.info(msg, { scope })` / `Notify.info(payload, { scope })` pick the container; `positioning="absolute"` pins a scoped container inside a `position: relative` parent (a panel, a card). Tone shortcuts on both faces (info/success/warning/error), `update(key, patch)` same-key in-place updates, `dismiss(key?)`, duration auto-dismiss (default 3s, 0 = sticky) with hover pause, per-item exit animation, `role="status"` (polite).',
      },
    },
  },
};

export default meta;

const Row = ({ children }: { children: ReactNode }) => (
  <Stack direction="row" gap="4" align="center">
    {children}
  </Stack>
);

export const Overview = {
  render: () => (
    <>
      {/* the root container: one MessageViewport per scope — the default
          `root` scope is the screen-wide fixed container every unscoped
          call routes into */}
      <MessageViewport />

      <Container size="md" gutter="4">
        <Stack direction="column" gap="8">
          <Section title="Toast — the lightweight hint face (top-center)">
            <Row>
              <Button onClick={() => Toast.info('Saved.')}>Info</Button>
              <Button onClick={() => Toast.success('All good.')}>Success</Button>
              <Button onClick={() => Toast.warning('Heads up.')}>Warning</Button>
              <Button onClick={() => Toast.error('Something went wrong.')}>Error</Button>
            </Row>
          </Section>

          <Section title="Custom content + duration (default 3s, 0 = sticky)">
            <Row>
              <Button
                onClick={() =>
                  Toast.custom(
                    <span>
                      <strong>Custom</strong> — any ReactNode renders as-is.
                    </span>,
                  )
                }
              >
                Custom
              </Button>
              <Button onClick={() => Toast.info('Auto-dismisses in 3s.')}>Default</Button>
              <Button onClick={() => Toast.info('Stays until dismissed.', { duration: 0 })}>
                Sticky
              </Button>
            </Row>
          </Section>

          <Section title="Same-key update + dismiss">
            <Row>
              <Button
                onClick={() => {
                  Toast.info('step one', { key: 'progress' });
                  window.setTimeout(() => Toast.update('progress', { content: 'step two' }), 500);
                }}
              >
                Update in place
              </Button>
              <Button onClick={() => Toast.info('Another toast.')}>Add</Button>
              <Button onClick={() => Toast.dismiss()}>Dismiss all</Button>
            </Row>
          </Section>

          <Section title="Notify — the titled card face (top-right)">
            <Row>
              <Button
                onClick={() =>
                  Notify.info({
                    title: 'Saved',
                    content: 'The file is on disk.',
                  })
                }
              >
                Info
              </Button>
              <Button
                onClick={() =>
                  Notify.success({
                    title: 'Deploy finished',
                    content: 'Preview is live at the usual URL.',
                  })
                }
              >
                Success
              </Button>
              <Button
                onClick={() =>
                  Notify.warning({
                    title: 'Rate limit',
                    content: 'You are close to the hourly cap.',
                  })
                }
              >
                Warning
              </Button>
              <Button
                onClick={() =>
                  Notify.error({
                    title: 'Upload failed',
                    content: 'The file is larger than 10 MB.',
                    action: { label: 'Retry', onClick: () => {} },
                  })
                }
              >
                Error + action
              </Button>
            </Row>
          </Section>

          <Section title="A scoped container — messages inside a panel">
            <div
              style={{
                position: 'relative',
                height: '240px',
                border: '1px dashed var(--colox-color-border-muted)',
                borderRadius: 'var(--colox-radius-md)',
              }}
            >
              <MessageViewport scope="panel" positioning="absolute" />
              <Stack
                direction="row"
                gap="4"
                align="center"
                style={{ padding: 'var(--colox-spacing-4)' }}
              >
                <Button onClick={() => Toast.info('Inside the panel.', { scope: 'panel' })}>
                  Toast in panel
                </Button>
                <Button
                  onClick={() =>
                    Notify.info(
                      { title: 'Panel notify', content: 'Scoped to the container box.' },
                      { scope: 'panel' },
                    )
                  }
                >
                  Notify in panel
                </Button>
              </Stack>
            </div>
          </Section>
        </Stack>
      </Container>
    </>
  ),
};
