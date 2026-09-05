/**
 * ColoxTheme runtime constants — every magic string of this module lands
 * here. Value vocabulary and type vocabulary share this single source:
 * the context types derive their literal unions from these constants via
 * `typeof`, so a rename in one place can never drift from the other.
 */
import type { ColoxThemePartKind } from '@/context/types';
import { defaultBreakpoints } from '@/styles/tokens/breakpoints';

/** Built-in theme names; 'system' means follow the OS preference. */
export const SYSTEM_THEME_NAME = 'system' as const;
export const LIGHT_THEME_NAME = 'light' as const;
export const DARK_THEME_NAME = 'dark' as const;

/** The matchMedia query behind follow-system mode. */
export const COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';

/** localStorage keys used by the Storage part. */
export const THEME_STORAGE_KEY = 'colox:theme';
export const PALETTE_STORAGE_KEY = 'colox:palette';

/**
 * Breakpoint contract keys in ascending threshold order — the smallest
 * matching query wins. Sourced from the generated design tokens so the
 * runtime and the token pipeline can never drift apart.
 */
export const BREAKPOINT_KEYS = Object.keys(defaultBreakpoints) as Array<
  keyof typeof defaultBreakpoints
>;

/** The segment name when no max-width query matches (attribute removed). */
export const BASE_BREAKPOINT_NAME = 'base' as const;

/** The three axes as <html> data-* attributes (the CSS selector contract). */
export const THEME_ATTRIBUTE = 'data-colox-theme';
export const PALETTE_ATTRIBUTE = 'data-colox-palette';
export const BREAKPOINT_ATTRIBUTE = 'data-colox-breakpoint';

/** All part kinds, in fold order. */
export const PART_KINDS = [
  'storage',
  'theme',
  'palette',
  'breakpoints',
] as const satisfies readonly ColoxThemePartKind[];
