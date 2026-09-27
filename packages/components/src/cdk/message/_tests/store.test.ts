import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMessageStore, DEFAULT_EXIT } from '../store';

describe('MessageStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('adds an entry with resolved defaults', () => {
    const store = createMessageStore();
    const id = store.add({ variant: 'toast', content: 'hi' });
    expect(store.getSnapshot()).toHaveLength(1);
    const entry = store.getSnapshot()[0];
    expect(entry.id).toBe(id);
    expect(entry.variant).toBe('toast');
    expect(entry.type).toBe('info');
    expect(entry.status).toBe('shown');
  });

  it('auto-dismisses after the default duration', () => {
    const store = createMessageStore();
    store.add({ variant: 'toast', content: 'hi' });
    expect(store.getSnapshot()[0].status).toBe('shown');
    vi.advanceTimersByTime(3000);
    expect(store.getSnapshot()[0].status).toBe('exiting');
    vi.advanceTimersByTime(DEFAULT_EXIT);
    expect(store.getSnapshot()).toHaveLength(0);
  });

  it('keeps a zero-duration entry sticky', () => {
    const store = createMessageStore();
    store.add({ variant: 'toast', content: 'hi', duration: 0 });
    vi.advanceTimersByTime(60_000);
    expect(store.getSnapshot()[0].status).toBe('shown');
  });

  it('updates in place by key', () => {
    const store = createMessageStore();
    store.add({ variant: 'notify', content: 'one', key: 'k' });
    store.update('k', { content: 'two' });
    expect(store.getSnapshot()[0].content).toBe('two');
    expect(store.getSnapshot()).toHaveLength(1);
  });

  it('dismisses one entry by id into the exit window', () => {
    const store = createMessageStore();
    store.add({ variant: 'toast', content: 'a' });
    const id = store.add({ variant: 'toast', content: 'b' });
    store.dismiss(id);
    const [a, b] = store.getSnapshot();
    expect(a.status).toBe('shown');
    expect(b.status).toBe('exiting');
  });

  it('dismissAll moves every entry to exiting then removes them', () => {
    const store = createMessageStore();
    store.add({ variant: 'toast', content: 'a' });
    store.add({ variant: 'notify', content: 'b' });
    store.dismissAll();
    expect(store.getSnapshot().every((e) => e.status === 'exiting')).toBe(true);
    vi.advanceTimersByTime(DEFAULT_EXIT);
    expect(store.getSnapshot()).toHaveLength(0);
  });

  it('pause/resume holds the countdown on hover', () => {
    const store = createMessageStore();
    store.add({ variant: 'toast', content: 'hi' });
    const id = store.getSnapshot()[0].id;
    vi.advanceTimersByTime(1000);
    store.pause(id);
    vi.advanceTimersByTime(10_000);
    expect(store.getSnapshot()[0].status).toBe('shown');
    store.resume(id);
    vi.advanceTimersByTime(1999);
    expect(store.getSnapshot()[0].status).toBe('shown');
    vi.advanceTimersByTime(1);
    expect(store.getSnapshot()[0].status).toBe('exiting');
  });

  it('emits on mutation only (snapshot identity)', () => {
    const store = createMessageStore();
    const first = store.getSnapshot();
    store.add({ variant: 'toast', content: 'hi' });
    expect(store.getSnapshot()).not.toBe(first);
    expect(store.getSnapshot()).toBe(store.getSnapshot());
  });
});
