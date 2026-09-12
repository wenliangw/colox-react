import { useCallback, useState } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';
import type { SelectChangePayload, SelectMode, SelectOption } from '../types';

export type SelectChangeEvent = MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>;

export interface UseSelectParams {
  mode: SelectMode;
  value: string | string[] | undefined;
  defaultValue: string | string[] | undefined;
  onChange: ((payload: SelectChangePayload) => void) | undefined;
  open: boolean | undefined;
  defaultOpen: boolean | undefined;
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
  select: (next: string, event: SelectChangeEvent, option?: SelectOption) => void;
  /** Multiple mode: toggles a member inside the selection array. */
  toggle: (member: string, event: SelectChangeEvent, option?: SelectOption) => void;
  /** Resets the selection to the mode's empty shape (clearable channel). */
  clear: (event: SelectChangeEvent) => void;
}

/**
 * The selection + open state behind Select: symmetric control (value /
 * defaultValue, open / defaultOpen), a query stream, and the three
 * change channels (select / toggle / clear) that publish the
 * `{ event, value, option }` payload.
 */
export function useSelect({
  mode,
  value,
  defaultValue,
  onChange,
  open,
  defaultOpen,
  onOpenChange,
  onSearch,
}: UseSelectParams): UseSelectResult {
  const isMultiple = mode === 'multiple';

  const [innerOpen, setInnerOpen] = useState<boolean>(defaultOpen ?? false);
  const [query, setQueryState] = useState<string>('');
  const [innerSingle, setInnerSingle] = useState<string>(() =>
    typeof defaultValue === 'string' ? defaultValue : '',
  );
  const [innerMultiple, setInnerMultiple] = useState<string[]>(() =>
    Array.isArray(defaultValue) ? [...defaultValue] : [],
  );

  const current: string | string[] = isMultiple
    ? Array.isArray(value)
      ? value
      : innerMultiple
    : typeof value === 'string'
      ? value
      : innerSingle;

  const setOpen = useCallback(
    (next: boolean) => {
      if (open === undefined) {
        setInnerOpen(next);
      }
      onOpenChange?.(next);
    },
    [open, onOpenChange],
  );

  const close = useCallback(() => {
    setOpen(false);
    setQueryState('');
  }, [setOpen]);

  const setQuery = useCallback(
    (next: string) => {
      setQueryState(next);
      onSearch?.(next);
    },
    [onSearch],
  );

  const commit = useCallback(
    (next: string | string[], event: SelectChangeEvent, option?: SelectOption) => {
      if (isMultiple) {
        const nextArray = next as string[];
        if (value === undefined) {
          setInnerMultiple(nextArray);
        }
      } else {
        const nextValue = next as string;
        if (value === undefined) {
          setInnerSingle(nextValue);
        }
      }
      onChange?.({ event, value: next, option });
    },
    [isMultiple, value, onChange],
  );

  const select = useCallback(
    (next: string, event: SelectChangeEvent, option?: SelectOption) => {
      commit(next, event, option);
    },
    [commit],
  );

  const toggle = useCallback(
    (member: string, event: SelectChangeEvent, option?: SelectOption) => {
      const members = current as string[];
      const next = members.includes(member)
        ? members.filter((candidate) => candidate !== member)
        : [...members, member];
      commit(next, event, option);
    },
    [current, commit],
  );

  const clear = useCallback(
    (event: SelectChangeEvent) => {
      commit(isMultiple ? [] : '', event);
    },
    [commit, isMultiple],
  );

  return {
    isOpen: open ?? innerOpen,
    setOpen,
    close,
    query,
    setQuery,
    value: current,
    select,
    toggle,
    clear,
  };
}
