import { useSyncExternalStore } from 'react';
import type { ColoxThemeValue } from '../types';
import {
  getColoxThemeServerSnapshot,
  getColoxThemeSnapshot,
  subscribeColoxTheme,
} from '../stores/theme-store';

/**
 * Subscribes to the live theme snapshot (the three axes plus the
 * imperative setters). React binds to the store through
 * useSyncExternalStore.
 */
export const useColoxTheme = (): ColoxThemeValue =>
  useSyncExternalStore(subscribeColoxTheme, getColoxThemeSnapshot, getColoxThemeServerSnapshot);
