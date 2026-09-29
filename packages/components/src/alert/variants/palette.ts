/**
 * Palette style maps — the six design-language families. The class
 * only sets the private palette variables; base.scss holds the brand
 * fallback so the paint survives even without a palette class. The
 * default family follows the `type` (resolved in the component, not
 * here — the cva default is the neutral info family).
 */
export const alertPaletteStyles = {
  gray: 'colox-alert--gray',
  primary: 'colox-alert--primary',
  info: 'colox-alert--info',
  error: 'colox-alert--error',
  warning: 'colox-alert--warning',
  success: 'colox-alert--success',
} as const;
