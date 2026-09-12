import type { KeyboardEvent, MouseEvent, ReactNode, RefObject } from 'react';
import type { SelectOptionRecord } from './component';

export type SelectControlRef = HTMLInputElement | HTMLButtonElement;

export interface SelectControlProps {
  /** Shape selector: every multiple select embeds the input control. */
  isMultiple: boolean;
  showSearch: boolean;
  open: boolean;
  disabled: boolean;
  invalid: boolean;
  id?: string;
  /** Explicit name override; wins over the fallback `controlLabel`. */
  ariaLabel?: string;
  /** The resolved combobox reachable name (selected text / raw value / placeholder). */
  controlLabel?: string;
  listboxId: string;
  /** Prefixed id of the highlighted option while open. */
  activeDescendantId?: string;
  /** The input control's value: query stream while open, selected text while closed single. */
  inputValue: string;
  /** The closed single button's display content (text / raw value / placeholder). */
  buttonDisplay: ReactNode;
  placeholder?: ReactNode;
  onInputChange: (value: string) => void;
  onButtonClick: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}

export interface SelectTagsProps {
  values: readonly string[];
  /** The compiled members — text lookup for chip labels. */
  options: readonly SelectOptionRecord[];
  disabled: boolean;
  onRemove: (value: string, event: MouseEvent<HTMLButtonElement>) => void;
}

export interface SelectClearButtonProps {
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}

export interface FormSelectValuesProps {
  name?: string;
  /** The current selection ('', a value, or the value array). */
  values: string | string[];
}

export interface SelectPanelProps {
  open: boolean;
  listboxId: string;
  optionIdPrefix: string;
  /** The positioning reference (the trigger shell). */
  referenceRef: RefObject<HTMLElement | null>;
  /** The filtered members rendered as rows. */
  options: readonly SelectOptionRecord[];
  /** Index of the keyboard-highlighted row, -1 when none. */
  activeIndex: number;
  /** Whether a value reads as selected in the current mode. */
  isSelected: (value: string) => boolean;
  onOptionClick: (option: SelectOptionRecord, event: MouseEvent<HTMLDivElement>) => void;
}
