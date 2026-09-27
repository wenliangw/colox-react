import { describe, expect, it } from 'vitest';
import { createId } from '../id';

describe('createId', () => {
  it('prefixes the id with the given prefix', () => {
    expect(createId('colox-toast')).toMatch(/^colox-toast-/);
  });

  it('produces unique ids within a prefix', () => {
    const ids = new Set(Array.from({ length: 100 }, () => createId('colox-toast')));
    expect(ids.size).toBe(100);
  });

  it('never collides across prefixes', () => {
    const a = createId('toast');
    const b = createId('notify');
    expect(a).not.toBe(b);
    expect(a.startsWith('toast-')).toBe(true);
    expect(b.startsWith('notify-')).toBe(true);
  });

  it('is strictly increasing per prefix', () => {
    const first = createId('seq');
    const second = createId('seq');
    expect(second > first).toBe(true);
  });
});
