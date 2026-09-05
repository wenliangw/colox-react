/**
 * ColoxTheme — the composable theme runtime root.
 *
 * <ColoxTheme>
 *   <ColoxTheme.Storage />                          // persistence: mount = on
 *   <ColoxTheme.Palette name="brand-2025" />        // palette axis (output.name)
 *   <ColoxTheme.Breakpoints values={{ md: '800px' }} /> // breakpoints: values only
 *   <ColoxTheme.Theme name="system" />              // theme: absent = follow system
 *   <App />
 * </ColoxTheme>
 *
 * The four parts are pure declarations (render null) that hand their config
 * to the root through the ColoxThemeContext registry; the root folds them
 * into a final config in a layout effect and applies it to the global store
 * (same-kind parts are last-write-wins). Subtrees are never themed in
 * isolation — all three axes live on <html> (the :root-prefixed selector
 * contract), and <ColoxTheme> is just a config entry point into the same
 * singleton.
 */
import { useCallback, useLayoutEffect, useMemo, useState, type FC } from 'react';
import { applyColoxConfig } from '@/stores/theme-store';
import { foldConfig } from '@/utils/registry';
import { ColoxThemeContext } from './context';
import {
  ColoxThemeBreakpointsPart,
  ColoxThemePalettePart,
  ColoxThemeStoragePart,
  ColoxThemeThemePart,
} from './parts';
import type { ColoxThemeProps, ColoxThemeRegistryEntry } from './types';

const ColoxThemeRoot = ({ children }: ColoxThemeProps) => {
  const [entries, setEntries] = useState<ColoxThemeRegistryEntry[]>([]);

  const register = useCallback((entry: ColoxThemeRegistryEntry) => {
    setEntries((prev) => [...prev.filter((item) => item.id !== entry.id), entry]);
  }, []);

  const unregister = useCallback((id: string) => {
    setEntries((prev) => {
      const next = prev.filter((item) => item.id !== id);
      return next.length === prev.length ? prev : next;
    });
  }, []);

  const registry = useMemo(() => ({ register, unregister }), [register, unregister]);

  useLayoutEffect(() => {
    applyColoxConfig(foldConfig(entries));
  }, [entries]);

  return <ColoxThemeContext.Provider value={registry}>{children}</ColoxThemeContext.Provider>;
};

type ColoxThemeComponent = FC<ColoxThemeProps> & {
  Theme: typeof ColoxThemeThemePart;
  Palette: typeof ColoxThemePalettePart;
  Breakpoints: typeof ColoxThemeBreakpointsPart;
  Storage: typeof ColoxThemeStoragePart;
};

export const ColoxTheme: ColoxThemeComponent = Object.assign(ColoxThemeRoot, {
  Theme: ColoxThemeThemePart,
  Palette: ColoxThemePalettePart,
  Breakpoints: ColoxThemeBreakpointsPart,
  Storage: ColoxThemeStoragePart,
});

export { ColoxThemeContext } from './context';
