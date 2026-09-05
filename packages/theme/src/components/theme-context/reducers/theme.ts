import { BASE_BREAKPOINT_NAME, LIGHT_THEME_NAME, SYSTEM_THEME_NAME } from '../constants/theme';
import type {
  BreakpointKey,
  BreakpointName,
  BreakpointOverrides,
  ColoxSystemThemeName,
  ColoxThemeConfigPatch,
  ColoxThemeName,
} from '../types';
import { defaultBreakpoints } from '@/styles/tokens/breakpoints';

export interface ThemeState {
  theme: ColoxThemeName;
  defaultTheme: ColoxSystemThemeName;
  palette: string | undefined;
  breakpointValues: Record<BreakpointKey, string>;
  breakpoint: BreakpointName;
  systemTheme: ColoxSystemThemeName;
  storageEnabled: boolean;
}

export type ThemeAction =
  | { type: 'set-theme'; theme: ColoxThemeName }
  | { type: 'set-palette'; palette: string | undefined }
  | { type: 'set-default-theme'; defaultTheme: ColoxSystemThemeName }
  | { type: 'set-breakpoints'; values: BreakpointOverrides }
  | { type: 'set-storage-enabled'; enabled: boolean }
  | { type: 'set-system-theme'; systemTheme: ColoxSystemThemeName }
  | { type: 'set-breakpoint'; breakpoint: BreakpointName }
  | { type: 'apply-config'; patch: ColoxThemeConfigPatch };

export function createInitialThemeState(): ThemeState {
  return {
    theme: SYSTEM_THEME_NAME,
    defaultTheme: LIGHT_THEME_NAME,
    palette: undefined,
    breakpointValues: { ...defaultBreakpoints },
    breakpoint: BASE_BREAKPOINT_NAME,
    systemTheme: LIGHT_THEME_NAME,
    storageEnabled: false,
  };
}

/** Derives the effective theme: the system value while following. */
export function resolveTheme(state: ThemeState): string {
  return state.theme === SYSTEM_THEME_NAME ? state.systemTheme : state.theme;
}

/**
 * Pure state transitions for the theme context. Identical transitions
 * return the previous state object so React can bail out of re-renders.
 * `apply-config` folds the patch by delegating to the granular actions in
 * declaration order.
 */
export function themeReducer(state: ThemeState, action: ThemeAction): ThemeState {
  switch (action.type) {
    case 'set-theme':
      return action.theme === state.theme ? state : { ...state, theme: action.theme };
    case 'set-palette':
      return action.palette === state.palette ? state : { ...state, palette: action.palette };
    case 'set-default-theme':
      return action.defaultTheme === state.defaultTheme
        ? state
        : { ...state, defaultTheme: action.defaultTheme };
    case 'set-breakpoints':
      return { ...state, breakpointValues: { ...defaultBreakpoints, ...action.values } };
    case 'set-storage-enabled':
      return action.enabled === state.storageEnabled
        ? state
        : { ...state, storageEnabled: action.enabled };
    case 'set-system-theme':
      return action.systemTheme === state.systemTheme
        ? state
        : { ...state, systemTheme: action.systemTheme };
    case 'set-breakpoint':
      return action.breakpoint === state.breakpoint
        ? state
        : { ...state, breakpoint: action.breakpoint };
    case 'apply-config': {
      let next = state;
      const { patch } = action;
      if (patch.theme !== undefined)
        next = themeReducer(next, { type: 'set-theme', theme: patch.theme });
      if (patch.defaultTheme !== undefined)
        next = themeReducer(next, { type: 'set-default-theme', defaultTheme: patch.defaultTheme });
      if (patch.palette !== undefined)
        next = themeReducer(next, { type: 'set-palette', palette: patch.palette });
      if (patch.breakpoints !== undefined)
        next = themeReducer(next, { type: 'set-breakpoints', values: patch.breakpoints });
      if (patch.storage !== undefined)
        next = themeReducer(next, { type: 'set-storage-enabled', enabled: patch.storage });
      return next;
    }
  }
}
