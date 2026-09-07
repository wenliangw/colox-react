/**
 * Max-width cap axis. The keys are the breakpoint words, and each cap IS
 * the same-named breakpoint floor (`--colox-breakpoint-*`, see
 * styles/index.scss): a size-sm container never exceeds the sm band.
 * `fluid` (the default) applies no cap — the block fills its parent.
 */
export const containerSizeStyles = {
  sm: 'colox-container--size-sm',
  md: 'colox-container--size-md',
  lg: 'colox-container--size-lg',
  xl: 'colox-container--size-xl',
  fluid: 'colox-container--size-fluid',
} as const;
