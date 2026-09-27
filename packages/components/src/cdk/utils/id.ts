// ——— unique id generation ————————————————————————————————————————————
// The one id factory for anything that needs a stable, human-traceable
// unique id outside React's useId (imperative stores, message entries,
// portal nodes). Monotonic per prefix + a millisecond component, so ids
// are unique within a run and sortable by creation order. No crypto, no
// randomness — determinism keeps tests stable.

const counters = new Map<string, number>();
let lastInstant = 0;
let sameInstantSequence = 0;

/**
 * Creates a unique id for the given prefix: `${prefix}-${millis}${seq}`.
 * Ids for the same prefix are strictly increasing; ids across prefixes
 * never collide because the prefix is part of the id. Within a single
 * millisecond the sequence disambiguates (up to 9999 ids — beyond that
 * it throws, mirroring DATEID's exhaustion guard).
 *
 * ```ts
 * createId('colox-toast'); // 'colox-toast-17690000000000001'
 * ```
 */
export function createId(prefix: string): string {
  const instant = Date.now();
  if (instant === lastInstant) {
    sameInstantSequence += 1;
    if (sameInstantSequence > 9999) {
      throw new RangeError('colox: createId sequence exhausted within one millisecond');
    }
  } else {
    lastInstant = instant;
    sameInstantSequence = 0;
  }
  const counter = (counters.get(prefix) ?? 0) + 1;
  counters.set(prefix, counter);
  return `${prefix}-${instant}${String(sameInstantSequence).padStart(4, '0')}-${counter}`;
}
