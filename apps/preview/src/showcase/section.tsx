import type { CSSProperties, ReactNode } from 'react';
import { Stack } from '@colox/react';

const titleStyle: CSSProperties = {
  fontSize: 'var(--colox-font-size-sm)',
  fontWeight: 'var(--colox-font-weight-semibold)',
  color: 'var(--colox-color-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
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
