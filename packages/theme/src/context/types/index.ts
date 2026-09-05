import type { ReactNode } from 'react';
import type {
  BASE_BREAKPOINT_NAME,
  DARK_THEME_NAME,
  LIGHT_THEME_NAME,
  SYSTEM_THEME_NAME,
} from '@/constants/theme';
import { defaultBreakpoints } from '@/styles/tokens/breakpoints';

/**
 * The ColoxTheme runtime type surface.
 *
 * Theme axis vocabulary: built-in light/dark plus 'system' (follow the OS)
 * with a freedom tail — custom theme names compiled by the CLI (e.g. 'deep')
 * also type-check, while built-ins keep autocompletion.
 */
export type ColoxThemeName =
  typeof LIGHT_THEME_NAME | typeof DARK_THEME_NAME | typeof SYSTEM_THEME_NAME | (string & {});

/** The concrete theme a follow-system sensor can resolve to. */
export type ColoxSystemThemeName = typeof LIGHT_THEME_NAME | typeof DARK_THEME_NAME;

/**
 * Responsive breakpoint keys — bound to the component CSS contract
 * (`[data-colox-breakpoint='…']` attribute selectors) and sourced from the
 * generated design tokens.
 */
export type BreakpointKey = keyof typeof defaultBreakpoints;

/** Current segment; 'base' when no max-width query matches (attribute removed). */
export type BreakpointName = typeof BASE_BREAKPOINT_NAME | BreakpointKey;

/** Breakpoint overrides: values only — the keys are the CSS contract. */
export type BreakpointOverrides = Partial<Record<BreakpointKey, string>>;

export interface ColoxThemeValue {
  /** The configured theme; 'system' means follow the OS preference. */
  theme: ColoxThemeName;
  /** The effective theme — always concrete (system value while following). */
  resolvedTheme: string;
  /** Derived from theme === 'system'; the follow state is controlled internally. */
  isFollowSystem: boolean;
  /** Palette axis name; undefined = the shipped default (attribute removed). */
  palette: string | undefined;
  /** Current segment; 'base' = no match (attribute removed). */
  breakpoint: BreakpointName;
  setTheme: (theme: ColoxThemeName) => void;
  setPalette: (palette: string | undefined) => void;
  setBreakpoints: (values: BreakpointOverrides) => void;
}

export interface ColoxThemeThemePartProps {
  /**
   * Theme axis value.
   * @default 'system'
   */
  name?: ColoxThemeName;
  /**
   * Fallback for the follow-system axis when matchMedia is unavailable.
   * @default 'light'
   */
  defaultTheme?: ColoxSystemThemeName;
}

export interface ColoxThemePalettePartProps {
  /**
   * Palette axis name — the output.name of a compiled colox.theme.json.
   * undefined = the shipped default.
   */
  name?: string;
}

export interface ColoxThemeBreakpointsPartProps {
  /** Threshold overrides; keys stay fixed, only values may differ. */
  values: BreakpointOverrides;
}

export interface ColoxThemeStoragePartProps {
  /**
   * The Storage part takes no props — mounting it is the switch.
   * children are forbidden to keep that intent unambiguous.
   */
  children?: never;
}

export interface ColoxThemeProps {
  children?: ReactNode;
}

export type ColoxThemePartKind = 'theme' | 'palette' | 'breakpoints' | 'storage';

export interface ColoxThemeThemeEntry {
  id: string;
  kind: 'theme';
  payload: { name: ColoxThemeName; defaultTheme: ColoxSystemThemeName };
}

export interface ColoxThemePaletteEntry {
  id: string;
  kind: 'palette';
  payload: { name: string | undefined };
}

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

export type ColoxThemeRegistryEntry =
  | ColoxThemeThemeEntry
  | ColoxThemePaletteEntry
  | ColoxThemeBreakpointsEntry
  | ColoxThemeStorageEntry;

/** Registry handle provided by the <ColoxTheme> root to its parts. */
export interface ColoxThemeRegistry {
  register: (entry: ColoxThemeRegistryEntry) => void;
  unregister: (id: string) => void;
}

/** The final config patch folded from the registry, applied to the store. */
export interface ColoxThemeConfigPatch {
  theme?: ColoxThemeName;
  defaultTheme?: ColoxSystemThemeName;
  palette?: string | undefined;
  breakpoints?: BreakpointOverrides;
  storage?: boolean;
}
