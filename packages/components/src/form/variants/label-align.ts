/**
 * The label text alignment inside the start-placement label column:
 * `'start'` leads (the natural flow), `'end'` trails against the
 * control, `'justify'` spreads the line across the whole column width —
 * the two-to-four character Chinese label trick, which needs
 * `text-align-last` because a single-line label is all "last line".
 */
export const formLabelAlignStyles = {
  start: 'colox-form-field--label-align-start',
  end: 'colox-form-field--label-align-end',
  justify: 'colox-form-field--label-align-justify',
} as const;
