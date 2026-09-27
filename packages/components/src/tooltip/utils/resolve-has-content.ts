import type { ReactNode } from 'react';
import type { CompiledTooltipLeaves } from '../types';

/** The channel-aware presence word behind the describedby wiring: composed reads the Content part, props reads the content truthiness. */
export function resolveTooltipHasContent(
  compiled: CompiledTooltipLeaves,
  content: ReactNode,
): boolean {
  if (compiled.composed) {
    return compiled.content !== null;
  }
  return Boolean(content);
}
