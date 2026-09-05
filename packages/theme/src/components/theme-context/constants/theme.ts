import { defaultBreakpoints } from '@/styles/tokens/breakpoints';

/*
 * Magic strings of the theme runtime live here. The type vocabulary derives
 * from these constants via `typeof`, so value and type stay in lockstep.
 */

/** Built-in theme names; 'system' follows the OS preference. */
export const SYSTEM_THEME_NAME = 'system' as const;
export const LIGHT_THEME_NAME = 'light' as const;
export const DARK_THEME_NAME = 'dark' as const;

/** The matchMedia query behind follow-system mode. */
export const COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';

/** localStorage keys used by the Storage subcomponent. */
export const THEME_STORAGE_KEY = 'colox:theme';
export const PALETTE_STORAGE_KEY = 'colox:palette';

/**
 * Breakpoint contract keys in ascending threshold order (smallest match
 * wins), sourced from the generated tokens so they cannot drift.
 */
export const BREAKPOINT_KEYS = Object.keys(defaultBreakpoints) as Array<
  keyof typeof defaultBreakpoints
>;

/** The segment when no max-width query matches (attribute removed). */
export const BASE_BREAKPOINT_NAME = 'base' as const;

/** The three axes as <html> data-* attributes (the CSS selector contract). */
export const THEME_ATTRIBUTE = 'data-colox-theme';
export const PALETTE_ATTRIBUTE = 'data-colox-palette';
export const BREAKPOINT_ATTRIBUTE = 'data-colox-breakpoint';
