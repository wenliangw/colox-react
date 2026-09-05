import {
  BASE_BREAKPOINT_NAME,
  BREAKPOINT_ATTRIBUTE,
  PALETTE_ATTRIBUTE,
  THEME_ATTRIBUTE,
} from '../constants/theme';
import { resolveTheme, type ThemeState } from '../reducers/theme';

/**
 * Writes the three axes from the state onto <html> — the single fact
 * source the theme CSS selectors read. The optional axes reset to their
 * default state first (attributes removed), then every deviation is
 * written conditionally; the theme itself has no default state and is
 * always written.
 */
export function applyThemeAttributes(state: ThemeState) {
  if (typeof document === 'undefined') {
    return;
  }
  const root = document.documentElement;
  root.removeAttribute(PALETTE_ATTRIBUTE);
  root.removeAttribute(BREAKPOINT_ATTRIBUTE);
  root.setAttribute(THEME_ATTRIBUTE, resolveTheme(state));
  if (state.palette !== undefined) {
    root.setAttribute(PALETTE_ATTRIBUTE, state.palette);
  }
  if (state.breakpoint !== BASE_BREAKPOINT_NAME) {
    root.setAttribute(BREAKPOINT_ATTRIBUTE, state.breakpoint);
  }
}
