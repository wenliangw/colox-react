import { forwardRef, useEffect, useId, useImperativeHandle, useMemo, useRef } from 'react';
import type { ChangeEvent, KeyboardEvent, MouseEvent } from 'react';
import { IconCheck, IconChevronDown, IconX } from '@colox/icons';
import clsx from 'clsx';
import { Popup, useComboboxKeyboard, useDismissible } from '@colox/cdk/floating';
import { InputOrgan } from '../input/organ';
import type { SelectOption, SelectProps, SelectRef } from './types';
import { useSelect } from './hooks/use-select';
import type { SelectChangeEvent } from './hooks/use-select';
import { filterSelectOptions, findSelectOption, selectOptionLabel } from './utils/select-options';
import { selectVariants } from './variants';

import './styles/index.scss';

/**
 * A searchable single/multiple select on a native-shell trigger: the
 * shell shares the form-family contract (1px border, focus-within
 * ring, four size tiers, red invalid channel, terminal disabled), the
 * popup is a portal listbox modeled as an ARIA 1.2 editable combobox
 * — focus stays in the trigger organ and arrows walk options via
 * aria-activedescendant. Selection is `options`-driven (`value`/
 * `defaultValue` symmetric, `{ event, value, option }` payloads);
 * FormData flows through hidden native inputs. The shell size tiers
 * are decoupled from the popup row tiers (`optionSize`).
 */
export const Select = forwardRef<SelectRef, SelectProps>((props, ref) => {
  const {
    mode = 'single',
    options = [],
    optionRender,
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
    size,
    optionSize = 'md',
    invalid = false,
    disabled = false,
    className,
    style,
    // The organ is the focusable form control: aria-label overrides the
    // display-text fallback name, id lands on the organ so <label for>
    // targets the real control rather than the shell.
    'aria-label': ariaLabel,
    id: restId,
    ...rest
  } = props;

  const isMultiple = mode === 'multiple';
  // Searchable single and every multiple select embed the input organ.
  const hasOrgan = isMultiple || showSearch;

  const uid = useId();
  const listboxId = `${uid}-listbox`;
  const optionIdPrefix = `${uid}-option`;

  const rootRef = useRef<HTMLDivElement>(null); // positioning reference + trigger scope
  const panelRef = useRef<HTMLDivElement>(null);
  const organRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  useImperativeHandle(ref, () => (hasOrgan ? organRef.current : buttonRef.current) as SelectRef);

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

  const visibleOptions = useMemo(
    () => (showSearch ? filterSelectOptions(options, state.query, filterOption) : [...options]),
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

  const keyboard = useComboboxKeyboard({
    open: state.isOpen,
    itemCount: visibleOptions.length,
    isItemDisabled: (index) => visibleOptions[index]?.disabled ?? false,
    onRequestOpen: () => {
      keyboard.setActiveIndex(initialActiveIndex);
      state.setOpen(true);
      organRef.current?.focus();
    },
    onActivate: (index, event) => {
      const option = visibleOptions[index];
      if (option !== undefined) {
        activateOption(option, event);
      }
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

  const handleDismiss = () => {
    state.close();
    keyboard.setActiveIndex(-1);
  };

  useDismissible({
    open: state.isOpen,
    onDismiss: handleDismiss,
    triggerRef: rootRef,
    panelRef,
  });

  const activateOption = (option: SelectOption, event: SelectChangeEvent) => {
    if (option.disabled) {
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

  /* ===== trigger internals ===== */

  const singleSelectedOption = findSelectOption(options, currentSingle);

  // A combobox takes its reachable name from the author (ARIA
  // nameFrom), never from contents — so the organ carries explicit
  // text: the selected label, then the placeholder. aria-label
  // overrides both.
  const organLabel =
    ariaLabel ??
    (isMultiple
      ? typeof placeholder === 'string'
        ? placeholder
        : undefined
      : singleSelectedOption !== undefined
        ? selectOptionLabel(singleSelectedOption)
        : currentSingle !== ''
          ? currentSingle
          : typeof placeholder === 'string'
            ? placeholder
            : undefined);

  const comboboxAria = {
    role: 'combobox' as const,
    'aria-label': organLabel,
    'aria-expanded': state.isOpen,
    'aria-haspopup': 'listbox' as const,
    'aria-controls': state.isOpen ? listboxId : undefined,
    'aria-activedescendant':
      state.isOpen && keyboard.activeIndex >= 0
        ? `${optionIdPrefix}-${keyboard.activeIndex}`
        : undefined,
    'aria-invalid': invalid || undefined,
    disabled,
  };

  // Closed single organ shows the selected label; the typed query
  // replaces it while open. Multiple always carries the query (close
  // resets it to '').
  const organValue = isMultiple
    ? state.query
    : state.isOpen
      ? state.query
      : singleSelectedOption === undefined
        ? ''
        : selectOptionLabel(singleSelectedOption);

  const organProps = {
    ...comboboxAria,
    autoComplete: 'off' as const,
    value: organValue,
    onChange: (event: ChangeEvent<HTMLInputElement>) => state.setQuery(event.target.value),
    placeholder: typeof placeholder === 'string' ? placeholder : undefined,
    disabled,
  };

  const handleMultipleOrganKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    keyboard.onOrganKeyDown(event);
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

  // The non-searchable single trigger button toggles the popup; clicks
  // elsewhere on the shell only open it (an open combobox must not
  // close while its organ keeps focus).
  const handleButtonClick = () => {
    if (state.isOpen) {
      state.close();
      keyboard.setActiveIndex(-1);
    } else {
      keyboard.setActiveIndex(initialActiveIndex);
      state.setOpen(true);
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

  const tags = currentMultiple.map((tagValue) => {
    const option = findSelectOption(options, tagValue);
    const tagLabel = option === undefined ? tagValue : selectOptionLabel(option);
    return (
      <span key={tagValue} className="colox-select__tag">
        <span className="colox-select__tag-label">{option?.label ?? tagLabel}</span>
        <button
          type="button"
          className="colox-select__tag-remove"
          aria-label={`Remove ${tagLabel}`}
          disabled={disabled}
          onClick={(event) => {
            event.stopPropagation();
            state.toggle(tagValue, event, option);
          }}
        >
          <IconX aria-hidden="true" />
        </button>
      </span>
    );
  });

  const showClear =
    !disabled && clearable && (isMultiple ? currentMultiple.length > 0 : currentSingle !== '');

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
        {isMultiple ? (
          <>
            {tags}
            <InputOrgan
              ref={organRef}
              id={restId}
              {...organProps}
              onKeyDown={handleMultipleOrganKeyDown}
            />
          </>
        ) : hasOrgan ? (
          <InputOrgan
            ref={organRef}
            id={restId}
            {...organProps}
            onKeyDown={keyboard.onOrganKeyDown}
          />
        ) : (
          <button
            ref={buttonRef}
            type="button"
            id={restId}
            {...comboboxAria}
            className="colox-select__combobox"
            onClick={handleButtonClick}
            onKeyDown={keyboard.onOrganKeyDown}
          >
            {singleSelectedOption !== undefined ? (
              singleSelectedOption.label
            ) : currentSingle !== '' ? (
              // Value outside the option list: display the raw value
              // instead of pretending the selection is empty.
              currentSingle
            ) : (
              <span className="colox-select__placeholder">
                {placeholder !== undefined && placeholder !== null ? placeholder : '\u00a0'}
              </span>
            )}
          </button>
        )}
      </div>

      <span className="colox-select__trailing">
        {showClear && (
          <button
            type="button"
            className="colox-select__clear"
            aria-label="Clear selection"
            onMouseDown={(event) => event.preventDefault()}
            onClick={(event) => state.clear(event)}
          >
            <IconX aria-hidden="true" />
          </button>
        )}
        <IconChevronDown className="colox-select__chevron" aria-hidden="true" />
      </span>

      {name !== undefined &&
        (isMultiple ? (
          currentMultiple.map((tagValue) => (
            <input
              key={tagValue}
              type="hidden"
              className="colox-select__hidden"
              name={name}
              value={tagValue}
            />
          ))
        ) : (
          <input type="hidden" className="colox-select__hidden" name={name} value={currentSingle} />
        ))}

      <Popup
        ref={panelRef}
        id={listboxId}
        role="listbox"
        referenceRef={rootRef}
        open={state.isOpen}
        className={clsx('colox-select__listbox', `colox-select__listbox--${optionSize}`)}
      >
        {visibleOptions.length === 0 && <span className="colox-select__empty">No options</span>}
        {visibleOptions.map((option, index) => {
          const selected = isMultiple
            ? currentMultiple.includes(option.value)
            : option.value === currentSingle;
          return (
            <div
              key={option.value}
              id={`${optionIdPrefix}-${index}`}
              role="option"
              aria-selected={selected}
              aria-disabled={option.disabled || undefined}
              className={clsx('colox-select__option', {
                'colox-select__option--selected': selected,
                'colox-select__option--active': keyboard.activeIndex === index,
                'colox-select__option--disabled': option.disabled,
              })}
              onMouseDown={(event) => event.preventDefault()}
              onClick={(event) => activateOption(option, event)}
            >
              <span className="colox-select__option-label">
                {optionRender !== undefined ? optionRender(option) : option.label}
              </span>
              {selected && <IconCheck className="colox-select__option-check" aria-hidden="true" />}
            </div>
          );
        })}
      </Popup>
    </div>
  );
});
