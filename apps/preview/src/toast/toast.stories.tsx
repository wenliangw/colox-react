import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button, Container, Stack, Toast, toast } from '@colox/react';

import { Section } from '../showcase/section';

const meta: Meta<typeof Toast> = {
  title: 'Components/Toast',
  component: Toast,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The transient notification stack — the M4 overlay family closer. A global imperative `toast()` (callable from any code position — a module store, no provider tree access needed) feeds a `<Toast.Provider>` host that must be mounted in the tree, and a `<Toast.Viewport>` declares the stack slot (six positions: top/bottom × left/center/right). One component, two payload tiers: `toast(content)` is the lightweight single-line tier; `toast({ title, content })` promotes to the titled notification tier. Opaque `bg-default` cards (the Popover surface — translucency is the hover-hint Tooltip recipe, a toast never hovers) with palette semantic icons (info/success/warning/error) and one `action: { label, onClick }` slot that auto-closes on click. Duration auto-dismiss (default 3s, 0 = sticky), hover pauses the countdown, manual close, same-key update (`toast.update`), per-item exit animation, `role="status"` (polite).',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Toast>;

const Row = ({ children }: { children: ReactNode }) => (
  <Stack direction="row" gap="4" align="center">
    {children}
  </Stack>
);

export const Overview: Story = {
  render: () => (
    <>
      {/* the host: must be mounted for toasts to render */}
      <Toast.Provider>
        <Toast.Viewport position="top-right" />
      </Toast.Provider>
      <Container size="md" gutter="4">
        <Stack direction="column" gap="8">
          <Section title="The two payload tiers">
            <Row>
              <Button onClick={() => toast('Saved')}>Lightweight</Button>
              <Button onClick={() => toast({ title: 'Saved', content: 'The file is on disk.' })}>
                Titled
              </Button>
            </Row>
          </Section>

          <Section title="Palette tones">
            <Row>
              <Button onClick={() => toast.info('For your information.')}>Info</Button>
              <Button onClick={() => toast.success('All good.')}>Success</Button>
              <Button onClick={() => toast.warning('Heads up — this is a warning.')}>
                Warning
              </Button>
              <Button onClick={() => toast.error('Something went wrong.')}>Error</Button>
            </Row>
          </Section>

          <Section title="Action (undo/retry)">
            <Row>
              <Button
                onClick={() =>
                  toast({
                    content: 'Item deleted.',
                    action: { label: 'Undo', onClick: () => {} },
                  })
                }
              >
                With action
              </Button>
            </Row>
          </Section>

          <Section title="Duration (default 3s, 0 = sticky)">
            <Row>
              <Button onClick={() => toast('Auto-dismisses in 3s.')}>Default</Button>
              <Button onClick={() => toast({ content: 'Stays until dismissed.', duration: 0 })}>
                Sticky
              </Button>
            </Row>
          </Section>

          <Section title="Same-key update">
            <Row>
              <Button
                onClick={() => {
                  toast({ key: 'progress', content: 'step one' });
                  window.setTimeout(() => toast.update('progress', { content: 'step two' }), 500);
                }}
              >
                Update in place
              </Button>
            </Row>
          </Section>
        </Stack>
      </Container>
    </>
  ),
};
