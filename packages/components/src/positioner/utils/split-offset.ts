import type { PositionerPlacement, SplitOffsetParams, SplitOffsetResult } from '../types';

/**
 * The edges each placement pins. `center` pins none — it sits on the
 * box centre rather than anchoring to an edge, so a bare offset key
 * has nothing to measure from (pair an object offset to nudge it).
 */
const PLACEMENT_EDGES: Record<PositionerPlacement, readonly (keyof SplitOffsetResult)[]> = {
  'top-start': ['top', 'start'],
  top: ['top'],
  'top-end': ['top', 'end'],
  start: ['start'],
  center: [],
  end: ['end'],
  'bottom-start': ['bottom', 'start'],
  bottom: ['bottom'],
  'bottom-end': ['bottom', 'end'],
};

const ALL_EDGES = ['top', 'bottom', 'start', 'end'] as const;

/**
 * Resolves the offset input into per-edge distances. A bare spacing key
 * means "this far from the edges the placement pins" (every edge when
 * the item has no placement); an object states each edge explicitly,
 * which also pins edges the placement left unanchored (CSS-faithful
 * stretch / two-edge anchoring).
 */
export function splitOffset({ offset, placement }: SplitOffsetParams): SplitOffsetResult {
  if (offset === undefined) {
    return {};
  }

  if (typeof offset === 'string') {
    const edges = placement === undefined ? ALL_EDGES : PLACEMENT_EDGES[placement];
    return Object.fromEntries(edges.map((edge) => [edge, offset])) as SplitOffsetResult;
  }

  return {
    top: offset.top,
    bottom: offset.bottom,
    start: offset.start,
    end: offset.end,
  };
}
