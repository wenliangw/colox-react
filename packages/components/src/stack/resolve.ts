import type { BreakpointName } from '@colox/theme';
import type { StackGap, StackResponsiveGap } from './types';

/**
 * Breakpoint ladder in narrow-to-wide order. The theme runtime writes
 * the tightest max-width cap that contains the viewport (or 'base' when
 * no cap matches), so walking from the current band outward reproduces
 * the cap semantics: the first configured value at or wider than the
 * current band wins, with 'base' as the final fallback.
 */
const NARROW_TO_WIDE: ReadonlyArray<Exclude<BreakpointName, 'base'>> = ['sm', 'md', 'lg', 'xl'];

export function resolveResponsiveGap(
  config: StackResponsiveGap,
  breakpoint: BreakpointName,
): StackGap | undefined {
  if (breakpoint === 'base') {
    return config.base;
  }
  const start = NARROW_TO_WIDE.indexOf(breakpoint);
  for (let i = start; i < NARROW_TO_WIDE.length; i += 1) {
    const value = config[NARROW_TO_WIDE[i]];
    if (value !== undefined) {
      return value;
    }
  }
  return config.base;
}
