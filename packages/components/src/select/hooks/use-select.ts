import { useCallback, useState } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';
import type { SelectChangePayload, SelectMode, SelectOptionRecord } from '../types';

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

/**
 * The selection truth: the controlled prop when supplied (the prop is
 * the contract), the seeded inner state otherwise.
 */
const resolveCurrent = (
  isMultiple: boolean,
  value: string | string[] | undefined,
  innerMultiple: string[],
  innerSingle: string,
): string | string[] => {
  if (isMultiple) {
    return Array.isArray(value) ? value : innerMultiple;
  }
  return typeof value === 'string' ? value : innerSingle;
};

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
  open,
  defaultOpen,
  onChange,
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

  const current = resolveCurrent(isMultiple, value, innerMultiple, innerSingle);

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

  // Writes the uncontrolled selection: the state slot follows the value
  // shape, the controlled select never writes (the prop is the truth).
  const writeUncontrolled = useCallback((next: string | string[]) => {
    if (typeof next === 'string') {
      setInnerSingle(next);
      return;
    }
    setInnerMultiple(next);
  }, []);

  const commit = useCallback(
    (next: string | string[], event: SelectChangeEvent, option?: SelectOptionRecord) => {
      if (value === undefined) {
        writeUncontrolled(next);
      }
      onChange?.({ event, value: next, option });
    },
    [value, writeUncontrolled, onChange],
  );

  const select = useCallback(
    (next: string, event: SelectChangeEvent, option?: SelectOptionRecord) => {
      commit(next, event, option);
    },
    [commit],
  );

  const toggle = useCallback(
    (member: string, event: SelectChangeEvent, option?: SelectOptionRecord) => {
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
