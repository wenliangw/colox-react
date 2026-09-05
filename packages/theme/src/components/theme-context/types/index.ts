import type { ReactNode } from 'react';
import type {
  BASE_BREAKPOINT_NAME,
  DARK_THEME_NAME,
  LIGHT_THEME_NAME,
  SYSTEM_THEME_NAME,
} from '../constants/theme';
import { defaultBreakpoints } from '@/styles/tokens/breakpoints';

/**
 * Theme axis vocabulary: built-in light/dark plus 'system' (follow the OS)
 * with a freedom tail for any CLI-compiled custom name (e.g. 'deep').
 */
export type ColoxThemeName =
  typeof LIGHT_THEME_NAME | typeof DARK_THEME_NAME | typeof SYSTEM_THEME_NAME | (string & {});

/** The concrete theme value a follow-system sensor can resolve to. */
export type ColoxSystemThemeName = typeof LIGHT_THEME_NAME | typeof DARK_THEME_NAME;

/**
 * Micro-motion gate vocabulary: true/false force the axis, 'system'
 * follows the prefers-reduced-motion media query natively.
 */
export type MotionPreference = boolean | 'system';

/**
 * Responsive breakpoint keys, bound to the component CSS contract
 * (`[data-colox-breakpoint='…']` selectors) and sourced from the generated
 * design tokens.
 */
export type BreakpointKey = keyof typeof defaultBreakpoints;

/** Current segment; 'base' when no max-width query matches (attribute removed). */
export type BreakpointName = typeof BASE_BREAKPOINT_NAME | BreakpointKey;

/** Breakpoint overrides: values only — the keys are the CSS contract. */
export type BreakpointOverrides = Partial<Record<BreakpointKey, string>>;

/**
 * A value that responds to the breakpoint axis: the plain value applies
 * everywhere, or an object maps per-band values by breakpoint name.
 * Band semantics follow the max-width cap ladder (see
 * resolveResponsiveValue). T is expected to be a scalar vocabulary type
 * (spacing keys, counts, etc.).
 */
export type ResponsiveValue<T> = T | Partial<Record<BreakpointName, T>>;

/** The live snapshot the useColoxTheme hook exposes. */
export interface ColoxThemeValue {
  /** The configured theme; 'system' means follow the OS preference. */
  theme: ColoxThemeName;
  /** The effective theme — always concrete (the system value while following). */
  resolvedTheme: string;
  /** Derived from theme === 'system'; the follow state is managed internally. */
  isFollowSystem: boolean;
  /** Palette axis name; undefined = the shipped default (attribute removed). */
  palette: string | undefined;
  /** Current segment; 'base' = no match (attribute removed). */
  breakpoint: BreakpointName;
  setTheme: (theme: ColoxThemeName) => void;
  setPalette: (palette: string | undefined) => void;
  setBreakpoints: (values: BreakpointOverrides) => void;
}

/**
 * Root props of <ColoxTheme>. theme / palette carry the two single-owner
 * axes directly; Storage and Breakpoints are mounted as subcomponents.
 */
export interface ColoxThemeProps {
  children?: ReactNode;
  /**
   * Theme axis value; 'system' follows the OS preference.
   * @default 'system'
   */
  theme?: ColoxThemeName;
  /**
   * Fallback for the follow-system axis when matchMedia is unavailable.
   * @default 'light'
   */
  defaultTheme?: ColoxSystemThemeName;
  /**
   * Palette axis name — the output.name of a compiled colox.theme.json.
   * undefined = the shipped default.
   */
  palette?: string;
  /**
   * Micro-motion gate: true forces motion on, false forces it off,
   * 'system' follows the OS reduced-motion preference (CSS-native).
   * @default 'system'
   */
  motion?: MotionPreference;
}

/**
 * Props of the Breakpoints subcomponent. Threshold overrides only; the
 * contract keys stay fixed.
 */
export interface ColoxThemeBreakpointsProps {
  values: BreakpointOverrides;
}

/**
 * Props surface of the Storage subcomponent. It takes no props — mounting
 * it is the switch; children are forbidden to keep that unambiguous.
 */
export interface ColoxThemeStorageProps {
  children?: never;
}

export type ColoxThemePartKind = 'breakpoints' | 'storage';

export interface ColoxThemeBreakpointsEntry {
  id: string;
  kind: 'breakpoints';
  payload: { values: BreakpointOverrides };
}

export interface ColoxThemeStorageEntry {
  id: string;
  kind: 'storage';
  payload: { enabled: boolean };
}

export type ColoxThemeRegistryEntry = ColoxThemeBreakpointsEntry | ColoxThemeStorageEntry;

/**
 * The context value — the only thing useColoxTheme ever returns.
 * Consumers read the snapshot fields; subcomponents use register /
 * unregister. The context's default value is a static snapshot with inert
 * callbacks, which keeps both safe outside a <ColoxTheme> root.
 */
export interface ColoxThemeContextValue extends ColoxThemeValue {
  register: (entry: ColoxThemeRegistryEntry) => void;
  unregister: (id: string) => void;
}

/** The final config patch folded from props + registry, applied to the store. */
export interface ColoxThemeConfigPatch {
  theme?: ColoxThemeName;
  defaultTheme?: ColoxSystemThemeName;
  palette?: string | undefined;
  breakpoints?: BreakpointOverrides;
  storage?: boolean;
}
