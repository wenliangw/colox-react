import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, FocusEvent, KeyboardEvent, MouseEvent } from 'react';
import { filterComboboxOptions } from '@colox/cdk/combobox';
import { useComboboxKeyboard, useDismissible } from '@colox/cdk/floating';
import type {
  AutoCompleteChangeEvent,
  AutoCompleteOptionRecord,
  TargetHandlers,
  UseAutoCompleteParams,
  UseAutoCompleteResult,
} from '../types';

/**
 * The first roaming-eligible row: -1 when the list has none.
 */
function firstEnabledIndex(options: readonly AutoCompleteOptionRecord[]): number {
  for (let index = 0; index < options.length; index += 1) {
    if (!options[index].disabled) {
      return index;
    }
  }
  return -1;
}

/**
 * The suggestion state machine behind AutoComplete: symmetric
 * value/open control (the `value` prop wins, internal state tracks
 * the uncontrolled slot), the local filter over the compiled members,
 * the ARIA editable-combobox keyboard (cdk), and the popup dismissal
 * channels. The open policy: focus/click opens when rows exist,
 * typing filters and closes on zero matches, escape/blur/pick close.
 */
export function useAutoComplete(params: UseAutoCompleteParams): UseAutoCompleteResult {
  const {
    options,
    target,
    value: valueProp,
    defaultValue,
    open: openProp,
    defaultOpen,
    filterOption,
    onChange,
    onSelect,
    onOpenChange,
  } = params;

  const [innerValue, setInnerValue] = useState(defaultValue ?? '');
  const [openState, setOpenState] = useState(defaultOpen ?? false);

  const value = valueProp === undefined ? innerValue : valueProp;
  const open = openProp === undefined ? openState : openProp;

  const host = target.props as Partial<TargetHandlers>;
  const isInteractable = !host.disabled && !host.readOnly;

  const anchorRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listboxId = `${useId()}-listbox`;

  const filtered = useMemo(
    () => filterComboboxOptions(options, value, filterOption),
    [options, value, filterOption],
  );

  const setOpen = useCallback(
    (next: boolean) => {
      if (openProp === undefined) {
        setOpenState(next);
      }
      if (next !== open) {
        onOpenChange?.(next);
      }
    },
    [openProp, open, onOpenChange],
  );

  const notifyChange = useCallback(
    (next: string, event: AutoCompleteChangeEvent) => {
      if (valueProp === undefined) {
        setInnerValue(next);
      }
      onChange?.({ event, value: next });
    },
    [valueProp, onChange],
  );

  const selectOption = useCallback(
    (
      option: AutoCompleteOptionRecord,
      event: KeyboardEvent<HTMLElement> | MouseEvent<HTMLElement>,
    ) => {
      notifyChange(option.value, event);
      onSelect?.({ event, value: option.value, option });
      setOpen(false);
    },
    [notifyChange, onSelect, setOpen],
  );

  const isItemDisabled = useCallback(
    (index: number) => filtered[index]?.disabled ?? false,
    [filtered],
  );

  const { activeIndex, setActiveIndex, onControlKeyDown } = useComboboxKeyboard({
    open,
    itemCount: filtered.length,
    isItemDisabled,
    onRequestOpen: () => {
      if (isInteractable) {
        setOpen(true);
      }
    },
    onActivate: (index, event) => {
      const option = filtered[index];
      if (option !== undefined) {
        selectOption(option, event);
      }
    },
  });

  // The committed value doubles as the query: typing applies the local
  // filter, and the auto-open policy keys off the match count.
  const onTargetChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const next = event.target.value;
      notifyChange(next, event);
      if (isInteractable && next.trim().length > 0) {
        setOpen(filterComboboxOptions(options, next, filterOption).length > 0);
      }
      (target.props as Partial<TargetHandlers>).onChange?.(event);
    },
    [notifyChange, isInteractable, options, filterOption, setOpen, target],
  );

  const onTargetFocus = useCallback(
    (event: FocusEvent<HTMLElement>) => {
      if (isInteractable && filtered.length > 0) {
        setOpen(true);
      }
      (target.props as Partial<TargetHandlers>).onFocus?.(event);
    },
    [isInteractable, filtered.length, setOpen, target],
  );

  const onTargetBlur = useCallback(
    (event: FocusEvent<HTMLElement>) => {
      setOpen(false);
      (target.props as Partial<TargetHandlers>).onBlur?.(event);
    },
    [setOpen, target],
  );

  // Closing resets the roaming highlight; edits reset it to the first
  // eligible row of the new result (the design ruling: the cursor
  // starts on the first candidate after typing).
  useEffect(() => {
    if (!open) {
      setActiveIndex(-1);
    }
  }, [open, setActiveIndex]);

  const previousValueRef = useRef(value);
  useEffect(() => {
    if (previousValueRef.current === value) {
      return;
    }
    previousValueRef.current = value;
    if (open) {
      setActiveIndex(firstEnabledIndex(filtered));
    }
  }, [value, open, filtered, setActiveIndex]);

  useDismissible({
    open,
    triggerRef: anchorRef,
    panelRef,
    onDismiss: () => setOpen(false),
  });

  return {
    anchorRef,
    panelRef,
    listboxId,
    value,
    open,
    filtered,
    activeIndex,
    onTargetChange,
    onTargetFocus,
    onTargetBlur,
    onControlKeyDown,
    selectOption,
  };
}
