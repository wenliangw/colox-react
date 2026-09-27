import { afterEach, describe, expect, it } from 'vitest';
import { act, render, screen } from '@testing-library/react';
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
});
