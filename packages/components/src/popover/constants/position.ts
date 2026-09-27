/**
 * The floating gaps between the panel and the trigger. Numbers are
 * the runtime mirrors of the css spacing ladder — the cdk gap option
 * reads px, not a var(): WITH_ARROW = --colox-spacing-2 (8px, the
 * arrow tip needs the room), WITHOUT_ARROW = --colox-spacing-1-5
 * (6px, the panel floats closer without the pointer).
 */
export const POPOVER_GAP = {
  WITH_ARROW: 8,
  WITHOUT_ARROW: 6,
} as const;
