import type { ReactNode } from 'react';
import type { Meta } from '@storybook/react';
import { Button, Container, MessageViewport, Notify, Stack } from '@colox/react';

import { Section } from '../showcase/section';

const meta: Meta = {
  title: 'Components/Notify',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The titled card kind of the message system (cdk/message) — the antd-notification tier: `title` + `content`, default slot `top-right`. No action slot — a notification reports and closes (undo/retry ride `Notify.custom`). Mount one `<MessageViewport>` per container (default `root`, screen-wide `fixed`; `positioning="absolute"` pins a scoped container inside a `position: relative` parent). `Notify.info/success/warning/error({ title, content, ... }, options)` is a global imperative namespace, callable from any code position, routing into the scope named by `{ scope }`. `palette` (six family colors, defaulting to the mode: info/success/warning/error) and `variant` (plain default / subtle / solid / outline surface), `strategy` (default `stack` — several titled cards legitimately coexist; `single` replaces in place with an instant zoom). A slot that accumulates more than three cards collapses into a **deck** — the newest card full, two behind it peeking as clipped strips, the rest folded into a `+N` chip; click the deck (or the chip) to expand/collapse. The call options carry the same chrome + lifecycle axes Toast exposes: `showIcon` / `closeable` (both default `true`), `data` passthrough and `onClose({ id, data })` fired once per payload end. `custom` renders any ReactNode as the card body, `update(key, patch)` same-key in-place updates, `dismiss(key?)`. Duration auto-dismiss (default 3s, 0 = sticky) with hover pause, per-item exit animation, `role="status"` (polite). The lightweight hint kind lives under Components/Toast — both share one scope table, so one container holds toast and notify side by side. Card depth = the design language\'s `--colox-shadow-md` (the popup family tier).',
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
          <Section title="Notify — the titled card kind (top-right, stack)">
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
                  })
                }
              >
                Error
              </Button>
            </Row>
          </Section>

          <Section title="Palette — the six family colors">
            <Row>
              <Button
                onClick={() => Notify.info({ title: 'Gray', content: 'Neutral.', palette: 'gray' })}
              >
                Gray
              </Button>
              <Button
                onClick={() =>
                  Notify.info({ title: 'Primary', content: 'Brand.', palette: 'primary' })
                }
              >
                Primary
              </Button>
              <Button
                onClick={() => Notify.info({ title: 'Info', content: 'Info.', palette: 'info' })}
              >
                Info
              </Button>
              <Button
                onClick={() =>
                  Notify.success({ title: 'Success', content: 'Done.', palette: 'success' })
                }
              >
                Success
              </Button>
              <Button
                onClick={() =>
                  Notify.warning({ title: 'Warning', content: 'Heads up.', palette: 'warning' })
                }
              >
                Warning
              </Button>
              <Button
                onClick={() =>
                  Notify.error({ title: 'Error', content: 'Failed.', palette: 'error' })
                }
              >
                Error
              </Button>
            </Row>
          </Section>

          <Section title="Variant — plain / subtle / solid / outline">
            <Row>
              <Button
                onClick={() => Notify.info({ title: 'Plain', content: 'The neutral default.' })}
                variant="outline"
              >
                Plain
              </Button>
              <Button
                onClick={() =>
                  Notify.success({
                    title: 'Subtle',
                    content: 'The family tint fills the card.',
                    palette: 'success',
                    variant: 'subtle',
                  })
                }
                variant="subtle"
              >
                Subtle
              </Button>
              <Button
                onClick={() =>
                  Notify.error({
                    title: 'Solid',
                    content: 'The family solid with inverse ink.',
                    palette: 'error',
                    variant: 'solid',
                  })
                }
                variant="solid"
              >
                Solid
              </Button>
              <Button
                onClick={() =>
                  Notify.warning({
                    title: 'Outline',
                    content: 'A 1px family border on the opaque card.',
                    palette: 'warning',
                    variant: 'outline',
                  })
                }
                variant="ghost"
              >
                Outline
              </Button>
            </Row>
          </Section>

          <Section title="Burst → deck (past 3) + dismiss">
            <Row>
              <Button
                onClick={() => {
                  // a burst: the slot passes DECK_THRESHOLD (3) and the
                  // viewport collapses the stack into a deck
                  Notify.info({ title: 'one', content: 'First in the pile.' });
                  Notify.info({ title: 'two', content: 'Second behind it.' });
                  Notify.info({ title: 'three', content: 'Third peeks out.' });
                  Notify.info({ title: 'four', content: 'Fourth folds into +N.' });
                  Notify.info({ title: 'five', content: 'Fifth too.' });
                }}
                variant="subtle"
              >
                Fire a burst (decks past 3)
              </Button>
              <Button onClick={() => Notify.dismiss()}>Dismiss all</Button>
            </Row>
          </Section>

          <Section title="Same-key update (zoom entrance) + strategy: single">
            <Row>
              <Button
                onClick={() => {
                  Notify.info({ title: 'Progress', content: 'step one', key: 'progress' });
                  window.setTimeout(() => Notify.update('progress', { content: 'step two' }), 500);
                  window.setTimeout(
                    () => Notify.update('progress', { content: 'step three' }),
                    1000,
                  );
                }}
              >
                Update in place
              </Button>
              <Button
                onClick={() => {
                  // single: the newcomer replaces the current card in its
                  // slot IN PLACE — same node, the new words zoom in (the
                  // same shape as an update), no opacity dip
                  Notify.info({ title: 'first', content: 'arrival' }, { strategy: 'single' });
                  window.setTimeout(
                    () =>
                      Notify.info(
                        { title: 'replaced', content: 'instant zoom' },
                        { strategy: 'single' },
                      ),
                    500,
                  );
                }}
                variant="subtle"
              >
                Replace in place (single)
              </Button>
            </Row>
          </Section>

          <Section title="Custom content + duration (default 3s, 0 = sticky)">
            <Row>
              <Button
                onClick={() =>
                  Notify.custom(
                    <span>
                      <strong>Custom</strong> — any ReactNode renders as the card body.
                    </span>,
                  )
                }
              >
                Custom
              </Button>
              <Button
                onClick={() =>
                  Notify.info({ title: 'Sticky', content: 'Stays until dismissed.', duration: 0 })
                }
              >
                Sticky
              </Button>
            </Row>
          </Section>

          <Section title="Chrome: showIcon / closeable + data / onClose">
            <Row>
              <Button
                onClick={() =>
                  Notify.info({ title: 'Text-only card', content: 'No icon.' }, { showIcon: false })
                }
                variant="subtle"
              >
                No icon
              </Button>
              <Button
                onClick={() =>
                  Notify.info(
                    { title: 'No corner ✕', content: 'Duration or dismiss closes.' },
                    { closeable: false },
                  )
                }
                variant="subtle"
              >
                Not closeable
              </Button>
              <Button
                onClick={() =>
                  Notify.info(
                    { title: 'Bare', content: 'No icon, no ✕.' },
                    { showIcon: false, closeable: false },
                  )
                }
                variant="subtle"
              >
                Bare
              </Button>
            </Row>
            <Row>
              <Button
                onClick={() =>
                  Notify.info(
                    { title: 'Trace', content: 'This card reports its own close.' },
                    {
                      data: 'trace-42',
                      onClose: ({ data }) =>
                        Notify.info({ title: 'Closed', content: String(data) }),
                    },
                  )
                }
                variant="subtle"
              >
                data + onClose (fires on any close)
              </Button>
            </Row>
          </Section>

          <Section title="A scoped container — Notify inside a panel">
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
