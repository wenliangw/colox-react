/**
 * The footprint rounding axis. Circle is the default — an avatar reads
 * as a round portrait (the ecosystem convention: antd/MUI/Chakra all
 * default to the full circle); `rounded` is the form-family lg radius
 * and `square` has no radius at all. This breaks the family's
 * "square-by-default + explicit `rounded`" habit on purpose — the
 * avatar is a portrait, not a control (see the design-alignment
 * decision).
 */
export const avatarShapeStyles = {
  circle: 'colox-avatar--circle',
  rounded: 'colox-avatar--rounded',
  square: 'colox-avatar--square',
} as const;
