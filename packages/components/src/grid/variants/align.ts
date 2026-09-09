/**
 * Block-axis track distribution (align-content). The start/center/end
 * box-alignment words mirror the library's alignment families; stretch
 * is the CSS-faithful behavior word. Baseline is omitted — baseline
 * track alignment is not a track-layout idiom.
 */
export const gridAlignStyles = {
  start: 'colox-grid--align-start',
  center: 'colox-grid--align-center',
  end: 'colox-grid--align-end',
  stretch: 'colox-grid--align-stretch',
} as const;
