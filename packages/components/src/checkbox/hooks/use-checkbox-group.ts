import { useCallback, useState } from 'react';
import type { ChangeEvent } from 'react';
import type { CheckboxGroupChangePayload } from '../types';

export interface UseCheckboxGroupParams {
  value: string[] | undefined;
  defaultValue: string[] | undefined;
  onChange: ((payload: CheckboxGroupChangePayload) => void) | undefined;
}

export interface UseCheckboxGroupResult {
  /** The current selection array (controlled prop or inner state). */
  value: string[];
  /**
   * Flips a member: adds it when absent, removes it when present, then
   * publishes `{ event, value }` with the next array.
   */
  toggleValue: (member: string, event: ChangeEvent<HTMLInputElement>) => void;
}

/**
 * The selection state behind <Checkbox.Group>: symmetric control —
 * `value` passes through, `defaultValue` seeds inner state — and a
 * toggle command that publishes `{ event, value }` through `onChange`:
 * the event is the triggering member's native change event, the value
 * the next selection array.
 */
export function useCheckboxGroup({
  value,
  defaultValue,
  onChange,
}: UseCheckboxGroupParams): UseCheckboxGroupResult {
  const [innerValue, setInnerValue] = useState<string[]>(defaultValue ?? []);
  const current = value ?? innerValue;

  const toggleValue = useCallback(
    (member: string, event: ChangeEvent<HTMLInputElement>) => {
      const next = current.includes(member)
        ? current.filter((candidate) => candidate !== member)
        : [...current, member];
      if (value === undefined) {
        setInnerValue(next);
      }
      onChange?.({ event, value: next });
    },
    [current, onChange, value],
  );

  return { value: current, toggleValue };
}
