import { createContext } from 'react';
import { BASE_BREAKPOINT_NAME, LIGHT_THEME_NAME, SYSTEM_THEME_NAME } from './constants/theme';
import type { ColoxThemeContextValue, ColoxThemeValue } from './types';

const noop = (): undefined => undefined;

/** The static snapshot served when no <ColoxTheme> is mounted. */
const defaultSnapshot: ColoxThemeValue = {
  theme: SYSTEM_THEME_NAME,
  resolvedTheme: LIGHT_THEME_NAME,
  isFollowSystem: true,
  palette: undefined,
  breakpoint: BASE_BREAKPOINT_NAME,
  setTheme: noop,
  setPalette: noop,
  setBreakpoints: noop,
};

export const defaultColoxThemeContextValue: ColoxThemeContextValue = {
  snapshot: defaultSnapshot,
  register: noop,
  unregister: noop,
};

/** Carries the live snapshot plus the subcomponent registry. */
export const ColoxThemeContext = createContext<ColoxThemeContextValue>(
  defaultColoxThemeContextValue,
);
