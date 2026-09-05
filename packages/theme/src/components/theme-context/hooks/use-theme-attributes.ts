import { useInsertionEffect } from 'react';
import { applyThemeAttributes } from '../utils/attributes';
import type { ThemeState } from '../utils/reducer';

/**
 * Keeps the <html> data-colox-* attributes in sync with the state. Runs
 * in the insertion phase so the theme CSS is already switched before the
 * browser paints.
 */
export function useThemeAttributes(state: ThemeState) {
  useInsertionEffect(() => {
    applyThemeAttributes(state);
  }, [state]);
}
