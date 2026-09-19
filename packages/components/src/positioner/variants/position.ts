/**
 * How the positioned box resolves its reference. The words are the CSS
 * `position` keywords verbatim — the component owns that property, so it
 * speaks it directly. `relative` is not here: the reference frame is its
 * own component (`Anchor`).
 */
export const positionerPositionStyles = {
  absolute: 'colox-positioner--position-absolute',
  fixed: 'colox-positioner--position-fixed',
} as const;
