import { forwardRef, useImperativeHandle, useRef } from 'react';
import type { MouseEvent } from 'react';
import clsx from 'clsx';
import { IconCalendar } from '@colox/icons';
import { InputControl } from '@colox/cdk/input-control';
import { Popup, useDismissible } from '@colox/cdk/floating';
import { DatePickerClearButton } from './controls/clear-button';
import { DatePickerPanel } from './controls/panel';
import { useDatePicker } from './hooks/use-date-picker';
import type { DatePickerProps, DatePickerRef } from './types';
import { todayIso } from './utils/date-core';
import { resolveDateLocale } from './utils/locale';
import { PICKER_DEFAULT_FORMAT } from './utils/format-date';
import { datePickerPaletteStyles } from './variants/palette';
import { datePickerVariants } from './variants';

import './styles/index.scss';

/**
 * Single-line date editor: a bare text input in the Input family
 * shell (typing takes the canonical grammar and the configured
 * `valueFormat`), a decorative calendar glyph at the trailing edge,
 * and a self-drawn panel riding the cdk popup carrier. The picker
 * chooses the granularity — a day grid, a 12-month grid or a
 * 12-year decade window — and the canonical value shape follows it
 * (`YYYY-MM-DD` / `YYYY-MM` / `YYYY`). The panel header title is
 * the drill path, split into its own segments (the month climbs one
 * level, the year jumps to the decade grid; cell picks descend back
 * down), and its single/double chevrons step the level or the
 * parent granularity — far dates skip the stepping entirely. The
 * change payload is `{ event, value }`; `clearable` follows the
 * Select interaction (the trailing glyph swaps into the ✕ control
 * on hover/focus).
 */
const DatePickerRoot = forwardRef<DatePickerRef, DatePickerProps>((props, ref) => {
  const {
    size,
    invalid = false,
    palette,
    picker = 'date',
    value,
    defaultValue,
    min,
    max,
    valueFormat: rawValueFormat,
    locale,
    clearable = false,
    open,
    defaultOpen,
    disabled,
    readOnly,
    className,
    style,
    onChange,
    onOpenChange,
    onBlur,
    onKeyDown,
    ...rest
  } = props;

  const inputRef = useRef<HTMLInputElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  const valueFormat = rawValueFormat ?? PICKER_DEFAULT_FORMAT[picker];

  const editor = useDatePicker({
    inputRef,
    panelRef,
    picker,
    value,
    defaultValue,
    min,
    max,
    valueFormat,
    open,
    defaultOpen,
    onChange,
    onOpenChange,
    onBlur,
    onKeyDown,
  });

  useDismissible({
    open: editor.open && !disabled && !readOnly,
    triggerRef: shellRef,
    panelRef,
    onDismiss: editor.closePanel,
  });

  const openable = !disabled && !readOnly;
  const resolvedLocale = resolveDateLocale(locale);
  const paletteClass = datePickerPaletteStyles[palette ?? 'primary'];
  const showClear = openable && clearable && editor.current !== null;

  // Shell clicks open the panel — except clicks on built-in buttons
  // (the ✕ clear control keeps its own program; the Select shell
  // guards the same way).
  const handleShellClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target;
    if (!(target instanceof HTMLElement) || target.closest('button') !== null) {
      return;
    }
    if (openable && !editor.open) {
      editor.openPanel();
    }
  };

  return (
    <div
      ref={shellRef}
      className={clsx(
        datePickerVariants({ size, palette }),
        {
          'colox-date-picker--invalid': invalid,
          'colox-date-picker--disabled': disabled,
          'colox-date-picker--clearable': showClear,
        },
        className,
      )}
      style={style}
      onClick={handleShellClick}
    >
      <InputControl
        ref={inputRef}
        className="colox-date-picker__control"
        type="text"
        role="combobox"
        aria-expanded={editor.open}
        aria-haspopup="dialog"
        aria-invalid={invalid || undefined}
        placeholder={valueFormat}
        value={editor.draft}
        onChange={editor.handleChange}
        onBlur={editor.handleBlur}
        onKeyDown={editor.handleKeyDown}
        disabled={disabled}
        readOnly={readOnly}
        {...rest}
      />
      <span className="colox-date-picker__trailing">
        <IconCalendar className="colox-date-picker__icon" />
        {showClear && <DatePickerClearButton onClear={editor.handleClear} />}
      </span>
      <Popup
        ref={panelRef}
        referenceRef={shellRef}
        open={editor.open}
        gap={4}
        matchWidth={false}
        className={clsx('colox-date-picker__popup', paletteClass)}
        onClick={(event) => event.stopPropagation()}
      >
        <DatePickerPanel
          level={editor.level}
          view={editor.view}
          locale={resolvedLocale}
          selected={editor.current}
          today={todayIso()}
          activeIso={editor.activeIso}
          onShiftView={editor.shiftView}
          onShiftDoubleView={editor.shiftDoubleView}
          onSelectCell={editor.handleSelectCell}
          onTitleClick={editor.handleTitleClick}
          onGridKeyDown={editor.handleGridKeyDown}
          isDisabled={editor.isDisabled}
        />
      </Popup>
    </div>
  );
});

DatePickerRoot.displayName = 'DatePicker';

export const DatePicker = DatePickerRoot;
