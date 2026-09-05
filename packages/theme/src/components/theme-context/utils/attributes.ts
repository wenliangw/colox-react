import {
  BASE_BREAKPOINT_NAME,
  BREAKPOINT_ATTRIBUTE,
  PALETTE_ATTRIBUTE,
  THEME_ATTRIBUTE,
} from '../constants/theme';
import { resolveTheme, type ThemeState } from '../reducers/theme';

/**
 * Writes the three axes from the state onto <html> — the single fact
 * source the theme CSS selectors read. Each axis starts from its default
 * state (attribute removed) and the value is written only when the state
 * deviates.
 */
export function applyThemeAttributes(state: ThemeState) {
  if (typeof document === 'undefined') {
    return;
  }
  const root = document.documentElement;
  root.setAttribute(THEME_ATTRIBUTE, resolveTheme(state));
  root.removeAttribute(PALETTE_ATTRIBUTE);
  if (state.palette !== undefined) {
    root.setAttribute(PALETTE_ATTRIBUTE, state.palette);
  }
  root.removeAttribute(BREAKPOINT_ATTRIBUTE);
  if (state.breakpoint !== BASE_BREAKPOINT_NAME) {
    root.setAttribute(BREAKPOINT_ATTRIBUTE, state.breakpoint);
  }
}
