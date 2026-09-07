/**
 * Max-width cap axis. The keys are the recognized size words, and each
 * cap IS a large-dimension design token (`--colox-size-*`, see
 * styles/index.scss): sm/md/lg/xl = 640/768/1024/1280px. No `size` prop
 * renders no modifier — the CSS-faithful default of no cap.
 */
export const containerSizeStyles = {
  sm: 'colox-container--size-sm',
  md: 'colox-container--size-md',
  lg: 'colox-container--size-lg',
  xl: 'colox-container--size-xl',
} as const;
