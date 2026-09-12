import type { CSSProperties, HTMLAttributes, KeyboardEvent, MouseEvent, ReactNode } from 'react';
import type { SelectVariants } from '../variants';

export type SelectSize = NonNullable<SelectVariants['size']>;

export type SelectMode = 'single' | 'multiple';

/**
 * A compiled option member: the Select.Option leaf resolved at render
 * time (the member's `size` falls back to the parent's, `content` is
 * the member's children or its `text`).
 */
export interface SelectOptionRecord {
  /** The selection truth: what `value`/`onChange`/FormData carry. */
  value: string;
  /** The text surface: search filtering, trigger display, chips and the default row render. */
  text: string;
  /** Not selectable; keyboard navigation skips it. */
  disabled: boolean;
  /** The row typography tier: the member's own prop or the parent's `size`. */
  size: SelectSize;
  /** Stable row key: the element's key, falling back to `value`. */
  key: string;
  /** The panel row content: the member's children, or `text` when absent. */
  content: ReactNode;
  /** The member's className — merged onto the panel row. */
  className?: string;
  style?: CSSProperties;
}

/** The Select.Option leaf: `value` + `text` required, children = optional rich render. */
export interface SelectOptionProps extends HTMLAttributes<HTMLDivElement> {
  /** The selection truth: what `value`/`onChange`/FormData carry. */
  value: string;
  /** The text surface: search, trigger display, chips, default render. */
  text: string;
  /** Not selectable; keyboard navigation skips it. */
  disabled?: boolean;
  /** Row typography tier — defaults to the parent Select `size`. */
  size?: SelectSize;
}

/**
 * The change payload: `event` is the native interaction that fired the
 * change — an option click (mouse) or the combobox Enter press
 * (keyboard) — `value` the next selection, and `option` the chosen or
 * toggled option's compiled record (undefined when cleared).
 */
export interface SelectChangePayload {
  /** The triggering interaction: an option click/press, chip remove or the clear button. */
  event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>;
  /**
   * The next selection: the chosen value in single mode ('' = none,
   * clearable) or the next array in multiple mode.
   */
  value: string | string[];
  /** The chosen/toggled option record; undefined on clearable clears. */
  option?: SelectOptionRecord;
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
  /**
   * Enable the search control: members get an embedded input (the cdk
   * InputControl) and typing filters the options.
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
  /**
   * Form collection name: a single hidden `<input type="hidden">` in
   * single mode, one per value in multiple mode (FormData native
   * collection, same channel as Checkbox.Group).
   */
  name?: string;
  /**
   * Visual tier of the trigger shell — and the default tier every
   * Select.Option member inherits for its row typography.
   * @default 'md'
   */
  size?: SelectSize;
  /**
   * Marks the select as invalid: sets `aria-invalid` and swaps the
   * shell border/ring to the red tokens (Input channel).
   * @default false
   */
  invalid?: boolean;
  /** Disables the select: the shell goes terminal and the panel cannot open. */
  disabled?: boolean;
  /**
   * Replaces the default filter (case-insensitive substring over text
   * and value). Applies only while `showSearch` is on.
   */
  filterOption?: (query: string, option: SelectOptionRecord) => boolean;
  /** Fires with the next selection as a `{ event, value, option }` payload. */
  onChange?: (payload: SelectChangePayload) => void;
  /**
   * The raw query stream (remote search delegation): fires on every
   * query change. Filtering still runs locally unless the consumer
   * swaps the members with server results.
   */
  onSearch?: (query: string) => void;
  /** Fires whenever the panel opens or closes. */
  onOpenChange?: (open: boolean) => void;
}

/** The combobox control: the embedded input when searchable/multiple, the trigger button otherwise. */
export type SelectRef = HTMLInputElement | HTMLButtonElement;
