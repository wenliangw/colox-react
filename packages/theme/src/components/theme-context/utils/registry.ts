import type { ColoxThemeConfigPatch, ColoxThemeRegistryEntry } from '../types';

const PART_KINDS = ['storage', 'breakpoints'] as const;

/**
 * Folds the subcomponent entries into the final config patch. Same-kind
 * entries are last-write-wins (later registration wins); the two kinds
 * write orthogonal axes, so fold order does not matter.
 */
export function foldConfig(entries: ColoxThemeRegistryEntry[]): ColoxThemeConfigPatch {
  const patch: ColoxThemeConfigPatch = {};
  for (const kind of PART_KINDS) {
    const lastEntry = [...entries].reverse().find((entry) => entry.kind === kind);
    if (!lastEntry) continue;
    switch (lastEntry.kind) {
      case 'storage':
        patch.storage = lastEntry.payload.enabled;
        break;
      case 'breakpoints':
        patch.breakpoints = lastEntry.payload.values;
        break;
    }
  }
  return patch;
}
