import { act, fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Popover } from '..';
import { POPOVER_EXIT } from '../constants/behavior';

const useDelayFakeTimers = () =>
  vi.useFakeTimers({
    toFake: ['setTimeout', 'clearTimeout'],
  });

const settleExit = () => {
  act(() => {
    vi.advanceTimersByTime(POPOVER_EXIT);
  });
};

const renderPopover = (props: ComponentProps<typeof Popover> = {}) =>
  render(
    <Popover
      content={
        <>
          <button type="button">one</button>
          <button type="button">two</button>
          <button type="button">three</button>
        </>
      }
      {...props}
    >
      <button type="button">host</button>
    </Popover>,
  );

describe('Popover focus machine', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('click-open focuses the first focusable inside the panel', () => {
    renderPopover();
    fireEvent.click(screen.getByRole('button', { name: 'host' }));
    expect(screen.getByRole('button', { name: 'one' })).toHaveFocus();
  });

  it('lands the focus on the panel itself (tabindex=-1) when the content has nothing focusable', () => {
    render(
      <Popover content="plain words">
        <button type="button">host</button>
      </Popover>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'host' }));
    expect(screen.getByRole('dialog')).toHaveFocus();
  });

  it('traps the Tab cycle: forward wraps from the last, Shift+Tab wraps from the first', () => {
    renderPopover();
    fireEvent.click(screen.getByRole('button', { name: 'host' }));
    expect(screen.getByRole('button', { name: 'one' })).toHaveFocus();
    fireEvent.keyDown(document.body, { key: 'Tab' });
    expect(screen.getByRole('button', { name: 'two' })).toHaveFocus();
    fireEvent.keyDown(document.body, { key: 'Tab' });
    expect(screen.getByRole('button', { name: 'three' })).toHaveFocus();
    fireEvent.keyDown(document.body, { key: 'Tab' });
    expect(screen.getByRole('button', { name: 'one' })).toHaveFocus();
    fireEvent.keyDown(document.body, { key: 'Tab', shiftKey: true });
    expect(screen.getByRole('button', { name: 'three' })).toHaveFocus();
  });

  it('pulls an empty-harvest panel back onto itself so the keystroke is contained', () => {
    render(
      <Popover content="plain words">
        <button type="button">host</button>
      </Popover>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'host' }));
    const panel = screen.getByRole('dialog');
    expect(panel).toHaveFocus();
    fireEvent.keyDown(document.body, { key: 'Tab' });
    expect(panel).toHaveFocus();
  });

  it('slides the keyboard from the trigger into the panel (hover: a forward Tab, not Shift+Tab)', () => {
    renderPopover({ visibleOn: 'hover' });
    const host = screen.getByRole('button', { name: 'host' });
    act(() => {
      host.focus();
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    // hover-open never steals: the focus rests on the trigger
    expect(host).toHaveFocus();
    fireEvent.keyDown(document.body, { key: 'Tab' });
    expect(screen.getByRole('button', { name: 'one' })).toHaveFocus();
  });

  it('hover-open never steals the keyboard focus (pointer interaction stays off the keyboard)', () => {
    useDelayFakeTimers();
    renderPopover({ visibleOn: 'hover' });
    const host = screen.getByRole('button', { name: 'host' });
    fireEvent.pointerEnter(host);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(host).not.toHaveFocus();
    expect(document.body).toHaveFocus();
  });

  it('manual-open keeps the focus where it was (no steal)', () => {
    render(
      <Popover visibleOn="manual" visible>
        <Popover.Trigger>
          <button type="button">host</button>
        </Popover.Trigger>
        <Popover.Content>
          <button type="button">one</button>
        </Popover.Content>
      </Popover>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'one' })).not.toHaveFocus();
  });

  it('Escape returns the focus to the trigger before the panel closes', () => {
    useDelayFakeTimers();
    renderPopover();
    const host = screen.getByRole('button', { name: 'host' });
    fireEvent.click(host);
    expect(screen.getByRole('button', { name: 'one' })).toHaveFocus();
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(host).toHaveFocus();
    settleExit();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('a scroll close that orphans the panel-held focus hands it back to the trigger', () => {
    useDelayFakeTimers();
    renderPopover({ closeOnScroll: true });
    const host = screen.getByRole('button', { name: 'host' });
    fireEvent.click(host);
    expect(screen.getByRole('button', { name: 'one' })).toHaveFocus();
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });
    expect(host).toHaveFocus();
    settleExit();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('re-opening inside the exit window focuses again (the appointment re-runs on the live node)', () => {
    useDelayFakeTimers();
    renderPopover();
    const host = screen.getByRole('button', { name: 'host' });
    fireEvent.click(host);
    expect(screen.getByRole('button', { name: 'one' })).toHaveFocus();
    fireEvent.click(host);
    expect(screen.getByRole('dialog')).toHaveClass('colox-popup--exiting');
    fireEvent.click(host);
    expect(screen.getByRole('button', { name: 'one' })).toHaveFocus();
    expect(screen.getByRole('dialog')).not.toHaveClass('colox-popup--exiting');
  });

  // The outside-click close deliberately does NOT move the focus in
  // this suite's assertions: real browsers move the focus onto the
  // clicked target on pointerdown (so the close-recover below never
  // sees the panel still focused and no steal happens), while jsdom
  // never moves focus for pointerdown — the no-steal guarantee is
  // probe-verified in a real browser instead.
  it('closes on an outside pointerdown without crashing the focus bookkeeping', () => {
    useDelayFakeTimers();
    renderPopover();
    const host = screen.getByRole('button', { name: 'host' });
    fireEvent.click(host);
    fireEvent.pointerDown(document.body);
    settleExit();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.body.contains(host)).toBe(true);
  });
});
