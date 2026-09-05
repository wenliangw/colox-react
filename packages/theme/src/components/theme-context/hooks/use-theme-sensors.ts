import { useLayoutEffect } from 'react';
import {
  BASE_BREAKPOINT_NAME,
  BREAKPOINT_KEYS,
  COLOR_SCHEME_QUERY,
  DARK_THEME_NAME,
  LIGHT_THEME_NAME,
} from '../constants/theme';
import type { BreakpointName } from '../types';
import type { ThemeAction, ThemeState } from '../reducers/theme';

type Dispatch = (action: ThemeAction) => void;

/**
 * Binds the two matchMedia sensors: the system color-scheme preference and
 * the breakpoint queries. The initial wiring runs in the layout phase so
 * the state — and therefore the first painted frame — is already correct;
 * later changes dispatch transitions and all listeners clean up after
 * themselves. Without matchMedia the breakpoint stays 'base' and the
 * system theme falls back to defaultTheme.
 */
export function useThemeSensors(state: ThemeState, dispatch: Dispatch) {
  const { breakpointValues, defaultTheme } = state;

  useLayoutEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia(COLOR_SCHEME_QUERY);
    dispatch({
      type: 'set-system-theme',
      systemTheme: query.matches ? DARK_THEME_NAME : LIGHT_THEME_NAME,
    });
    const onChange = (event: MediaQueryListEvent) => {
      dispatch({
        type: 'set-system-theme',
        systemTheme: event.matches ? DARK_THEME_NAME : LIGHT_THEME_NAME,
      });
    };
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, [dispatch]);

  useLayoutEffect(() => {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') return;
    // Without a sensor the fallback is the live system value.
    dispatch({ type: 'set-system-theme', systemTheme: defaultTheme });
  }, [defaultTheme, dispatch]);

  useLayoutEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const queries = BREAKPOINT_KEYS.map((key) =>
      window.matchMedia(`(max-width: ${breakpointValues[key]})`),
    );
    const compute = (): BreakpointName => {
      for (let i = 0; i < BREAKPOINT_KEYS.length; i += 1) {
        if (queries[i].matches) return BREAKPOINT_KEYS[i];
      }
      return BASE_BREAKPOINT_NAME;
    };
    dispatch({ type: 'set-breakpoint', breakpoint: compute() });
    const onChange = () => dispatch({ type: 'set-breakpoint', breakpoint: compute() });
    for (const query of queries) query.addEventListener('change', onChange);
    return () => {
      for (const query of queries) query.removeEventListener('change', onChange);
    };
  }, [breakpointValues, dispatch]);
}
