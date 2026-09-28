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

  it('a new arrival during a fold reveals with the zoom entrance', () => {
    render(<MessageViewport scope="fold" data-testid="vp" />);
    act(() => {
      Notify.info({ title: 'one', content: 'first' }, { scope: 'fold' });
      Notify.info({ title: 'two', content: 'second' }, { scope: 'fold' });
      Notify.info({ title: 'three', content: 'third' }, { scope: 'fold' });
    });
    const vp = screen.getByTestId('vp');
    // the card that BIRTHS the fold is a plain arrival: the capsule and
    // the card appear together, the frame plays its enter animation
    expect(vp.querySelector('.colox-notify__body--zoom')).toBeNull();
    expect(vp.textContent).toContain('three');
    // a NEW card arriving into the active fold is a reveal — the frame
    // stays, the words re-mount with the zoom entrance
    act(() => {
      Notify.info({ title: 'four', content: 'fourth' }, { scope: 'fold' });
    });
    expect(vp.textContent).toContain('four');
    expect(vp.textContent).not.toContain('three');
    expect(vp.querySelector('.colox-message-count__label')?.textContent).toBe('4');
    const body = vp.querySelector('.colox-notify__body');
    expect(body?.classList.contains('colox-notify__body--zoom')).toBe(true);
    expect(vp.querySelectorAll('.colox-notify')).toHaveLength(1);
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
    // closing the visible (newest) card pops IN PLACE: the popped card
    // leaves instantly (no exit window, still exactly one card) and
    // the promoted card lands with the zoom entrance on its words
    act(() => {
      fireEvent.click(vp.querySelector('.colox-notify__close')!);
    });
    expect(vp.querySelectorAll('.colox-notify')).toHaveLength(1);
    expect(vp.querySelector('.colox-notify.colox-message--exiting')).toBeNull();
    expect(vp.querySelector('.colox-notify__body--zoom')).not.toBeNull();
    expect(vp.querySelector('.colox-message-count__label')?.textContent).toBe('2');
    expect(vp.textContent).toContain('two');
    // closing again leaves the last card under a countdown capsule —
    // the capsule now reads its seconds, not the tally; a countdown is
    // a reading, so the clear-all ✕ steps back
    act(() => {
      fireEvent.click(vp.querySelector('.colox-notify__close')!);
    });
    expect(vp.querySelector('.colox-message-count--countdown')).not.toBeNull();
    expect(vp.querySelector('.colox-message-count__label')?.textContent).toMatch(/^\d+s$/);
    expect(vp.querySelector('.colox-message-count__clear')).toBeNull();
    expect(vp.textContent).toContain('one');
  });

  it('every pop re-mounts the words — the zoom replays on each reveal', () => {
    render(<MessageViewport scope="fold" data-testid="vp" />);
    act(() => {
      Notify.info({ title: 'one', content: 'first' }, { scope: 'fold' });
      Notify.info({ title: 'two', content: 'second' }, { scope: 'fold' });
      Notify.info({ title: 'three', content: 'third' }, { scope: 'fold' });
    });
    const vp = screen.getByTestId('vp');
    // the fold-engage card is a plain arrival — no zoom words yet
    expect(vp.querySelector('.colox-notify__body--zoom')).toBeNull();
    act(() => {
      fireEvent.click(vp.querySelector('.colox-notify__close')!);
    });
    const firstBody = vp.querySelector('.colox-notify__body');
    expect(firstBody?.classList.contains('colox-notify__body--zoom')).toBe(true);
    act(() => {
      fireEvent.click(vp.querySelector('.colox-notify__close')!);
    });
    const secondBody = vp.querySelector('.colox-notify__body');
    expect(secondBody?.classList.contains('colox-notify__body--zoom')).toBe(true);
    // a FRESH node: the previous body must not be recycled under an
    // equal bare-version key (two different entries can share v1)
    expect(secondBody).not.toBe(firstBody);
    expect(vp.textContent).toContain('one');
  });

  it('the last card walks the exit animation — earlier pops never do', () => {
    vi.useFakeTimers();
    render(<MessageViewport scope="fold" data-testid="vp" />);
    act(() => {
      Notify.info({ title: 'one', content: 'first' }, { scope: 'fold' });
      Notify.info({ title: 'two', content: 'second' }, { scope: 'fold' });
      Notify.info({ title: 'three', content: 'third' }, { scope: 'fold' });
    });
    const vp = screen.getByTestId('vp');
    // each pop re-queries: the visible card changes between re-renders
    act(() => {
      fireEvent.click(vp.querySelector('.colox-notify__close')!);
    });
    act(() => {
      fireEvent.click(vp.querySelector('.colox-notify__close')!);
    });
    // down to the last card — closing it now plays the exit window
    act(() => {
      fireEvent.click(vp.querySelector('.colox-notify__close')!);
    });
    expect(vp.querySelector('.colox-notify.colox-message--exiting')).not.toBeNull();
    expect(vp.querySelectorAll('.colox-notify')).toHaveLength(1);
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(vp.querySelectorAll('.colox-notify')).toHaveLength(0);
    vi.useRealTimers();
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
    // the capsule leaves instantly; the invisible backlog never flashes
    // (it cleared instantly) — only the visible card walks its exit
    expect(vp.querySelector('.colox-message-count')).toBeNull();
    expect(vp.querySelectorAll('.colox-notify')).toHaveLength(1);
    expect(vp.querySelector('.colox-notify.colox-message--exiting')).not.toBeNull();
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
