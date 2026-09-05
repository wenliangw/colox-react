/**
 * Registry folding utility: turns the scattered declarations handed in by
 * the parts into the final config patch applied to the store.
 *
 * Multiple parts of the same kind are last-write-wins (later registration
 * wins); different kinds write their own orthogonal axes, order-independent.
 */
import { PART_KINDS } from '@/constants/theme';
import type { ColoxThemeConfigPatch, ColoxThemeRegistryEntry } from '@/context/types';

export function foldConfig(entries: ColoxThemeRegistryEntry[]): ColoxThemeConfigPatch {
  const patch: ColoxThemeConfigPatch = {};
  for (const kind of PART_KINDS) {
    const last = [...entries].reverse().find((entry) => entry.kind === kind);
    if (!last) continue;
    switch (last.kind) {
      case 'theme':
        patch.theme = last.payload.name;
        patch.defaultTheme = last.payload.defaultTheme;
        break;
      case 'palette':
        patch.palette = last.payload.name;
        break;
      case 'breakpoints':
        patch.breakpoints = last.payload.values;
        break;
      case 'storage':
        patch.storage = last.payload.enabled;
        break;
    }
  }
  return patch;
}
