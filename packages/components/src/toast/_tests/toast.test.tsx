import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { toast } from '../api';
import { DEFAULT_DURATION, TOAST_EXIT, toastStore } from '../store';
import { Toast } from '../toast';

const renderHost = () =>
  render(
    <Toast.Provider>
      <Toast.Viewport />
    </Toast.Provider>,
  );

const useFakeTimers = () =>
  vi.useFakeTimers({
    toFake: ['setTimeout', 'clearTimeout', 'Date'],
  });

const advance = (ms: number) => {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
};

afterEach(() => {
  // drain the module store while fake timers are still active so one
  // test's toasts never leak into the next
  act(() => {
    toastStore.dismissAll();
  });
  act(() => {
    vi.advanceTimersByTime(TOAST_EXIT);
  });
  vi.useRealTimers();
});

describe('imperative api', () => {
  it('toast(content) adds a lightweight single-line toast', () => {
    useFakeTimers();
    renderHost();
    act(() => {
      toast('Saved');
    });
    expect(screen.getByRole('status')).toHaveTextContent('Saved');
  });

  it('toast({ title, content }) promotes to the titled tier', () => {
    useFakeTimers();
    renderHost();
    act(() => {
      toast({ title: 'Saved', content: 'The file is on disk.' });
    });
    expect(screen.getByRole('status')).toHaveTextContent('Saved');
    expect(screen.getByRole('status')).toHaveTextContent('The file is on disk.');
    expect(screen.getByRole('status')).toHaveClass('colox-toast--titled');
  });

  it('tone shortcuts set the palette tone class', () => {
    useFakeTimers();
    renderHost();
    act(() => {
      toast.success('ok');
      toast.error('boom');
      toast.warning('careful');
      toast.info('note');
    });
    const cards = screen.getAllByRole('status');
    expect(cards).toHaveLength(4);
    expect(cards[0]).toHaveClass('colox-toast--tone-success');
    expect(cards[1]).toHaveClass('colox-toast--tone-error');
    expect(cards[2]).toHaveClass('colox-toast--tone-warning');
    expect(cards[3]).toHaveClass('colox-toast--tone-info');
  });

  it('returns an id dismissable via toast.dismiss(id)', () => {
    useFakeTimers();
    renderHost();
    let id = '';
    act(() => {
      id = toast('Saved');
    });
    expect(screen.getByRole('status')).toBeInTheDocument();
    act(() => {
      toast.dismiss(id);
    });
    expect(screen.getByRole('status')).toHaveClass('colox-toast--exiting');
    advance(TOAST_EXIT);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});

describe('store lifecycle', () => {
  it('auto-dismisses after the duration', () => {
    useFakeTimers();
    renderHost();
    act(() => {
      toast('Saved');
    });
    expect(screen.getByRole('status')).toBeInTheDocument();
    advance(DEFAULT_DURATION);
    expect(screen.getByRole('status')).toHaveClass('colox-toast--exiting');
    advance(TOAST_EXIT);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('duration 0 stays until manually dismissed', () => {
    useFakeTimers();
    renderHost();
    act(() => {
      toast({ content: 'sticky', duration: 0 });
    });
    advance(DEFAULT_DURATION * 3);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByRole('status')).not.toHaveClass('colox-toast--exiting');
  });

  it('update(key, patch) mutates a live toast in place', () => {
    useFakeTimers();
    renderHost();
    act(() => {
      toast({ key: 'progress', content: 'step one' });
    });
    act(() => {
      toast.update('progress', { content: 'step two' });
    });
    expect(screen.getByRole('status')).toHaveTextContent('step two');
    expect(screen.getByRole('status')).not.toHaveTextContent('step one');
  });

  it('dismissAll() sends every toast into the exit window', () => {
    useFakeTimers();
    renderHost();
    act(() => {
      toast('one');
      toast('two');
    });
    expect(screen.getAllByRole('status')).toHaveLength(2);
    act(() => {
      toast.dismiss();
    });
    expect(screen.getAllByRole('status')).toHaveLength(2);
    expect(screen.getAllByRole('status')[0]).toHaveClass('colox-toast--exiting');
    advance(TOAST_EXIT);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});

describe('interactions', () => {
  it('the close button dismisses the toast', () => {
    useFakeTimers();
    renderHost();
    act(() => {
      toast('Saved');
    });
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.getByRole('status')).toHaveClass('colox-toast--exiting');
  });

  it('the action runs onClick then closes the toast', () => {
    useFakeTimers();
    const onClick = vi.fn();
    renderHost();
    act(() => {
      toast({ content: 'Deleted', action: { label: 'Undo', onClick } });
    });
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status')).toHaveClass('colox-toast--exiting');
  });

  it('hover pauses the countdown and leave resumes it', () => {
    useFakeTimers();
    renderHost();
    act(() => {
      toast('Saved');
    });
    const card = screen.getByRole('status');
    // hover for most of the duration — nothing dismisses yet
    fireEvent.mouseEnter(card);
    advance(DEFAULT_DURATION * 2);
    expect(card).toBeInTheDocument();
    // leave: the remaining time runs out and it dismisses
    fireEvent.mouseLeave(card);
    advance(DEFAULT_DURATION);
    expect(screen.getByRole('status')).toHaveClass('colox-toast--exiting');
  });
});

describe('viewport', () => {
  it('renders nothing without toasts and maps the position class', () => {
    useFakeTimers();
    render(
      <Toast.Provider>
        <Toast.Viewport position="bottom-center" />
      </Toast.Provider>,
    );
    expect(document.querySelector('.colox-toast-viewport')).toHaveClass(
      'colox-toast-viewport--bottom-center',
    );
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('merges a consumer className onto the viewport', () => {
    useFakeTimers();
    render(
      <Toast.Provider>
        <Toast.Viewport className="my-toasts" />
      </Toast.Provider>,
    );
    expect(document.querySelector('.colox-toast-viewport')).toHaveClass('my-toasts');
  });
});
