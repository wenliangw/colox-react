import { act, fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Drawer } from '..';
import { DRAWER_EXIT } from '../constants/behavior';

const useExitFakeTimers = () =>
  vi.useFakeTimers({
    toFake: ['setTimeout', 'clearTimeout'],
  });

const settleExit = () => {
  act(() => {
    vi.advanceTimersByTime(DRAWER_EXIT);
  });
};

const renderDrawer = ({ visible = true, ...rest }: Partial<ComponentProps<typeof Drawer>> = {}) =>
  render(
    <Drawer visible={visible} {...rest}>
      <Drawer.Title>title</Drawer.Title>
      <Drawer.Content>
        <button type="button">one</button>
        <button type="button">two</button>
        <button type="button">three</button>
      </Drawer.Content>
      <Drawer.Footer>
        <button type="button">confirm</button>
      </Drawer.Footer>
    </Drawer>,
  );

describe('Drawer close channels', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls onVisibleChange(false) from the corner close button', () => {
    const onVisibleChange = vi.fn();
    renderDrawer({ onVisibleChange });
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onVisibleChange).toHaveBeenCalledWith(false);
  });

  it('calls onVisibleChange(false) from Escape', () => {
    const onVisibleChange = vi.fn();
    renderDrawer({ onVisibleChange });
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(onVisibleChange).toHaveBeenCalledWith(false);
  });

  it('calls onVisibleChange(false) from a backdrop click', () => {
    const onVisibleChange = vi.fn();
    renderDrawer({ onVisibleChange });
    fireEvent.click(document.querySelector('.colox-overlay__backdrop') as Element);
    expect(onVisibleChange).toHaveBeenCalledWith(false);
  });

  it('does not close on backdrop click with closeOnMaskClick={false}', () => {
    const onVisibleChange = vi.fn();
    renderDrawer({ onVisibleChange, closeOnMaskClick: false });
    fireEvent.click(document.querySelector('.colox-overlay__backdrop') as Element);
    expect(onVisibleChange).not.toHaveBeenCalled();
  });

  it('does not call onVisibleChange when the panel itself is clicked', () => {
    const onVisibleChange = vi.fn();
    renderDrawer({ onVisibleChange });
    fireEvent.click(screen.getByRole('dialog'));
    expect(onVisibleChange).not.toHaveBeenCalled();
  });

  it('unmounts through the exit window (DRAWER_EXIT) then disappears', () => {
    useExitFakeTimers();
    const { rerender } = renderDrawer();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    rerender(
      <Drawer visible={false}>
        <Drawer.Content>body</Drawer.Content>
      </Drawer>,
    );
    // still mounted inside the exit window, sliding out — the exiting
    // class rides the overlay root (the cdk Overlay owns the window)
    expect(document.querySelector('.colox-drawer')).toHaveClass('colox-overlay--exiting');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    settleExit();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('Drawer focus trap', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('opens with the focus on the first focusable element', () => {
    renderDrawer();
    expect(screen.getByRole('button', { name: 'one' })).toHaveFocus();
  });

  it('lands the focus on the panel itself (tabindex=-1) when there is nothing focusable', () => {
    render(
      <Drawer visible showClose={false}>
        <Drawer.Content>plain words</Drawer.Content>
      </Drawer>,
    );
    expect(screen.getByRole('dialog')).toHaveFocus();
  });

  it('lands the focus on the panel with initialFocus="container"', () => {
    renderDrawer({ initialFocus: 'container' });
    expect(screen.getByRole('dialog')).toHaveFocus();
  });

  it('traps the Tab cycle inside the drawer — forward wraps from the last, Shift+Tab wraps from the first', () => {
    renderDrawer();
    expect(screen.getByRole('button', { name: 'one' })).toHaveFocus();
    fireEvent.keyDown(document.body, { key: 'Tab' });
    expect(screen.getByRole('button', { name: 'two' })).toHaveFocus();
    fireEvent.keyDown(document.body, { key: 'Tab' });
    fireEvent.keyDown(document.body, { key: 'Tab' });
    expect(screen.getByRole('button', { name: 'confirm' })).toHaveFocus();
    // the corner close is the LAST stop (absolute-positioned chrome)
    fireEvent.keyDown(document.body, { key: 'Tab' });
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
    // forward wraps back to the first
    fireEvent.keyDown(document.body, { key: 'Tab' });
    expect(screen.getByRole('button', { name: 'one' })).toHaveFocus();
    // Shift+Tab from the first wraps to the last (Close)
    fireEvent.keyDown(document.body, { key: 'Tab', shiftKey: true });
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
  });

  it('never lets Tab escape to a background element', () => {
    render(
      <>
        <button type="button">background</button>
        <Drawer visible>
          <Drawer.Content>
            <button type="button">inside</button>
          </Drawer.Content>
        </Drawer>
      </>,
    );
    expect(screen.getByRole('button', { name: 'inside' })).toHaveFocus();
    // Tab walks the chrome then wraps — it never reaches the background
    fireEvent.keyDown(document.body, { key: 'Tab' });
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
    fireEvent.keyDown(document.body, { key: 'Tab' });
    expect(screen.getByRole('button', { name: 'inside' })).toHaveFocus();
    expect(screen.getByRole('button', { name: 'background' })).not.toHaveFocus();
  });

  it('restores focus to the previously focused element when closing', () => {
    useExitFakeTimers();
    const { rerender } = render(
      <Drawer visible={false}>
        <Drawer.Content>
          <button type="button">inside</button>
        </Drawer.Content>
      </Drawer>,
    );
    const opener = document.createElement('button');
    opener.textContent = 'opener';
    document.body.appendChild(opener);
    opener.focus();
    // open: the trap captures the opener as its restore target
    rerender(
      <Drawer visible>
        <Drawer.Content>
          <button type="button">inside</button>
        </Drawer.Content>
      </Drawer>,
    );
    expect(screen.getByRole('button', { name: 'inside' })).toHaveFocus();
    // close: the trap hands the focus back to the opener
    rerender(
      <Drawer visible={false}>
        <Drawer.Content>
          <button type="button">inside</button>
        </Drawer.Content>
      </Drawer>,
    );
    act(() => {
      vi.advanceTimersByTime(DRAWER_EXIT);
    });
    expect(opener).toHaveFocus();
    opener.remove();
  });

  it('sets and clears aria-modal on the dialog across open/close', () => {
    useExitFakeTimers();
    const { rerender } = renderDrawer();
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    rerender(
      <Drawer visible={false}>
        <Drawer.Content>body</Drawer.Content>
      </Drawer>,
    );
    // the aria-modal is removed as soon as the trap releases
    expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-modal');
    settleExit();
  });
});
