import { forwardRef, useImperativeHandle, useRef } from 'react';
import type { MouseEvent } from 'react';
import clsx from 'clsx';
import { IconClock } from '@colox/icons';
import { InputControl } from '@colox/cdk/input-control';
import { Popup, useDismissible } from '@colox/cdk/floating';
import { TimePickerClearButton } from './controls/clear-button';
import { TimePickerPanel } from './controls/panel';
import { useTimePicker } from './hooks/use-time-picker';
import type { TimePickerProps, TimePickerRef } from './types';
import { TIME_DEFAULT_FORMAT } from './utils/format';
import { timePickerPaletteStyles } from './variants/palette';
import { timePickerVariants } from './variants';

import './styles/index.scss';

/**
 * Single-line time editor: a bare text input in the Input family
 * shell (typing takes the canonical `HH:mm` grammar and the
 * configured `valueFormat`), a decorative clock glyph at the trailing
 * edge, and a self-drawn panel riding the cdk popup carrier. The
 * panel holds the two cyclic columns — hours and minutes, 8 visible
 * options each, chevron steps of 7, no scrollbar — and picking an
 * option merges it into the value, commits and closes (the same
 * pick-and-commit semantics as the date-only picker). The change
 * payload is `{ event, value }`; `clearable` follows the Select
 * interaction (the trailing glyph swaps into the ✕ control on
 * hover/focus).
 */
const TimePickerRoot = forwardRef<TimePickerRef, TimePickerProps>((props, ref) => {
  const {
    size,
    invalid = false,
    palette,
    value,
    defaultValue,
    min,
    max,
    valueFormat: rawValueFormat,
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

  const valueFormat = rawValueFormat ?? TIME_DEFAULT_FORMAT;

  const editor = useTimePicker({
    inputRef,
    panelRef,
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
  const paletteClass = timePickerPaletteStyles[palette ?? 'primary'];
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
        timePickerVariants({ size, palette }),
        {
          'colox-time-picker--invalid': invalid,
          'colox-time-picker--disabled': disabled,
          'colox-time-picker--clearable': showClear,
        },
        className,
      )}
      style={style}
      onClick={handleShellClick}
    >
      <InputControl
        ref={inputRef}
        className="colox-time-picker__control"
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
      <span className="colox-time-picker__trailing">
        <IconClock className="colox-time-picker__icon" />
        {showClear && <TimePickerClearButton onClear={editor.handleClear} />}
      </span>
      <Popup
        ref={panelRef}
        referenceRef={shellRef}
        open={editor.open}
        gap={4}
        matchWidth={false}
        className={clsx('colox-time-picker__popup', paletteClass)}
        onClick={(event) => event.stopPropagation()}
      >
        <TimePickerPanel
          hourAnchor={editor.hourAnchor}
          minuteAnchor={editor.minuteAnchor}
          hourCursor={editor.hourCursor}
          minuteCursor={editor.minuteCursor}
          hourSelected={editor.hourSelected}
          minuteSelected={editor.minuteSelected}
          isDisabledHour={editor.isDisabledHour}
          isDisabledMinute={editor.isDisabledMinute}
          onSelectOption={editor.handleSelectOption}
          onColumnKeyDown={editor.handleColumnKeyDown}
          onScrollColumn={editor.scrollColumn}
        />
      </Popup>
    </div>
  );
});

TimePickerRoot.displayName = 'TimePicker';

export const TimePicker = TimePickerRoot;
