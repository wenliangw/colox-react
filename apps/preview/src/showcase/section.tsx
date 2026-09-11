import type { CSSProperties, ReactNode } from 'react';
import { Stack } from '@colox/react';

const titleStyle: CSSProperties = {
  fontSize: 'var(--colox-font-size-sm)',
  fontWeight: 'var(--colox-font-weight-semibold)',
  color: 'var(--colox-color-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};

const hintStyle: CSSProperties = {
  fontSize: 'var(--colox-font-size-sm)',
  color: 'var(--colox-color-text-muted)',
};

/**
 * A labelled exhibit block used by the per-component Overview stories:
 * a muted caption over a column of state demos. Rows stretch to the
 * section width; demo rows cap their own width via style when needed.
 */
export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Stack direction="column" gap="2">
      <span style={titleStyle}>{title}</span>
      {children}
    </Stack>
  );
}

/**
 * A visible dashed frame around a layout demo: it draws the "available
 * width" the demo works against, so capped/centered wrappers and flex
 * tracks can be seen for what they are.
 */
export const track: CSSProperties = {
  border: '1px dashed var(--colox-color-border-muted)',
  borderRadius: 'var(--colox-radius-sm)',
  padding: 'var(--colox-spacing-2)',
};

/** Bounds a demo row to a fixed reading width (cap shrinks on narrow canvases). */
export const bound = (width = 480): CSSProperties => ({
  width: `min(${width}px, 100%)`,
});

/** A small muted note under a section, when the exhibit shows a scale partially. */
export function Hint({ children }: { children: ReactNode }) {
  return <span style={hintStyle}>{children}</span>;
}
