import { useEffect, useLayoutEffect } from 'react';
import { PALETTE_STORAGE_KEY, THEME_STORAGE_KEY } from '../constants/theme';
import type { ColoxThemeName } from '../types';
import type { ThemeAction, ThemeState } from '../reducers/theme';

type Dispatch = (action: ThemeAction) => void;

/**
 * Storage bridge. The restore runs in the layout phase so saved values
 * beat the props before the first paint; write-through persists every
 * manual change once the Storage subcomponent has enabled persistence.
 */
export function useThemeStorage(state: ThemeState, dispatch: Dispatch) {
  const { palette, storageEnabled, theme } = state;

  useLayoutEffect(() => {
    if (typeof window === 'undefined' || !storageEnabled) return;
    try {
      const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
      const savedPalette = window.localStorage.getItem(PALETTE_STORAGE_KEY);
      if (savedTheme !== null) dispatch({ type: 'set-theme', theme: savedTheme as ColoxThemeName });
      if (savedPalette !== null)
        dispatch({ type: 'set-palette', palette: savedPalette === '' ? undefined : savedPalette });
    } catch {
      // Storage unavailable (private mode etc.): keep the in-memory state.
    }
  }, [storageEnabled, dispatch]);

  useEffect(() => {
    if (typeof window === 'undefined' || !storageEnabled) return;
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
      if (palette === undefined) window.localStorage.removeItem(PALETTE_STORAGE_KEY);
      else window.localStorage.setItem(PALETTE_STORAGE_KEY, palette);
    } catch {
      // Storage unavailable: skip, the in-memory state is unaffected.
    }
  }, [storageEnabled, theme, palette]);
}
