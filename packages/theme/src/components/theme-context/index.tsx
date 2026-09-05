import { useCallback, useLayoutEffect, useMemo, useState, type FC } from 'react';
import { applyColoxConfig } from './stores/theme-store';
import { foldConfig } from './utils/registry';
import { ColoxThemeBreakpoints } from './breakpoints';
import { ColoxThemeStorage } from './storage';
import { ColoxThemeContext } from './context';
import type { ColoxThemeProps, ColoxThemeRegistryEntry } from './types';

const ColoxThemeRoot = ({ children, theme, defaultTheme, palette }: ColoxThemeProps) => {
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
    applyColoxConfig({ theme, defaultTheme, palette, ...foldConfig(entries) });
  }, [entries, theme, defaultTheme, palette]);

  return <ColoxThemeContext.Provider value={registry}>{children}</ColoxThemeContext.Provider>;
};

type ColoxThemeComponent = FC<ColoxThemeProps> & {
  Storage: typeof ColoxThemeStorage;
  Breakpoints: typeof ColoxThemeBreakpoints;
};

export const ColoxTheme: ColoxThemeComponent = Object.assign(ColoxThemeRoot, {
  Storage: ColoxThemeStorage,
  Breakpoints: ColoxThemeBreakpoints,
});

export { ColoxThemeContext } from './context';
