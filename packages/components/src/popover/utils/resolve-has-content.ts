import type { ReactNode } from 'react';
import type { CompiledPopoverLeaves } from '../types';

/** The channel-aware presence word behind the aria wiring: composed reads the Content part, props reads the content truthiness. */
export function resolvePopoverHasContent(
  compiled: CompiledPopoverLeaves,
  content: ReactNode,
): boolean {
  if (compiled.composed) {
    return compiled.content !== null;
  }
  return Boolean(content);
}
