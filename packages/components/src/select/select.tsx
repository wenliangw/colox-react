import { forwardRef, useEffect, useId, useImperativeHandle, useMemo, useRef } from 'react';
import type { KeyboardEvent, MouseEvent, ReactNode } from 'react';
import clsx from 'clsx';
import { IconChevronDown } from '@colox/icons';
import { useComboboxKeyboard, useDismissible } from '@colox/cdk/floating';
import { SelectClearButton } from './children/clear-button';
import { SelectControl } from './children/control';
import type { SelectControlRef } from './children/control';
import { SelectHiddenInputs } from './children/hidden-inputs';
import { SelectOption } from './children/option';
import { SelectPanel } from './children/panel';
import { SelectTags } from './children/tags';
import { useSelect } from './hooks/use-select';
import type { SelectChangeEvent } from './hooks/use-select';
import type { SelectOptionRecord, SelectProps, SelectRef } from './types';
import {
  compileSelectOptions,
  filterSelectOptions,
  findSelectOption,
} from './utils/select-options';
import { selectVariants } from './variants';

import './styles/index.scss';

/**
 * A searchable single/multiple select on a native-shell trigger: the
 * shell shares the form-family contract (1px border, focus-within
 * ring, four size tiers, red invalid channel, terminal disabled), the
 * popup is a portal listbox modeled as an ARIA 1.2 editable combobox
 * — focus stays in the trigger control and arrows walk options via
 * aria-activedescendant. The members are compiled from Select.Option
 * leaves (`value` + `text`, optional rich children); FormData flows
 * through hidden native inputs. Members inherit the parent `size` for
 * their row typography and may override it per member.
 */
const SelectRoot = forwardRef<SelectRef, SelectProps>((props, ref) => {
  const {
    mode = 'single',
    filterOption,
    showSearch = false,
    value,
    defaultValue,
    onChange,
    onSearch,
    placeholder,
    clearable = false,
    open,
    defaultOpen,
    onOpenChange,
    name,
    size = 'md',
    invalid = false,
    disabled = false,
    className,
    style,
    children,
    // The control is the focusable form element: aria-label overrides the
    // display-text fallback name, id lands on the control so <label for>
    // targets the real control rather than the shell.
    'aria-label': ariaLabel,
    id,
    ...rest
  } = props;

  const isMultiple = mode === 'multiple';

  const uid = useId();
  const listboxId = `${uid}-listbox`;
  const optionIdPrefix = `${uid}-option`;

  const rootRef = useRef<HTMLDivElement>(null); // positioning reference + trigger scope
  const panelRef = useRef<HTMLDivElement>(null);
  const controlRef = useRef<SelectControlRef>(null);
  useImperativeHandle(ref, () => controlRef.current as SelectRef);

  const state = useSelect({
    mode,
    value,
    defaultValue,
    onChange,
    open,
    defaultOpen,
    onOpenChange,
    onSearch,
  });

  // Resolve the members into option records; the member's own size wins,
  // the parent's tier follows.
  const options = useMemo(() => compileSelectOptions(children, size), [children, size]);
  const visibleOptions = useMemo(
    () => (showSearch ? filterSelectOptions(options, state.query, filterOption) : options),
    [options, state.query, filterOption, showSearch],
  );

  const currentSingle = typeof state.value === 'string' ? state.value : '';
  const currentMultiple = Array.isArray(state.value) ? state.value : [];

  // Reopening a single select starts at the currently selected option
  // (or the first enabled one when nothing is selected / filtered out).
  const initialActiveIndex = useMemo(() => {
    if (isMultiple) {
      return -1;
    }
    return visibleOptions.findIndex((option) => option.value === currentSingle);
  }, [isMultiple, visibleOptions, currentSingle]);

  const activateOption = (option: SelectOptionRecord | undefined, event: SelectChangeEvent) => {
    if (option === undefined || option.disabled) {
      return;
    }
    if (isMultiple) {
      state.toggle(option.value, event, option);
    } else {
      state.select(option.value, event, option);
      state.close();
      keyboard.setActiveIndex(-1);
    }
  };

  const keyboard = useComboboxKeyboard({
    open: state.isOpen,
    itemCount: visibleOptions.length,
    isItemDisabled: (index) => visibleOptions[index]?.disabled ?? false,
    onRequestOpen: () => {
      keyboard.setActiveIndex(initialActiveIndex);
      state.setOpen(true);
      controlRef.current?.focus();
    },
    onActivate: (index, event) => {
      activateOption(visibleOptions[index], event);
    },
  });

  // Keep the keyboard highlight inside the scrollport.
  useEffect(() => {
    if (!state.isOpen || keyboard.activeIndex < 0) {
      return;
    }
    // getElementById (not a selector): useId values contain colons.
    document
      .getElementById(`${optionIdPrefix}-${keyboard.activeIndex}`)
      ?.scrollIntoView?.({ block: 'nearest' });
  }, [state.isOpen, keyboard.activeIndex, optionIdPrefix]);

  useDismissible({
    open: state.isOpen,
    onDismiss: () => {
      state.close();
      keyboard.setActiveIndex(-1);
    },
    triggerRef: rootRef,
    panelRef,
  });

  const selectedRecord = findSelectOption(options, currentSingle);

  /* ===== control surfaces ===== */

  // Closed single shows the selected text; the typed query replaces it
  // while open. Multiple always carries the query (close resets it).
  let inputValue: string;
  if (isMultiple || state.isOpen) {
    inputValue = state.query;
  } else {
    inputValue = selectedRecord?.text ?? '';
  }

  // aria-label > selected text > raw value > placeholder (single);
  // aria-label > placeholder (multiple — the query stream is the name
  // while open, the placeholder names the empty control).
  let controlLabel: string | undefined;
  if (ariaLabel !== undefined) {
    controlLabel = ariaLabel;
  } else if (isMultiple) {
    controlLabel = typeof placeholder === 'string' ? placeholder : undefined;
  } else if (selectedRecord !== undefined) {
    controlLabel = selectedRecord.text;
  } else if (currentSingle !== '') {
    controlLabel = currentSingle;
  } else {
    controlLabel = typeof placeholder === 'string' ? placeholder : undefined;
  }

  let activeDescendantId: string | undefined;
  if (state.isOpen && keyboard.activeIndex >= 0) {
    activeDescendantId = `${optionIdPrefix}-${keyboard.activeIndex}`;
  }

  // The closed single button display: selected text, then the raw
  // value (a controlled value outside the members still reads
  // honestly), then the placeholder.
  let buttonDisplay: ReactNode;
  if (selectedRecord !== undefined) {
    buttonDisplay = selectedRecord.text;
  } else if (currentSingle !== '') {
    buttonDisplay = currentSingle;
  } else {
    buttonDisplay = (
      <span className="colox-select__placeholder">
        {placeholder !== undefined ? placeholder : '\u00a0'}
      </span>
    );
  }

  const handleButtonClick = () => {
    if (state.isOpen) {
      state.close();
      keyboard.setActiveIndex(-1);
    } else {
      keyboard.setActiveIndex(initialActiveIndex);
      state.setOpen(true);
    }
  };

  const handleControlKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    keyboard.onControlKeyDown(event);
    if (
      !event.defaultPrevented &&
      event.key === 'Backspace' &&
      state.query === '' &&
      currentMultiple.length > 0
    ) {
      event.preventDefault();
      const last = currentMultiple[currentMultiple.length - 1];
      state.toggle(last, event, findSelectOption(options, last));
    }
  };

  const handleShellClick = (event: MouseEvent<HTMLDivElement>) => {
    if (disabled || state.isOpen) {
      return;
    }
    const target = event.target;
    if (target instanceof HTMLElement && target.closest('button') !== null) {
      return;
    }
    keyboard.setActiveIndex(initialActiveIndex);
    state.setOpen(true);
  };

  const showClear =
    !disabled && clearable && (isMultiple ? currentMultiple.length > 0 : currentSingle !== '');

  const isSelected = (candidate: string) =>
    isMultiple ? currentMultiple.includes(candidate) : candidate === currentSingle;

  /* ===== the shell ===== */

  return (
    <div
      ref={rootRef}
      className={clsx(
        selectVariants({ size }),
        {
          'colox-select--open': state.isOpen,
          'colox-select--invalid': invalid,
          'colox-select--disabled': disabled,
        },
        className,
      )}
      style={style}
      onClick={handleShellClick}
      {...rest}
    >
      <div className="colox-select__inner">
        {isMultiple && (
          <SelectTags
            values={currentMultiple}
            options={options}
            disabled={disabled}
            onRemove={(tagValue, event) =>
              state.toggle(tagValue, event, findSelectOption(options, tagValue))
            }
          />
        )}
        <SelectControl
          ref={controlRef}
          isMultiple={isMultiple}
          showSearch={showSearch}
          open={state.isOpen}
          disabled={disabled}
          invalid={invalid}
          id={id}
          ariaLabel={ariaLabel}
          controlLabel={controlLabel}
          listboxId={listboxId}
          activeDescendantId={activeDescendantId}
          inputValue={inputValue}
          buttonDisplay={buttonDisplay}
          placeholder={placeholder}
          onInputChange={state.setQuery}
          onButtonClick={handleButtonClick}
          onKeyDown={handleControlKeyDown}
        />
      </div>

      <span className="colox-select__trailing">
        {showClear && <SelectClearButton onClick={(event) => state.clear(event)} />}
        <IconChevronDown className="colox-select__chevron" aria-hidden="true" />
      </span>

      <SelectHiddenInputs name={name} values={state.value} />

      <SelectPanel
        ref={panelRef}
        open={state.isOpen}
        listboxId={listboxId}
        optionIdPrefix={optionIdPrefix}
        referenceRef={rootRef}
        options={visibleOptions}
        activeIndex={keyboard.activeIndex}
        isSelected={isSelected}
        onOptionClick={activateOption}
      />
    </div>
  );
});

export const Select = Object.assign(SelectRoot, { Option: SelectOption });
