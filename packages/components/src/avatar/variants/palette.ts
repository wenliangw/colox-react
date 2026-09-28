/**
 * The semantic palette axis — the six design-language families, mapped
 * onto the private avatar palette variables by palette.scss. Only the
 * colored variants (subtle/solid/outline) read it; plain speaks at the
 * muted volume regardless of palette.
 */
export const avatarPaletteStyles = {
  gray: 'colox-avatar--gray',
  primary: 'colox-avatar--primary',
  info: 'colox-avatar--info',
  error: 'colox-avatar--error',
  warning: 'colox-avatar--warning',
  success: 'colox-avatar--success',
} as const;
