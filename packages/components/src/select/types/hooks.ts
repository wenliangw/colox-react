import type { KeyboardEvent, MouseEvent, RefObject } from 'react';
import type { SelectChangePayload, SelectMode, SelectOptionRecord } from './component';

export type SelectChangeEvent = MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>;

export interface UseSelectParams {
  mode: SelectMode;
  value: string | string[] | undefined;
  defaultValue: string | string[] | undefined;
  open: boolean | undefined;
  defaultOpen: boolean | undefined;
  onChange: ((payload: SelectChangePayload) => void) | undefined;
  onOpenChange: ((open: boolean) => void) | undefined;
  onSearch: ((query: string) => void) | undefined;
}

export interface UseSelectResult {
  /** The resolved open state (controlled prop or inner state). */
  isOpen: boolean;
  /** Opens/closes; fires `onOpenChange` on every transition. */
  setOpen: (next: boolean) => void;
  /** Closes and resets the search query. */
  close: () => void;
  /** The current search query (empty while closed). */
  query: string;
  /** Sets the query and streams it through `onSearch`. */
  setQuery: (next: string) => void;
  /** The current selection: `''`/`string[]` resolved from control or state. */
  value: string | string[];
  /** Single mode: picks the selection (`next` replaces, '' = none). */
  select: (next: string, event: SelectChangeEvent, option?: SelectOptionRecord) => void;
  /** Multiple mode: toggles a member inside the selection array. */
  toggle: (member: string, event: SelectChangeEvent, option?: SelectOptionRecord) => void;
  /** Resets the selection to the mode's empty shape (clearable channel). */
  clear: (event: SelectChangeEvent) => void;
}

export interface UseTagFoldArgs {
  /** The selection in order — every chip participates in the fold. */
  values: readonly string[];
  /** The single-line chip row whose tail gets visually sliced. */
  rowRef: RefObject<HTMLDivElement | null>;
  /** The always-mounted +M count chip (hidden while nothing folds). */
  badgeRef: RefObject<HTMLSpanElement | null>;
}

export interface UseTagFoldResult {
  /** Chips with a lower index render in flow; the rest are sliced. */
  visibleCount: number;
}
