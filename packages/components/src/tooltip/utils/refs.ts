/**
 * Writes a node into a function or object ref. The compiled trigger
 * keeps its own ref (function or object) — the merged callback hands
 * the same node to the library and to the author's ref alike.
 */
export function assignTooltipRef(ref: unknown, node: HTMLElement | null): void {
  if (typeof ref === 'function') {
    ref(node);
    return;
  }
  if (ref !== null && typeof ref === 'object' && 'current' in ref) {
    (ref as { current: HTMLElement | null }).current = node;
  }
}
