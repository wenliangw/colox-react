import { act, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Popup } from '..';

const renderPopup = (props: ComponentProps<typeof Popup>) => {
  const ref = createRef<HTMLDivElement>();
  const result = render(<Popup {...props} ref={ref} />);
  return { ref, rerender: result.rerender };
};

describe('Popup exit channel', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('exitDuration 0 (default): the close unmounts in the same commit — no exit frame', () => {
    const { rerender } = renderPopup({
      referenceRef: { current: document.createElement('div') },
      open: true,
      children: 'body',
    });
    expect(screen.getByText('body')).toBeInTheDocument();
    rerender(
      <Popup referenceRef={{ current: document.createElement('div') }} open={false}>
        body
      </Popup>,
    );
    // instant: no exiting class, no remaining DOM
    expect(screen.queryByText('body')).not.toBeInTheDocument();
  });

  it('exitDuration > 0: the closed panel stays mounted with the exiting class, then unmounts', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const reference = { current: document.createElement('div') };
    const { rerender } = renderPopup({
      referenceRef: reference,
      open: true,
      exitDuration: 100,
      children: 'body',
    });
    const panel = screen.getByText('body');
    rerender(
      <Popup referenceRef={reference} open={false} exitDuration={100}>
        body
      </Popup>,
    );
    expect(panel).toBeInTheDocument();
    expect(panel).toHaveClass('colox-popup--exiting');
    act(() => {
      vi.advanceTimersByTime(99);
    });
    expect(panel).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.queryByText('body')).not.toBeInTheDocument();
  });

  it('re-opening inside the exit window cancels the unmount and drops the exiting class', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const reference = { current: document.createElement('div') };
    const { rerender } = renderPopup({
      referenceRef: reference,
      open: true,
      exitDuration: 100,
      children: 'body',
    });
    const panel = screen.getByText('body');
    rerender(
      <Popup referenceRef={reference} open={false} exitDuration={100}>
        body
      </Popup>,
    );
    expect(panel).toHaveClass('colox-popup--exiting');
    rerender(
      <Popup referenceRef={reference} open exitDuration={100}>
        body
      </Popup>,
    );
    expect(panel).not.toHaveClass('colox-popup--exiting');
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.getByText('body')).toBe(panel);
  });

  it('a panel that mounts already open still lands (the exit gate never blocks the first show)', () => {
    const reference = { current: document.createElement('div') };
    renderPopup({ referenceRef: reference, open: true, exitDuration: 100, children: 'body' });
    expect(screen.getByText('body')).toBeInTheDocument();
    expect(screen.getByText('body')).not.toHaveClass('colox-popup--exiting');
  });
});
