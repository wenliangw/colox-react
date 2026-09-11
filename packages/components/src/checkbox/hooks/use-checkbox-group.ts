import { useCallback, useState } from 'react';

export interface UseCheckboxGroupParams {
  value: string[] | undefined;
  defaultValue: string[] | undefined;
  onChange: ((value: string[]) => void) | undefined;
}

export interface UseCheckboxGroupResult {
  /** The current selection array (controlled prop or inner state). */
  value: string[];
  /** Flips a member: adds it when absent, removes it when present. */
  toggleValue: (member: string) => void;
}

/**
 * The selection state behind <Checkbox.Group>: symmetric control —
 * `value` passes through, `defaultValue` seeds inner state — and a
 * toggle command that publishes the next array through `onChange`.
 */
export function useCheckboxGroup({
  value,
  defaultValue,
  onChange,
}: UseCheckboxGroupParams): UseCheckboxGroupResult {
  const [innerValue, setInnerValue] = useState<string[]>(defaultValue ?? []);
  const current = value ?? innerValue;

  const toggleValue = useCallback(
    (member: string) => {
      const next = current.includes(member)
        ? current.filter((candidate) => candidate !== member)
        : [...current, member];
      if (value === undefined) {
        setInnerValue(next);
      }
      onChange?.(next);
    },
    [current, onChange, value],
  );

  return { value: current, toggleValue };
}
