import { afterEach, describe, expect, it } from 'vitest';
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

  it('collapses more than three notify cards into a deck with a +N chip', () => {
    render(<MessageViewport scope="deck" data-testid="vp" />);
    act(() => {
      Notify.info({ title: 'one', content: 'first' }, { scope: 'deck' });
      Notify.info({ title: 'two', content: 'second' }, { scope: 'deck' });
      Notify.info({ title: 'three', content: 'third' }, { scope: 'deck' });
      Notify.info({ title: 'four', content: 'fourth' }, { scope: 'deck' });
    });
    const vp = screen.getByTestId('vp');
    // deck collapsed: the +N chip folds the cards beyond the peek
    expect(vp.querySelector('.colox-message-deck')).not.toBeNull();
    expect(vp.querySelector('.colox-message-deck__count')?.textContent).toBe('+1');
    // not expanded yet — no collapse chip
    expect(vp.querySelector('.colox-message-deck__collapse')).toBeNull();
  });

  it('does not deck three or fewer notify cards', () => {
    render(<MessageViewport scope="deck" data-testid="vp" />);
    act(() => {
      Notify.info({ title: 'one', content: 'first' }, { scope: 'deck' });
      Notify.info({ title: 'two', content: 'second' }, { scope: 'deck' });
      Notify.info({ title: 'three', content: 'third' }, { scope: 'deck' });
    });
    const vp = screen.getByTestId('vp');
    expect(vp.querySelector('.colox-message-deck')).toBeNull();
  });

  it('expands the deck on count-chip click and collapses on the collapse chip', () => {
    render(<MessageViewport scope="deck" data-testid="vp" />);
    act(() => {
      Notify.info({ title: 'one', content: 'first' }, { scope: 'deck' });
      Notify.info({ title: 'two', content: 'second' }, { scope: 'deck' });
      Notify.info({ title: 'three', content: 'third' }, { scope: 'deck' });
      Notify.info({ title: 'four', content: 'fourth' }, { scope: 'deck' });
    });
    const vp = screen.getByTestId('vp');
    const count = vp.querySelector('.colox-message-deck__count');
    expect(count).not.toBeNull();
    act(() => {
      fireEvent.click(count!);
    });
    // expanded: the collapse chip appears, the count chip is gone
    expect(vp.querySelector('.colox-message-deck__collapse')).not.toBeNull();
    expect(vp.querySelector('.colox-message-deck__count')).toBeNull();
    act(() => {
      fireEvent.click(vp.querySelector('.colox-message-deck__collapse')!);
    });
    expect(vp.querySelector('.colox-message-deck__count')).not.toBeNull();
  });
});
