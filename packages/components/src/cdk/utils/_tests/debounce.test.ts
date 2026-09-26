import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { debounce } from '../debounce';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fires once with the last arguments after the quiet window', () => {
    const fn = vi.fn();
    const call = debounce(fn, 100);
    call(1);
    call(2);
    call(3);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(99);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(3);
  });

  it('cancel discards the pending call and leaves the wrapper reusable', () => {
    const fn = vi.fn();
    const call = debounce(fn, 100);
    call('queued');
    call.cancel();
    vi.advanceTimersByTime(200);
    expect(fn).not.toHaveBeenCalled();
    call('after');
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('after');
  });
});
