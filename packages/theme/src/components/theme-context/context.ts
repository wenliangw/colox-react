import { createContext } from 'react';
import { BASE_BREAKPOINT_NAME, LIGHT_THEME_NAME, SYSTEM_THEME_NAME } from './constants/theme';
import type { ColoxThemeContextValue } from './types';

const noop = (): undefined => undefined;

/** The static snapshot served when no <ColoxTheme> is mounted. */
export const defaultColoxThemeContextValue: ColoxThemeContextValue = {
  theme: SYSTEM_THEME_NAME,
  resolvedTheme: LIGHT_THEME_NAME,
  isFollowSystem: true,
  palette: undefined,
  breakpoint: BASE_BREAKPOINT_NAME,
  setTheme: noop,
  setPalette: noop,
  setBreakpoints: noop,
  register: noop,
  unregister: noop,
};

/**
 * The context behind useColoxTheme, consumed only through that hook and
 * provided only by the <ColoxTheme> root.
 */
export const ColoxThemeContext = createContext<ColoxThemeContextValue>(
  defaultColoxThemeContextValue,
);
