/**
 * Inline-axis placement of the constrained box, in the box-alignment
 * vocabulary (same words as CSS `align-self` and Stack's align axis).
 * Centered is the shell semantic (the container definition); `start`
 * renders the block's own default margins as an explicit opt-out;
 * `end` pins the box to the inline end.
 */
export const containerAlignStyles = {
  center: 'colox-container--align-center',
  start: 'colox-container--align-start',
  end: 'colox-container--align-end',
} as const;
