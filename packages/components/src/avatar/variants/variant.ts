/**
 * The surface strength axis of the text avatar (and of the failure
 * fallback). plain (default) is the quiet neutral portrait surface —
 * muted background, default text, palette-independent. subtle is the
 * palette tint fill, solid the full palette fill with inverse text,
 * outline a palette border on a transparent fill.
 */
export const avatarVariantStyles = {
  plain: 'colox-avatar--plain',
  subtle: 'colox-avatar--subtle',
  solid: 'colox-avatar--solid',
  outline: 'colox-avatar--outline',
} as const;
