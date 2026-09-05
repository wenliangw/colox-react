import { createContext } from 'react';
import type { BreakpointName } from '@colox/theme';
import type { StackGap, StackResponsiveGap } from '../types';

const noop = (): undefined => undefined;

/**
 * The channel between <Stack> and its parts. The root owns the
 * resolved gap; parts only push values through it (last mounted
 * writer wins, unmounting restores the static gap prop).
 */
export interface StackContextValue {
  registerResponsiveGap: (gap: StackGap | undefined) => void;
}

/** The static snapshot served when no <Stack> is mounted. */
export const defaultStackContextValue: StackContextValue = {
  registerResponsiveGap: noop,
};

/**
 * The context behind useStackContext, consumed only through that hook
 * and provided only by the <Stack> root.
 */
export const StackContext = createContext<StackContextValue>(defaultStackContextValue);

/**
 * Breakpoint ladder in narrow-to-wide order. The theme runtime writes
 * the tightest max-width cap that contains the viewport (or 'base' when
 * no cap matches), so walking from the current band outward reproduces
 * the cap semantics: the first configured value at or wider than the
 * current band wins, with 'base' as the final fallback.
 */
const NARROW_TO_WIDE: ReadonlyArray<Exclude<BreakpointName, 'base'>> = ['sm', 'md', 'lg', 'xl'];

/**
 * The responsive-gap resolver. It lives in the context module because
 * composition components keep their few, closely-related helpers with
 * the context instead of scattering util files.
 */
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
