import { useContext, useEffect } from 'react';
import { ColoxThemeContext, defaultColoxThemeContextValue } from '../context';
import type { ColoxThemeContextValue } from '../types';

/**
 * The single protected outlet for the theme context: consumers read the
 * snapshot fields, subcomponents use register / unregister — no code
 * consumes ColoxThemeContext directly. Outside a <ColoxTheme> root it
 * warns once per mount and serves static defaults, so registrations and
 * imperative setters become no-ops.
 */
export const useColoxTheme = (): ColoxThemeContextValue => {
  const context = useContext(ColoxThemeContext);
  useEffect(() => {
    if (context === defaultColoxThemeContextValue) {
      console.warn(
        '[ColoxTheme] useColoxTheme must be used within a <ColoxTheme> root; static defaults are served.',
      );
    }
  }, [context]);
  return context;
};
