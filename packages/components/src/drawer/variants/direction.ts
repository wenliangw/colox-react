/**
 * The direction axis: the edge the panel slides from. `left`/`right`
 * anchor a vertical panel (full height, width from the size tier);
 * `top`/`bottom` anchor a horizontal one (full width, height from the
 * size tier).
 */
export const drawerDirectionStyles = {
  left: 'colox-drawer__panel--direction-left',
  right: 'colox-drawer__panel--direction-right',
  top: 'colox-drawer__panel--direction-top',
  bottom: 'colox-drawer__panel--direction-bottom',
} as const;
