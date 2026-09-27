import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Tooltip } from '..';
import { TOOLTIP_EXIT } from '../constants/behavior';

const renderTooltip = (props: ComponentProps<typeof Tooltip> = {}) => {
  render(
    <Tooltip content="hint" {...props}>
      <button type="button">host</button>
    </Tooltip>,
  );
  return screen.getByRole('button', { name: 'host' });
};

/** The delay pair and the exit window are the only timer needs. */
const useDelayFakeTimers = () =>
  vi.useFakeTimers({
    toFake: ['setTimeout', 'clearTimeout'],
  });

/**
 * Advances past the cdk exit window: a closed panel stays mounted with
 * the exiting class for TOOLTIP_EXIT so the fade-out can play — the
 * unmount lands after that window.
 */
const settleExit = () => {
  act(() => {
    vi.advanceTimersByTime(TOOLTIP_EXIT);
  });
};

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
    settleExit();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('plays the exit window on close: exiting class for TOOLTIP_EXIT, then unmount', () => {
    useDelayFakeTimers();
    const trigger = renderTooltip();
    fireEvent.focus(trigger);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    fireEvent.blur(trigger);
    expect(screen.getByRole('tooltip')).toHaveClass('colox-popup--exiting');
    act(() => {
      vi.advanceTimersByTime(TOOLTIP_EXIT - 1);
    });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('re-opening inside the exit window keeps the one panel and drops the exiting class', () => {
    useDelayFakeTimers();
    const trigger = renderTooltip({ visibleOn: 'click' });
    fireEvent.click(trigger);
    const panel = screen.getByRole('tooltip');
    fireEvent.click(trigger);
    expect(panel).toHaveClass('colox-popup--exiting');
    fireEvent.click(trigger);
    expect(panel).not.toHaveClass('colox-popup--exiting');
    act(() => {
      vi.advanceTimersByTime(TOOLTIP_EXIT + 50);
    });
    expect(screen.getByRole('tooltip')).toBe(panel);
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
    expect(screen.getByRole('tooltip')).toHaveClass('colox-popup--exiting');
    settleExit();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('opens on focus instantly and closes on blur (hover channel)', () => {
    useDelayFakeTimers();
    const trigger = renderTooltip();
    fireEvent.focus(trigger);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    fireEvent.blur(trigger);
    settleExit();
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
    useDelayFakeTimers();
    const trigger = renderTooltip();
    fireEvent.focus(trigger);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    // tab away: the focused element blurs (the panel closes, the exit window starts)
    fireEvent.blur(trigger);
    // tab back: the browser replants focus — not a user gesture
    fireEvent.focus(trigger);
    settleExit();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    // any real input re-arms the focus leg (the swallow is one-shot)
    fireEvent.pointerDown(document.body);
    fireEvent.focus(trigger);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('stays closed when only the window blurs and the browser restores the focus', () => {
    useDelayFakeTimers();
    const trigger = renderTooltip();
    fireEvent.focus(trigger);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    // iframe/embed hosts: the element keeps focus, only the window blurs
    act(() => {
      window.dispatchEvent(new Event('blur'));
    });
    fireEvent.focus(trigger);
    settleExit();
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
    useDelayFakeTimers();
    const trigger = renderTooltip({ visibleOn: 'click' });
    fireEvent.click(trigger);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    fireEvent.click(trigger);
    settleExit();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    fireEvent.click(trigger);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    fireEvent.pointerDown(document.body);
    settleExit();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('closes on Escape (hover channel)', () => {
    useDelayFakeTimers();
    const trigger = renderTooltip();
    fireEvent.focus(trigger);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    fireEvent.keyDown(document.body, { key: 'Escape' });
    settleExit();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('closes when the window loses focus', () => {
    useDelayFakeTimers();
    const trigger = renderTooltip();
    fireEvent.focus(trigger);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    act(() => {
      window.dispatchEvent(new Event('blur'));
    });
    settleExit();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('manual channel: visible drives, no surfaces, no auto close, Escape stays silent', () => {
    useDelayFakeTimers();
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
    settleExit();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('manual channel: the opt-in close channels echo onVisibleChange(false)', () => {
    useDelayFakeTimers();
    const onVisibleChange = vi.fn();
    const manual = (extra: Record<string, unknown> = {}) => (
      <Tooltip
        content="hint"
        visibleOn="manual"
        visible
        onVisibleChange={onVisibleChange}
        {...extra}
      >
        <button type="button">m</button>
      </Tooltip>
    );
    const { rerender } = render(manual());
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    // the outside click echoes — the controlled panel stays up, the
    // owner follows the echo
    fireEvent.pointerDown(document.body);
    expect(onVisibleChange).toHaveBeenLastCalledWith(false);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    // closeOnOutsideClick=false silences the outside channel
    onVisibleChange.mockClear();
    rerender(manual({ closeOnOutsideClick: false }));
    fireEvent.pointerDown(document.body);
    expect(onVisibleChange).not.toHaveBeenCalled();

    // closeOnScroll echoes too
    onVisibleChange.mockClear();
    rerender(manual({ closeOnScroll: true }));
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });
    expect(onVisibleChange).toHaveBeenLastCalledWith(false);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('closeOnOutsideClick=false keeps the hint open on an outside pointerdown', () => {
    useDelayFakeTimers();
    const trigger = renderTooltip({ visibleOn: 'click', closeOnOutsideClick: false });
    fireEvent.click(trigger);
    const panel = screen.getByRole('tooltip');
    expect(panel).toBeInTheDocument();
    fireEvent.pointerDown(document.body);
    expect(screen.getByRole('tooltip')).toBe(panel);
    // Escape keeps dismissing (not an outside click)
    fireEvent.keyDown(document.body, { key: 'Escape' });
    settleExit();
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
    useDelayFakeTimers();
    const trigger = renderTooltip({ closeOnScroll: true });
    fireEvent.focus(trigger);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });
    settleExit();
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
