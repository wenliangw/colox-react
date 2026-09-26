import type { Placement } from '@floating-ui/dom';

const oppositeSides = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
} as const;

type PlacementSide = keyof typeof oppositeSides;

/**
 * The tooltip flip chain: the opposite side first, then its two
 * alignments — a `top*` preference flips below before anything else.
 */
export function resolveTooltipFallbackPlacements(placement: Placement): Placement[] {
  const side = placement.split('-')[0] as PlacementSide;
  const opposite = oppositeSides[side];
  return [opposite, `${opposite}-start`, `${opposite}-end`];
}
