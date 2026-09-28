import type { ReactNode } from 'react';
import type { Meta } from '@storybook/react';
import { Button, Container, MessageViewport, Stack, Toast } from '@colox/react';

import { Section } from '../showcase/section';

const meta: Meta = {
  title: 'Components/Toast',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The lightweight hint kind of the message system (cdk/message) — the antd-message tier: a slim single-line pill, default slot `top-center`. Mount one `<MessageViewport>` per container — the default `root` is the screen-wide fixed layer; `<MessageViewport scope="…" asChild>` merges a scoped container onto your own element (no wrapper div, no `position: relative` parent needed — the element itself becomes the anchor). `Toast.info/success/warning/error(content, options)` is a global imperative namespace, callable from any code position, routing into the scope named by `{ scope }`. `palette` (six family colors, defaulting to the mode: info/success/warning/error) and `variant` (plain default / subtle / solid / outline surface), `strategy` (`single` replaces a toast in its slot IN PLACE — the new words land instantly with a zoom entrance, no opacity dip; `stack` piles up), `update(key, patch)` same-key in-place updates (the same instant zoom), `custom` renders any ReactNode, renderer chrome `showIcon` / `closeable` (both default on) gate the mode icon / the corner ✕. No `action` slot — a 3s transient hint solicits no decision; custom interactive content rides `content` / `Toast.custom`. `data` passes an opaque value through and `onClose({ id, data })` fires once per payload end (dismissed, expired, cleared or replaced — `update` never fires it). Duration auto-dismiss (default 3s, 0 = sticky) with hover pause, per-item exit animation, `role="status"` (polite). The titled-card kind lives under Components/Notify — both share one scope table, so one container holds toast and notify side by side. Pill depth = the design language\'s `--colox-shadow-md` (the popup family tier).',
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
          <Section title="Toast — the lightweight hint kind (top-center, single)">
            <Row>
              <Button onClick={() => Toast.info('Saved.')}>Info</Button>
              <Button onClick={() => Toast.success('All good.')}>Success</Button>
              <Button onClick={() => Toast.warning('Heads up.')}>Warning</Button>
              <Button onClick={() => Toast.error('Something went wrong.')}>Error</Button>
            </Row>
            <Row>
              <Button
                onClick={() => Toast.info('Another one.', { strategy: 'stack' })}
                variant="subtle"
              >
                Add (stack, shows more than one)
              </Button>
            </Row>
          </Section>

          <Section title="Palette — the six family colors">
            <Row>
              <Button onClick={() => Toast.info('Gray toast', { palette: 'gray' })}>Gray</Button>
              <Button onClick={() => Toast.info('Primary toast', { palette: 'primary' })}>
                Primary
              </Button>
              <Button onClick={() => Toast.info('Info toast', { palette: 'info' })}>Info</Button>
              <Button onClick={() => Toast.success('Success toast', { palette: 'success' })}>
                Success
              </Button>
              <Button onClick={() => Toast.warning('Warning toast', { palette: 'warning' })}>
                Warning
              </Button>
              <Button onClick={() => Toast.error('Error toast', { palette: 'error' })}>
                Error
              </Button>
            </Row>
          </Section>

          <Section title="Variant — plain / subtle / solid / outline">
            <Row>
              <Button onClick={() => Toast.info('Plain (default)')} variant="outline">
                Plain
              </Button>
              <Button
                onClick={() =>
                  Toast.success('Subtle', {
                    palette: 'success',
                    variant: 'subtle',
                  })
                }
                variant="subtle"
              >
                Subtle
              </Button>
              <Button
                onClick={() => Toast.error('Solid', { palette: 'error', variant: 'solid' })}
                variant="solid"
              >
                Solid
              </Button>
              <Button
                onClick={() =>
                  Toast.warning('Outline', {
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

          <Section title="Chrome: showIcon / closeable + data / onClose">
            <Row>
              <Button
                onClick={() => Toast.info('Text-only pill.', { showIcon: false })}
                variant="subtle"
              >
                No icon
              </Button>
              <Button
                onClick={() =>
                  Toast.info('No corner ✕ — duration or dismiss closes.', { closeable: false })
                }
                variant="subtle"
              >
                Not closeable
              </Button>
              <Button
                onClick={() =>
                  Toast.info('No icon, no ✕.', {
                    showIcon: false,
                    closeable: false,
                  })
                }
                variant="subtle"
              >
                Bare
              </Button>
            </Row>
            <Row>
              <Button
                onClick={() =>
                  Toast.info('This toast reports its own close.', {
                    data: 'trace-42',
                    onClose: ({ data }) => Toast.info(`Closed: ${String(data)}`),
                  })
                }
                variant="subtle"
              >
                data + onClose (fires on any close)
              </Button>
            </Row>
          </Section>

          <Section title="Same-key update (zoom entrance) + dismiss">
            <Row>
              <Button
                onClick={() => {
                  Toast.info('step one', { key: 'progress' });
                  window.setTimeout(() => Toast.update('progress', { content: 'step two' }), 500);
                  window.setTimeout(
                    () => Toast.update('progress', { content: 'step three' }),
                    1000,
                  );
                }}
              >
                Update in place
              </Button>
              <Button onClick={() => Toast.info('Another toast.')}>Add</Button>
              <Button
                onClick={() => {
                  // single replacement: the newcomer lands instantly and
                  // its words zoom in — the same shape as an update, no dip
                  Toast.info('first arrival');
                  window.setTimeout(() => Toast.info('replaced — instant zoom'), 500);
                }}
                variant="subtle"
              >
                Replace in place (instant zoom, no dip)
              </Button>
              <Button onClick={() => Toast.dismiss()}>Dismiss all</Button>
            </Row>
          </Section>

          <Section title="A scoped container — Toast inside a panel">
            {/* the panel IS the container: `asChild` merges the anchor onto
                the div — no wrapper node, no position: relative needed
                anywhere (the viewport used to lean on a positioned
                parent; a parent without `relative` leaked to the page) */}
            <MessageViewport scope="panel" asChild>
              <div
                style={{
                  height: '240px',
                  border: '1px dashed var(--colox-color-border-muted)',
                  borderRadius: 'var(--colox-radius-md)',
                }}
              >
                <Stack
                  direction="row"
                  gap="4"
                  align="center"
                  style={{ padding: 'var(--colox-spacing-4)' }}
                >
                  <Button onClick={() => Toast.info('Inside the panel.', { scope: 'panel' })}>
                    Toast in panel
                  </Button>
                </Stack>
              </div>
            </MessageViewport>
          </Section>
        </Stack>
      </Container>
    </>
  ),
};
