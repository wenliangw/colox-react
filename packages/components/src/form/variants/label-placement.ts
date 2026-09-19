/**
 * The label placement axis: `'top'` stacks (the field is a column Stack)
 * and `'start'` becomes a row whose label slot keeps the fixed width.
 * Both words are logical — start mirrors under RTL, top does not.
 */
export const formLabelPlacementStyles = {
  top: 'colox-form-field--top',
  start: 'colox-form-field--start',
} as const;
