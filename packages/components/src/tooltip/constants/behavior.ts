/**
 * The hover-channel delay defaults (ms). The focus channel is always
 * instant — only the pointer edges ride these.
 */
export const TOOLTIP_DELAY = {
  IN: 300,
  OUT: 0,
} as const;

/**
 * The exit window (ms) handed to the cdk Popup: once `open` turns
 * false the panel stays mounted with the exiting class for this long
 * so the fade-out plays. The runtime mirror of
 * `--colox-motion-duration-fast` (the exit animation uses the same
 * token — the two numbers travel together).
 */
export const TOOLTIP_EXIT = 100;
