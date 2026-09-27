import { act, fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Modal } from '..';
import { MODAL_EXIT } from '../constants/behavior';

const useExitFakeTimers = () =>
  vi.useFakeTimers({
    toFake: ['setTimeout', 'clearTimeout'],
  });

const settleExit = () => {
  act(() => {
    vi.advanceTimersByTime(MODAL_EXIT);
  });
};

const renderModal = ({ visible = true, ...rest }: Partial<ComponentProps<typeof Modal>> = {}) =>
  render(
    <Modal visible={visible} {...rest}>
      <Modal.Title>title</Modal.Title>
      <Modal.Content>
        <button type="button">one</button>
        <button type="button">two</button>
        <button type="button">three</button>
      </Modal.Content>
      <Modal.Footer>
        <button type="button">confirm</button>
      </Modal.Footer>
    </Modal>,
  );

describe('Modal close channels', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls onVisibleChange(false) from the corner close button', () => {
    const onVisibleChange = vi.fn();
    renderModal({ onVisibleChange });
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onVisibleChange).toHaveBeenCalledWith(false);
  });

  it('calls onVisibleChange(false) from Escape', () => {
    const onVisibleChange = vi.fn();
    renderModal({ onVisibleChange });
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(onVisibleChange).toHaveBeenCalledWith(false);
  });

  it('calls onVisibleChange(false) from a backdrop click', () => {
    const onVisibleChange = vi.fn();
    renderModal({ onVisibleChange });
    fireEvent.click(document.querySelector('.colox-overlay__backdrop') as Element);
    expect(onVisibleChange).toHaveBeenCalledWith(false);
  });

  it('does not close on backdrop click with closeOnMaskClick={false}', () => {
    const onVisibleChange = vi.fn();
    renderModal({ onVisibleChange, closeOnMaskClick: false });
    fireEvent.click(document.querySelector('.colox-overlay__backdrop') as Element);
    expect(onVisibleChange).not.toHaveBeenCalled();
  });

  it('does not call onVisibleChange when the panel itself is clicked', () => {
    const onVisibleChange = vi.fn();
    renderModal({ onVisibleChange });
    fireEvent.click(screen.getByRole('dialog'));
    expect(onVisibleChange).not.toHaveBeenCalled();
  });

  it('unmounts through the exit window (MODAL_EXIT) then disappears', () => {
    useExitFakeTimers();
    const { rerender } = renderModal();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    rerender(
      <Modal visible={false}>
        <Modal.Content>body</Modal.Content>
      </Modal>,
    );
    // still mounted inside the exit window, fading out — the exiting
    // class rides the overlay root (the cdk Overlay owns the window)
    expect(document.querySelector('.colox-modal')).toHaveClass('colox-overlay--exiting');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    settleExit();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('Modal focus trap', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('opens with the focus on the first focusable element', () => {
    renderModal();
    expect(screen.getByRole('button', { name: 'one' })).toHaveFocus();
  });

  it('lands the focus on the panel itself (tabindex=-1) when there is nothing focusable', () => {
    render(
      <Modal visible showClose={false}>
        <Modal.Content>plain words</Modal.Content>
      </Modal>,
    );
    expect(screen.getByRole('dialog')).toHaveFocus();
  });

  it('lands the focus on the panel with initialFocus="container"', () => {
    renderModal({ initialFocus: 'container' });
    expect(screen.getByRole('dialog')).toHaveFocus();
  });

  it('traps the Tab cycle inside the modal — forward wraps from the last, Shift+Tab wraps from the first', () => {
    renderModal();
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
        <Modal visible>
          <Modal.Content>
            <button type="button">inside</button>
          </Modal.Content>
        </Modal>
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
      <Modal visible={false}>
        <Modal.Content>
          <button type="button">inside</button>
        </Modal.Content>
      </Modal>,
    );
    const opener = document.createElement('button');
    opener.textContent = 'opener';
    document.body.appendChild(opener);
    opener.focus();
    // open: the trap captures the opener as its restore target
    rerender(
      <Modal visible>
        <Modal.Content>
          <button type="button">inside</button>
        </Modal.Content>
      </Modal>,
    );
    expect(screen.getByRole('button', { name: 'inside' })).toHaveFocus();
    // close: the trap hands the focus back to the opener
    rerender(
      <Modal visible={false}>
        <Modal.Content>
          <button type="button">inside</button>
        </Modal.Content>
      </Modal>,
    );
    act(() => {
      vi.advanceTimersByTime(MODAL_EXIT);
    });
    expect(opener).toHaveFocus();
    opener.remove();
  });

  it('sets and clears aria-modal on the dialog across open/close', () => {
    useExitFakeTimers();
    const { rerender } = renderModal();
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    rerender(
      <Modal visible={false}>
        <Modal.Content>body</Modal.Content>
      </Modal>,
    );
    // the aria-modal is removed as soon as the trap releases
    expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-modal');
    settleExit();
  });
});
