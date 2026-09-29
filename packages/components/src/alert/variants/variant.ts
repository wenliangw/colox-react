/**
 * Variant style maps — the surface strength over the private palette
 * variables. subtle (default) is the palette tint — an inline status
 * block reads as a tinted block, unlike a transient pill's neutral
 * plain; solid the full fill, outline a ring, plain the quiet neutral
 * surface (palette-independent).
 */
export const alertVariantStyles = {
  plain: 'colox-alert--plain',
  subtle: 'colox-alert--subtle',
  solid: 'colox-alert--solid',
  outline: 'colox-alert--outline',
} as const;
