import { BASE_BREAKPOINT_NAME, BREAKPOINT_KEYS } from '../constants/theme';
import type { BreakpointName, ResponsiveValue } from '../types';

/**
 * Resolves a responsive value against the current breakpoint name.
 *
 * Band semantics follow the runtime ladder: the runtime publishes the
 * tightest max-width cap that contains the viewport (or 'base' when no
 * cap matches), so the effective value is the first configured key at
 * or wider than the current band, with 'base' as the final fallback.
 * A plain (non-object) value is static and returns unchanged.
 */
export function resolveResponsiveValue<T>(
  value: ResponsiveValue<T>,
  breakpoint: BreakpointName,
): T | undefined {
  if (value === null || typeof value !== 'object') {
    return value;
  }
  const config = value as Partial<Record<BreakpointName, T>>;
  if (breakpoint === BASE_BREAKPOINT_NAME) {
    return config.base;
  }
  const start = BREAKPOINT_KEYS.indexOf(breakpoint);
  for (let i = start; i < BREAKPOINT_KEYS.length; i += 1) {
    const candidate = config[BREAKPOINT_KEYS[i]];
    if (candidate !== undefined) {
      return candidate;
    }
  }
  return config.base;
}
