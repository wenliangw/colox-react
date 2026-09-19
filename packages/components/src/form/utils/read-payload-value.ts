/**
 * Reads the next value out of a family change payload: every form leaf
 * publishes `{ event, value }` (the family word shape), so the payload's
 * `value` is the field's next value whatever the domain — text,
 * boolean, number, date string or selection array. A payload without
 * the key (an author's own handler shape) falls back to the native
 * event's target value.
 */
export function readPayloadValue(payload: unknown): unknown {
  if (typeof payload !== 'object' || payload === null) {
    return undefined;
  }
  if ('value' in payload) {
    return (payload as { value: unknown }).value;
  }
  const { event } = payload as { event?: { target?: { value?: unknown } } };
  return event?.target?.value;
}
