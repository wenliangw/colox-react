import type { CSSProperties, ReactNode } from 'react';
import type { AutoCompleteFilterOption } from './component';

/**
 * The compiled suggestion row: the filter surface extended with the
 * row's own presentation. Self-contained on purpose — the cdk kernel
 * record must never leak into a public d.ts.
 */
export interface AutoCompleteOptionRecord extends AutoCompleteFilterOption {
  /** The stable row key: the member key, falling back to `value`. */
  key: string;
  /** The rich row render, falling back to `text`. */
  content: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/** The active-descendant resolver input. */
export interface ResolveActiveDescendantIdParams {
  open: boolean;
  activeIndex: number;
  listboxId: string;
}
