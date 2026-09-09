/**
 * Inline-axis track distribution (justify-content). The six-word family
 * matches Stack's justify axis word set, so alignment vocabulary stays
 * uniform across layout components.
 */
export const gridJustifyStyles = {
  start: 'colox-grid--justify-start',
  center: 'colox-grid--justify-center',
  end: 'colox-grid--justify-end',
  between: 'colox-grid--justify-between',
  around: 'colox-grid--justify-around',
  evenly: 'colox-grid--justify-evenly',
} as const;
