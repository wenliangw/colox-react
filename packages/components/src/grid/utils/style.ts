import type { CSSProperties } from 'react';

/**
 * Style assembly for the grid custom-property channel: the resolved
 * column count rides `--colox-grid-columns` into the single template
 * rule — arbitrary counts stay class-free. Incoming style is spread
 * last, so consumers keep the override.
 */
export function withColumnsVariable(
  style: CSSProperties | undefined,
  columns: number | undefined,
): CSSProperties | undefined {
  if (columns === undefined) {
    return style;
  }
  const variable = { '--colox-grid-columns': columns } as CSSProperties;
  return style === undefined ? variable : { ...variable, ...style };
}

/**
 * Style assembly for the span custom property
 * (`--colox-grid-item-span: span N`). Same contract: incoming style
 * wins.
 */
export function withSpanVariable(
  style: CSSProperties | undefined,
  span: number | undefined,
): CSSProperties | undefined {
  if (span === undefined) {
    return style;
  }
  const variable = { '--colox-grid-item-span': `span ${span}` } as CSSProperties;
  return style === undefined ? variable : { ...variable, ...style };
}
