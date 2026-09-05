import { useContext, useEffect } from 'react';
import { ColoxThemeContext, defaultColoxThemeContextValue } from '../context';
import type { ColoxThemeValue } from '../types';

/**
 * Reads the live theme snapshot from the context. Outside a <ColoxTheme>
 * root it warns once per mount and serves static defaults — the
 * imperative setters become no-ops.
 */
export const useColoxTheme = (): ColoxThemeValue => {
  const context = useContext(ColoxThemeContext);
  useEffect(() => {
    if (context === defaultColoxThemeContextValue) {
      console.warn(
        '[ColoxTheme] useColoxTheme must be used within a <ColoxTheme> root; static defaults are served.',
      );
    }
  }, [context]);
  return context.snapshot;
};
