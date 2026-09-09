import { BASE_BREAKPOINT_NAME, BREAKPOINT_KEYS } from '../constants/theme';
import type { BreakpointKey, BreakpointName, ResponsiveValue } from '../types';

/**
 * Resolves a responsive value against the current breakpoint name.
 *
 * Band semantics are min-width activation points: a configured key takes
 * effect from its band upward ("lg starts at lg"), so the effective value
 * is the LAST configured key at or narrower than the current band. Wider
 * bands without their own key keep the latest configured one — including
 * the 'base' state beyond the widest cap. When no key is configured at or
 * narrower than the current band, the component's static default
 * (`fallback`) applies. A plain (non-object) value is static and returns
 * unchanged.
 */
export function resolveResponsiveValue<T>(
  value: ResponsiveValue<T>,
  breakpoint: BreakpointName,
  fallback?: T,
): T | undefined {
  if (value === null || typeof value !== 'object') {
    return value;
  }
  const config = value as Partial<Record<BreakpointKey, T>>;
  // 'base' (attribute removed) means beyond the widest cap: treat it
  // like the widest band so the last configured slot keeps applying.
  const start =
    breakpoint === BASE_BREAKPOINT_NAME
      ? BREAKPOINT_KEYS.length - 1
      : BREAKPOINT_KEYS.indexOf(breakpoint as BreakpointKey);
  for (let i = start; i >= 0; i -= 1) {
    const candidate = config[BREAKPOINT_KEYS[i]];
    if (candidate !== undefined) {
      return candidate;
    }
  }
  return fallback;
}
