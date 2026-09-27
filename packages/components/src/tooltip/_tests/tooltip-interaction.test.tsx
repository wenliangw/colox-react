import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Tooltip } from '..';

const renderTooltip = (props: ComponentProps<typeof Tooltip> = {}) => {
  render(
    <Tooltip content="hint" {...props}>
      <button type="button">host</button>
    </Tooltip>,
  );
  return screen.getByRole('button', { name: 'host' });
};

/** The delay pair is the only timer need — advanceTimersByTime drives it. */
const useDelayFakeTimers = () =>
  vi.useFakeTimers({
    toFake: ['setTimeout', 'clearTimeout'],
  });

describe('Tooltip interaction channels', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('opens the hover channel after delay.in and closes on pointer leave', () => {
    useDelayFakeTimers();
    const trigger = renderTooltip();
    fireEvent.pointerEnter(trigger);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    fireEvent.pointerLeave(trigger);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('cancels a pending open on quick leave (the timer pair never fights)', () => {
    useDelayFakeTimers();
    const trigger = renderTooltip();
    fireEvent.pointerEnter(trigger);
    act(() => {
      vi.advanceTimersByTime(120);
    });
    fireEvent.pointerLeave(trigger);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('merges a partial delay object into the defaults ({ out: 200 } keeps in 300)', () => {
    useDelayFakeTimers();
    const trigger = renderTooltip({ delay: { out: 200 } });
    fireEvent.pointerEnter(trigger);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    fireEvent.pointerLeave(trigger);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('opens on focus instantly and closes on blur (hover channel)', () => {
    const trigger = renderTooltip();
    fireEvent.focus(trigger);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    fireEvent.blur(trigger);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('refocusing clears a pending delayed close', () => {
    useDelayFakeTimers();
    const trigger = renderTooltip({ delay: { in: 0, out: 200 } });
    fireEvent.pointerEnter(trigger);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    fireEvent.pointerLeave(trigger);
    fireEvent.focus(trigger);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('swallows the focus the browser replants after a tab switch (stays closed on return)', () => {
    const trigger = renderTooltip();
    fireEvent.focus(trigger);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    // tab away: the focused element blurs (the panel closes)
    fireEvent.blur(trigger);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    // tab back: the browser replants focus — not a user gesture
    fireEvent.focus(trigger);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    // any real input re-arms the focus leg (the swallow is one-shot)
    fireEvent.pointerDown(document.body);
    fireEvent.focus(trigger);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('stays closed when only the window blurs and the browser restores the focus', () => {
    const trigger = renderTooltip();
    fireEvent.focus(trigger);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    // iframe/embed hosts: the element keeps focus, only the window blurs
    act(() => {
      window.dispatchEvent(new Event('blur'));
    });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    fireEvent.focus(trigger);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    fireEvent.keyDown(document.body);
    fireEvent.focus(trigger);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('cancels a pending delayed open when the window loses focus', () => {
    useDelayFakeTimers();
    const trigger = renderTooltip();
    fireEvent.pointerEnter(trigger);
    act(() => {
      window.dispatchEvent(new Event('blur'));
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('toggles instantly on click and closes on outside pointerdown', () => {
    const trigger = renderTooltip({ visibleOn: 'click' });
    fireEvent.click(trigger);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    fireEvent.click(trigger);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    fireEvent.click(trigger);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('closes on Escape (hover channel)', () => {
    const trigger = renderTooltip();
    fireEvent.focus(trigger);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('closes when the window loses focus', () => {
    const trigger = renderTooltip();
    fireEvent.focus(trigger);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    act(() => {
      window.dispatchEvent(new Event('blur'));
    });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('manual channel: visible drives, no surfaces, no auto close, no echo', () => {
    const onVisibleChange = vi.fn();
    const { rerender } = render(
      <Tooltip content="hint" visibleOn="manual" visible onVisibleChange={onVisibleChange}>
        <button type="button">m</button>
      </Tooltip>,
    );

    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    const trigger = screen.getByRole('button', { name: 'm' });
    fireEvent.pointerEnter(trigger);
    fireEvent.focus(trigger);
    fireEvent.click(trigger);
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(onVisibleChange).not.toHaveBeenCalled();
    rerender(
      <Tooltip content="hint" visibleOn="manual" visible={false} onVisibleChange={onVisibleChange}>
        <button type="button">m</button>
      </Tooltip>,
    );
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('positions a panel that mounts already open (manual: visible from the first render)', async () => {
    render(
      <Tooltip content="hint" visibleOn="manual" visible>
        <button type="button">host</button>
      </Tooltip>,
    );
    const panel = screen.getByRole('tooltip');
    // the positioning stream must land even though `open` never flips:
    // the popup arrives via the mounted gate and the pointing must
    // run once the portal element exists.
    await waitFor(() => {
      expect(panel).toHaveAttribute('data-placement', 'top');
      expect(panel.style.position).toBe('fixed');
      expect(panel.style.left).not.toBe('');
      expect(panel.style.top).not.toBe('');
    });
  });

  it('echoes onVisibleChange across the hover transitions', () => {
    useDelayFakeTimers();
    const onVisibleChange = vi.fn();
    const trigger = renderTooltip({ onVisibleChange });
    fireEvent.pointerEnter(trigger);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(onVisibleChange).toHaveBeenLastCalledWith(true);
    fireEvent.pointerLeave(trigger);
    expect(onVisibleChange).toHaveBeenLastCalledWith(false);
  });

  it('closeOnScroll closes on any scroll (window capture), the default follows instead', () => {
    const trigger = renderTooltip({ closeOnScroll: true });
    fireEvent.focus(trigger);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('keeps the panel open on scroll by default (autoUpdate follow)', () => {
    const trigger = renderTooltip({ visibleOn: 'click' });
    fireEvent.click(trigger);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('runs the injected surface before the author trigger handler', () => {
    const order: string[] = [];
    render(
      <Tooltip visibleOn="click" onVisibleChange={() => order.push('tooltip')}>
        <button type="button" onClick={() => order.push('author')}>
          c
        </button>
      </Tooltip>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'c' }));
    expect(order).toEqual(['tooltip', 'author']);
  });

  it('honors a root-level author handler when the trigger declares none', () => {
    const onRootClick = vi.fn();
    render(
      <Tooltip content="hint" visibleOn="click" onClick={onRootClick}>
        <button type="button">plain</button>
      </Tooltip>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'plain' }));
    expect(onRootClick).toHaveBeenCalled();
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });
});
