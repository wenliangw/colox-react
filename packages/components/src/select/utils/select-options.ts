import { isValidElement } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { SelectOption } from '../children/option';
import { SelectTemplate } from '../children/template';
import type {
  SelectFilterFn,
  SelectOptionProps,
  SelectOptionRecord,
  SelectSize,
  SelectTemplateProps,
} from '../types';

/** The default matcher: case-insensitive substring over the text and value. */
export const defaultSelectFilter: SelectFilterFn = (query, option) => {
  const needle = query.trim().toLowerCase();
  if (needle.length === 0) {
    return true;
  }
  return option.text.toLowerCase().includes(needle) || option.value.toLowerCase().includes(needle);
};

/**
 * The shared compile traversal: one walk rules every leaf discovery —
 * fragments, arrays and pass-through wrappers are descended (members
 * passed as children stay reachable), while a component that creates
 * members internally is not visible — the member never renders
 * itself, its element props are the data (same boundary as
 * rc-select). Options and templates share this single walker so the
 * discovery rules can never drift apart.
 */
export function walkSelectLeaves(
  children: ReactNode,
  onOption: (element: ReactElement<SelectOptionProps>) => void,
  onTemplate: (element: ReactElement<SelectTemplateProps>) => void,
): void {
  const visit = (node: ReactNode): void => {
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (!isValidElement(node)) {
      return;
    }
    if (node.type === SelectOption) {
      onOption(node as ReactElement<SelectOptionProps>);
      return;
    }
    if (node.type === SelectTemplate) {
      onTemplate(node as ReactElement<SelectTemplateProps>);
      return;
    }
    // Fragments and pass-through wrappers: their children stay
    // structurally reachable. A component that creates members
    // internally is not visible — the member never renders itself.
    visit((node.props as { children?: ReactNode }).children);
  };
  visit(children);
}

/**
 * Compiles the Select.Option members into option records: a pure
 * structural walk over the children subtree. The member's own `size`
 * wins, the parent's tier follows; the member key falls back to
 * `value`.
 */
export function compileSelectOptions(
  children: ReactNode,
  fallbackSize: SelectSize,
): SelectOptionRecord[] {
  const records: SelectOptionRecord[] = [];
  walkSelectLeaves(
    children,
    (element) => {
      const member = element.props;
      records.push({
        value: member.value,
        text: member.text,
        disabled: member.disabled ?? false,
        size: member.size ?? fallbackSize,
        key: element.key ?? member.value,
        content: member.children ?? member.text,
        className: member.className,
        style: member.style,
      });
    },
    () => undefined,
  );
  return records;
}

/**
 * Captures the Select.Template leaf for the open slot. The compile
 * rules are hard errors (fail fast on the authoring mistake instead
 * of silently switching channel):
 *
 * - at most one template per Select;
 * - `name` must be an open slot (`tag` today);
 * - exactly one child, and the child must be a component — a host
 *   element would receive the injected contract as DOM props.
 */
export function findSelectTemplate(children: ReactNode): ReactElement | null {
  let captured: ReactElement | null = null;
  walkSelectLeaves(
    children,
    () => undefined,
    (element) => {
      const { name, children: templateChild } = element.props;
      if (captured !== null) {
        throw new Error('Select accepts at most one <Select.Template>.');
      }
      if (name !== 'tag') {
        throw new Error(`Select.Template: unknown slot "${String(name)}" — open slots: "tag".`);
      }
      if (!isValidElement(templateChild)) {
        throw new Error('<Select.Template name="tag"> requires exactly one component child.');
      }
      if (typeof templateChild.type === 'string' || typeof templateChild.type === 'symbol') {
        throw new Error(
          '<Select.Template name="tag"> child must be a component (function/class), not a host element.',
        );
      }
      captured = templateChild;
    },
  );
  return captured;
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
