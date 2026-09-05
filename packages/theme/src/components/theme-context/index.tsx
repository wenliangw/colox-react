import { useCallback, useLayoutEffect, useMemo, useReducer, useState, type FC } from 'react';
import { SYSTEM_THEME_NAME } from './constants/theme';
import { useThemeAttributes } from './hooks/use-theme-attributes';
import { useMotionAttribute } from './hooks/use-motion-attribute';
import { useThemeSensors } from './hooks/use-theme-sensors';
import { useThemeStorage } from './hooks/use-theme-storage';
import { createInitialThemeState, resolveTheme, themeReducer } from './reducers/theme';
import { foldConfig } from './utils/registry';
import { ColoxThemeBreakpoints } from './children/breakpoints';
import { ColoxThemeStorage } from './children/storage';
import { ColoxThemeContext } from './context';
import type {
  BreakpointOverrides,
  ColoxThemeContextValue,
  ColoxThemeName,
  ColoxThemeProps,
  ColoxThemeRegistryEntry,
} from './types';

const ColoxThemeRoot = ({ children, theme, defaultTheme, palette, motion }: ColoxThemeProps) => {
  const [state, dispatch] = useReducer(themeReducer, undefined, createInitialThemeState);
  const [entries, setEntries] = useState<ColoxThemeRegistryEntry[]>([]);

  useLayoutEffect(() => {
    dispatch({
      type: 'apply-config',
      patch: { theme, defaultTheme, palette, ...foldConfig(entries) },
    });
  }, [entries, theme, defaultTheme, palette]);

  useThemeAttributes(state);
  useMotionAttribute(motion);
  useThemeSensors(state, dispatch);
  useThemeStorage(state, dispatch);

  const register = useCallback((entry: ColoxThemeRegistryEntry) => {
    setEntries((prev) => [...prev.filter((item) => item.id !== entry.id), entry]);
  }, []);

  const unregister = useCallback((id: string) => {
    setEntries((prev) => {
      const next = prev.filter((item) => item.id !== id);
      return next.length === prev.length ? prev : next;
    });
  }, []);

  const setTheme = useCallback(
    (value: ColoxThemeName) => dispatch({ type: 'set-theme', theme: value }),
    [],
  );
  const setPalette = useCallback(
    (value: string | undefined) => dispatch({ type: 'set-palette', palette: value }),
    [],
  );
  const setBreakpoints = useCallback(
    (values: BreakpointOverrides) => dispatch({ type: 'set-breakpoints', values }),
    [],
  );

  const contextValue = useMemo<ColoxThemeContextValue>(
    () => ({
      theme: state.theme,
      resolvedTheme: resolveTheme(state),
      isFollowSystem: state.theme === SYSTEM_THEME_NAME,
      palette: state.palette,
      breakpoint: state.breakpoint,
      setTheme,
      setPalette,
      setBreakpoints,
      register,
      unregister,
    }),
    [state, setTheme, setPalette, setBreakpoints, register, unregister],
  );

  return <ColoxThemeContext.Provider value={contextValue}>{children}</ColoxThemeContext.Provider>;
};

type ColoxThemeComponent = FC<ColoxThemeProps> & {
  Storage: typeof ColoxThemeStorage;
  Breakpoints: typeof ColoxThemeBreakpoints;
};

export const ColoxTheme: ColoxThemeComponent = Object.assign(ColoxThemeRoot, {
  Storage: ColoxThemeStorage,
  Breakpoints: ColoxThemeBreakpoints,
});
