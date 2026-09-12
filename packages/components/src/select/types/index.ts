import type { HTMLAttributes, KeyboardEvent, MouseEvent, ReactNode } from 'react';
import type { SelectVariants } from '../variants';

export type SelectSize = NonNullable<SelectVariants['size']>;

export type SelectMode = 'single' | 'multiple';

export interface SelectOption {
  /** The selection truth: what `value`/`onChange`/FormData carry. */
  value: string;
  /** Display content — also the default filter match surface. */
  label: ReactNode;
  /** Not selectable; keyboard navigation skips it. */
  disabled?: boolean;
}

/**
 * The group's change payload: `event` is the native event that fired
 * the change — an option click (mouse) or the combobox Enter press
 * (keyboard) — `value` the next selection, and `option` the chosen or
 * toggled option (undefined when cleared).
 */
export interface SelectChangePayload {
  /** The triggering interaction: an option click/press or the clear button. */
  event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>;
  /**
   * The next selection: the chosen value in single mode ('' = none,
   * clearable) or the next array in multiple mode.
   */
  value: string | string[];
  /** The chosen/toggled option; undefined on clearable clears. */
  option?: SelectOption;
}

export interface SelectProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange' | 'defaultValue'
> {
  /**
   * Single or multiple selection. The value shape switches with it:
   * `string` ('') for single, `string[]` for multiple.
   * @default 'single'
   */
  mode?: SelectMode;
  /** The option list rendered inside the popup (data-driven, server-ready). */
  options?: readonly SelectOption[];
  /**
   * Customizes an option's panel content. The trigger still displays
   * the raw `label`.
   */
  optionRender?: (option: SelectOption) => ReactNode;
  /**
   * Replaces the default filter (case-insensitive substring over label
   * and value). Applies only while `showSearch` is on.
   */
  filterOption?: (query: string, option: SelectOption) => boolean;
  /**
   * Enable the search organ: members get an embedded input (Input's
   * inner organ) and typing filters the options.
   * @default false
   */
  showSearch?: boolean;
  /**
   * The selection: the chosen option's value in single mode, the array
   * of chosen values in multiple mode. Symmetric control — leave
   * undefined to run uncontrolled (`defaultValue` seeds).
   */
  value?: string | string[];
  defaultValue?: string | string[];
  /** Fires with the next selection as a `{ event, value, option }` payload. */
  onChange?: (payload: SelectChangePayload) => void;
  /**
   * The raw query stream (remote search delegation): fires on every
   * query change. Filtering still runs locally unless the consumer
   * swaps `options` with server results.
   */
  onSearch?: (query: string) => void;
  /** Shown while the selection is empty. */
  placeholder?: ReactNode;
  /**
   * Adds the clear control: resets single to '' and multiple to []
   * (the action surfaces through `onChange`).
   * @default false
   */
  clearable?: boolean;
  /** Controlled open state; `defaultOpen` seeds the uncontrolled one. */
  open?: boolean;
  defaultOpen?: boolean;
  /** Fires whenever the panel opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Form collection name: a single hidden `<input type="hidden">` in
   * single mode, one per value in multiple mode (FormData native
   * collection, same channel as Checkbox.Group).
   */
  name?: string;
  /**
   * Visual tier of the trigger shell: same-name tiers share the
   * Button/Input/Checkbox design language.
   * @default 'md'
   */
  size?: SelectSize;
  /**
   * The popup's row typography tier. The panel is its own layout
   * context, so its type does not follow the trigger size.
   * @default 'md'
   */
  optionSize?: SelectSize;
  /**
   * Marks the select as invalid: sets `aria-invalid` and swaps the
   * shell border/ring to the red tokens (Input channel).
   * @default false
   */
  invalid?: boolean;
  /** Disables the select: the shell goes terminal and the panel cannot open. */
  disabled?: boolean;
}

/** The combobox organ: the embedded input when searchable/multiple, the trigger button otherwise. */
export type SelectRef = HTMLInputElement | HTMLButtonElement;
