import { useCallback, useState } from 'react';

export interface UseRadioGroupParams {
  value: string | undefined;
  defaultValue: string | undefined;
  onChange: ((value: string) => void) | undefined;
}

export interface UseRadioGroupResult {
  /** The current single selection (controlled prop or inner state). */
  value: string;
  /** Picks a member value as the group's selection. */
  selectValue: (next: string) => void;
}

/**
 * The single selection behind <Radio.Group>: symmetric control —
 * `value` passes through, `defaultValue` seeds inner state — and a
 * select command that publishes the next value through `onChange`.
 * Selection is driven by the members' native change events, so a
 * re-click on the already-selected radio (no DOM change) never reaches
 * here.
 */
export function useRadioGroup({
  value,
  defaultValue,
  onChange,
}: UseRadioGroupParams): UseRadioGroupResult {
  const [innerValue, setInnerValue] = useState<string>(defaultValue ?? '');
  const current = value ?? innerValue;

  const selectValue = useCallback(
    (next: string) => {
      if (value === undefined) {
        setInnerValue(next);
      }
      onChange?.(next);
    },
    [value, onChange],
  );

  return { value: current, selectValue };
}
