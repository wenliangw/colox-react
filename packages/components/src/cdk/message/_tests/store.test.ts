import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_EXIT } from '../constants/defaults';
import { createMessageStore } from '../stores/store';

describe('MessageStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('adds an entry with resolved defaults', () => {
    const store = createMessageStore();
    const id = store.add({ type: 'toast', content: 'hi' });
    expect(store.getSnapshot()).toHaveLength(1);
    const entry = store.getSnapshot()[0];
    expect(entry.id).toBe(id);
    expect(entry.type).toBe('toast');
    expect(entry.mode).toBe('info');
    expect(entry.palette).toBe('info');
    expect(entry.variant).toBe('plain');
    expect(entry.showIcon).toBe(true);
    expect(entry.closeable).toBe(true);
    expect(entry.status).toBe('shown');
  });

  it('auto-dismisses after the default duration', () => {
    const store = createMessageStore();
    store.add({ type: 'toast', content: 'hi' });
    expect(store.getSnapshot()[0].status).toBe('shown');
    vi.advanceTimersByTime(3000);
    expect(store.getSnapshot()[0].status).toBe('exiting');
    vi.advanceTimersByTime(DEFAULT_EXIT);
    expect(store.getSnapshot()).toHaveLength(0);
  });

  it('keeps a zero-duration entry sticky', () => {
    const store = createMessageStore();
    store.add({ type: 'toast', content: 'hi', duration: 0 });
    vi.advanceTimersByTime(60_000);
    expect(store.getSnapshot()[0].status).toBe('shown');
  });

  it('dismiss after an in-place replacement exits the new payload', () => {
    const store = createMessageStore();
    const id = store.add({
      type: 'toast',
      content: 'a',
      position: 'top-center',
      strategy: 'single',
    });
    store.add({ type: 'toast', content: 'b', position: 'top-center', strategy: 'single' });
    // the replacement landed instantly — the new payload is live
    expect(store.getSnapshot()[0].content).toBe('b');
    store.dismiss(id);
    // the live payload exits and its exit window removes it
    expect(store.getSnapshot()[0].status).toBe('exiting');
    vi.advanceTimersByTime(DEFAULT_EXIT);
    expect(store.getSnapshot()).toHaveLength(0);
  });

  it('updates in place by key instantly with a zoom re-mount', () => {
    const store = createMessageStore();
    store.add({ type: 'notify', content: 'one', key: 'k' });
    store.update('k', { content: 'two' });
    // instant: no opacity dip — the new payload lands right away and
    // the contentVersion bump re-mounts the content node for its zoom
    // entrance
    const [entry] = store.getSnapshot();
    expect(entry.content).toBe('two');
    expect(entry.contentVersion).toBe(1);
    expect(store.getSnapshot()).toHaveLength(1);
  });

  it('replaces and updates both commit instantly — one re-mount per payload', () => {
    const store = createMessageStore();
    store.add({
      type: 'toast',
      content: 'a',
      key: 'k',
      position: 'top-center',
      strategy: 'single',
    });
    // a same-slot replacement lands instantly with the zoom (no dip)
    store.add({
      type: 'toast',
      content: 'b',
      key: 'k',
      position: 'top-center',
      strategy: 'single',
    });
    const [replaced] = store.getSnapshot();
    expect(replaced.content).toBe('b');
    expect(replaced.contentVersion).toBe(1);
    // an update is the same instant shape — one more re-mount
    store.update('k', { content: 'c' });
    expect(store.getSnapshot()[0].content).toBe('c');
    expect(store.getSnapshot()[0].contentVersion).toBe(2);
  });

  it('applies an invisible patch immediately without staging', () => {
    const store = createMessageStore();
    store.add({ type: 'notify', content: 'one', key: 'k' });
    store.update('k', { duration: 8000 });
    // no visible change → the patch applies synchronously, no re-mount
    expect(store.getSnapshot()[0].duration).toBe(8000);
    expect(store.getSnapshot()[0].content).toBe('one');
    expect(store.getSnapshot()[0].contentVersion).toBe(0);
  });

  it('dismisses one entry by id into the exit window', () => {
    const store = createMessageStore();
    store.add({ type: 'toast', content: 'a' });
    const id = store.add({ type: 'toast', content: 'b' });
    store.dismiss(id);
    const [a, b] = store.getSnapshot();
    expect(a.status).toBe('shown');
    expect(b.status).toBe('exiting');
  });

  it('dismissAll moves every entry to exiting then removes them', () => {
    const store = createMessageStore();
    store.add({ type: 'toast', content: 'a' });
    store.add({ type: 'notify', content: 'b' });
    store.dismissAll();
    expect(store.getSnapshot().every((e) => e.status === 'exiting')).toBe(true);
    vi.advanceTimersByTime(DEFAULT_EXIT);
    expect(store.getSnapshot()).toHaveLength(0);
  });

  it('pause/resume holds the countdown on hover', () => {
    const store = createMessageStore();
    store.add({ type: 'toast', content: 'hi' });
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

  it('pause holders stack — the countdown restarts only on the last resume', () => {
    const store = createMessageStore();
    store.add({ type: 'toast', content: 'hi' });
    const id = store.getSnapshot()[0].id;
    // hover pause + fold freeze hold together
    store.pause(id);
    store.pause(id);
    vi.advanceTimersByTime(30_000);
    expect(store.getSnapshot()[0].status).toBe('shown');
    // one holder releases — still frozen
    store.resume(id);
    vi.advanceTimersByTime(30_000);
    expect(store.getSnapshot()[0].status).toBe('shown');
    // the last holder releases — the countdown continues from the rest
    store.resume(id);
    vi.advanceTimersByTime(3000);
    expect(store.getSnapshot()[0].status).toBe('exiting');
  });

  it('getRemaining reports the ms left — counting and frozen', () => {
    vi.useFakeTimers();
    const store = createMessageStore();
    store.add({ type: 'toast', content: 'hi', duration: 5000 });
    const id = store.getSnapshot()[0].id;
    vi.advanceTimersByTime(1000);
    const counting = store.getRemaining(id);
    expect(counting).not.toBeNull();
    expect(counting!).toBeLessThanOrEqual(4000);
    expect(counting!).toBeGreaterThan(3900);
    store.pause(id);
    const frozen = store.getRemaining(id);
    expect(frozen).toBe(counting);
    vi.advanceTimersByTime(10_000);
    // frozen: unchanged
    expect(store.getRemaining(id)).toBe(frozen);
    // sticky entries have no countdown
    store.add({ type: 'toast', content: 'sticky', duration: 0 });
    expect(store.getRemaining(store.getSnapshot()[1].id)).toBeNull();
    vi.useRealTimers();
  });

  it('the store folds a burst past the threshold and freezes the countdowns', () => {
    vi.useFakeTimers();
    const store = createMessageStore();
    store.add({ type: 'notify', content: 'a', position: 'top-right', duration: 3000 });
    store.add({ type: 'notify', content: 'b', position: 'top-right', duration: 3000 });
    expect(store.isFolded('top-right')).toBe(false);
    store.add({ type: 'notify', content: 'c', position: 'top-right', duration: 3000 });
    expect(store.isFolded('top-right')).toBe(true);
    // frozen: way past their durations, everything stays shown
    vi.advanceTimersByTime(10_000);
    expect(store.getSnapshot().every((entry) => entry.status === 'shown')).toBe(true);
    // down to the last survivor — its countdown resumes
    const [a, b, c] = store.getSnapshot();
    store.dismiss(c.id);
    store.dismiss(b.id);
    const survivor = store.getSnapshot()[0];
    expect(survivor.id).toBe(a.id);
    expect(store.getRemaining(survivor.id)).not.toBeNull();
    expect(store.isFolded('top-right')).toBe(true);
    vi.advanceTimersByTime(3000);
    expect(store.getSnapshot()[0].status).toBe('exiting');
    vi.advanceTimersByTime(200);
    expect(store.getSnapshot()).toHaveLength(0);
    expect(store.isFolded('top-right')).toBe(false);
    vi.useRealTimers();
  });

  it('a folded close pops the card instantly and promotes the next in place', () => {
    vi.useFakeTimers();
    const store = createMessageStore();
    store.add({ type: 'notify', content: 'a', position: 'top-right', duration: 3000 });
    store.add({ type: 'notify', content: 'b', position: 'top-right', duration: 3000 });
    store.add({ type: 'notify', content: 'c', position: 'top-right', duration: 3000 });
    const [a, b, c] = store.getSnapshot();
    store.dismiss(c.id);
    // popped the visible card: gone INSTANTLY (not exiting), the next
    // card stays put and its content version bumps for the zoom
    let snapshot = store.getSnapshot();
    expect(snapshot).toHaveLength(2);
    expect(snapshot.every((entry) => entry.status === 'shown')).toBe(true);
    expect(snapshot[1].id).toBe(b.id);
    expect(snapshot[1].contentVersion).toBe(1);
    // the remaining fold still freezes; the other cards show intact
    vi.advanceTimersByTime(10_000);
    expect(store.getSnapshot().every((entry) => entry.status === 'shown')).toBe(true);
    // popping a BACKLOG card directly (not the visible one) removes it
    // instantly without bumping the visible card
    store.dismiss(a.id);
    snapshot = store.getSnapshot();
    expect(snapshot).toHaveLength(1);
    expect(snapshot[0].id).toBe(b.id);
    expect(snapshot[0].contentVersion).toBe(1);
    expect(store.getSnapshot()[0].status).toBe('shown');
    vi.useRealTimers();
  });

  it('clearSlot clears the invisible backlog instantly and exits the visible card', () => {
    vi.useFakeTimers();
    const store = createMessageStore();
    store.add({ type: 'notify', content: 'a', position: 'top-right', duration: 3000 });
    store.add({ type: 'notify', content: 'b', position: 'top-right', duration: 3000 });
    store.add({ type: 'notify', content: 'c', position: 'top-right', duration: 3000 });
    const [a, b, c] = store.getSnapshot();
    store.clearSlot('top-right');
    // only the visible card remains, walking its exit window
    const snapshot = store.getSnapshot();
    expect(snapshot).toHaveLength(1);
    expect(snapshot[0].id).toBe(c.id);
    expect(snapshot[0].status).toBe('exiting');
    expect([a.id, b.id].every((id) => !snapshot.some((entry) => entry.id === id))).toBe(true);
    vi.advanceTimersByTime(200);
    expect(store.getSnapshot()).toHaveLength(0);
    expect(store.isFolded('top-right')).toBe(false);
    vi.useRealTimers();
  });

  it('a card arriving into an active fold lands with a zoom bump', () => {
    vi.useFakeTimers();
    const store = createMessageStore();
    store.add({ type: 'notify', content: 'a', position: 'top-right', duration: 3000 });
    store.add({ type: 'notify', content: 'b', position: 'top-right', duration: 3000 });
    // the third card BIRTHS the fold — its reveal coincides with the
    // capsule's first appearance: a plain arrival, no zoom bump
    store.add({ type: 'notify', content: 'c', position: 'top-right', duration: 3000 });
    let snapshot = store.getSnapshot();
    expect(snapshot[2].contentVersion).toBe(0);
    // a NEW arrival into the already-folded slot lands in the display
    // slot — a reveal, not an arrival: it bumps so the words zoom
    store.add({ type: 'notify', content: 'd', position: 'top-right', duration: 3000 });
    snapshot = store.getSnapshot();
    expect(snapshot.map((entry) => entry.content)).toEqual(['a', 'b', 'c', 'd']);
    expect(snapshot[3].contentVersion).toBe(1);
    // arrivals keep bumping for the slot's lifetime (still folded)
    store.add({ type: 'notify', content: 'e', position: 'top-right', duration: 3000 });
    snapshot = store.getSnapshot();
    expect(snapshot[4].contentVersion).toBe(1);
    expect(snapshot[0].contentVersion).toBe(0);
    vi.useRealTimers();
  });

  it('an arrival during the fold descent (count == 2 or tapped-out) still zooms', () => {
    vi.useFakeTimers();
    const store = createMessageStore();
    store.add({ type: 'notify', content: 'a', position: 'top-right', duration: 3000 });
    store.add({ type: 'notify', content: 'b', position: 'top-right', duration: 3000 });
    store.add({ type: 'notify', content: 'c', position: 'top-right', duration: 3000 });
    // pop down to two shown — the fold holds through the descent
    const c = store.getSnapshot()[2];
    store.dismiss(c.id);
    // a fresh arrival while the fold holds: the display reveals it
    const d = store.add({ type: 'notify', content: 'd', position: 'top-right', duration: 3000 });
    const snapshot = store.getSnapshot();
    expect(snapshot.find((entry) => entry.id === d)?.contentVersion).toBe(1);
    expect(store.isFolded('top-right')).toBe(true);
    vi.useRealTimers();
  });

  it('arrivals outside a fold never bump', () => {
    vi.useFakeTimers();
    const store = createMessageStore();
    store.add({ type: 'notify', content: 'a', position: 'top-right', duration: 3000 });
    store.add({ type: 'notify', content: 'b', position: 'top-right', duration: 3000 });
    // two shown — below the fold: plain arrivals
    store.add({ type: 'notify', content: 'c', position: 'top-right', duration: 3000 });
    expect(store.getSnapshot().every((entry) => entry.contentVersion === 0)).toBe(true);
    // ...and a 4th card arriving after the fold DRAINED (post window,
    // everything gone) is likewise a plain arrival — position empty, no fold
    store.clearSlot('top-right');
    vi.advanceTimersByTime(200);
    store.add({ type: 'notify', content: 'z', position: 'top-right', duration: 3000 });
    expect(store.getSnapshot()[0].contentVersion).toBe(0);
    vi.useRealTimers();
  });

  it('emits on mutation only (snapshot identity)', () => {
    const store = createMessageStore();
    const first = store.getSnapshot();
    store.add({ type: 'toast', content: 'hi' });
    expect(store.getSnapshot()).not.toBe(first);
    expect(store.getSnapshot()).toBe(store.getSnapshot());
  });

  it('resolves palette from the tone by default', () => {
    const store = createMessageStore();
    store.add({ type: 'toast', content: 'hi', mode: 'error' });
    store.add({ type: 'toast', content: 'hi2' });
    const [a, b] = store.getSnapshot();
    expect(a.palette).toBe('error');
    expect(b.palette).toBe('info');
  });

  it('keeps an explicit palette over the tone', () => {
    const store = createMessageStore();
    store.add({ type: 'toast', content: 'hi', mode: 'error', palette: 'primary' });
    const [entry] = store.getSnapshot();
    expect(entry.palette).toBe('primary');
    expect(entry.mode).toBe('error');
  });

  it('resolves the surface variant to plain by default', () => {
    const store = createMessageStore();
    store.add({ type: 'notify', content: 'hi', variant: 'solid' });
    store.add({ type: 'notify', content: 'hi2' });
    const [a, b] = store.getSnapshot();
    expect(a.variant).toBe('solid');
    expect(b.variant).toBe('plain');
  });

  it('single strategy replaces the same-face same-slot entry in place', () => {
    const store = createMessageStore();
    const firstId = store.add({ type: 'toast', content: 'a', position: 'top-center' });
    const secondId = store.add({
      type: 'toast',
      content: 'b',
      position: 'top-center',
      strategy: 'single',
    });
    // exactly one entry; the slot keeps its identity while the new
    // payload lands instantly (zoom re-mount, no dip)
    expect(store.getSnapshot()).toHaveLength(1);
    const [entry] = store.getSnapshot();
    expect(entry.id).toBe(firstId);
    expect(secondId).toBe(firstId);
    expect(entry.content).toBe('b');
    expect(entry.status).toBe('shown');
    expect(entry.contentVersion).toBe(1);
  });

  it('single strategy replacement ignores palette/variant — one per position', () => {
    const store = createMessageStore();
    store.add({ type: 'toast', content: 'a', position: 'top-center', variant: 'solid' });
    store.add({
      type: 'toast',
      content: 'b',
      position: 'top-center',
      strategy: 'single',
      palette: 'primary',
      variant: 'outline',
    });
    expect(store.getSnapshot()).toHaveLength(1);
    const [entry] = store.getSnapshot();
    expect(entry.content).toBe('b');
    expect(entry.palette).toBe('primary');
    expect(entry.variant).toBe('outline');
  });

  it('single strategy replacement restarts the countdown', () => {
    const store = createMessageStore();
    store.add({ type: 'toast', content: 'a', position: 'top-center', strategy: 'single' });
    vi.advanceTimersByTime(2999);
    store.add({ type: 'toast', content: 'b', position: 'top-center', strategy: 'single' });
    // the old countdown is dropped at the commit; the fresh payload
    // restarts a full countdown right away
    vi.advanceTimersByTime(2999);
    expect(store.getSnapshot()[0].status).toBe('shown');
    vi.advanceTimersByTime(1);
    expect(store.getSnapshot()[0].status).toBe('exiting');
  });

  it('single strategy revives an exiting entry back to shown immediately', () => {
    const store = createMessageStore();
    const id = store.add({
      type: 'toast',
      content: 'a',
      position: 'top-center',
      strategy: 'single',
    });
    store.dismiss(id);
    expect(store.getSnapshot()[0].status).toBe('exiting');
    store.add({ type: 'toast', content: 'b', position: 'top-center', strategy: 'single' });
    // the revive lands the payload immediately over the active exit
    expect(store.getSnapshot()).toHaveLength(1);
    expect(store.getSnapshot()[0].id).toBe(id);
    expect(store.getSnapshot()[0].status).toBe('shown');
    expect(store.getSnapshot()[0].content).toBe('b');
    expect(store.getSnapshot()[0].contentVersion).toBe(1);
  });

  it('single strategy clears earlier stack leftovers — one live entry per position', () => {
    const store = createMessageStore();
    store.add({ type: 'toast', content: 'a', position: 'top-center', strategy: 'stack' });
    store.add({ type: 'toast', content: 'b', position: 'top-center', strategy: 'stack' });
    const liveId = store.add({
      type: 'toast',
      content: 'c',
      position: 'top-center',
      strategy: 'single',
    });
    // the newcomer replaces the edge-anchored (first) entry in place —
    // the survivor keeps its DOM spot, no reflow; the leftover stack
    // entry exits beneath it. The replacement and the leftover exit
    // both start right away, so exactly one LIVE entry exists from the
    // first assertion on.
    const shown = store.getSnapshot().filter((e) => e.status === 'shown');
    expect(shown).toHaveLength(1);
    expect(shown[0].id).toBe(liveId);
    expect(shown[0].content).toBe('c');
    expect(store.getSnapshot().filter((e) => e.status === 'exiting')).toHaveLength(1);
    // the leftover finishes its exit window and is removed
    vi.advanceTimersByTime(DEFAULT_EXIT);
    expect(store.getSnapshot()).toHaveLength(1);
    expect(store.getSnapshot()[0].status).toBe('shown');
    expect(store.getSnapshot()[0].content).toBe('c');
  });

  it('single strategy leaves other slots alone', () => {
    const store = createMessageStore();
    store.add({ type: 'toast', content: 'a', position: 'top-center' });
    store.add({ type: 'toast', content: 'b', position: 'top-left', strategy: 'single' });
    expect(store.getSnapshot().every((e) => e.status === 'shown')).toBe(true);
  });

  it('single strategy leaves other faces alone', () => {
    const store = createMessageStore();
    store.add({ type: 'toast', content: 'a', position: 'top-center' });
    store.add({ type: 'notify', content: 'b', position: 'top-center', strategy: 'single' });
    expect(store.getSnapshot().every((e) => e.status === 'shown')).toBe(true);
  });

  it('stack strategy piles entries up', () => {
    const store = createMessageStore();
    store.add({ type: 'toast', content: 'a', position: 'top-center', strategy: 'stack' });
    store.add({ type: 'toast', content: 'b', position: 'top-center', strategy: 'stack' });
    expect(store.getSnapshot()).toHaveLength(2);
    expect(store.getSnapshot().every((e) => e.status === 'shown')).toBe(true);
  });

  it('starts every entry at contentVersion 0', () => {
    const store = createMessageStore();
    store.add({ type: 'toast', content: 'a' });
    expect(store.getSnapshot()[0].contentVersion).toBe(0);
  });

  it('keeps chrome eager while a visible update lands instantly', () => {
    const store = createMessageStore();
    store.add({ type: 'toast', content: 'a', key: 'k' });
    store.update('k', { content: 'b', showIcon: false, closeable: false });
    const [entry] = store.getSnapshot();
    expect(entry.content).toBe('b');
    expect(entry.showIcon).toBe(false);
    expect(entry.closeable).toBe(false);
    expect(entry.contentVersion).toBe(1);
  });

  it('fires onClose with { id, data } when the toast is dismissed', () => {
    const store = createMessageStore();
    const payloads: Array<{ id: string; data?: unknown }> = [];
    const id = store.add({
      type: 'toast',
      content: 'saved',
      data: { recordId: 42 },
      onClose: (p) => payloads.push(p),
    });
    store.dismiss(id);
    expect(payloads).toEqual([{ id, data: { recordId: 42 } }]);
  });

  it('fires onClose once when the toast auto-expires', () => {
    const store = createMessageStore();
    let calls = 0;
    store.add({
      type: 'toast',
      content: 'hi',
      data: 'trace-me',
      onClose: (p) => {
        calls += 1;
        expect(p.data).toBe('trace-me');
      },
    });
    vi.advanceTimersByTime(3001);
    expect(calls).toBe(1);
  });

  it('does not fire onClose when the payload is updated', () => {
    const store = createMessageStore();
    let calls = 0;
    store.add({ type: 'toast', content: 'one', key: 'k', onClose: () => (calls += 1) });
    store.update('k', { content: 'two' });
    expect(calls).toBe(0);
    store.update('k', { duration: 8000 });
    expect(calls).toBe(0);
  });

  it("fires the replaced payload's onClose as the replacement lands and hands the new payload on", () => {
    const store = createMessageStore();
    const closed: string[] = [];
    store.add({
      type: 'toast',
      content: 'old',
      position: 'top-center',
      strategy: 'single',
      data: 'old-data',
      onClose: (p) => closed.push(`old:${p.data}`),
    });
    store.add({
      type: 'toast',
      content: 'new',
      position: 'top-center',
      strategy: 'single',
      data: 'new-data',
      onClose: (p) => closed.push(`new:${p.data}`),
    });
    // the old payload's job ended as the replacement landed — fired
    // once, right away
    expect(closed).toEqual(['old:old-data']);
    const [entry] = store.getSnapshot();
    expect(entry.content).toBe('new');
    // the new payload closes with its own data
    store.dismiss(entry.id);
    expect(closed).toEqual(['old:old-data', 'new:new-data']);
  });

  it('replacement + dismissAll fires the replaced payload once then the live one once', () => {
    const store = createMessageStore();
    const closed: string[] = [];
    store.add({
      type: 'toast',
      content: 'a',
      position: 'top-center',
      strategy: 'single',
      data: 'a',
      onClose: (p) => closed.push(String(p.data)),
    });
    store.add({
      type: 'toast',
      content: 'b',
      position: 'top-center',
      strategy: 'single',
      data: 'b',
      onClose: (p) => closed.push(String(p.data)),
    });
    // the replacement landed instantly — the replaced payload already
    // fired once; dismissAll now ends the live payload only
    expect(closed).toEqual(['a']);
    store.dismissAll();
    expect(closed).toEqual(['a', 'b']);
  });

  it('dismissing a plain shown toast mid-flight fires its onClose exactly once', () => {
    const store = createMessageStore();
    let calls = 0;
    const id = store.add({ type: 'toast', content: 'a', data: 'x', onClose: () => (calls += 1) });
    store.dismiss(id);
    store.dismiss(id);
    expect(calls).toBe(1);
    store.dismissAll();
    expect(calls).toBe(1);
  });

  it('fires the close once when onClose re-enters add (dismiss path — the story demo)', () => {
    const store = createMessageStore();
    let calls = 0;
    const id = store.add({
      type: 'toast',
      content: 'a',
      position: 'top-center',
      strategy: 'single',
      data: 'trace-42',
      onClose: () => {
        calls += 1;
        // The demo's follow-up: a single top-center toast lands where
        // the closing one lives. It must NOT re-fire this payload.
        if (calls === 1) {
          store.add({
            type: 'toast',
            content: 'Closed',
            position: 'top-center',
            strategy: 'single',
          });
        }
      },
    });
    store.dismiss(id);
    expect(calls).toBe(1);
    const [entry] = store.getSnapshot();
    expect(entry.content).toBe('Closed');
  });

  it("fires the close once when a replaced payload's onClose re-enters add (single replacement path)", () => {
    const store = createMessageStore();
    let calls = 0;
    store.add({
      type: 'toast',
      content: 'a',
      position: 'top-center',
      strategy: 'single',
      data: 'x',
      onClose: () => {
        calls += 1;
        if (calls === 1) {
          store.add({ type: 'toast', content: 'c', position: 'top-center', strategy: 'single' });
        }
      },
    });
    store.add({ type: 'toast', content: 'b', position: 'top-center', strategy: 'single' });
    expect(calls).toBe(1);
    const [entry] = store.getSnapshot();
    expect(entry.content).toBe('c');
  });

  it('fires each close once when onClose re-enters add (dismissAll path)', () => {
    const store = createMessageStore();
    let calls = 0;
    store.add({
      type: 'toast',
      content: 'a',
      position: 'top-center',
      strategy: 'single',
      data: 'x',
      onClose: () => {
        calls += 1;
        if (calls === 1) {
          store.add({ type: 'toast', content: 'b', position: 'top-center', strategy: 'single' });
        }
      },
    });
    store.dismissAll();
    expect(calls).toBe(1);
  });
});
