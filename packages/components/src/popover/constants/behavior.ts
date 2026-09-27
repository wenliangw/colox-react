/**
 * The delay pair defaults (ms). The hover channel rides both edges —
 * `out` doubles as the pointer bridge: the panel is interactive, so a
 * pointer moving off the trigger into the panel must not close it;
 * the out-delay is that bridge (antd mouseLeaveDelay homologue). The
 * focus leg is always instant; the click and manual channels carry no
 * timers.
 */
export const POPOVER_DELAY = {
  IN: 300,
  OUT: 100,
} as const;

/**
 * The exit window (ms) handed to the cdk Popup: once `open` turns
 * false the panel stays mounted with the exiting class for this long
 * so the fade-out can play. The runtime mirror of
 * `--colox-motion-duration-fast` (the exit animation below uses the
 * same token — the two numbers must travel together).
 */
export const POPOVER_EXIT = 100;
