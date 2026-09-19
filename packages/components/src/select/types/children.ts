import type { KeyboardEvent, MouseEvent, ReactElement, ReactNode, RefObject } from 'react';
import type { SelectOptionRecord, SelectSize } from './component';

export type SelectControlRef = HTMLInputElement | HTMLButtonElement;

export interface SelectControlProps {
  /** The search capability: the embedded input renders only while on. */
  showSearch: boolean;
  open: boolean;
  disabled: boolean;
  invalid: boolean;
  id?: string;
  /** Explicit name override; wins over the fallback `controlLabel`. */
  ariaLabel?: string;
  /** Field wiring forwarded from the root (the focus owner carries it). */
  ariaDescribedBy?: string;
  ariaLabelledBy?: string;
  ariaRequired?: boolean;
  /** The resolved combobox reachable name (selected text / raw value / placeholder). */
  controlLabel?: string;
  listboxId: string;
  /** Prefixed id of the highlighted option while open. */
  activeDescendantId?: string;
  /** The input control's value: query stream while open, selected text while closed single. */
  inputValue: string;
  /**
   * The trigger button's display content — placeholder while empty in
   * multiple mode, `null` once chips carry the selection.
   */
  buttonDisplay: ReactNode;
  placeholder?: ReactNode;
  onInputChange: (value: string) => void;
  /**
   * Marks a pointer-driven interaction before focus lands: the focus
   * handler then defers to the click, which owns the toggle.
   */
  onControlMouseDown: () => void;
  /**
   * Click toggles the panel on the trigger button (and opens it on
   * the searchable input, whose click places the caret instead).
   */
  onControlClick: () => void;
  /** Keyboard focus opens the panel; pointer focus defers to the click. */
  onControlFocus: () => void;
  /** Blur closes it — including when the pointer leaves the page control. */
  onControlBlur: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}

export interface SelectTagsProps {
  values: readonly string[];
  /** The compiled members — text lookup for chip labels. */
  options: readonly SelectOptionRecord[];
  disabled: boolean;
  /** The captured Select.Template('tag') component; null renders the default chip. */
  tagTemplate: ReactElement | null;
  /** The parent tier for synthesizing records of values outside the compiled members. */
  fallbackSize: SelectSize;
  onRemove: (value: string, event: KeyboardEvent<HTMLElement> | MouseEvent<HTMLElement>) => void;
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
