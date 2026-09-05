/**
 * Parts-only hook: returns the registry handle for handing declarations to
 * the <ColoxTheme> root. Parts must live under <ColoxTheme>; outside one
 * the part is ignored (the store itself is unaffected).
 */
import { useContext } from 'react';
import { ColoxThemeContext } from '@/context/context';
import type { ColoxThemeRegistry } from '@/context/types';

const inertRegistry: ColoxThemeRegistry = {
  register: () => undefined,
  unregister: () => undefined,
};

export function useColoxThemeRegistry(): ColoxThemeRegistry {
  const registry = useContext(ColoxThemeContext);
  if (registry === null) {
    console.warn('[ColoxTheme] parts must be children of <ColoxTheme>; this part is ignored.');
    return inertRegistry;
  }
  return registry;
}
