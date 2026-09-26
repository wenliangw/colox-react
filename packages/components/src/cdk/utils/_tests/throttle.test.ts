import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { throttle } from '../throttle';

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fires on the leading edge and drops every call inside the window — no replay', () => {
    const fn = vi.fn();
    const call = throttle(fn, 100);
    call('first');
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenLastCalledWith('first');
    vi.advanceTimersByTime(50);
    call('dropped-a');
    call('dropped-b');
    expect(fn).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(60);
    // The window lapsed: nothing replayed, the gate stands open.
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenLastCalledWith('first');
  });

  it('fires again once the window lapses — dropped calls never re-arm it', () => {
    const fn = vi.fn();
    const call = throttle(fn, 100);
    call('one');
    // A dropped call at t=90 must NOT push the release past t=100.
    vi.advanceTimersByTime(90);
    call('dropped');
    vi.advanceTimersByTime(10);
    call('two');
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith('two');
  });

  it('cancel abandons the window — the next call fires immediately', () => {
    const fn = vi.fn();
    const call = throttle(fn, 100);
    call('one');
    call.cancel();
    call('two');
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith('two');
  });
});
