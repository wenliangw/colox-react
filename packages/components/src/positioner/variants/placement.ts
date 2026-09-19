/**
 * Where a positioned box is pinned: the nine anchors — corners, edge
 * middles and the centre. The block axis keeps the physical
 * top/bottom words (they never mirror); the inline axis uses the
 * logical start/end words, so the same placement mirrors correctly in
 * RTL. `fill` is not here — it is its own boolean (the cover preset).
 */
export const positionerPlacementStyles = {
  'top-start': 'colox-positioner--placement-top-start',
  top: 'colox-positioner--placement-top',
  'top-end': 'colox-positioner--placement-top-end',
  start: 'colox-positioner--placement-start',
  center: 'colox-positioner--placement-center',
  end: 'colox-positioner--placement-end',
  'bottom-start': 'colox-positioner--placement-bottom-start',
  bottom: 'colox-positioner--placement-bottom',
  'bottom-end': 'colox-positioner--placement-bottom-end',
} as const;
