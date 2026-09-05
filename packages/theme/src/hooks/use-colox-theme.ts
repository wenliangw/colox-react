/**
 * The ColoxTheme React subscription surface: the hook's value comes entirely
 * from the global store (useSyncExternalStore), so it works without any
 * provider — the no-provider degradation is guaranteed by the singleton
 * structure, not by a special case.
 */
import { useSyncExternalStore } from 'react';
import type { ColoxThemeValue } from '@/context/types';
import {
  getColoxThemeServerSnapshot,
  getColoxThemeSnapshot,
  subscribeColoxTheme,
} from '@/stores/theme-store';

export const useColoxTheme = (): ColoxThemeValue =>
  useSyncExternalStore(subscribeColoxTheme, getColoxThemeSnapshot, getColoxThemeServerSnapshot);
