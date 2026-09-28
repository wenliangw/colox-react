import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MessageViewport, messageFactory } from '../index';
import { Toast } from '../../../toast';
import { Notify } from '../../../notify';

describe('MessageViewport', () => {
  afterEach(() => {
    messageFactory.clearAll();
  });

  it('renders toast and notify entries in the same scope container', () => {
    render(<MessageViewport scope="chat" data-testid="vp" />);
    act(() => {
      Toast.info('toast msg', { scope: 'chat' });
      Notify.info({ title: 't', content: 'notify msg' }, { scope: 'chat' });
    });

    expect(screen.getByText('toast msg')).toBeInTheDocument();
    expect(screen.getByText('t')).toBeInTheDocument();
    expect(screen.getByText('notify msg')).toBeInTheDocument();
  });

  it('groups entries into their position slots', () => {
    render(<MessageViewport scope="chat" data-testid="vp" />);
    act(() => {
      Toast.info('top one', { scope: 'chat' });
      Toast.info('bottom one', { scope: 'chat', position: 'bottom-right' });
    });

    const slot = (cls: string) => screen.getByTestId('vp').querySelector(`.${cls}`);
    expect(slot('colox-message-viewport__slot--top-center')).toContainElement(
      screen.getByText('top one'),
    );
    expect(slot('colox-message-viewport__slot--bottom-right')).toContainElement(
      screen.getByText('bottom one'),
    );
  });

  it('renders nothing for an empty scope', () => {
    const { container } = render(<MessageViewport scope="empty" data-testid="vp" />);
    expect(container.querySelector('.colox-message')).toBeNull();
  });

  it('unregisters the scope on unmount', () => {
    const { unmount } = render(<MessageViewport scope="gone" data-testid="vp" />);
    act(() => {
      Toast.info('hi', { scope: 'gone' });
    });
    expect(messageFactory.get('gone')).toBeDefined();
    unmount();
    expect(messageFactory.get('gone')).toBeUndefined();
  });

  it('folds more than two notify cards into the newest card + a count capsule', () => {
    render(<MessageViewport scope="fold" data-testid="vp" />);
    act(() => {
      Notify.info({ title: 'one', content: 'first' }, { scope: 'fold' });
      Notify.info({ title: 'two', content: 'second' }, { scope: 'fold' });
      Notify.info({ title: 'three', content: 'third' }, { scope: 'fold' });
    });
    const vp = screen.getByTestId('vp');
    // folded: one count capsule reading the tally, its ✕ for clear-all
    expect(vp.querySelector('.colox-message-count__label')?.textContent).toBe('3');
    expect(vp.querySelector('.colox-message-count__clear')).not.toBeNull();
    // only the newest card renders — the backlog folded away
    expect(vp.querySelectorAll('.colox-notify')).toHaveLength(1);
    expect(vp.textContent).toContain('three');
    expect(vp.textContent).not.toContain('two');
    // the deck markup is gone — the fold replaced it
    expect(vp.querySelector('.colox-message-deck')).toBeNull();
  });

  it('does not fold two or fewer notify cards', () => {
    render(<MessageViewport scope="fold" data-testid="vp" />);
    act(() => {
      Notify.info({ title: 'one', content: 'first' }, { scope: 'fold' });
      Notify.info({ title: 'two', content: 'second' }, { scope: 'fold' });
    });
    const vp = screen.getByTestId('vp');
    expect(vp.querySelector('.colox-message-count')).toBeNull();
    // both cards render as a plain stack
    expect(vp.querySelectorAll('.colox-notify')).toHaveLength(2);
  });

  it('closing the visible card pops the stack LIFO into a countdown capsule', () => {
    render(<MessageViewport scope="fold" data-testid="vp" />);
    act(() => {
      Notify.info({ title: 'one', content: 'first' }, { scope: 'fold' });
      Notify.info({ title: 'two', content: 'second' }, { scope: 'fold' });
      Notify.info({ title: 'three', content: 'third' }, { scope: 'fold' });
    });
    const vp = screen.getByTestId('vp');
    // closing the visible (newest) card promotes the next-newest
    act(() => {
      fireEvent.click(vp.querySelector('.colox-notify__close')!);
    });
    expect(vp.querySelector('.colox-message-count__label')?.textContent).toBe('2');
    expect(vp.textContent).toContain('two');
    // closing again leaves the last card under a countdown capsule —
    // the capsule now reads its seconds, not the tally
    act(() => {
      fireEvent.click(vp.querySelector('.colox-notify__close')!);
    });
    expect(vp.querySelector('.colox-message-count--countdown')).not.toBeNull();
    expect(vp.querySelector('.colox-message-count__label')?.textContent).toMatch(/^\d+s$/);
    expect(vp.textContent).toContain('one');
  });

  it('the capsule ✕ dismisses the whole slot at once', () => {
    vi.useFakeTimers();
    render(<MessageViewport scope="fold" data-testid="vp" />);
    act(() => {
      Notify.info({ title: 'one', content: 'first' }, { scope: 'fold' });
      Notify.info({ title: 'two', content: 'second' }, { scope: 'fold' });
      Notify.info({ title: 'three', content: 'third' }, { scope: 'fold' });
    });
    const vp = screen.getByTestId('vp');
    act(() => {
      fireEvent.click(vp.querySelector('.colox-message-count__clear')!);
    });
    // the capsule leaves instantly — the cards finish their exit window
    expect(vp.querySelector('.colox-message-count')).toBeNull();
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(vp.querySelectorAll('.colox-notify')).toHaveLength(0);
    vi.useRealTimers();
  });

  it('freezes the folded countdowns and resumes the last survivor', () => {
    vi.useFakeTimers();
    render(<MessageViewport scope="fold" data-testid="vp" />);
    act(() => {
      Notify.info({ title: 'one', content: 'first' }, { scope: 'fold' });
      Notify.info({ title: 'two', content: 'second' }, { scope: 'fold' });
      Notify.info({ title: 'three', content: 'third' }, { scope: 'fold' });
    });
    const vp = screen.getByTestId('vp');
    // way past their durations, the folded cards stay — frozen
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(vp.querySelector('.colox-message-count__label')?.textContent).toBe('3');
    expect(vp.querySelectorAll('.colox-notify')).toHaveLength(1);

    // pop to the last survivor — its countdown resumes, the capsule
    // becomes a countdown capsule (each click re-queries: the visible
    // card changes between re-renders)
    act(() => {
      fireEvent.click(vp.querySelector('.colox-notify__close')!);
    });
    act(() => {
      fireEvent.click(vp.querySelector('.colox-notify__close')!);
    });
    expect(vp.querySelector('.colox-message-count--countdown')).not.toBeNull();
    expect(vp.querySelector('.colox-message-count__label')?.textContent).toMatch(/^\d+s$/);

    // the survivor auto-dismisses at the end of its countdown
    act(() => {
      vi.advanceTimersByTime(3_500);
    });
    expect(vp.querySelectorAll('.colox-notify')).toHaveLength(0);
    expect(vp.querySelector('.colox-message-count')).toBeNull();
    vi.useRealTimers();
  });
});
