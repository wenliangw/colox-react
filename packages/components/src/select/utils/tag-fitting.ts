/**
 * The tag-row fitting math: how many leading chips are fully visible
 * inside a single-line chip row before the tail folds into the +M
 * badge. Pure arithmetic — the DOM measurement (chip widths, row
 * width, badge width) happens in the consumer, jsdom can unit-test
 * the numbers directly.
 */
export function countFittingTags(
  chipWidths: number[],
  chipGap: number,
  containerWidth: number,
  badgeWidth: number,
): number {
  if (chipWidths.length === 0) {
    return 0;
  }

  // Optimistic pass: if every chip edge stays inside the row, nothing
  // folds and the badge never shows.
  let visible = chipWidths.length;
  let edge = 0;
  for (let i = 0; i < chipWidths.length; i += 1) {
    if (i > 0) {
      edge += chipGap;
    }
    edge += chipWidths[i];
    if (edge > containerWidth) {
      visible = i;
      break;
    }
  }
  if (visible === chipWidths.length) {
    return visible;
  }

  // Fold pass: the badge overlays the row's right end, so the last
  // visible chip has to end before the badge begins (one gap of
  // breathing room kept).
  const limit = containerWidth - badgeWidth - chipGap;
  let folded = 0;
  edge = 0;
  for (let i = 0; i < chipWidths.length; i += 1) {
    if (i > 0) {
      edge += chipGap;
    }
    edge += chipWidths[i];
    if (edge > limit) {
      break;
    }
    folded = i + 1;
  }
  return folded;
}
