import { forwardRef, useImperativeHandle, useRef } from 'react';
import type { ChangeEvent } from 'react';
import { InputControl } from '@colox/cdk/input-control';
import type { SelectControlProps, SelectControlRef } from '../../types';

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
