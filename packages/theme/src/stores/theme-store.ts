/**
 * The ColoxTheme global store: the single source of truth for the theme /
 * palette / breakpoint axes.
 *
 * State is written to the data-colox-* attributes on <html> (CSS selectors
 * read the same place); the React side (useColoxTheme / parts) is only a
 * subscriber and config entry point into this store. The store is a
 * module-level singleton (one per JS realm, naturally matching one
 * document) and is SSR-safe: all browser APIs are wired lazily inside
 * subscribe (the commit phase) — the pure render path never touches
 * window/document, so there are no side effects before first interactivity
 * or commit.
 *
 * The no-provider degradation is a byproduct of this singleton:
 * useColoxTheme does not depend on React Context, and reads the same state
 * from anywhere.
 */
import {
  BASE_BREAKPOINT_NAME,
  BREAKPOINT_ATTRIBUTE,
  BREAKPOINT_KEYS,
  COLOR_SCHEME_QUERY,
  DARK_THEME_NAME,
  LIGHT_THEME_NAME,
  PALETTE_ATTRIBUTE,
  PALETTE_STORAGE_KEY,
  SYSTEM_THEME_NAME,
  THEME_ATTRIBUTE,
  THEME_STORAGE_KEY,
} from '@/constants/theme';
import type {
  BreakpointKey,
  BreakpointName,
  BreakpointOverrides,
  ColoxSystemThemeName,
  ColoxThemeConfigPatch,
  ColoxThemeName,
  ColoxThemeValue,
} from '@/context/types';
import { defaultBreakpoints } from '@/styles/tokens/breakpoints';

type Listener = () => void;

interface StoreState {
  theme: ColoxThemeName;
  palette: string | undefined;
  breakpoint: BreakpointName;
  systemTheme: ColoxSystemThemeName;
}

let state: StoreState = {
  theme: SYSTEM_THEME_NAME,
  palette: undefined,
  breakpoint: BASE_BREAKPOINT_NAME,
  systemTheme: LIGHT_THEME_NAME,
};
let defaultTheme: ColoxSystemThemeName = LIGHT_THEME_NAME;
let breakpointValues: Record<BreakpointKey, string> = { ...defaultBreakpoints };
let storageEnabled = false;
let wired = false;
let themeQuery: MediaQueryList | null = null;
let breakpointQueries: MediaQueryList[] = [];
const listeners = new Set<Listener>();
let snapshot: ColoxThemeValue = buildSnapshot();

function resolvedTheme(): string {
  return state.theme === SYSTEM_THEME_NAME ? state.systemTheme : state.theme;
}

function buildSnapshot(): ColoxThemeValue {
  return {
    theme: state.theme,
    resolvedTheme: resolvedTheme(),
    isFollowSystem: state.theme === SYSTEM_THEME_NAME,
    palette: state.palette,
    breakpoint: state.breakpoint,
    setTheme: setColoxTheme,
    setPalette: setColoxPalette,
    setBreakpoints: setColoxBreakpoints,
  };
}

function emit() {
  snapshot = buildSnapshot();
  for (const listener of listeners) listener();
}

function applyAttributes() {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute(THEME_ATTRIBUTE, resolvedTheme());
  if (state.palette === undefined) root.removeAttribute(PALETTE_ATTRIBUTE);
  else root.setAttribute(PALETTE_ATTRIBUTE, state.palette);
  if (state.breakpoint === BASE_BREAKPOINT_NAME) root.removeAttribute(BREAKPOINT_ATTRIBUTE);
  else root.setAttribute(BREAKPOINT_ATTRIBUTE, state.breakpoint);
}

function onSystemChange(event: MediaQueryListEvent) {
  state = { ...state, systemTheme: event.matches ? DARK_THEME_NAME : LIGHT_THEME_NAME };
  applyAttributes();
  emit();
}

function computeBreakpoint(): BreakpointName {
  for (let i = 0; i < BREAKPOINT_KEYS.length; i += 1) {
    if (breakpointQueries[i].matches) return BREAKPOINT_KEYS[i];
  }
  return BASE_BREAKPOINT_NAME;
}

function onBreakpointChange() {
  const next = computeBreakpoint();
  if (next === state.breakpoint) return;
  state = { ...state, breakpoint: next };
  applyAttributes();
  emit();
}

function rebindBreakpointQueries() {
  for (const mql of breakpointQueries) mql.removeEventListener('change', onBreakpointChange);
  breakpointQueries = BREAKPOINT_KEYS.map((key) =>
    window.matchMedia(`(max-width: ${breakpointValues[key]})`),
  );
  for (const mql of breakpointQueries) mql.addEventListener('change', onBreakpointChange);
  state = { ...state, breakpoint: computeBreakpoint() };
}

/** Lazy wiring: once per realm (idempotent), triggered from the subscribe commit phase. */
function wire() {
  if (wired) return;
  wired = true;
  if (typeof window === 'undefined') return;
  if (typeof window.matchMedia === 'function') {
    state = {
      ...state,
      systemTheme: window.matchMedia(COLOR_SCHEME_QUERY).matches
        ? DARK_THEME_NAME
        : LIGHT_THEME_NAME,
    };
    themeQuery = window.matchMedia(COLOR_SCHEME_QUERY);
    themeQuery.addEventListener('change', onSystemChange);
    rebindBreakpointQueries();
  } else {
    state = { ...state, systemTheme: defaultTheme };
  }
  applyAttributes();
  emit();
}

/* ---------------------------------------------------------------- */
/* Config entry points (parts / advanced consumers)                  */
/* ---------------------------------------------------------------- */

export function setColoxTheme(theme: ColoxThemeName) {
  if (theme === state.theme) return;
  state = { ...state, theme };
  applyAttributes();
  persist();
  emit();
}

export function setColoxPalette(palette: string | undefined) {
  if (palette === state.palette) return;
  state = { ...state, palette };
  applyAttributes();
  persist();
  emit();
}

export function setColoxBreakpoints(values: BreakpointOverrides) {
  breakpointValues = { ...defaultBreakpoints, ...values };
  if (!wired) return;
  if (typeof window.matchMedia !== 'function') return;
  const before = state.breakpoint;
  rebindBreakpointQueries();
  applyAttributes();
  if (state.breakpoint !== before) emit();
}

export function setColoxDefaultTheme(value: ColoxSystemThemeName) {
  defaultTheme = value;
  // The fallback only enters the state when the system sensor is unavailable;
  // with a sensor present it is just the SSR snapshot convention.
  if (wired && typeof window.matchMedia !== 'function') {
    state = { ...state, systemTheme: value };
    applyAttributes();
    emit();
  }
}

export function setColoxStorageEnabled(enabled: boolean) {
  if (storageEnabled === enabled) return;
  storageEnabled = enabled;
  // Applied as the last fold step: restored values beat part declarations
  // (storage > part > default).
  if (enabled) restoreFromStorage();
}

function restoreFromStorage() {
  if (typeof window === 'undefined' || !storageEnabled) return;
  let changed = false;
  try {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    const savedPalette = window.localStorage.getItem(PALETTE_STORAGE_KEY);
    if (savedTheme !== null && savedTheme !== state.theme) {
      state = { ...state, theme: savedTheme as ColoxThemeName };
      changed = true;
    }
    if (savedPalette !== null) {
      const palette = savedPalette === '' ? undefined : savedPalette;
      if (palette !== state.palette) {
        state = { ...state, palette };
        changed = true;
      }
    }
  } catch {
    // Storage unavailable (private mode etc.): degrade silently to part/defaults.
  }
  if (changed) {
    applyAttributes();
    emit();
  }
}

function persist() {
  if (typeof window === 'undefined' || !storageEnabled) return;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, state.theme);
    if (state.palette === undefined) window.localStorage.removeItem(PALETTE_STORAGE_KEY);
    else window.localStorage.setItem(PALETTE_STORAGE_KEY, state.palette);
  } catch {
    // Storage unavailable: skip, the in-memory state is unaffected.
  }
}

/** The unified config application entry point for the folded parts. */
export function applyColoxConfig(patch: ColoxThemeConfigPatch) {
  wire();
  if (patch.theme !== undefined) setColoxTheme(patch.theme);
  if (patch.defaultTheme !== undefined) setColoxDefaultTheme(patch.defaultTheme);
  if (patch.palette !== undefined) setColoxPalette(patch.palette);
  if (patch.breakpoints !== undefined) setColoxBreakpoints(patch.breakpoints);
  if (patch.storage !== undefined) setColoxStorageEnabled(patch.storage);
}

/* ---------------------------------------------------------------- */
/* Subscription surface (useSyncExternalStore)                       */
/* ---------------------------------------------------------------- */

export function subscribeColoxTheme(listener: Listener): () => void {
  const first = listeners.size === 0;
  listeners.add(listener);
  // React calls subscribe in the commit phase, where wiring is safe
  // (attributes are in place before the first paint).
  if (first) wire();
  return () => {
    listeners.delete(listener);
  };
}

export function getColoxThemeSnapshot(): ColoxThemeValue {
  return snapshot;
}

const serverSnapshot: ColoxThemeValue = {
  theme: SYSTEM_THEME_NAME,
  resolvedTheme: LIGHT_THEME_NAME,
  isFollowSystem: true,
  palette: undefined,
  breakpoint: BASE_BREAKPOINT_NAME,
  setTheme: setColoxTheme,
  setPalette: setColoxPalette,
  setBreakpoints: setColoxBreakpoints,
};

export function getColoxThemeServerSnapshot(): ColoxThemeValue {
  return serverSnapshot;
}

/** Test-only: resets the singleton state (not exported from index — stays out of published types). */
export function _resetColoxThemeStateForTests() {
  state = {
    theme: SYSTEM_THEME_NAME,
    palette: undefined,
    breakpoint: BASE_BREAKPOINT_NAME,
    systemTheme: LIGHT_THEME_NAME,
  };
  defaultTheme = LIGHT_THEME_NAME;
  breakpointValues = { ...defaultBreakpoints };
  storageEnabled = false;
  wired = false;
  themeQuery = null;
  breakpointQueries = [];
  listeners.clear();
  snapshot = buildSnapshot();
  if (typeof document !== 'undefined') {
    for (const name of [THEME_ATTRIBUTE, PALETTE_ATTRIBUTE, BREAKPOINT_ATTRIBUTE]) {
      document.documentElement.removeAttribute(name);
    }
  }
}
