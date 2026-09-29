import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useProgressStrategy } from '../hooks/use-progress-strategy';

/**
 * The strategy hook is driven by an interval clock; every test runs
 * under fake timers so the growth curve is stepped deterministically.
 */
function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

describe('useProgressStrategy', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts at zero', () => {
    const { result } = renderHook(() => useProgressStrategy());
    expect(result.current.value).toBe(0);
  });

  it('grows on start, fast first and slower as it approaches the cap', () => {
    const { result } = renderHook(() => useProgressStrategy());
    act(() => result.current.start());

    // One tick: (99 - 0) * 0.1 = 9.9.
    advance(200);
    const firstStep = result.current.value;
    expect(firstStep).toBeCloseTo(9.9, 2);

    // Second tick: step taken from a closer distance — the curve slows.
    advance(200);
    const secondStep = result.current.value - firstStep;
    expect(secondStep).toBeGreaterThan(0);
    expect(secondStep).toBeLessThan(firstStep);
  });

  it('parks exactly at the cap and never creeps past it', () => {
    const { result } = renderHook(() => useProgressStrategy());
    act(() => result.current.start());

    advance(60000);
    expect(result.current.value).toBe(99);
  });

  it('reaches a custom cap', () => {
    const { result } = renderHook(() => useProgressStrategy({ cap: 80 }));
    act(() => result.current.start());

    advance(60000);
    expect(result.current.value).toBe(80);
  });

  it('done jumps to 100 and stops the clock', () => {
    const { result } = renderHook(() => useProgressStrategy());
    act(() => result.current.start());
    advance(200);
    expect(result.current.value).toBeGreaterThan(0);

    act(() => result.current.done());
    expect(result.current.value).toBe(100);

    advance(60000);
    expect(result.current.value).toBe(100);
  });

  it('reset brings the value back to 0 and clears a running clock', () => {
    const { result } = renderHook(() => useProgressStrategy());
    act(() => result.current.start());
    advance(200);
    expect(result.current.value).toBeGreaterThan(0);

    act(() => result.current.reset());
    expect(result.current.value).toBe(0);

    advance(60000);
    expect(result.current.value).toBe(0);
  });

  it('start after done is a no-op until reset', () => {
    const { result } = renderHook(() => useProgressStrategy());
    act(() => result.current.start());
    act(() => result.current.done());

    act(() => result.current.start());
    advance(60000);
    expect(result.current.value).toBe(100);

    act(() => result.current.reset());
    act(() => result.current.start());
    advance(200);
    expect(result.current.value).toBeGreaterThan(0);
  });

  it('reset re-arms immediately: reset then start in the same tick works', () => {
    const { result } = renderHook(() => useProgressStrategy());
    act(() => {
      result.current.start();
      result.current.done();
      result.current.reset();
      result.current.start();
    });
    advance(200);
    expect(result.current.value).toBeCloseTo(9.9, 2);
  });

  it('never moves backwards while growing', () => {
    const { result } = renderHook(() => useProgressStrategy());
    act(() => result.current.start());

    let previous = result.current.value;
    for (let i = 0; i < 50; i += 1) {
      advance(200);
      expect(result.current.value).toBeGreaterThanOrEqual(previous);
      previous = result.current.value;
    }
  });

  it('start is idempotent: a second start never arms a second clock', () => {
    const { result } = renderHook(() => useProgressStrategy());
    act(() => result.current.start());
    act(() => result.current.start());
    expect(vi.getTimerCount()).toBe(1);
  });

  it('clears its clock on unmount', () => {
    const { result, unmount } = renderHook(() => useProgressStrategy());
    act(() => result.current.start());
    expect(vi.getTimerCount()).toBe(1);

    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  describe('segmented strategy plan', () => {
    const plan: [marker: `${number}%`, durationMs: number][] = [
      ['20%', 300],
      ['60%', 600],
      ['99%', 1000],
    ];

    it('walks the checkpoints segment by segment', () => {
      const { result } = renderHook(() => useProgressStrategy({ strategy: plan }));
      act(() => result.current.start());

      advance(200); // tick 1 (t=200), segment 1: 20% * 2/3
      expect(result.current.value).toBeCloseTo(13.3, 1);

      advance(200); // t=400, segment 2: 20% + 40% * 1/6
      expect(result.current.value).toBeCloseTo(26.7, 1);

      advance(200); // t=600, segment 2: 20% + 40% * 3/6
      expect(result.current.value).toBeCloseTo(40, 1);

      advance(300); // t=800, segment 2: 20% + 40% * 5/6
      expect(result.current.value).toBeCloseTo(53.3, 1);
    });

    it('parks at the last marker and stops the clock', () => {
      const { result } = renderHook(() => useProgressStrategy({ strategy: plan }));
      act(() => result.current.start());

      advance(2000); // one tick past the total runtime — parked by the plan
      expect(result.current.value).toBe(99);

      advance(60000);
      expect(result.current.value).toBe(99);
      expect(vi.getTimerCount()).toBe(0);
    });

    it('clamps markers beyond the cap while their durations still apply', () => {
      const { result } = renderHook(() => useProgressStrategy({ cap: 50, strategy: plan }));
      act(() => result.current.start());

      advance(200); // 13.3 — the first marker is under the cap
      expect(result.current.value).toBeCloseTo(13.3, 1);

      advance(600); // t=800: segment 2 walks 20% → clamped 50% over its 600ms
      expect(result.current.value).toBeCloseTo(45, 1);

      advance(1200); // the plan finishes: parked at the clamped 50%
      expect(result.current.value).toBe(50);

      advance(60000);
      expect(result.current.value).toBe(50);
    });

    it('parks at the last marker when the plan ends below the cap', () => {
      const shortPlan: [marker: `${number}%`, durationMs: number][] = [
        ['20%', 300],
        ['40%', 600],
      ];
      const { result } = renderHook(() => useProgressStrategy({ strategy: shortPlan }));
      act(() => result.current.start());

      advance(200);
      expect(result.current.value).toBeCloseTo(13.3, 1);

      advance(800); // tick 5 (t=1000) — past the 900ms runtime: parked at 40%
      expect(result.current.value).toBe(40);

      advance(60000);
      expect(result.current.value).toBe(40);
      expect(vi.getTimerCount()).toBe(0);
    });

    it('never moves backwards across the whole plan', () => {
      const { result } = renderHook(() => useProgressStrategy({ strategy: plan }));
      act(() => result.current.start());

      let previous = result.current.value;
      for (let i = 0; i < 40; i += 1) {
        advance(200);
        expect(result.current.value).toBeGreaterThanOrEqual(previous);
        previous = result.current.value;
      }
    });

    it('done jumps to 100 mid-plan and stops the clock', () => {
      const { result } = renderHook(() => useProgressStrategy({ strategy: plan }));
      act(() => result.current.start());
      advance(200);
      expect(result.current.value).toBeCloseTo(13.3, 1);

      act(() => result.current.done());
      expect(result.current.value).toBe(100);

      advance(60000);
      expect(result.current.value).toBe(100);
    });

    it('reset re-arms a plan run from scratch', () => {
      const { result } = renderHook(() => useProgressStrategy({ strategy: plan }));
      act(() => result.current.start());
      advance(200);
      expect(result.current.value).toBeCloseTo(13.3, 1);

      act(() => result.current.reset());
      act(() => result.current.start());
      advance(200);
      expect(result.current.value).toBeCloseTo(13.3, 1);
    });
  });
});
