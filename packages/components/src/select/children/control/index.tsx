import { forwardRef, useImperativeHandle, useRef } from 'react';
import type { ChangeEvent, KeyboardEvent, ReactNode } from 'react';
import { InputControl } from '@colox/cdk/input-control';

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

/**
 * The combobox control in both shapes: the embedded InputControl for
 * searchable single and every multiple select, a native button for the
 * plain single trigger. Both carry the ARIA 1.2 editable-combobox
 * surface (role, expansion state, activedescendant) — focus never
 * leaves this element while the panel is open.
 */
export const SelectControl = forwardRef<SelectControlRef, SelectControlProps>((props, ref) => {
  const {
    isMultiple,
    showSearch,
    open,
    disabled,
    invalid,
    id,
    ariaLabel,
    controlLabel,
    listboxId,
    activeDescendantId,
    inputValue,
    buttonDisplay,
    placeholder,
    onInputChange,
    onButtonClick,
    onKeyDown,
  } = props;

  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const usesInput = isMultiple || showSearch;
  useImperativeHandle(
    ref,
    () => (usesInput ? inputRef.current : buttonRef.current) as SelectControlRef,
  );

  // A combobox takes its reachable name from the author (ARIA
  // nameFrom), never from contents — the control carries explicit
  // text: the selected text, then the raw value, then the placeholder.
  // aria-label overrides all three.
  const comboboxAria = {
    role: 'combobox' as const,
    'aria-label': ariaLabel ?? controlLabel,
    'aria-expanded': open,
    'aria-haspopup': 'listbox' as const,
    'aria-controls': open ? listboxId : undefined,
    'aria-activedescendant':
      open && activeDescendantId !== undefined ? activeDescendantId : undefined,
    'aria-invalid': invalid || undefined,
    disabled,
  };

  if (usesInput) {
    return (
      <InputControl
        ref={inputRef}
        id={id}
        {...comboboxAria}
        className="colox-select__control"
        autoComplete="off"
        value={inputValue}
        placeholder={typeof placeholder === 'string' ? placeholder : undefined}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onInputChange(event.target.value)}
        onKeyDown={onKeyDown}
      />
    );
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      id={id}
      {...comboboxAria}
      className="colox-select__control"
      onClick={onButtonClick}
      onKeyDown={onKeyDown}
    >
      {buttonDisplay}
    </button>
  );
});

SelectControl.displayName = 'SelectControl';
