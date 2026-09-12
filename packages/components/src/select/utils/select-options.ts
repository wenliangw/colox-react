import type { SelectOption } from '../types';

export type SelectFilterFn = (query: string, option: SelectOption) => boolean;

export const selectOptionLabel = (option: SelectOption): string => String(option.label);

/** The default matcher: case-insensitive substring over the label and value. */
export const defaultSelectFilter: SelectFilterFn = (query, option) => {
  const needle = query.trim().toLowerCase();
  if (needle.length === 0) {
    return true;
  }
  return (
    selectOptionLabel(option).toLowerCase().includes(needle) ||
    option.value.toLowerCase().includes(needle)
  );
};

/**
 * The visible option list: everything while the query is empty,
 * otherwise the local filter (default matcher or the consumer's
 * `filterOption`). Runs only in search mode.
 */
export function filterSelectOptions(
  options: readonly SelectOption[],
  query: string,
  filterOption?: SelectFilterFn,
): SelectOption[] {
  if (query.length === 0) {
    return [...options];
  }
  const matches = filterOption ?? defaultSelectFilter;
  return options.filter((option) => matches(query, option));
}

/** The option a single-mode value maps back to (undefined when unset/unknown). */
export function findSelectOption(
  options: readonly SelectOption[],
  value: string | undefined,
): SelectOption | undefined {
  if (value === undefined) {
    return undefined;
  }
  return options.find((option) => option.value === value);
}
