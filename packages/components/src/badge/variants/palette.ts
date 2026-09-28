/**
 * Palette style maps — the six design-language families, shared by
 * every badge form. The class only sets the private palette
 * variables; base.scss holds the brand fallback so the paint
 * survives even without a palette class.
 */
export const badgePaletteStyles = {
  gray: 'colox-badge--gray',
  primary: 'colox-badge--primary',
  info: 'colox-badge--info',
  error: 'colox-badge--error',
  warning: 'colox-badge--warning',
  success: 'colox-badge--success',
} as const;
