import { act, fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Popover } from '..';
import { POPOVER_EXIT } from '../constants/behavior';

const renderPopover = (props: ComponentProps<typeof Popover> = {}) => {
  render(
    <Popover content={<button type="button">inside action</button>} {...props}>
      <button type="button">host</button>
    </Popover>,
  );
  return screen.getByRole('button', { name: 'host' });
};

/** The delay pair and the exit window are the only timer needs. */
const useDelayFakeTimers = () =>
  vi.useFakeTimers({
    toFake: ['setTimeout', 'clearTimeout'],
  });

/** Advances past the cdk exit window so a closed panel can unmount. */
const settleExit = () => {
  act(() => {
    vi.advanceTimersByTime(POPOVER_EXIT);
  });
};

describe('Popover interaction channels', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('click (default): toggles instantly, closes on outside pointerdown', () => {
    useDelayFakeTimers();
    const trigger = renderPopover();
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(trigger);
    settleExit();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.pointerDown(document.body);
    settleExit();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closeOnOutsideClick=false ignores the outside pointerdown, Escape still closes', () => {
    useDelayFakeTimers();
    const trigger = renderPopover({ closeOnOutsideClick: false });
    fireEvent.click(trigger);
    const panel = screen.getByRole('dialog');
    expect(panel).toBeInTheDocument();

    fireEvent.pointerDown(document.body);
    expect(screen.getByRole('dialog')).toBe(panel);

    // the trigger toggle stays live under the opt-out
    fireEvent.click(trigger);
    settleExit();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Escape remains the keyboard way out
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(document.body, { key: 'Escape' });
    settleExit();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('hover: closeOnOutsideClick=false keeps the panel open on outside pointerdown', () => {
    useDelayFakeTimers();
    const trigger = renderPopover({ visibleOn: 'hover', closeOnOutsideClick: false });
    fireEvent.pointerEnter(trigger);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    const panel = screen.getByRole('dialog');
    expect(panel).toBeInTheDocument();
    fireEvent.pointerDown(document.body);
    expect(screen.getByRole('dialog')).toBe(panel);
  });

  it('plays the exit window: exiting class for POPOVER_EXIT, then unmount', () => {
    useDelayFakeTimers();
    const trigger = renderPopover();
    fireEvent.click(trigger);
    fireEvent.click(trigger);
    const panel = screen.getByRole('dialog');
    expect(panel).toHaveClass('colox-popup--exiting');
    act(() => {
      vi.advanceTimersByTime(POPOVER_EXIT - 1);
    });
    expect(screen.getByRole('dialog')).toBe(panel);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('re-opening inside the exit window keeps the one panel and drops the exiting class', () => {
    useDelayFakeTimers();
    const trigger = renderPopover();
    fireEvent.click(trigger);
    const panel = screen.getByRole('dialog');
    fireEvent.click(trigger);
    expect(panel).toHaveClass('colox-popup--exiting');
    fireEvent.click(trigger);
    expect(panel).not.toHaveClass('colox-popup--exiting');
    act(() => {
      vi.advanceTimersByTime(POPOVER_EXIT + 50);
    });
    expect(screen.getByRole('dialog')).toBe(panel);
  });

  it('hover: opens after delay.in (300 default) and closes after delay.out (100, the bridge)', () => {
    useDelayFakeTimers();
    const trigger = renderPopover({ visibleOn: 'hover' });
    fireEvent.pointerEnter(trigger);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.pointerLeave(trigger);
    // the out-delay keeps it alive while the pointer crosses the gap
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(screen.getByRole('dialog')).toHaveClass('colox-popup--exiting');
    settleExit();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('hover: entering the panel cancels the pending close (the out-delay IS the bridge)', () => {
    useDelayFakeTimers();
    const trigger = renderPopover({ visibleOn: 'hover' });
    fireEvent.pointerEnter(trigger);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    const panel = screen.getByRole('dialog');
    fireEvent.pointerLeave(trigger);
    act(() => {
      vi.advanceTimersByTime(50);
    });
    fireEvent.pointerEnter(panel);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByRole('dialog')).toBe(panel);
    // leaving the panel starts a fresh close
    fireEvent.pointerLeave(panel);
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(panel).toHaveClass('colox-popup--exiting');
  });

  it('hover: a pending open dies on quick leave (the timer pair never fights)', () => {
    useDelayFakeTimers();
    const trigger = renderPopover({ visibleOn: 'hover' });
    fireEvent.pointerEnter(trigger);
    act(() => {
      vi.advanceTimersByTime(120);
    });
    fireEvent.pointerLeave(trigger);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('merges a partial delay object into the defaults ({ out: 200 } keeps in 300)', () => {
    useDelayFakeTimers();
    const trigger = renderPopover({ visibleOn: 'hover', delay: { out: 200 } });
    fireEvent.pointerEnter(trigger);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.pointerLeave(trigger);
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.getByRole('dialog')).toHaveClass('colox-popup--exiting');
    settleExit();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens on focus instantly and closes on blur (hover channel)', () => {
    useDelayFakeTimers();
    const trigger = renderPopover({ visibleOn: 'hover' });
    fireEvent.focus(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.blur(trigger);
    settleExit();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('keeps the panel open when the trigger blur is the panel taking the focus', () => {
    useDelayFakeTimers();
    const trigger = renderPopover({ visibleOn: 'hover' });
    fireEvent.focus(trigger);
    const panel = screen.getByRole('dialog');
    const action = screen.getByRole('button', { name: 'inside action' });
    // the real browser pair: jsdom's focus move blurs the trigger with
    // relatedTarget pointing INTO the panel — internal navigation
    fireEvent.focus(action);
    expect(screen.getByRole('dialog')).toBe(panel);
    // the pointer leaves the trigger while the keyboard focus lives
    // inside the panel — the region keeps the panel open under it
    fireEvent.pointerLeave(trigger);
    expect(screen.getByRole('dialog')).toBe(panel);
    // an outside pointerdown (the user really clicked away) closes
    fireEvent.pointerDown(document.body);
    settleExit();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('element blur does not arm the restore swallow (unlike the tooltip): focus reopens', () => {
    useDelayFakeTimers();
    const trigger = renderPopover({ visibleOn: 'hover' });
    fireEvent.focus(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.blur(trigger);
    settleExit();
    fireEvent.focus(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('swallows the focus the browser replants after a window loss (stays closed on return)', () => {
    useDelayFakeTimers();
    const trigger = renderPopover({ visibleOn: 'hover' });
    fireEvent.focus(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    act(() => {
      window.dispatchEvent(new Event('blur'));
    });
    fireEvent.focus(trigger);
    settleExit();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    // any real input re-arms the focus leg (the swallow is one-shot)
    fireEvent.pointerDown(document.body);
    fireEvent.focus(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('cancels a pending delayed open when the window loses focus', () => {
    useDelayFakeTimers();
    const trigger = renderPopover({ visibleOn: 'hover' });
    fireEvent.pointerEnter(trigger);
    act(() => {
      window.dispatchEvent(new Event('blur'));
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes on Escape (the panel returns the focus before closing)', () => {
    useDelayFakeTimers();
    const trigger = renderPopover();
    fireEvent.click(trigger);
    const action = screen.getByRole('button', { name: 'inside action' });
    expect(action).toHaveFocus();
    fireEvent.keyDown(action, { key: 'Escape' });
    expect(trigger).toHaveFocus();
    settleExit();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('manual channel: visible drives, no surfaces, no auto close, Escape stays silent', () => {
    useDelayFakeTimers();
    const onVisibleChange = vi.fn();
    render(
      <Popover visibleOn="manual" visible onVisibleChange={onVisibleChange}>
        <Popover.Trigger>
          <button type="button">m</button>
        </Popover.Trigger>
        <Popover.Content>controlled body</Popover.Content>
      </Popover>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    const trigger = screen.getByRole('button', { name: 'm' });
    fireEvent.pointerEnter(trigger);
    fireEvent.focus(trigger);
    fireEvent.click(trigger);
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(onVisibleChange).not.toHaveBeenCalled();
  });

  it('manual channel: the opt-in close channels echo onVisibleChange(false)', () => {
    useDelayFakeTimers();
    const onVisibleChange = vi.fn();
    const manual = (extra: Record<string, unknown> = {}) => (
      <Popover visibleOn="manual" visible onVisibleChange={onVisibleChange} {...extra}>
        <Popover.Trigger>
          <button type="button">m</button>
        </Popover.Trigger>
        <Popover.Content>controlled body</Popover.Content>
      </Popover>
    );
    const { rerender } = render(manual());
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // the outside click echoes — the controlled panel stays up, the
    // owner follows the echo
    fireEvent.pointerDown(document.body);
    expect(onVisibleChange).toHaveBeenLastCalledWith(false);
    settleExit();
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // closeOnOutsideClick=false silences the outside channel
    onVisibleChange.mockClear();
    rerender(manual({ closeOnOutsideClick: false }));
    fireEvent.pointerDown(document.body);
    expect(onVisibleChange).not.toHaveBeenCalled();
    settleExit();
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // closeOnScroll echoes too
    onVisibleChange.mockClear();
    rerender(manual({ closeOnScroll: true }));
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });
    expect(onVisibleChange).toHaveBeenLastCalledWith(false);
    settleExit();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('manual channel: a rendered visible=false never mounts and the controlled open mounts already-on', () => {
    const { rerender } = render(
      <Popover visibleOn="manual" visible={false}>
        <Popover.Trigger>
          <button type="button">m</button>
        </Popover.Trigger>
        <Popover.Content>body</Popover.Content>
      </Popover>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    rerender(
      <Popover visibleOn="manual" visible>
        <Popover.Trigger>
          <button type="button">m</button>
        </Popover.Trigger>
        <Popover.Content>body</Popover.Content>
      </Popover>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('echoes onVisibleChange across the hover transitions', () => {
    useDelayFakeTimers();
    const onVisibleChange = vi.fn();
    const trigger = renderPopover({ visibleOn: 'hover', onVisibleChange });
    fireEvent.pointerEnter(trigger);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(onVisibleChange).toHaveBeenLastCalledWith(true);
    fireEvent.pointerLeave(trigger);
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(onVisibleChange).toHaveBeenLastCalledWith(false);
  });

  it('closes on any scroll with closeOnScroll, follows with the default', () => {
    useDelayFakeTimers();
    const trigger = renderPopover({ closeOnScroll: true });
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });
    settleExit();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });
    // the default keeps the panel up (autoUpdate follows the trigger)
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('runs the injected surface before the author trigger handler', () => {
    const order: string[] = [];
    render(
      <Popover content="body" onVisibleChange={() => order.push('popover')}>
        <button type="button" onClick={() => order.push('author')}>
          c
        </button>
      </Popover>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'c' }));
    expect(order).toEqual(['popover', 'author']);
  });

  it('honors a root-level author handler when the trigger declares none', () => {
    const onRootClick = vi.fn();
    render(
      <Popover content="body" onClick={onRootClick}>
        <button type="button">plain</button>
      </Popover>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'plain' }));
    expect(onRootClick).toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
