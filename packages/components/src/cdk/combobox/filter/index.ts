import type { ComboboxFilterFn, ComboboxOption } from '../types';

/**
 * The default matcher: case-insensitive substring over the text and
 * the value (value-completion is the point of the combobox — an ID
 * whose label never spells the typed prefix still matches).
 */
export const defaultComboboxFilter: ComboboxFilterFn = (query, option) => {
  const needle = query.trim().toLowerCase();
  if (needle.length === 0) {
    return true;
  }
  return option.text.toLowerCase().includes(needle) || option.value.toLowerCase().includes(needle);
};

/**
 * The visible option list: everything while the query is empty,
 * otherwise the consumer's matcher or the default substring filter.
 */
export function filterComboboxOptions<T extends ComboboxOption>(
  options: readonly T[],
  query: string,
  filter?: ComboboxFilterFn,
): T[] {
  if (query.length === 0) {
    return [...options];
  }
  const matches = filter ?? defaultComboboxFilter;
  return options.filter((option) => matches(query, option));
}
