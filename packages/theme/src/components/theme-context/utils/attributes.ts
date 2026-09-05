import {
  BASE_BREAKPOINT_NAME,
  BREAKPOINT_ATTRIBUTE,
  PALETTE_ATTRIBUTE,
  THEME_ATTRIBUTE,
} from '../constants/theme';
import { resolveTheme, type ThemeState } from './reducer';

/**
 * Writes the three axes from the state onto <html> — the single fact
 * source the theme CSS selectors read. Removing the attribute resets an
 * axis to its default.
 */
export function applyThemeAttributes(state: ThemeState) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute(THEME_ATTRIBUTE, resolveTheme(state));
  if (state.palette === undefined) root.removeAttribute(PALETTE_ATTRIBUTE);
  else root.setAttribute(PALETTE_ATTRIBUTE, state.palette);
  if (state.breakpoint === BASE_BREAKPOINT_NAME) root.removeAttribute(BREAKPOINT_ATTRIBUTE);
  else root.setAttribute(BREAKPOINT_ATTRIBUTE, state.breakpoint);
}
