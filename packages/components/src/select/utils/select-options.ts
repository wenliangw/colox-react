import { isValidElement } from 'react';
import type { ReactNode } from 'react';
import { SelectOption } from '../children/option';
import type { SelectFilterFn, SelectOptionRecord, SelectOptionProps, SelectSize } from '../types';

/** The default matcher: case-insensitive substring over the text and value. */
export const defaultSelectFilter: SelectFilterFn = (query, option) => {
  const needle = query.trim().toLowerCase();
  if (needle.length === 0) {
    return true;
  }
  return option.text.toLowerCase().includes(needle) || option.value.toLowerCase().includes(needle);
};

/**
 * Compiles the Select.Option members into option records: a pure
 * structural walk over the children subtree — fragments, arrays and
 * pass-through wrappers are descended (members passed as children stay
 * reachable), while a component that creates members internally is not
 * visible — the member never renders itself, its element props are the
 * data (same boundary as rc-select). The member's own `size` wins, the
 * parent's tier follows; the member key falls back to `value`.
 */
export function compileSelectOptions(
  children: ReactNode,
  fallbackSize: SelectSize,
): SelectOptionRecord[] {
  const records: SelectOptionRecord[] = [];

  const visit = (node: ReactNode): void => {
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (!isValidElement(node)) {
      return;
    }
    if (node.type === SelectOption) {
      const member = node.props as SelectOptionProps;
      records.push({
        value: member.value,
        text: member.text,
        disabled: member.disabled ?? false,
        size: member.size ?? fallbackSize,
        key: node.key ?? member.value,
        content: member.children ?? member.text,
        className: member.className,
        style: member.style,
      });
      return;
    }
    // Fragments and pass-through wrappers: their children stay
    // structurally reachable. A component that creates members
    // internally is not visible — the member never renders itself.
    visit((node.props as { children?: ReactNode }).children);
  };

  visit(children);
  return records;
}

/**
 * The visible option list: everything while the query is empty,
 * otherwise the local filter (default matcher or the consumer's
 * `filterOption`). Runs only in search mode.
 */
export function filterSelectOptions(
  options: readonly SelectOptionRecord[],
  query: string,
  filterOption?: SelectFilterFn,
): SelectOptionRecord[] {
  if (query.length === 0) {
    return [...options];
  }
  const matches = filterOption ?? defaultSelectFilter;
  return options.filter((option) => matches(query, option));
}

/** The record a single-mode value maps back to (undefined when unset/unknown). */
export function findSelectOption(
  options: readonly SelectOptionRecord[],
  value: string | undefined,
): SelectOptionRecord | undefined {
  if (value === undefined) {
    return undefined;
  }
  return options.find((option) => option.value === value);
}
