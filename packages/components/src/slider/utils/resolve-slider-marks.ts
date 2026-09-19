import type { ResolveSliderMarksParams, SliderMarkItem } from '../types';

/**
 * Flattens the marks record into positioned tick items: each value
 * becomes a left offset on the [min, max] span (a percentage string
 * ready for an inline style), the labels pass through untouched and
 * the first/last items get their edge snap hint so their labels align
 * inside the strip instead of overflowing its ends.
 */
export function resolveSliderMarks({
  marks,
  min,
  max,
}: ResolveSliderMarksParams): SliderMarkItem[] {
  const span = max - min;
  const items = Object.entries(marks)
    .filter(([key]) => key !== '' && Number.isFinite(Number(key)))
    .map(([key, label]): SliderMarkItem => {
      const value = Number(key);
      const percent = span <= 0 ? 0 : ((value - min) / span) * 100;
      return { value, label, position: `${percent}%` };
    })
    .sort((a, b) => a.value - b.value);

  if (items.length > 1) {
    const first = items[0];
    const last = items[items.length - 1];
    if (first) {
      first.edge = 'first';
    }
    if (last) {
      last.edge = 'last';
    }
  }
  return items;
}
