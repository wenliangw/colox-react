import type { ReactNode } from 'react';

export interface ResolveSliderMarksParams {
  marks: Record<number, ReactNode>;
  min: number;
  max: number;
}

/**
 * A single tick mark: the slider value it marks, the computed left
 * offset (percentage string, ready for an inline style), the label
 * content (`null` renders a bare tick) and the edge snap hint for
 * label alignment at the strip ends.
 */
export interface SliderMarkItem {
  value: number;
  position: string;
  label: ReactNode;
  edge?: 'first' | 'last';
}
