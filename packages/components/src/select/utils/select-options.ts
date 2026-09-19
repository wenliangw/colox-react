import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { walkComboboxLeaves, type ComboboxFilterFn } from '@colox/cdk/combobox';
import { SelectOption } from '../children/option';
import { SelectTemplate } from '../children/template';
import type {
  SelectFilterFn,
  SelectOptionProps,
  SelectOptionRecord,
  SelectSize,
  SelectTemplateProps,
} from '../types';

/**
 * Bridges Select's record-typed public matcher onto the cdk filter
 * contract (the combobox surface). The runtime records are the very
 * SelectOptionRecord instances the cdk kernel receives, so the
 * narrower cdk signature is a typing artifact, not a narrowing —
 * documented once here instead of sprinkled at call sites.
 */
export function adaptComboboxFilter(
  filter: SelectFilterFn | undefined,
): ComboboxFilterFn | undefined {
  return filter as ComboboxFilterFn | undefined;
}

/**
 * Compiles the Select.Option members into option records: a pure
 * structural walk over the children subtree (cdk/combobox kernel).
 * The member's own `size` wins, the parent's tier follows; the
 * member key falls back to `value`.
 */
export function compileSelectOptions(
  children: ReactNode,
  fallbackSize: SelectSize,
): SelectOptionRecord[] {
  const records: SelectOptionRecord[] = [];
  walkComboboxLeaves(
    children,
    (element) => element.type === SelectOption,
    (element) => {
      const member = (element as ReactElement<SelectOptionProps>).props;
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
  walkComboboxLeaves(
    children,
    (element) => element.type === SelectTemplate,
    (element) => {
      const { name, children: templateChild } = (element as ReactElement<SelectTemplateProps>)
        .props;
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
