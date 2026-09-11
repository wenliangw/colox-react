import { useCallback, useState } from 'react';
import type { ChangeEvent } from 'react';
import type { RadioGroupChangePayload } from '../types';

export interface UseRadioGroupParams {
  value: string | undefined;
  defaultValue: string | undefined;
  onChange: ((payload: RadioGroupChangePayload) => void) | undefined;
}

export interface UseRadioGroupResult {
  /** The current single selection (controlled prop or inner state). */
  value: string;
  /** Picks a member value as the group's selection. */
  selectValue: (next: string, event: ChangeEvent<HTMLInputElement>) => void;
}

/**
 * The single selection behind <Radio.Group>: symmetric control —
 * `value` passes through, `defaultValue` seeds inner state — and a
 * select command that publishes `{ event, value }` through `onChange`:
 * the event is the triggering member's native change event, the value
 * the next selection. Selection is driven by the members' native
 * change events, so a re-click on the already-selected radio (no DOM
 * change) never reaches here.
 */
export function useRadioGroup({
  value,
  defaultValue,
  onChange,
}: UseRadioGroupParams): UseRadioGroupResult {
  const [innerValue, setInnerValue] = useState<string>(defaultValue ?? '');
  const current = value ?? innerValue;

  const selectValue = useCallback(
    (next: string, event: ChangeEvent<HTMLInputElement>) => {
      if (value === undefined) {
        setInnerValue(next);
      }
      onChange?.({ event, value: next });
    },
    [value, onChange],
  );

  return { value: current, selectValue };
}
