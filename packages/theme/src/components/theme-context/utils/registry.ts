import type { ColoxThemeConfigPatch, ColoxThemeRegistryEntry } from '../types';

/**
 * Folds the subcomponent entries into the final config patch. The axes
 * are orthogonal and same-kind entries overwrite in source order, so a
 * single pass is last-write-wins by construction.
 */
export function foldConfig(entries: ColoxThemeRegistryEntry[]): ColoxThemeConfigPatch {
  const patch: ColoxThemeConfigPatch = {};
  for (const entry of entries) {
    if (entry.kind === 'storage') {
      patch.storage = entry.payload.enabled;
      continue;
    }
    patch.breakpoints = entry.payload.values;
  }
  return patch;
}
