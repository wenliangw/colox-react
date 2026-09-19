import type { ResolveActiveDescendantIdParams } from '../types';

/**
 * The ARIA active-descendant pointer: present only while the panel is
 * open AND the keyboard walk sits on a row (a closed list has no
 * roaming highlight).
 */
export function resolveActiveDescendantId({
  open,
  activeIndex,
  listboxId,
}: ResolveActiveDescendantIdParams): string | undefined {
  if (!open || activeIndex < 0) {
    return undefined;
  }
  return `${listboxId}-item-${activeIndex}`;
}
